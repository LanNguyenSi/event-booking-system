'use client';

/**
 * Veranstaltung bearbeiten Page
 * Loads existing event data and allows editing
 */

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface EventData {
  id: string;
  title: string;
  description: string;
  eventType: string;
  format: string;
  startTime: string;
  timezone: string;
  location: string | null;
  meetingLink: string | null;
  totalSlots: number;
  availableSlots: number;
  maxSlotsPerUser: number;
  organizerName: string | null;
  organizerEmail: string | null;
  status: string;
}

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [event, setEvent] = useState<EventData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadEvent() {
      try {
        const response = await fetch(`/api/events/${id}`);
        if (!response.ok) throw new Error('Event not found');
        const data = await response.json();
        setEvent(data.event || data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load event');
      } finally {
        setIsLoading(false);
      }
    }
    loadEvent();
  }, [id]);

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
      location: formData.get('location') || null,
      meetingLink: formData.get('meetingLink') || null,
      totalSlots: parseInt(formData.get('totalSlots') as string),
      maxSlotsPerUser: parseInt(formData.get('maxSlotsPerUser') as string),
      organizerName: formData.get('organizerName') || null,
      organizerEmail: formData.get('organizerEmail') || null,
      status: formData.get('status'),
    };

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to update event');
      }

      router.push('/admin/events');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Etwas ist schiefgelaufen');
      setIsSubmitting(false);
    }
  };

  // Format datetime for input
  const formatDatetime = (iso: string | null) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 16);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Loading event...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Event not found'}</p>
          <Link href="/admin/events" className="text-blue-600 hover:text-blue-800">
            ← Zurück zu Veranstaltungen
          </Link>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Veranstaltung bearbeiten</h1>
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
                defaultValue={event.title}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Beschreibung */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Beschreibung *
              </label>
              <textarea
                name="description"
                required
                rows={5}
                defaultValue={event.description}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  defaultValue={event.eventType}
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
                  defaultValue={event.format}
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
                  defaultValue={formatDatetime(event.startTime)}
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
                  defaultValue={event.timezone}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Ort & Meeting-Link */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ort
                </label>
                <input
                  type="text"
                  name="location"
                  defaultValue={event.location || ''}
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
                  defaultValue={event.meetingLink || ''}
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
                  defaultValue={event.totalSlots}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Currently {event.totalSlots - event.availableSlots} booked, {event.availableSlots} available
                </p>
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
                  defaultValue={event.maxSlotsPerUser}
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
                  defaultValue={event.organizerName || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Veranstalter E-Mail
                </label>
                <input
                  type="email"
                  name="organizerEmail"
                  defaultValue={event.organizerEmail || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                defaultValue={event.status}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="DRAFT">Entwurf</option>
                <option value="PUBLISHED">Veröffentlicht</option>
                <option value="CANCELLED">Abgesagt</option>
              </select>
            </div>

            {/* Submit */}
            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
              <Link
                href="/admin/events"
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
