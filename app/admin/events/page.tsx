export const dynamic = "force-dynamic";

/**
 * Admin Events Management Page
 * List all events with edit/delete actions
 */

import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function AdminEventsPage() {
  const events = await prisma.event.findMany({
    orderBy: {
      startTime: 'desc',
    },
    include: {
      _count: {
        select: { bookings: true },
      },
    },
  });

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
                Veranstaltungen verwalten
              </h1>
            </div>
            <Link
              href="/admin/events/new"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              + Veranstaltung erstellen
            </Link>
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
                    Veranstaltung
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Typ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Datum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Buchungen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      Noch keine Veranstaltungen.{' '}
                      <Link
                        href="/admin/events/new"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Erste Veranstaltung erstellen
                      </Link>
                    </td>
                  </tr>
                ) : (
                  events.map((event) => (
                    <tr key={event.id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {event.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {event.format}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {event.eventType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(event.startTime).toLocaleDateString('de-DE')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            event.status === 'PUBLISHED'
                              ? 'bg-green-100 text-green-800'
                              : event.status === 'DRAFT'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {event.status === 'PUBLISHED' ? 'Veröffentlicht' : 
                           event.status === 'DRAFT' ? 'Entwurf' : 
                           'Abgesagt'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {event._count.bookings} / {event.totalSlots}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/events/${event.id}`}
                            target="_blank"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Ansehen
                          </Link>
                          <Link
                            href={`/admin/events/${event.id}/edit`}
                            className="text-indigo-600 hover:text-indigo-800"
                          >
                            Bearbeiten
                          </Link>
                          <Link
                            href={`/admin/bookings?eventId=${event.id}`}
                            className="text-green-600 hover:text-green-800"
                          >
                            Buchungen
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
