/**
 * PATCH /api/bookings/[id] - Update booking status (cancel)
 * Supports both admin (with token) and public (with email + confirmationToken) cancel flows
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';
import { sendBookingCancellation, sendBookingConfirmation } from '@/lib/email';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params;
    const body = await request.json();
    const { status, email, confirmationToken } = body;

    // Validate status field
    if (status !== 'CANCELLED') {
      return NextResponse.json(
        { error: 'Only CANCELLED status is supported' },
        { status: 400 }
      );
    }

    // Get booking with event info
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            availableSlots: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if already cancelled
    if (booking.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Booking is already cancelled' },
        { status: 400 }
      );
    }

    // Authorization check: Admin OR matching email + confirmationToken
    const authHeader = request.headers.get('authorization');
    const token = extractToken(authHeader);
    const isAdmin = token && verifyToken(token);

    if (!isAdmin) {
      // Public cancel: verify email and confirmation token
      if (!email || !confirmationToken) {
        return NextResponse.json(
          { error: 'Email and confirmation token required for public cancel' },
          { status: 401 }
        );
      }

      if (booking.email !== email) {
        return NextResponse.json(
          { error: 'Email does not match booking' },
          { status: 403 }
        );
      }

      if (booking.confirmationToken !== confirmationToken) {
        return NextResponse.json(
          { error: 'Invalid confirmation token' },
          { status: 403 }
        );
      }
    }

    // Check if there's a waitlisted booking to promote
    const firstWaitlisted = await prisma.booking.findFirst({
      where: {
        eventId: booking.event.id,
        status: 'WAITLISTED',
      },
      orderBy: {
        createdAt: 'asc', // FIFO
      },
      include: {
        event: true,
      },
    });

    // Update booking status and handle waitlist promotion
    if (firstWaitlisted) {
      // Promote waitlisted to confirmed (no slot change - just reuse the cancelled slot)
      const [updatedBooking, promotedBooking] = await prisma.$transaction([
        prisma.booking.update({
          where: { id: bookingId },
          data: { status: 'CANCELLED' },
          include: {
            event: true,
          },
        }),
        prisma.booking.update({
          where: { id: firstWaitlisted.id },
          data: { status: 'CONFIRMED' },
          include: {
            event: true,
          },
        }),
      ]);

      // Send emails (async)
      sendBookingCancellation(updatedBooking).catch(error => {
        console.error('Failed to send cancellation email:', error);
      });
      
      sendBookingConfirmation(promotedBooking).catch(error => {
        console.error('Failed to send waitlist promotion email:', error);
      });

      return NextResponse.json({
        message: 'Booking cancelled successfully',
        booking: updatedBooking,
        waitlistPromoted: true,
      });
    } else {
      // No waitlist - just cancel and restore slot
      const [updatedBooking] = await prisma.$transaction([
        prisma.booking.update({
          where: { id: bookingId },
          data: { status: 'CANCELLED' },
          include: {
            event: true,
          },
        }),
        prisma.event.update({
          where: { id: booking.event.id },
          data: {
            availableSlots: {
              increment: 1,
            },
          },
        }),
      ]);

      // Send cancellation email (async)
      sendBookingCancellation(updatedBooking).catch(error => {
        console.error('Failed to send cancellation email:', error);
      });

      return NextResponse.json({
        message: 'Booking cancelled successfully',
        booking: updatedBooking,
        waitlistPromoted: false,
      });
    }
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}
