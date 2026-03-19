'use client';

/**
 * Create Event Page (MVP)
 * Simple form to create new events
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateEventPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title'),
      description: formData.get('description'),
      eventType: formData.get('eventType'),
      format: formData.get('format'),
      startTime: new Date(formData.get('startTime') as string).toISOString(),
      timezone: formData.get('timezone'),
      location: formData.get('location') || undefined,
      meetingLink: formData.get('meetingLink') || undefined,
      totalSlots: parseInt(formData.get('totalSlots') as string),
      maxSlotsPerUser: parseInt(formData.get('maxSlotsPerUser') as string),
      organizerName: formData.get('organizerName') || undefined,
      organizerEmail: formData.get('organizerEmail') || undefined,
      status: formData.get('status'),
    };

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create event');
      }

      router.push('/admin/events');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Etwas ist schiefgelaufen');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/admin/events"
            className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block"
          >
            ← Zurück zu Veranstaltungen
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Neue Veranstaltung erstellen</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titel der Veranstaltung *
              </label>
              <input
                type="text"
                name="title"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Einführung in KI Workshop"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Beschreibung *
              </label>
              <textarea
                name="description"
                required
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Beschreibe deine Veranstaltung..."
              />
            </div>

            {/* Type & Format */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Veranstaltungstyp *
                </label>
                <select
                  name="eventType"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="WORKSHOP">Workshop</option>
                  <option value="TALK">Vortrag</option>
                  <option value="WEBINAR">Webinar</option>
                  <option value="MEETUP">Meetup</option>
                  <option value="CONSULTATION">Beratung</option>
                  <option value="OTHER">Sonstiges</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Format *
                </label>
                <select
                  name="format"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="REMOTE">Online</option>
                  <option value="IN_PERSON">Vor Ort</option>
                  <option value="HYBRID">Hybrid</option>
                </select>
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Startdatum & Uhrzeit *
                </label>
                <input
                  type="datetime-local"
                  name="startTime"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zeitzone *
                </label>
                <input
                  type="text"
                  name="timezone"
                  required
                  defaultValue="Europe/Berlin"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Location & Meeting Link */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ort
                </label>
                <input
                  type="text"
                  name="location"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Berlin, Deutschland"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting-Link
                </label>
                <input
                  type="url"
                  name="meetingLink"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://zoom.us/..."
                />
              </div>
            </div>

            {/* Slots */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gesamtplätze *
                </label>
                <input
                  type="number"
                  name="totalSlots"
                  required
                  min="1"
                  defaultValue="12"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max. Plätze pro Person *
                </label>
                <input
                  type="number"
                  name="maxSlotsPerUser"
                  required
                  min="1"
                  defaultValue="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Organizer */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Veranstalter Name
                </label>
                <input
                  type="text"
                  name="organizerName"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Max Mustermann"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Veranstalter E-Mail
                </label>
                <input
                  type="email"
                  name="organizerEmail"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="max@beispiel.de"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                name="status"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="DRAFT">Entwurf</option>
                <option value="PUBLISHED">Veröffentlicht</option>
              </select>
            </div>

            {/* Submit */}
            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Wird erstellt...' : 'Veranstaltung erstellen'}
              </button>
              <Link
                href="/admin/events"
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                Abbrechen
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
