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
  const router = useRouter();

  // Don't show delete button for already cancelled events
  if (status === 'CANCELLED') {
    return null;
  }

  const handleDelete = async () => {
    setIsLoading(true);

    try {
      // Get admin token from localStorage
      const token = localStorage.getItem('admin_token');
      if (!token) {
        alert('Not authenticated. Please log in again.');
        router.push('/admin/login');
        return;
      }

      // If event has confirmed bookings, force delete
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
        throw new Error(data.error || 'Failed to delete event');
      }

      // Success - refresh the page
      router.refresh();
      setShowConfirm(false);
    } catch (error) {
      console.error('Error deleting event:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete event');
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
        Delete
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm text-gray-600">
        Delete &quot;{eventTitle}&quot;?
        {confirmedBookingsCount > 0 && (
          <div className="text-xs text-orange-600 mt-1">
            ⚠️ {confirmedBookingsCount} confirmed booking(s) will be cancelled
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleDelete}
          disabled={isLoading}
          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-sm"
        >
          {isLoading ? 'Deleting...' : 'Yes, Delete'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={isLoading}
          className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
