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

const eventTypeColors: Record<string, string> = {
  WORKSHOP: 'bg-violet-500',
  TALK: 'bg-sky-500',
  WEBINAR: 'bg-emerald-500',
  MEETUP: 'bg-amber-500',
  CONSULTATION: 'bg-rose-500',
  OTHER: 'bg-slate-500',
};

const eventTypeBadgeColors: Record<string, string> = {
  WORKSHOP: 'bg-violet-50 text-violet-700 ring-violet-200',
  TALK: 'bg-sky-50 text-sky-700 ring-sky-200',
  WEBINAR: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  MEETUP: 'bg-amber-50 text-amber-700 ring-amber-200',
  CONSULTATION: 'bg-rose-50 text-rose-700 ring-rose-200',
  OTHER: 'bg-slate-50 text-slate-700 ring-slate-200',
};

const formatLabels: Record<string, string> = {
  REMOTE: 'Online',
  IN_PERSON: 'Vor Ort',
  HYBRID: 'Hybrid',
};

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

  const accentColor = eventTypeColors[event.eventType] || eventTypeColors.OTHER;
  const badgeColor = eventTypeBadgeColors[event.eventType] || eventTypeBadgeColors.OTHER;

  return (
    <Link
      href={`/events/${event.id}`}
      className="group block bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden"
    >
      {/* Colored accent bar */}
      <div className={`h-1.5 ${accentColor}`} />

      <div className="p-6">
        {/* Event Type & Format Badges */}
        <div className="flex items-center justify-between mb-4">
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ring-1 ring-inset ${badgeColor}`}>
            {event.eventType}
          </span>
          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-200">
            {formatLabels[event.format] || event.format}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors duration-200 line-clamp-2">
          {event.title}
        </h3>

        {/* Description Preview */}
        <p className="text-gray-500 text-sm mb-5 line-clamp-2 leading-relaxed">
          {event.description}
        </p>

        {/* Date & Time */}
        <div className="flex items-center text-sm text-gray-600 mb-4">
          <svg
            className="w-4 h-4 mr-2.5 text-indigo-400 flex-shrink-0"
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
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center">
            <svg
              className="w-4 h-4 mr-2 text-gray-400"
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
            <span className="text-sm text-gray-500">
              {bookingsCount} / {event.totalSlots} gebucht
            </span>
          </div>

          {isFull ? (
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-50 text-red-700 ring-1 ring-inset ring-red-200">
              Ausgebucht
            </span>
          ) : (
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200">
              {availableSlots} {availableSlots === 1 ? 'Platz' : 'Plätze'} frei
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
