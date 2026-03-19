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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors mb-2"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Dashboard
              </Link>
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                Veranstaltungen
              </h1>
            </div>
            <Link
              href="/admin/events/new"
              className="inline-flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-md text-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Erstellen
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {events.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-12 text-center text-gray-400">
            <svg className="mx-auto h-8 w-8 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Noch keine Veranstaltungen.{' '}
            <Link href="/admin/events/new" className="text-indigo-600 hover:text-indigo-800 font-medium">
              Erste Veranstaltung erstellen
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50/80">
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Veranstaltung</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Typ</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Datum</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Buchungen</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {events.map((event) => (
                      <tr key={event.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{event.title}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{formatLabels[event.format] || event.format}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200">
                            {event.eventType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {new Date(event.startTime).toLocaleDateString('de-DE')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ring-1 ring-inset ${
                            event.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' :
                            event.status === 'DRAFT' ? 'bg-gray-50 text-gray-600 ring-gray-200' :
                            'bg-red-50 text-red-700 ring-red-200'
                          }`}>
                            {event.status === 'PUBLISHED' ? 'Veröffentlicht' : event.status === 'DRAFT' ? 'Entwurf' : 'Abgesagt'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium text-gray-700">{event._count.bookings}</span>
                          <span className="text-gray-400"> / {event.totalSlots}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Link href={`/events/${event.id}`} target="_blank" className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 ring-1 ring-inset ring-gray-200 transition-colors">Ansehen</Link>
                            <Link href={`/admin/events/${event.id}/edit`} className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 ring-1 ring-inset ring-indigo-200 transition-colors">Bearbeiten</Link>
                            <Link href={`/admin/bookings?eventId=${event.id}`} className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 ring-1 ring-inset ring-emerald-200 transition-colors">Buchungen</Link>
                            <DeleteEventButton eventId={event.id} eventTitle={event.title} confirmedBookingsCount={event._count.bookings} status={event.status} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {events.map((event) => (
                <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{event.title}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{formatLabels[event.format] || event.format}</p>
                    </div>
                    <span className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded-full ring-1 ring-inset whitespace-nowrap ${
                      event.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' :
                      event.status === 'DRAFT' ? 'bg-gray-50 text-gray-600 ring-gray-200' :
                      'bg-red-50 text-red-700 ring-red-200'
                    }`}>
                      {event.status === 'PUBLISHED' ? 'Veröffentlicht' : event.status === 'DRAFT' ? 'Entwurf' : 'Abgesagt'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <span>{new Date(event.startTime).toLocaleDateString('de-DE')}</span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium">{event.eventType}</span>
                    <span>{event._count.bookings} / {event.totalSlots} Buchungen</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/events/${event.id}`} target="_blank" className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 ring-1 ring-inset ring-gray-200">Ansehen</Link>
                    <Link href={`/admin/events/${event.id}/edit`} className="px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 ring-1 ring-inset ring-indigo-200">Bearbeiten</Link>
                    <Link href={`/admin/bookings?eventId=${event.id}`} className="px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 ring-1 ring-inset ring-emerald-200">Buchungen</Link>
                    <DeleteEventButton eventId={event.id} eventTitle={event.title} confirmedBookingsCount={event._count.bookings} status={event.status} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
