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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <a
            href="/events"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            ← Zurück zu Veranstaltungen
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Details (Left - 2/3) */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-8">
            {/* Event Type Badge */}
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                {event.eventType}
              </span>
              <span className="px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-800">
                {event.format}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              {event.title}
            </h1>

            {/* Date & Time */}
            <div className="flex items-start mb-6 text-gray-700">
              <svg
                className="w-5 h-5 mr-3 mt-1 flex-shrink-0"
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
              <div>
                <p className="font-medium">
                  {startDate.toLocaleDateString('de-DE', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-sm">
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
              <div className="flex items-start mb-6 text-gray-700">
                <svg
                  className="w-5 h-5 mr-3 mt-1 flex-shrink-0"
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
                <p>{event.location}</p>
              </div>
            )}

            {/* Organizer */}
            {event.organizerName && (
              <div className="flex items-start mb-6 text-gray-700">
                <svg
                  className="w-5 h-5 mr-3 mt-1 flex-shrink-0"
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
                <div>
                  <p className="font-medium">Veranstaltet von</p>
                  <p>{event.organizerName}</p>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Über diese Veranstaltung</h2>
              <div className="prose prose-slate max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {event.description}
                </ReactMarkdown>
              </div>
            </div>
          </div>

          {/* Booking Form (Right - 1/3) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Platz buchen</h2>

              {/* Availability Status */}
              <div className="mb-6 p-4 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Verfügbare Plätze</span>
                  <span className="text-lg font-bold text-gray-900">
                    {event.availableSlots} / {event.totalSlots}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${
                        ((event.totalSlots - event.availableSlots) /
                          event.totalSlots) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>

              {isPast ? (
                <div className="text-center py-4">
                  <p className="text-red-600 font-medium">
                    Diese Veranstaltung ist bereits vorbei
                  </p>
                </div>
              ) : isFull ? (
                <div className="text-center py-4">
                  <p className="text-red-600 font-medium mb-2">Veranstaltung ausgebucht</p>
                  <p className="text-sm text-gray-600">
                    Alle Plätze sind bereits gebucht
                  </p>
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
