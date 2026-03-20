'use client';

/**
 * Booking Form Component
 * Handles event booking submission
 */

import { useState } from 'react';

interface BookingFormProps {
  eventId: string;
  disabled?: boolean;
}

export function BookingForm({ eventId, disabled = false }: BookingFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    role: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [isWaitlisted, setIsWaitlisted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          name: formData.name,
          email: formData.email,
          metadata: {
            company: formData.company || undefined,
            role: formData.role || undefined,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Buchung konnte nicht erstellt werden');
      }

      setSuccess(true);
      setConfirmationCode(data.booking?.confirmationToken || '');
      setIsWaitlisted(data.waitlisted || false);
      setFormData({ name: '', email: '', company: '', role: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Etwas ist schiefgelaufen');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-6">
        <div className="mb-5">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${isWaitlisted ? 'bg-amber-50' : 'bg-emerald-50'}`}>
            <svg
              className={`h-8 w-8 ${isWaitlisted ? 'text-amber-500' : 'text-emerald-500'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          {isWaitlisted ? 'Auf Warteliste!' : 'Buchung bestätigt!'}
        </h3>
        <p className="text-gray-500 text-sm mb-5 leading-relaxed">
          {isWaitlisted
            ? 'Die Veranstaltung ist ausgebucht. Sie wurden auf die Warteliste gesetzt und werden automatisch benachrichtigt, sobald ein Platz frei wird.'
            : 'Sie erhalten in Kürze eine Bestätigungs-E-Mail.'
          }
        </p>

        {confirmationCode && (
          <div className={`mb-6 p-5 rounded-xl border ${isWaitlisted ? 'bg-amber-50 border-amber-200' : 'bg-indigo-50 border-indigo-200'}`}>
            <p className="text-sm text-gray-600 mb-2">{isWaitlisted ? 'Ihr Wartelisten-Code:' : 'Ihr Bestätigungscode:'}</p>
            <p className={`text-2xl font-mono font-bold tracking-wider mb-3 ${isWaitlisted ? 'text-amber-800' : 'text-indigo-800'}`}>
              {confirmationCode}
            </p>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              {isWaitlisted
                ? 'Bitte bewahren Sie diesen Code auf. Sie werden automatisch informiert, wenn ein Platz frei wird.'
                : 'Bitte bewahren Sie diesen Code auf. Sie können damit Ihre Buchung jederzeit einsehen oder stornieren.'
              }
            </p>
            <a
              href="/bookings/lookup"
              className={`inline-flex items-center text-sm font-medium transition-colors ${isWaitlisted ? 'text-amber-700 hover:text-amber-900' : 'text-indigo-600 hover:text-indigo-800'}`}
            >
              {isWaitlisted ? 'Wartelisten-Status prüfen' : 'Buchung verwalten'}
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        )}

        <button
          onClick={() => {
            setSuccess(false);
            setConfirmationCode('');
          }}
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
        >
          Weiteren Platz buchen
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          Vollständiger Name *
        </label>
        <input
          type="text"
          id="name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-colors placeholder:text-gray-400"
          placeholder="Max Mustermann"
        />
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          E-Mail *
        </label>
        <input
          type="email"
          id="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-colors placeholder:text-gray-400"
          placeholder="max@beispiel.de"
        />
      </div>

      {/* Company (Optional) */}
      <div>
        <label
          htmlFor="company"
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          Firma/Organisation
        </label>
        <input
          type="text"
          id="company"
          value={formData.company}
          onChange={(e) =>
            setFormData({ ...formData, company: e.target.value })
          }
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-colors placeholder:text-gray-400"
          placeholder="Beispiel GmbH"
        />
      </div>

      {/* Role (Optional) */}
      <div>
        <label
          htmlFor="role"
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          Position/Rolle
        </label>
        <input
          type="text"
          id="role"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-colors placeholder:text-gray-400"
          placeholder="Softwareentwickler/in"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || disabled}
        className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
      >
        {isSubmitting ? 'Wird gebucht...' : 'Buchung bestätigen'}
      </button>

      <p className="text-xs text-gray-400 text-center">
        Mit der Buchung stimmen Sie zu, Updates per E-Mail zu erhalten
      </p>
    </form>
  );
}
