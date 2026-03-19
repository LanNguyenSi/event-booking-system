export const dynamic = "force-dynamic";

/**
 * Admin Events Management Page
 * List all events with edit/delete actions
 */

import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import DeleteEventButton from '@/components/DeleteEventButton';

const formatLabels: Record<string, string> = {
  REMOTE: 'Online',
  IN_PERSON: 'Vor Ort',
  HYBRID: 'Hybrid',
};

export default async function AdminEventsPage() {
  const events = await prisma.event.findMany({
    orderBy: {
      startTime: 'desc',
    },
    include: {
      _count: {
        select: {
          bookings: {
            where: { status: 'CONFIRMED' }
          }
        },
      },
    },
  });

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
                Veranstaltungen verwalten
              </h1>
            </div>
            <Link
              href="/admin/events/new"
              className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-md text-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Veranstaltung erstellen
            </Link>
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
                    Veranstaltung
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Typ
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Datum
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Buchungen
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {events.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-400"
                    >
                      <svg className="mx-auto h-8 w-8 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Noch keine Veranstaltungen.{' '}
                      <Link
                        href="/admin/events/new"
                        className="text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Erste Veranstaltung erstellen
                      </Link>
                    </td>
                  </tr>
                ) : (
                  events.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {event.title}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {formatLabels[event.format] || event.format}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200">
                          {event.eventType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(event.startTime).toLocaleDateString('de-DE')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 text-xs font-semibold rounded-full ring-1 ring-inset ${
                            event.status === 'PUBLISHED'
                              ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                              : event.status === 'DRAFT'
                              ? 'bg-gray-50 text-gray-600 ring-gray-200'
                              : 'bg-red-50 text-red-700 ring-red-200'
                          }`}
                        >
                          {event.status === 'PUBLISHED' ? 'Veröffentlicht' :
                           event.status === 'DRAFT' ? 'Entwurf' :
                           'Abgesagt'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-700">
                          {event._count.bookings}
                        </span>
                        <span className="text-sm text-gray-400"> / {event.totalSlots}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/events/${event.id}`}
                            target="_blank"
                            className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 ring-1 ring-inset ring-gray-200 transition-colors"
                            title="Ansehen"
                          >
                            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Ansehen
                          </Link>
                          <Link
                            href={`/admin/events/${event.id}/edit`}
                            className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 ring-1 ring-inset ring-indigo-200 transition-colors"
                            title="Bearbeiten"
                          >
                            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Bearbeiten
                          </Link>
                          <Link
                            href={`/admin/bookings?eventId=${event.id}`}
                            className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 ring-1 ring-inset ring-emerald-200 transition-colors"
                            title="Buchungen"
                          >
                            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Buchungen
                          </Link>
                          <DeleteEventButton
                            eventId={event.id}
                            eventTitle={event.title}
                            confirmedBookingsCount={event._count.bookings}
                            status={event.status}
                          />
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
