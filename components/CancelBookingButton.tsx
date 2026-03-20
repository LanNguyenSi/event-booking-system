'use client';

/**
 * Cancel Booking Button Component
 * Client component for admin booking cancellation with confirmation dialog
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CancelBookingButtonProps {
  bookingId: string;
}

export default function CancelBookingButton({ bookingId }: CancelBookingButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCancel = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Stornierung fehlgeschlagen');
      }

      router.refresh();
      setShowConfirm(false);
    } catch (error) {
      console.error('Error cancelling booking:', error);
      setError(error instanceof Error ? error.message : 'Stornierung fehlgeschlagen');
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className="flex flex-col gap-1.5">
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Bist du sicher?</span>
        <button
          onClick={handleCancel}
          disabled={isLoading}
          className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
        >
          {isLoading ? 'Wird storniert...' : 'Ja'}
        </button>
        <button
          onClick={() => { setShowConfirm(false); setError(null); }}
          disabled={isLoading}
          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 text-sm"
        >
          Nein
        </button>
      </div>
    </div>
  );
}
