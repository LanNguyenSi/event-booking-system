/**
 * GET /api/cron/reminders
 * Send reminder emails for events starting in 24 hours
 * Called by cron job
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEventReminder } from '@/lib/email';

export async function GET(request: NextRequest) {
  try {
    // Optional: Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('Authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Calculate time window (24 hours from now, ±1 hour buffer)
    const now = new Date();
    const reminderWindowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000); // 23h from now
    const reminderWindowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);   // 25h from now

    // Find bookings for events starting in 24 hours that haven't received reminders
    const bookings = await prisma.booking.findMany({
      where: {
        status: 'CONFIRMED',
        reminderSent: false,
        event: {
          status: 'PUBLISHED',
          startTime: {
            gte: reminderWindowStart,
            lte: reminderWindowEnd,
          },
        },
      },
      include: {
        event: true,
      },
    });

    console.log(`Found ${bookings.length} bookings requiring reminder emails`);

    // Send reminders and mark as sent
    let successCount = 0;
    let errorCount = 0;

    for (const booking of bookings) {
      try {
        await sendEventReminder(booking);
        
        // Mark reminder as sent
        await prisma.booking.update({
          where: { id: booking.id },
          data: { reminderSent: true },
        });

        successCount++;
      } catch (error) {
        console.error(`Failed to send reminder for booking ${booking.id}:`, error);
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      totalBookings: bookings.length,
      sent: successCount,
      failed: errorCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Reminder cron error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
