/**
 * EventCard Component
 * Displays event summary in list view
 */

import Link from 'next/link';
import { Event } from '@prisma/client';

interface EventCardProps {
  event: Event & {
    _count?: {
      bookings: number;
    };
  };
}

export function EventCard({ event }: EventCardProps) {
  const bookingsCount = event._count?.bookings || 0;
  const availableSlots = event.availableSlots;
  const isFull = availableSlots === 0;

  // Format date (German)
  const startDate = new Date(event.startTime);
  const dateStr = startDate.toLocaleDateString('de-DE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeStr = startDate.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Link
      href={`/events/${event.id}`}
      className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200"
    >
      {/* Event Type Badge */}
      <div className="flex items-center justify-between mb-3">
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          {event.eventType}
        </span>
        <span className="text-xs text-gray-500 uppercase tracking-wide">
          {event.format}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
        {event.title}
      </h3>

      {/* Description Preview */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {event.description}
      </p>

      {/* Date & Time */}
      <div className="flex items-center text-sm text-gray-700 mb-3">
        <svg
          className="w-4 h-4 mr-2"
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
        <span>
          {dateStr} um {timeStr} Uhr
        </span>
      </div>

      {/* Slots Available */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <div className="flex items-center">
          <svg
            className="w-4 h-4 mr-2 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <span className="text-sm text-gray-600">
            {bookingsCount} / {event.totalSlots} gebucht
          </span>
        </div>

        {isFull ? (
          <span className="px-3 py-1 text-xs font-semibold rounded bg-red-100 text-red-800">
            AUSGEBUCHT
          </span>
        ) : (
          <span className="px-3 py-1 text-xs font-semibold rounded bg-green-100 text-green-800">
            {availableSlots} Plätze frei
          </span>
        )}
      </div>
    </Link>
  );
}
