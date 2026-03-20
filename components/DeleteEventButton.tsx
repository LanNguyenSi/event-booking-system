'use client';

/**
 * Delete Event Button Component
 * Client component for admin event soft deletion with confirmation dialog
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DeleteEventButtonProps {
  eventId: string;
  eventTitle: string;
  confirmedBookingsCount: number;
  status: string;
}

export default function DeleteEventButton({
  eventId,
  eventTitle,
  confirmedBookingsCount,
  status
}: DeleteEventButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPermanentConfirm, setShowPermanentConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const isCancelled = status === 'CANCELLED';

  const handleDelete = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const url = confirmedBookingsCount > 0
        ? `/api/events/${eventId}?force=true`
        : `/api/events/${eventId}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Veranstaltung konnte nicht gelöscht werden');
      }

      router.refresh();
      setShowConfirm(false);
    } catch (error) {
      console.error('Error deleting event:', error);
      setError(error instanceof Error ? error.message : 'Veranstaltung konnte nicht gelöscht werden');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermanentDelete = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const response = await fetch(`/api/events/${eventId}?permanent=true`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Veranstaltung konnte nicht endgültig gelöscht werden');
      }

      router.push('/admin/events');
    } catch (error) {
      console.error('Error permanently deleting event:', error);
      setError(error instanceof Error ? error.message : 'Veranstaltung konnte nicht endgültig gelöscht werden');
    } finally {
      setIsLoading(false);
    }
  };

  // For cancelled events: show permanent delete button
  if (isCancelled) {
    if (!showPermanentConfirm) {
      return (
        <button
          onClick={() => setShowPermanentConfirm(true)}
          className="text-red-600 hover:text-red-800 font-medium"
        >
          Endgültig löschen
        </button>
      );
    }

    return (
      <div className="flex flex-col gap-2">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="text-sm text-red-700 font-medium">
          Diese Aktion kann nicht rückgängig gemacht werden. Die Veranstaltung und alle zugehörigen Buchungen werden unwiderruflich gelöscht.
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePermanentDelete}
            disabled={isLoading}
            className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
          >
            {isLoading ? 'Lösche...' : 'Ja, endgültig löschen'}
          </button>
          <button
            onClick={() => { setShowPermanentConfirm(false); setError(null); }}
            disabled={isLoading}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 text-sm"
          >
            Abbrechen
          </button>
        </div>
      </div>
    );
  }

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        className="text-red-600 hover:text-red-800 font-medium"
      >
        Stornieren
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="text-sm text-gray-600">
        &quot;{eventTitle}&quot; stornieren?
        {confirmedBookingsCount > 0 && (
          <div className="text-xs text-orange-600 mt-1">
            {confirmedBookingsCount} bestätigte Buchung(en) werden storniert
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleDelete}
          disabled={isLoading}
          className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
        >
          {isLoading ? 'Lösche...' : 'Ja, stornieren'}
        </button>
        <button
          onClick={() => { setShowConfirm(false); setError(null); }}
          disabled={isLoading}
          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 text-sm"
        >
          Abbrechen
        </button>
      </div>
    </div>
  );
}
