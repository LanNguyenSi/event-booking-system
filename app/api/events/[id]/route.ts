/**
 * GET /api/events/[id] - Get single event (public)
 * PUT /api/events/[id] - Update event (admin only)
 * DELETE /api/events/[id] - Delete event (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';

// GET /api/events/[id] - Public
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        bookings: {
          select: {
            id: true,
            name: true,
            slotNumber: true,
            status: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Veranstaltung nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
}

// PUT /api/events/[id] - Admin only
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check authentication
    const authHeader = request.headers.get('authorization');
    const token = extractToken(authHeader);

    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { error: 'Nicht berechtigt' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Update event
    const event = await prisma.event.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ event });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id] - Admin only (Soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check authentication
    const authHeader = request.headers.get('authorization');
    const token = extractToken(authHeader);

    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { error: 'Nicht berechtigt' },
        { status: 401 }
      );
    }

    // Check for force parameter
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';

    // Get event with confirmed bookings count
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            bookings: {
              where: { status: 'CONFIRMED' },
            },
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    const confirmedBookingsCount = event._count.bookings;

    // If event has confirmed bookings and force=false, return warning
    if (confirmedBookingsCount > 0 && !force) {
      return NextResponse.json(
        { 
          error: 'Event has confirmed bookings',
          confirmedBookingsCount,
          message: `This event has ${confirmedBookingsCount} confirmed booking(s). Add ?force=true to proceed with cancellation.`
        },
        { status: 400 }
      );
    }

    // Soft delete: Set status to CANCELLED
    // If forced, also cancel all confirmed bookings and restore slots
    if (force && confirmedBookingsCount > 0) {
      await prisma.$transaction([
        // Cancel all confirmed bookings
        prisma.booking.updateMany({
          where: {
            eventId: id,
            status: 'CONFIRMED',
          },
          data: {
            status: 'CANCELLED',
          },
        }),
        // Cancel event
        prisma.event.update({
          where: { id },
          data: {
            status: 'CANCELLED',
            availableSlots: event.totalSlots, // Restore all slots
          },
        }),
      ]);
    } else {
      // No bookings, just cancel the event
      await prisma.event.update({
        where: { id },
        data: {
          status: 'CANCELLED',
        },
      });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Event cancelled successfully',
      cancelledBookings: force ? confirmedBookingsCount : 0,
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}
