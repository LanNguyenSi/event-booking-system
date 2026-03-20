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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/20" />
          <div className="absolute -bottom-12 -left-12 w-72 h-72 rounded-full bg-white/10" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Kommende Veranstaltungen
          </h1>
          <p className="mt-3 text-lg text-indigo-100 max-w-2xl">
            Entdecke und buche deinen Platz bei Workshops, Vorträgen und Meetups
          </p>
        </div>
      </header>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        <EventFilters
          currentType={type}
          currentFormat={format}
          currentSearch={search}
        />
      </div>

      {/* Results Count */}
      {hasFilters && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
          <p className="text-sm font-medium text-gray-500">{resultsText}</p>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {events.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-50 mb-6">
              <svg
                className="h-10 w-10 text-indigo-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {hasFilters
                ? 'Keine Veranstaltungen gefunden'
                : 'Keine kommenden Veranstaltungen'}
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {hasFilters
                ? 'Versuchen Sie es mit anderen Filtern oder einer anderen Suche.'
                : 'Schauen Sie bald wieder vorbei - neue Veranstaltungen werden laufend hinzugefügt.'}
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
      <footer className="border-t border-gray-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-400 text-sm">
            Sichere dir jetzt deinen Platz!
          </p>
          <div className="text-center mt-4">
            <a
              href="/admin/login"
              className="text-xs text-gray-300 hover:text-gray-400 transition-colors"
            >
              Admin
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
