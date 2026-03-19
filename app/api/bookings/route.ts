/**
 * POST /api/bookings - Create new booking (public)
 * GET /api/bookings - List bookings (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';
import { sendBookingConfirmation } from '@/lib/email';

// POST /api/bookings - Public endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, name, email, metadata } = body;

    // Validate required fields
    if (!eventId || !name || !email) {
      return NextResponse.json(
        { error: 'Erforderliche Felder fehlen' },
        { status: 400 }
      );
    }

    // Check if event exists and has available slots
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        bookings: {
          where: { email, status: 'CONFIRMED' },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Veranstaltung nicht gefunden' },
        { status: 404 }
      );
    }

    if (event.status !== 'PUBLISHED') {
      return NextResponse.json(
        { error: 'Veranstaltung ist nicht buchbar' },
        { status: 400 }
      );
    }

    // Check max slots per user (both confirmed + waitlisted)
    const existingBookings = event.bookings.length;
    if (existingBookings >= event.maxSlotsPerUser) {
      return NextResponse.json(
        { error: `Maximum ${event.maxSlotsPerUser} booking(s) per person` },
        { status: 400 }
      );
    }

    // Generate confirmation code (e.g., EVT-A3B7K9)
    const confirmationToken = `EVT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Determine if booking is confirmed or waitlisted
    const isWaitlisted = event.availableSlots <= 0;
    const bookingStatus = isWaitlisted ? 'WAITLISTED' : 'CONFIRMED';

    // Create booking (and update slots if confirmed)
    const booking = isWaitlisted
      ? await prisma.booking.create({
          data: {
            eventId,
            name,
            email,
            metadata,
            status: 'WAITLISTED',
            confirmationToken,
          },
          include: {
            event: true,
          },
        })
      : await prisma.$transaction([
          prisma.booking.create({
            data: {
              eventId,
              name,
              email,
              metadata,
              status: 'CONFIRMED',
              confirmationToken,
            },
            include: {
              event: true,
            },
          }),
          prisma.event.update({
            where: { id: eventId },
            data: {
              availableSlots: {
                decrement: 1,
              },
            },
          }),
        ]).then(([booking]) => booking);

    // Send confirmation email (async, don't block response)
    sendBookingConfirmation(booking).catch(error => {
      console.error('Failed to send confirmation email:', error);
    });

    return NextResponse.json({ 
      booking,
      waitlisted: isWaitlisted,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Buchung konnte nicht erstellt werden' },
      { status: 500 }
    );
  }
}

// GET /api/bookings - Admin only
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization');
    const token = extractToken(authHeader);

    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { error: 'Nicht berechtigt' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    const where = eventId ? { eventId } : {};

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startTime: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Buchungen konnten nicht geladen werden' },
      { status: 500 }
    );
  }
}
