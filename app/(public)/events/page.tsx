export const dynamic = "force-dynamic";

/**
 * Public Events List Page
 * Shows all published events with filters
 */

import { EventCard } from '@/components/public/EventCard';
import { EventFilters } from '@/components/public/EventFilters';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

interface EventsPageProps {
  searchParams: Promise<{
    type?: string;
    format?: string;
    search?: string;
  }>;
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = await searchParams;
  const { type, format, search } = params;

  // Build where clause with filters
  const where: Prisma.EventWhereInput = {
    status: 'PUBLISHED',
    startTime: {
      gte: new Date(), // Only upcoming events
    },
  };

  if (type) {
    where.eventType = type as any;
  }

  if (format) {
    where.format = format as any;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const events = await prisma.event.findMany({
    where,
    orderBy: {
      startTime: 'asc',
    },
    include: {
      _count: {
        select: { bookings: true },
      },
    },
  });

  const hasFilters = !!(type || format || search);
  const resultsText = hasFilters
    ? `${events.length} ${events.length === 1 ? 'Veranstaltung gefunden' : 'Veranstaltungen gefunden'}`
    : '';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Kommende Veranstaltungen
          </h1>
          <p className="mt-2 text-gray-600">
            Entdecke und buche deinen Platz für Workshops, Vorträge und Meetups
          </p>
        </div>
      </header>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <EventFilters
          currentType={type}
          currentFormat={format}
          currentSearch={search}
        />
      </div>

      {/* Results Count */}
      {hasFilters && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
          <p className="text-sm text-gray-600">{resultsText}</p>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {events.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
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
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              {hasFilters
                ? 'Keine Veranstaltungen gefunden'
                : 'Keine kommenden Veranstaltungen'}
            </h3>
            <p className="mt-1 text-gray-500">
              {hasFilters
                ? 'Versuchen Sie es mit anderen Filtern'
                : 'Schauen Sie später noch einmal vorbei!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500 text-sm">
            Veranstaltungsbuchung - Sichere dir jetzt deinen Platz!
          </p>
        </div>
      </footer>
    </div>
  );
}
