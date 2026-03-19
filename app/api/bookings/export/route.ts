/**
 * GET /api/bookings/export - Export bookings as CSV (admin only)
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

    // Get optional eventId filter
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    // Build where clause
    const where = eventId ? { eventId } : {};

    // Fetch bookings
    const bookings = await prisma.booking.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        event: {
          select: {
            title: true,
            startTime: true,
          },
        },
      },
    });

    // Generate CSV
    const csvRows = [];
    
    // UTF-8 BOM for Excel compatibility
    const BOM = '\uFEFF';
    
    // Headers
    csvRows.push('Name,E-Mail,Veranstaltung,Firma,Position,Status,Gebucht am,Event-Datum');

    // Data rows
    for (const booking of bookings) {
      const metadata = booking.metadata as any;
      const company = metadata?.company || '';
      const role = metadata?.role || '';
      
      const row = [
        escapeCSV(booking.name),
        escapeCSV(booking.email),
        escapeCSV(booking.event.title),
        escapeCSV(company),
        escapeCSV(role),
        booking.status === 'CONFIRMED' ? 'Bestätigt' : 
        booking.status === 'CANCELLED' ? 'Storniert' : booking.status,
        new Date(booking.createdAt).toLocaleString('de-DE'),
        new Date(booking.event.startTime).toLocaleString('de-DE'),
      ].join(',');
      
      csvRows.push(row);
    }

    const csv = BOM + csvRows.join('\n');

    // Generate filename with current date
    const date = new Date().toISOString().split('T')[0];
    const filename = eventId 
      ? `buchungen-event-${date}.csv`
      : `buchungen-${date}.csv`;

    // Return CSV file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Export fehlgeschlagen' },
      { status: 500 }
    );
  }
}

/**
 * Escape CSV field (quotes and commas)
 */
function escapeCSV(field: string): string {
  if (!field) return '';
  
  // If field contains comma, quote, or newline, wrap in quotes and escape quotes
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  
  return field;
}
