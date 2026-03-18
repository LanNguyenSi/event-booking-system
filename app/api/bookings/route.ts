/**
 * POST /api/bookings - Create new booking (public)
 * GET /api/bookings - List bookings (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';

// POST /api/bookings - Public endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, name, email, metadata } = body;

    // Validate required fields
    if (!eventId || !name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (event.status !== 'PUBLISHED') {
      return NextResponse.json(
        { error: 'Event is not available for booking' },
        { status: 400 }
      );
    }

    if (event.availableSlots <= 0) {
      return NextResponse.json(
        { error: 'No available slots' },
        { status: 400 }
      );
    }

    // Check max slots per user
    const existingBookings = event.bookings.length;
    if (existingBookings >= event.maxSlotsPerUser) {
      return NextResponse.json(
        { error: `Maximum ${event.maxSlotsPerUser} booking(s) per person` },
        { status: 400 }
      );
    }

    // Create booking and update available slots
    const [booking] = await prisma.$transaction([
      prisma.booking.create({
        data: {
          eventId,
          name,
          email,
          metadata,
          status: 'CONFIRMED',
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
    ]);

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
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
        { error: 'Unauthorized' },
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
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
