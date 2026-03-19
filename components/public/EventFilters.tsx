'use client';

/**
 * Event Filters Component
 * Client-side filter controls with URL sync
 */

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

interface EventFiltersProps {
  currentType?: string;
  currentFormat?: string;
  currentSearch?: string;
}

export function EventFilters({
  currentType,
  currentFormat,
  currentSearch,
}: EventFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(currentSearch || '');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== currentSearch) {
        updateFilters({ search: search || undefined });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const updateFilters = (updates: {
    type?: string;
    format?: string;
    search?: string;
  }) => {
    const params = new URLSearchParams(searchParams.toString());

    // Update params
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Navigate with new params
    router.push(`/events?${params.toString()}`);
  };

  const resetFilters = () => {
    setSearch('');
    router.push('/events');
  };

  const hasFilters = !!(currentType || currentFormat || currentSearch);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="flex-1">
          <label htmlFor="search" className="sr-only">
            Suche
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              id="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-colors placeholder:text-gray-400"
              placeholder="Veranstaltungen durchsuchen..."
            />
          </div>
        </div>

        {/* Event Type */}
        <div className="w-full md:w-48">
          <label htmlFor="type" className="sr-only">
            Typ
          </label>
          <select
            id="type"
            value={currentType || ''}
            onChange={(e) =>
              updateFilters({ type: e.target.value || undefined })
            }
            className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-colors text-gray-700"
          >
            <option value="">Alle Typen</option>
            <option value="WORKSHOP">Workshop</option>
            <option value="TALK">Vortrag</option>
            <option value="WEBINAR">Webinar</option>
            <option value="MEETUP">Meetup</option>
            <option value="CONSULTATION">Beratung</option>
            <option value="OTHER">Sonstiges</option>
          </select>
        </div>

        {/* Format */}
        <div className="w-full md:w-48">
          <label htmlFor="format" className="sr-only">
            Format
          </label>
          <select
            id="format"
            value={currentFormat || ''}
            onChange={(e) =>
              updateFilters({ format: e.target.value || undefined })
            }
            className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-colors text-gray-700"
          >
            <option value="">Alle Formate</option>
            <option value="REMOTE">Online</option>
            <option value="IN_PERSON">Vor Ort</option>
            <option value="HYBRID">Hybrid</option>
          </select>
        </div>

        {/* Reset Button */}
        {hasFilters && (
          <button
            onClick={resetFilters}
            className="px-4 py-2.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors whitespace-nowrap"
          >
            Filter zurücksetzen
          </button>
        )}
      </div>
    </div>
  );
}
