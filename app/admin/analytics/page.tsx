'use client';

/**
 * Admin Analytics Page
 * Charts and metrics dashboard
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface AnalyticsData {
  overview: {
    totalEvents: number;
    totalBookings: number;
    upcomingEvents: number;
    cancellationRate: number;
  };
  bookingsByDay: Array<{ date: string; count: number }>;
  eventsByType: Array<{ type: string; count: number }>;
  bookingsByStatus: Array<{ status: string; count: number }>;
  topEvents: Array<{ id: string; title: string; bookings: number }>;
}

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const STATUS_LABELS: Record<string, string> = {
  CONFIRMED: 'Bestätigt',
  CANCELLED: 'Storniert',
  WAITLISTED: 'Warteliste',
  ATTENDED: 'Teilgenommen',
};

const TYPE_LABELS: Record<string, string> = {
  WORKSHOP: 'Workshop',
  TALK: 'Vortrag',
  WEBINAR: 'Webinar',
  MEETUP: 'Meetup',
  CONSULTATION: 'Beratung',
  OTHER: 'Sonstiges',
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/analytics?days=${days}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      alert('Fehler beim Laden der Analysedaten');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Laden...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Keine Daten verfügbar</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/admin/dashboard"
                className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block"
              >
                ← Zurück zum Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            </div>
            <select
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7">Letzte 7 Tage</option>
              <option value="30">Letzte 30 Tage</option>
              <option value="90">Letzte 90 Tage</option>
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Veranstaltungen gesamt</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {data.overview.totalEvents}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Buchungen gesamt</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {data.overview.totalBookings}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Kommende Events</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {data.overview.upcomingEvents}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Stornierungsrate</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {data.overview.cancellationRate}%
            </p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Bookings Over Time */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Buchungen über Zeit
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.bookingsByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#2563eb"
                  strokeWidth={2}
                  name="Buchungen"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Event Types */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Veranstaltungstypen
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.eventsByType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="type"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => TYPE_LABELS[value] || value}
                />
                <YAxis />
                <Tooltip
                  formatter={(value) => [value, 'Anzahl']}
                  labelFormatter={(value) => TYPE_LABELS[value] || value}
                />
                <Bar dataKey="count" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Booking Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Buchungsstatus
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.bookingsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) =>
                    `${STATUS_LABELS[entry.status] || entry.status} ${(entry.percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="status"
                >
                  {data.bookingsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [value, STATUS_LABELS[name as string] || name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Top Events */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Top 5 Veranstaltungen
            </h3>
            <div className="space-y-3">
              {data.topEvents.map((event, index) => (
                <div key={event.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                      {index + 1}
                    </div>
                    <Link
                      href={`/events/${event.id}`}
                      target="_blank"
                      className="text-gray-900 hover:text-blue-600 font-medium"
                    >
                      {event.title}
                    </Link>
                  </div>
                  <span className="text-gray-600 font-semibold">
                    {event.bookings} Buchungen
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
