export const dynamic = "force-dynamic";

/**
 * Admin Bookings Management Page
 * Alle Buchungen ansehen with optional event filter + Cancel functionality
 */

import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import CancelBookingButton from '@/components/CancelBookingButton';
import ExportCSVButton from '@/components/ExportCSVButton';

const statusLabels: Record<string, { text: string; classes: string }> = {
  CONFIRMED: { text: 'Bestätigt', classes: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  CANCELLED: { text: 'Storniert', classes: 'bg-red-50 text-red-700 ring-red-200' },
  WAITLISTED: { text: 'Warteliste', classes: 'bg-amber-50 text-amber-700 ring-amber-200' },
};

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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors mb-2"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Zurück zum Dashboard
              </Link>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                {event ? `Buchungen: ${event.title}` : 'Alle Buchungen'}
              </h1>
              {event && (
                <Link
                  href="/admin/bookings"
                  className="text-sm text-gray-500 hover:text-gray-700 mt-1 inline-block transition-colors"
                >
                  Alle Buchungen ansehen
                </Link>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
                Gesamt: <span className="text-gray-900">{Buchungen.length}</span> Buchungen
              </div>
              <ExportCSVButton eventId={eventId} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50/80">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    E-Mail
                  </th>
                  {!eventId && (
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Veranstaltung
                    </th>
                  )}
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Firma
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Gebucht am
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {Buchungen.length === 0 ? (
                  <tr>
                    <td
                      colSpan={eventId ? 7 : 8}
                      className="px-6 py-12 text-center text-gray-400"
                    >
                      <svg className="mx-auto h-8 w-8 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Noch keine Buchungen vorhanden
                    </td>
                  </tr>
                ) : (
                  Buchungen.map((booking) => {
                    const metadata = booking.metadata as any;
                    const status = statusLabels[booking.status] || { text: booking.status, classes: 'bg-gray-50 text-gray-600 ring-gray-200' };
                    return (
                      <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {booking.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {booking.email}
                        </td>
                        {!eventId && (
                          <td className="px-6 py-4 text-sm text-gray-700">
                            <Link
                              href={`/admin/bookings?eventId=${booking.event.id}`}
                              className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
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
                          {new Date(booking.createdAt).toLocaleDateString('de-DE')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 text-xs font-semibold rounded-full ring-1 ring-inset ${status.classes}`}
                          >
                            {status.text}
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
