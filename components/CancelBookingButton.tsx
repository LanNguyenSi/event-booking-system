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
  const router = useRouter();

  const handleCancel = async () => {
    setIsLoading(true);

    try {
      // Get admin token from localStorage
      const token = localStorage.getItem('adminToken');
      if (!token) {
        alert('Not authenticated. Please log in again.');
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
        throw new Error(data.error || 'Failed to cancel booking');
      }

      // Success - refresh the page to show updated status
      router.refresh();
      setShowConfirm(false);
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert(error instanceof Error ? error.message : 'Failed to cancel booking');
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
        Cancel
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">Are you sure?</span>
      <button
        onClick={handleCancel}
        disabled={isLoading}
        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-sm"
      >
        {isLoading ? 'Cancelling...' : 'Yes'}
      </button>
      <button
        onClick={() => setShowConfirm(false)}
        disabled={isLoading}
        className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 text-sm"
      >
        No
      </button>
    </div>
  );
}
