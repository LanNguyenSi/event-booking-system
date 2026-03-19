/**
 * GET /api/bookings/lookup - Public booking lookup (email + confirmation code)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const code = searchParams.get('code');

    // Validate required fields
    if (!email || !code) {
      return NextResponse.json(
        { error: 'E-Mail und Bestätigungscode erforderlich' },
        { status: 400 }
      );
    }

    // Find booking by email and confirmation token
    const booking = await prisma.booking.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        confirmationToken: code.toUpperCase().trim(),
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            description: true,
            startTime: true,
            timezone: true,
            location: true,
            meetingLink: true,
            format: true,
            eventType: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Buchung nicht gefunden. Bitte überprüfen Sie E-Mail und Bestätigungscode.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Lookup error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Buchung' },
      { status: 500 }
    );
  }
}
