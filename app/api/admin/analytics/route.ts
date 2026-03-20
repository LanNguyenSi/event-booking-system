/**
 * GET /api/admin/analytics - Get analytics data
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('Authorization');
    const token = extractToken(authHeader);
    if (!token) {
      return NextResponse.json(
        { error: 'Nicht berechtigt' },
        { status: 401 }
      );
    }

    const admin = await verifyToken(token);
    if (!admin) {
      return NextResponse.json(
        { error: 'Ungültiges Token' },
        { status: 401 }
      );
    }

    // Get date range from query params (default: last 30 days)
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 1. Bookings over time (by day)
    const bookingsByDay = await prisma.$queryRaw<Array<{
      date: Date;
      count: bigint;
    }>>`
      SELECT
        DATE("createdAt") as date,
        COUNT(*) as count
      FROM bookings
      WHERE "createdAt" >= ${startDate}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;

    // 2. Event type distribution
    const eventsByType = await prisma.event.groupBy({
      by: ['eventType'],
      _count: {
        eventType: true,
      },
    });

    // 3. Booking status distribution
    const bookingsByStatus = await prisma.booking.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    // 4. Top events by booking count
    const topEvents = await prisma.event.findMany({
      select: {
        id: true,
        title: true,
        _count: {
          select: { bookings: true },
        },
      },
      orderBy: {
        bookings: {
          _count: 'desc',
        },
      },
      take: 5,
    });

    // 5. Overall stats
    const [totalEvents, totalBookings, upcomingEvents] = await Promise.all([
      prisma.event.count(),
      prisma.booking.count(),
      prisma.event.count({
        where: {
          startTime: {
            gte: new Date(),
          },
          status: 'PUBLISHED',
        },
      }),
    ]);

    // 6. Cancellation rate
    const confirmedCount = await prisma.booking.count({
      where: { status: 'CONFIRMED' },
    });
    const cancelledCount = await prisma.booking.count({
      where: { status: 'CANCELLED' },
    });
    const cancellationRate = totalBookings > 0
      ? (cancelledCount / totalBookings) * 100
      : 0;

    return NextResponse.json({
      overview: {
        totalEvents,
        totalBookings,
        upcomingEvents,
        cancellationRate: Math.round(cancellationRate * 10) / 10,
      },
      bookingsByDay: bookingsByDay.map(row => ({
        date: row.date.toISOString().split('T')[0],
        count: Number(row.count),
      })),
      eventsByType: eventsByType.map(item => ({
        type: item.eventType,
        count: item._count.eventType,
      })),
      bookingsByStatus: bookingsByStatus.map(item => ({
        status: item.status,
        count: item._count.status,
      })),
      topEvents: topEvents.map(event => ({
        id: event.id,
        title: event.title,
        bookings: event._count.bookings,
      })),
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Analysedaten' },
      { status: 500 }
    );
  }
}
