export const dynamic = "force-dynamic";

/**
 * Public Events List Page
 * Shows all published events
 */

import { EventCard } from '@/components/public/EventCard';
import { prisma } from '@/lib/prisma';

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    where: {
      status: 'PUBLISHED',
      startTime: {
        gte: new Date(), // Only upcoming events
      },
    },
    orderBy: {
      startTime: 'asc',
    },
    include: {
      _count: {
        select: { bookings: true },
      },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Upcoming Events
          </h1>
          <p className="mt-2 text-gray-600">
            Browse and book your spot for workshops, talks, and meetups
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              No upcoming events
            </h3>
            <p className="mt-1 text-gray-500">
              Check back later for new events!
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
            Event Booking System - Book your spot today!
          </p>
        </div>
      </footer>
    </div>
  );
}
