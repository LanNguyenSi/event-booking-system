export const dynamic = "force-dynamic";

/**
 * Event Detail Page
 * Shows event details and booking form
 */

import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { BookingForm } from '@/components/public/BookingForm';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Metadata } from 'next';

const formatLabels: Record<string, string> = {
  REMOTE: 'Online',
  IN_PERSON: 'Vor Ort',
  HYBRID: 'Hybrid',
};

const eventTypeBadgeColors: Record<string, string> = {
  WORKSHOP: 'bg-violet-50 text-violet-700 ring-violet-200',
  TALK: 'bg-sky-50 text-sky-700 ring-sky-200',
  WEBINAR: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  MEETUP: 'bg-amber-50 text-amber-700 ring-amber-200',
  CONSULTATION: 'bg-rose-50 text-rose-700 ring-rose-200',
  OTHER: 'bg-slate-50 text-slate-700 ring-slate-200',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
  });

  if (!event || event.status !== 'PUBLISHED') {
    return {
      title: 'Veranstaltung nicht gefunden',
    };
  }

  const shortDescription = event.description.length > 160
    ? event.description.substring(0, 157) + '...'
    : event.description;

  return {
    title: `${event.title} | Veranstaltungsbuchung`,
    description: shortDescription,
    openGraph: {
      title: event.title,
      description: shortDescription,
      type: 'website',
      locale: 'de_DE',
      siteName: 'Veranstaltungsbuchung',
    },
    twitter: {
      card: 'summary_large_image',
      title: event.title,
      description: shortDescription,
    },
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      _count: {
        select: { bookings: true },
      },
    },
  });

  if (!event || event.status !== 'PUBLISHED') {
    notFound();
  }

  const startDate = new Date(event.startTime);
  const isFull = event.availableSlots === 0;
  const isPast = startDate < new Date();
  const badgeColor = eventTypeBadgeColors[event.eventType] || eventTypeBadgeColors.OTHER;
  const progressPercent = ((event.totalSlots - event.availableSlots) / event.totalSlots) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <a
            href="/events"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Zurück zu Veranstaltungen
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Details (Left - 2/3) */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8">
              {/* Event Type & Format Badges */}
              <div className="flex items-center gap-3 mb-5">
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ring-1 ring-inset ${badgeColor}`}>
                  {event.eventType}
                </span>
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-200">
                  {formatLabels[event.format] || event.format}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight">
                {event.title}
              </h1>

              {/* Date & Time */}
              <div className="flex items-start mb-5 text-gray-700">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center mr-4">
                  <svg
                    className="w-5 h-5 text-indigo-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {startDate.toLocaleDateString('de-DE', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {startDate.toLocaleTimeString('de-DE', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })} Uhr{' '}
                    {event.timezone}
                  </p>
                </div>
              </div>

              {/* Location/Format */}
              {event.location && (
                <div className="flex items-start mb-5 text-gray-700">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center mr-4">
                    <svg
                      className="w-5 h-5 text-indigo-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Veranstaltungsort</p>
                    <p className="text-sm text-gray-500 mt-0.5">{event.location}</p>
                  </div>
                </div>
              )}

              {/* Organizer */}
              {event.organizerName && (
                <div className="flex items-start mb-5 text-gray-700">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center mr-4">
                    <svg
                      className="w-5 h-5 text-indigo-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Veranstaltet von</p>
                    <p className="text-sm text-gray-500 mt-0.5">{event.organizerName}</p>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="mt-10 pt-8 border-t border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-5">Über diese Veranstaltung</h2>
                <div className="prose prose-slate prose-headings:font-bold prose-a:text-indigo-600 max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {event.description}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form (Right - 1/3) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-5">Platz buchen</h2>

              {/* Availability Status */}
              <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-500">Verfügbare Plätze</span>
                  <span className="text-lg font-bold text-gray-900">
                    {event.availableSlots} / {event.totalSlots}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      progressPercent > 80 ? 'bg-gradient-to-r from-amber-500 to-red-500' : 'bg-gradient-to-r from-indigo-500 to-violet-500'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                {progressPercent > 80 && !isFull && (
                  <p className="text-xs text-amber-600 font-medium mt-2">Nur noch wenige Plätze verfügbar!</p>
                )}
              </div>

              {isPast ? (
                <div className="text-center py-6 px-4 rounded-xl bg-gray-50 border border-gray-100">
                  <svg className="mx-auto h-10 w-10 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-500 font-medium">
                    Diese Veranstaltung ist bereits vorbei
                  </p>
                </div>
              ) : isFull ? (
                <div>
                  <div className="text-center py-5 px-4 mb-5 rounded-xl bg-amber-50 border border-amber-100">
                    <p className="text-amber-700 font-semibold mb-1">Veranstaltung ausgebucht</p>
                    <p className="text-sm text-amber-600">
                      Alle Plätze sind bereits vergeben
                    </p>
                  </div>
                  <div className="border-t border-gray-100 pt-5">
                    <p className="text-sm text-gray-600 mb-5 leading-relaxed">
                      Sie können sich auf die Warteliste setzen. Bei Stornierungen werden Sie automatisch benachrichtigt.
                    </p>
                    <BookingForm eventId={event.id} disabled={false} />
                  </div>
                </div>
              ) : (
                <BookingForm eventId={event.id} disabled={isPast} />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
