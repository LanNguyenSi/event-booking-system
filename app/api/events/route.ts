/**
 * GET /api/events - List all published events (public)
 * POST /api/events - Create new event (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';

// GET /api/events - Public endpoint
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'PUBLISHED';
    const eventType = searchParams.get('type');

    const where: any = {
      status: status as any,
    };

    if (eventType) {
      where.eventType = eventType;
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: {
        startTime: 'asc',
      },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

// POST /api/events - Admin only
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization');
    const token = extractToken(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: 'Nicht berechtigt' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      title,
      description,
      eventType,
      startTime,
      endTime,
      timezone,
      format,
      location,
      meetingLink,
      totalSlots,
      maxSlotsPerUser,
      organizerName,
      organizerEmail,
      coverImage,
      customFields,
      status,
    } = body;

    // Validate required fields
    if (!title || !description || !eventType || !startTime || !format || !totalSlots) {
      return NextResponse.json(
        { error: 'Erforderliche Felder fehlen' },
        { status: 400 }
      );
    }

    // Create event
    const event = await prisma.event.create({
      data: {
        title,
        description,
        eventType,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        timezone: timezone || 'Europe/Berlin',
        format,
        location,
        meetingLink,
        totalSlots: parseInt(totalSlots),
        availableSlots: parseInt(totalSlots),
        maxSlotsPerUser: maxSlotsPerUser ? parseInt(maxSlotsPerUser) : 1,
        organizerName,
        organizerEmail,
        coverImage,
        customFields,
        status: status || 'DRAFT',
      },
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Veranstaltung konnte nicht erstellt werden' },
      { status: 500 }
    );
  }
}
