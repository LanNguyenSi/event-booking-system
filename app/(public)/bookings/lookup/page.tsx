'use client';

/**
 * Public Booking Lookup Page
 * Users can check their booking status with email + confirmation code
 */

import { useState } from 'react';
import Link from 'next/link';

interface Booking {
  id: string;
  name: string;
  email: string;
  status: string;
  confirmationToken: string;
  createdAt: string;
  event: {
    id: string;
    title: string;
    description: string;
    startTime: string;
    timezone: string;
    location: string | null;
    meetingLink: string | null;
    format: string;
    eventType: string;
  };
}

const formatLabels: Record<string, string> = {
  REMOTE: 'Online',
  IN_PERSON: 'Vor Ort',
  HYBRID: 'Hybrid',
};

const eventTypeBadgeColors: Record<string, string> = {
  WORKSHOP: 'bg-violet-50 text-violet-700 ring-violet-200',
  TALK: 'bg-sky-50 text-sky-700 ring-sky-200',
  WEBINAR: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  MEETUP: 'bg-amber-50 text-amber-700 ring-amber-200',
  CONSULTATION: 'bg-rose-50 text-rose-700 ring-rose-200',
  OTHER: 'bg-slate-50 text-slate-700 ring-slate-200',
};

export default function BookingLookupPage() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setBooking(null);

    try {
      const response = await fetch(
        `/api/bookings/lookup?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Buchung nicht gefunden');
      }

      setBooking(data.booking);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Etwas ist schiefgelaufen');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!booking) return;

    setIsCancelling(true);
    setCancelError('');

    try {
      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Stornierung fehlgeschlagen');
      }

      setBooking({ ...booking, status: 'CANCELLED' });
      setShowCancelConfirm(false);
      setCancelSuccess(true);
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : 'Stornierung fehlgeschlagen');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/events"
            className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors mb-3"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Zurück zu Veranstaltungen
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Buchung suchen
          </h1>
          <p className="mt-2 text-gray-500">
            Geben Sie Ihre E-Mail-Adresse und Ihren Bestätigungscode ein
          </p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!booking ? (
          // Lookup Form
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <form onSubmit={handleLookup} className="space-y-6">
              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  E-Mail-Adresse
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-colors placeholder:text-gray-400"
                  placeholder="ihre@email.de"
                />
              </div>

              {/* Confirmation Code */}
              <div>
                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Bestätigungscode
                </label>
                <input
                  type="text"
                  id="code"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg font-mono text-lg tracking-wider focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-colors placeholder:text-gray-400"
                  placeholder="EVT-A3B7K9"
                  maxLength={10}
                />
                <p className="mt-1.5 text-xs text-gray-400">
                  Sie haben diesen Code per E-Mail erhalten
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                {isLoading ? 'Suche...' : 'Buchung suchen'}
              </button>
            </form>
          </div>
        ) : (
          // Booking Details
          <div className="space-y-6">
            {/* Cancel Success Message */}
            {cancelSuccess && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <p className="text-sm text-emerald-700 font-medium">Buchung erfolgreich storniert.</p>
              </div>
            )}

            {/* Status Badge */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-7">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-gray-900">
                  Buchungsdetails
                </h2>
                <span
                  className={`px-4 py-1.5 text-sm font-semibold rounded-full ring-1 ring-inset ${
                    booking.status === 'CONFIRMED'
                      ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                      : booking.status === 'CANCELLED'
                      ? 'bg-red-50 text-red-700 ring-red-200'
                      : booking.status === 'WAITLISTED'
                      ? 'bg-amber-50 text-amber-700 ring-amber-200'
                      : 'bg-gray-50 text-gray-600 ring-gray-200'
                  }`}
                >
                  {booking.status === 'CONFIRMED'
                    ? 'Bestätigt'
                    : booking.status === 'CANCELLED'
                    ? 'Storniert'
                    : booking.status === 'WAITLISTED'
                    ? 'Warteliste'
                    : booking.status}
                </span>
              </div>

              {/* Confirmation Code */}
              <div className="mb-6 p-5 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-100">
                <p className="text-sm text-gray-500 mb-1.5">Bestätigungscode</p>
                <p className="text-2xl font-mono font-bold text-gray-900 tracking-wider">
                  {booking.confirmationToken}
                </p>
              </div>

              {/* Attendee Info */}
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="text-base font-semibold text-gray-900">{booking.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">E-Mail</p>
                  <p className="text-base font-semibold text-gray-900">{booking.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gebucht am</p>
                  <p className="text-base font-semibold text-gray-900">
                    {new Date(booking.createdAt).toLocaleDateString('de-DE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    Uhr
                  </p>
                </div>
              </div>

              {/* Cancel Error */}
              {cancelError && (
                <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600">{cancelError}</p>
                </div>
              )}

              {/* Cancel Button / Confirm */}
              {booking.status === 'CONFIRMED' && !cancelSuccess && (
                showCancelConfirm ? (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                    <p className="text-sm text-red-700 font-medium mb-3">
                      Möchten Sie diese Buchung wirklich stornieren?
                    </p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleCancel}
                        disabled={isCancelling}
                        className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {isCancelling ? 'Wird storniert...' : 'Ja, stornieren'}
                      </button>
                      <button
                        onClick={() => setShowCancelConfirm(false)}
                        disabled={isCancelling}
                        className="px-5 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-white font-medium transition-all text-sm"
                      >
                        Abbrechen
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all shadow-sm"
                  >
                    Buchung stornieren
                  </button>
                )
              )}
            </div>

            {/* Event Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-7">
              <h3 className="text-lg font-bold text-gray-900 mb-5">
                Veranstaltungsdetails
              </h3>

              <div className="space-y-5">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Veranstaltung</p>
                  <p className="text-xl font-bold text-gray-900">{booking.event.title}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ring-1 ring-inset ${eventTypeBadgeColors[booking.event.eventType] || eventTypeBadgeColors.OTHER}`}>
                    {booking.event.eventType}
                  </span>
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-200">
                    {formatLabels[booking.event.format] || booking.event.format}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Datum & Uhrzeit</p>
                  <p className="text-base font-semibold text-gray-900">
                    {new Date(booking.event.startTime).toLocaleDateString('de-DE', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-gray-500 text-sm mt-0.5">
                    {new Date(booking.event.startTime).toLocaleTimeString('de-DE', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    Uhr ({booking.event.timezone})
                  </p>
                </div>

                {booking.event.location && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Ort</p>
                    <p className="text-base font-semibold text-gray-900">{booking.event.location}</p>
                  </div>
                )}

                {booking.event.meetingLink && booking.status === 'CONFIRMED' && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Meeting-Link</p>
                    <a
                      href={booking.event.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 font-medium break-all transition-colors"
                    >
                      {booking.event.meetingLink}
                    </a>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-500 mb-2">Beschreibung</p>
                  <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{booking.event.description}</p>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-gray-100">
                <Link
                  href={`/events/${booking.event.id}`}
                  className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                >
                  Veranstaltungsseite ansehen
                  <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* New Lookup Button */}
            <button
              onClick={() => {
                setBooking(null);
                setEmail('');
                setCode('');
                setError('');
                setCancelSuccess(false);
                setCancelError('');
                setShowCancelConfirm(false);
              }}
              className="w-full py-3 px-4 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-300 font-medium transition-all"
            >
              Weitere Buchung suchen
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
