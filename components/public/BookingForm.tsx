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
        throw new Error(data.error || 'Failed to create booking');
      }

      setSuccess(true);
      setConfirmationCode(data.booking?.confirmationToken || '');
      setIsWaitlisted(data.waitlisted || false);
      setFormData({ name: '', email: '', company: '', role: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-6">
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-green-500"
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
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {isWaitlisted ? 'Auf Warteliste!' : 'Buchung bestätigt!'}
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          {isWaitlisted 
            ? 'Die Veranstaltung ist ausgebucht. Sie wurden auf die Warteliste gesetzt und werden automatisch benachrichtigt, sobald ein Platz frei wird.'
            : 'Sie erhalten in Kürze eine Bestätigungs-E-Mail.'
          }
        </p>
        
        {confirmationCode && (
          <div className={`mb-6 p-4 rounded-lg border ${isWaitlisted ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200'}`}>
            <p className="text-sm text-gray-700 mb-2">{isWaitlisted ? 'Ihr Wartelisten-Code:' : 'Ihr Bestätigungscode:'}</p>
            <p className={`text-2xl font-mono font-bold tracking-wider mb-3 ${isWaitlisted ? 'text-orange-900' : 'text-blue-900'}`}>
              {confirmationCode}
            </p>
            <p className="text-xs text-gray-600 mb-3">
              {isWaitlisted
                ? 'Bitte bewahren Sie diesen Code auf. Sie werden automatisch informiert, wenn ein Platz frei wird.'
                : 'Bitte bewahren Sie diesen Code auf. Sie können damit Ihre Buchung jederzeit einsehen oder stornieren.'
              }
            </p>
            <a
              href="/bookings/lookup"
              className={`inline-block hover:underline text-sm font-medium ${isWaitlisted ? 'text-orange-600' : 'text-blue-600'}`}
            >
              {isWaitlisted ? 'Wartelisten-Status prüfen' : 'Buchung verwalten'} →
            </a>
          </div>
        )}

        <button
          onClick={() => {
            setSuccess(false);
            setConfirmationCode('');
          }}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Weiteren Platz buchen
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Vollständiger Name *
        </label>
        <input
          type="text"
          id="name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="John Doe"
        />
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email *
        </label>
        <input
          type="email"
          id="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="john@example.com"
        />
      </div>

      {/* Company (Optional) */}
      <div>
        <label
          htmlFor="company"
          className="block text-sm font-medium text-gray-700 mb-1"
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
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Acme Inc"
        />
      </div>

      {/* Role (Optional) */}
      <div>
        <label
          htmlFor="role"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Position/Rolle
        </label>
        <input
          type="text"
          id="role"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Software Engineer"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || disabled}
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Wird gebucht...' : 'Buchung bestätigen'}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Mit der Buchung stimmen Sie zu, Updates per E-Mail zu erhalten
      </p>
    </form>
  );
}
