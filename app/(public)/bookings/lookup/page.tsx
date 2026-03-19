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

export default function BookingLookupPage() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

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
    if (!confirm('Möchten Sie diese Buchung wirklich stornieren?')) return;

    setIsCancelling(true);

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

      // Update local booking status
      setBooking({ ...booking, status: 'CANCELLED' });
      alert('Buchung erfolgreich storniert!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Stornierung fehlgeschlagen');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/events"
            className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block"
          >
            ← Zurück zu Veranstaltungen
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Buchung suchen
          </h1>
          <p className="mt-2 text-gray-600">
            Geben Sie Ihre E-Mail-Adresse und Ihren Bestätigungscode ein
          </p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!booking ? (
          // Lookup Form
          <div className="bg-white rounded-lg shadow-md p-8">
            <form onSubmit={handleLookup} className="space-y-6">
              {error && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  E-Mail-Adresse
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ihre@email.de"
                />
              </div>

              {/* Confirmation Code */}
              <div>
                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Bestätigungscode
                </label>
                <input
                  type="text"
                  id="code"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-lg tracking-wider"
                  placeholder="EVT-A3B7K9"
                  maxLength={10}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Sie haben diesen Code per E-Mail erhalten
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Suche...' : 'Buchung suchen'}
              </button>
            </form>
          </div>
        ) : (
          // Booking Details
          <div className="space-y-6">
            {/* Status Badge */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Buchungsdetails
                </h2>
                <span
                  className={`px-4 py-2 text-sm font-semibold rounded-full ${
                    booking.status === 'CONFIRMED'
                      ? 'bg-green-100 text-green-800'
                      : booking.status === 'CANCELLED'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {booking.status === 'CONFIRMED'
                    ? 'Bestätigt'
                    : booking.status === 'CANCELLED'
                    ? 'Storniert'
                    : booking.status}
                </span>
              </div>

              {/* Confirmation Code */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Bestätigungscode</p>
                <p className="text-2xl font-mono font-bold text-gray-900 tracking-wider">
                  {booking.confirmationToken}
                </p>
              </div>

              {/* Attendee Info */}
              <div className="space-y-3 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="text-lg font-medium text-gray-900">{booking.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">E-Mail</p>
                  <p className="text-lg font-medium text-gray-900">{booking.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Gebucht am</p>
                  <p className="text-lg font-medium text-gray-900">
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

              {/* Cancel Button */}
              {booking.status === 'CONFIRMED' && (
                <button
                  onClick={handleCancel}
                  disabled={isCancelling}
                  className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCancelling ? 'Wird storniert...' : 'Buchung stornieren'}
                </button>
              )}
            </div>

            {/* Event Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Veranstaltungsdetails
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Veranstaltung</p>
                  <p className="text-xl font-bold text-gray-900">{booking.event.title}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                    {booking.event.eventType}
                  </span>
                  <span className="px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-800">
                    {booking.event.format === 'REMOTE' ? 'Online' : 
                     booking.event.format === 'IN_PERSON' ? 'Vor Ort' : 'Hybrid'}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Datum & Uhrzeit</p>
                  <p className="text-lg font-medium text-gray-900">
                    {new Date(booking.event.startTime).toLocaleDateString('de-DE', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-gray-700">
                    {new Date(booking.event.startTime).toLocaleTimeString('de-DE', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    Uhr ({booking.event.timezone})
                  </p>
                </div>

                {booking.event.location && (
                  <div>
                    <p className="text-sm text-gray-600">Ort</p>
                    <p className="text-lg font-medium text-gray-900">{booking.event.location}</p>
                  </div>
                )}

                {booking.event.meetingLink && booking.status === 'CONFIRMED' && (
                  <div>
                    <p className="text-sm text-gray-600">Meeting-Link</p>
                    <a
                      href={booking.event.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium break-all"
                    >
                      {booking.event.meetingLink}
                    </a>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600 mb-2">Beschreibung</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{booking.event.description}</p>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href={`/events/${booking.event.id}`}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Veranstaltungsseite ansehen →
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
              }}
              className="w-full py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
              Weitere Buchung suchen
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
