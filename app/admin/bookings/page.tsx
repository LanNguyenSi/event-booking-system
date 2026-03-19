export const dynamic = "force-dynamic";

/**
 * Admin Bookings Management Page
 * Alle Buchungen ansehen with optional event filter + Cancel functionality
 */

import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import CancelBookingButton from '@/components/CancelBookingButton';

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ eventId?: string }>;
}) {
  const { eventId } = await searchParams;

  const where = eventId ? { eventId } : {};

  const [Buchungen, event] = await Promise.all([
    prisma.booking.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startTime: true,
          },
        },
      },
    }),
    eventId
      ? prisma.event.findUnique({
          where: { id: eventId },
          select: { title: true },
        })
      : null,
  ]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/admin/dashboard"
                className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block"
              >
                ← Zurück zum Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                {event ? `Buchungen: ${event.title}` : 'Alle Buchungen'}
              </h1>
              {event && (
                <Link
                  href="/admin/Buchungen"
                  className="text-sm text-gray-600 hover:text-gray-900 mt-1 inline-block"
                >
                  Alle Buchungen ansehen
                </Link>
              )}
            </div>
            <div className="text-sm text-gray-600">
              Gesamt: {Buchungen.length} Buchungen
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  {!eventId && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Firma
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booked At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Buchungen.length === 0 ? (
                  <tr>
                    <td
                      colSpan={eventId ? 7 : 8}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      Noch keine Buchungen
                    </td>
                  </tr>
                ) : (
                  Buchungen.map((booking) => {
                    const metadata = booking.metadata as any;
                    return (
                      <tr key={booking.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {booking.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {booking.email}
                        </td>
                        {!eventId && (
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <Link
                              href={`/admin/Buchungen?eventId=${booking.event.id}`}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {booking.event.title}
                            </Link>
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {metadata?.company || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {metadata?.role || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              booking.status === 'CONFIRMED'
                                ? 'bg-green-100 text-green-800'
                                : booking.status === 'CANCELLED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {booking.status === 'CONFIRMED' && (
                            <CancelBookingButton bookingId={booking.id} />
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
