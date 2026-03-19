'use client';

/**
 * Veranstaltung bearbeiten Page
 * Loads existing event data and allows editing
 */

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import DeleteEventButton from '@/components/DeleteEventButton';

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
  const [confirmedBookingsCount, setConfirmedBookingsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadEvent() {
      try {
        const response = await fetch(`/api/events/${id}`);
        if (!response.ok) throw new Error('Event not found');
        const data = await response.json();
        const eventData = data.event || data;
        setEvent(eventData);

        // Count confirmed bookings if bookings array exists
        if (eventData.bookings && Array.isArray(eventData.bookings)) {
          const confirmed = eventData.bookings.filter((b: any) => b.status === 'CONFIRMED').length;
          setConfirmedBookingsCount(confirmed);
        }
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

  const inputClasses = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-colors placeholder:text-gray-400";
  const labelClasses = "block text-sm font-medium text-gray-700 mb-1.5";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 mb-3">
            <svg className="w-6 h-6 text-indigo-500 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-gray-500 text-sm">Veranstaltung wird geladen...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-600 mb-4 font-medium">{error || 'Veranstaltung nicht gefunden'}</p>
          <Link href="/admin/events" className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Zurück zu Veranstaltungen
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <Link
            href="/admin/events"
            className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors mb-2"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Zurück zu Veranstaltungen
          </Link>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Veranstaltung bearbeiten</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {error && (
            <div className="mx-8 mt-8 p-4 rounded-xl bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="p-8 space-y-6">
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Grundinformationen</h3>
                <div className="space-y-5">
                  <div>
                    <label className={labelClasses}>Titel der Veranstaltung *</label>
                    <input type="text" name="title" required defaultValue={event.title} className={inputClasses} />
                  </div>
                  <div>
                    <label className={labelClasses}>Beschreibung *</label>
                    <textarea name="description" required rows={5} defaultValue={event.description} className={inputClasses} />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Art und Format</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClasses}>Veranstaltungstyp *</label>
                    <select name="eventType" required defaultValue={event.eventType} className={inputClasses}>
                      <option value="WORKSHOP">Workshop</option>
                      <option value="TALK">Vortrag</option>
                      <option value="WEBINAR">Webinar</option>
                      <option value="MEETUP">Meetup</option>
                      <option value="CONSULTATION">Beratung</option>
                      <option value="OTHER">Sonstiges</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClasses}>Format *</label>
                    <select name="format" required defaultValue={event.format} className={inputClasses}>
                      <option value="REMOTE">Online</option>
                      <option value="IN_PERSON">Vor Ort</option>
                      <option value="HYBRID">Hybrid</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Termin</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClasses}>Startdatum & Uhrzeit *</label>
                    <input type="datetime-local" name="startTime" required defaultValue={formatDatetime(event.startTime)} className={inputClasses} />
                  </div>
                  <div>
                    <label className={labelClasses}>Zeitzone *</label>
                    <input type="text" name="timezone" required defaultValue={event.timezone} className={inputClasses} />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Ort und Zugang</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClasses}>Ort</label>
                    <input type="text" name="location" defaultValue={event.location || ''} className={inputClasses} placeholder="Berlin, Deutschland" />
                  </div>
                  <div>
                    <label className={labelClasses}>Meeting-Link</label>
                    <input type="url" name="meetingLink" defaultValue={event.meetingLink || ''} className={inputClasses} placeholder="https://zoom.us/..." />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Kapazität</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClasses}>Gesamtplätze *</label>
                    <input type="number" name="totalSlots" required min="1" defaultValue={event.totalSlots} className={inputClasses} />
                    <p className="text-xs text-gray-500 mt-1.5">
                      Aktuell {event.totalSlots - event.availableSlots} gebucht, {event.availableSlots} verfügbar
                    </p>
                  </div>
                  <div>
                    <label className={labelClasses}>Max. Plätze pro Person *</label>
                    <input type="number" name="maxSlotsPerUser" required min="1" defaultValue={event.maxSlotsPerUser} className={inputClasses} />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Veranstalter</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClasses}>Veranstalter Name</label>
                    <input type="text" name="organizerName" defaultValue={event.organizerName || ''} className={inputClasses} />
                  </div>
                  <div>
                    <label className={labelClasses}>Veranstalter E-Mail</label>
                    <input type="email" name="organizerEmail" defaultValue={event.organizerEmail || ''} className={inputClasses} />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Veröffentlichung</h3>
                <div>
                  <label className={labelClasses}>Status *</label>
                  <select name="status" required defaultValue={event.status} className={inputClasses}>
                    <option value="DRAFT">Entwurf</option>
                    <option value="PUBLISHED">Veröffentlicht</option>
                    <option value="CANCELLED">Abgesagt</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit area */}
            <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md text-sm"
                >
                  {isSubmitting ? 'Wird gespeichert...' : 'Änderungen speichern'}
                </button>
                <Link
                  href="/admin/events"
                  className="px-6 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-white font-medium transition-all text-sm"
                >
                  Abbrechen
                </Link>
              </div>

              {/* Delete Button */}
              <div className="flex items-center gap-2">
                <DeleteEventButton
                  eventId={event.id}
                  eventTitle={event.title}
                  confirmedBookingsCount={confirmedBookingsCount}
                  status={event.status}
                />
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
