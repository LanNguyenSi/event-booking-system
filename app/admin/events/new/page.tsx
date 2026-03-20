'use client';

/**
 * Create Event Page
 * Form to create new events
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
        throw new Error(error.error || 'Veranstaltung konnte nicht erstellt werden');
      }

      router.push('/admin/events');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Etwas ist schiefgelaufen');
      setIsSubmitting(false);
    }
  };

  const inputClasses = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-colors placeholder:text-gray-400";
  const labelClasses = "block text-sm font-medium text-gray-700 mb-1.5";

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
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Neue Veranstaltung erstellen</h1>
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
            {/* Basic Info Section */}
            <div className="p-8 space-y-6">
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Grundinformationen</h3>
                <div className="space-y-5">
                  <div>
                    <label className={labelClasses}>Titel der Veranstaltung *</label>
                    <input type="text" name="title" required className={inputClasses} placeholder="Einführung in KI Workshop" />
                  </div>
                  <div>
                    <label className={labelClasses}>Beschreibung *</label>
                    <textarea name="description" required rows={5} className={inputClasses} placeholder="Beschreibe deine Veranstaltung..." />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Art und Format</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClasses}>Veranstaltungstyp *</label>
                    <select name="eventType" required className={inputClasses}>
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
                    <select name="format" required className={inputClasses}>
                      <option value="REMOTE">Online</option>
                      <option value="IN_PERSON">Vor Ort</option>
                      <option value="HYBRID">Hybrid</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Termin</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClasses}>Startdatum & Uhrzeit *</label>
                    <input type="datetime-local" name="startTime" required className={inputClasses} />
                  </div>
                  <div>
                    <label className={labelClasses}>Zeitzone *</label>
                    <input type="text" name="timezone" required defaultValue="Europe/Berlin" className={inputClasses} />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Ort und Zugang</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClasses}>Ort</label>
                    <input type="text" name="location" className={inputClasses} placeholder="Berlin, Deutschland" />
                  </div>
                  <div>
                    <label className={labelClasses}>Meeting-Link</label>
                    <input type="url" name="meetingLink" className={inputClasses} placeholder="https://zoom.us/..." />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Kapazität</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClasses}>Gesamtplätze *</label>
                    <input type="number" name="totalSlots" required min="1" defaultValue="12" className={inputClasses} />
                  </div>
                  <div>
                    <label className={labelClasses}>Max. Plätze pro Person *</label>
                    <input type="number" name="maxSlotsPerUser" required min="1" defaultValue="1" className={inputClasses} />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Veranstalter</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClasses}>Veranstalter Name</label>
                    <input type="text" name="organizerName" className={inputClasses} placeholder="Max Mustermann" />
                  </div>
                  <div>
                    <label className={labelClasses}>Veranstalter E-Mail</label>
                    <input type="email" name="organizerEmail" className={inputClasses} placeholder="max@beispiel.de" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Veröffentlichung</h3>
                <div>
                  <label className={labelClasses}>Status *</label>
                  <select name="status" required className={inputClasses}>
                    <option value="DRAFT">Entwurf</option>
                    <option value="PUBLISHED">Veröffentlicht</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit area */}
            <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md text-sm"
              >
                {isSubmitting ? 'Wird erstellt...' : 'Veranstaltung erstellen'}
              </button>
              <Link
                href="/admin/events"
                className="px-6 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-white font-medium transition-all text-sm"
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
