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

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

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
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/analytics?days=${days}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Analysedaten konnten nicht geladen werden');
      }

      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Fehler beim Laden der Analysedaten');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 mb-3">
            <svg className="w-6 h-6 text-indigo-500 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-gray-500 text-sm">Laden...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-600 mb-4 font-medium">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-md text-sm"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-gray-500 text-sm">Keine Daten verfügbar</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors mb-2"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Dashboard
              </Link>
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">Statistiken</h1>
            </div>
            <select
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-colors"
            >
              <option value="7">Letzte 7 Tage</option>
              <option value="30">Letzte 30 Tage</option>
              <option value="90">Letzte 90 Tage</option>
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6">
            <p className="text-xs sm:text-sm font-medium text-gray-500">Veranstaltungen</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1.5">
              {data.overview.totalEvents}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6">
            <p className="text-xs sm:text-sm font-medium text-gray-500">Buchungen</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1.5">
              {data.overview.totalBookings}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6">
            <p className="text-xs sm:text-sm font-medium text-gray-500">Kommende</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1.5">
              {data.overview.upcomingEvents}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6">
            <p className="text-xs sm:text-sm font-medium text-gray-500">Stornierungsrate</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1.5">
              {data.overview.cancellationRate}%
            </p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Bookings Over Time */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
              Buchungen über Zeit
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data.bookingsByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#6366f1"
                  strokeWidth={2}
                  name="Buchungen"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Event Types */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
              Veranstaltungstypen
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.eventsByType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="type"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) => TYPE_LABELS[value] || value}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value) => [value, 'Anzahl']}
                  labelFormatter={(value) => TYPE_LABELS[value] || value}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Booking Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
              Buchungsstatus
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data.bookingsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) =>
                    `${STATUS_LABELS[entry.status] || entry.status} ${(entry.percent * 100).toFixed(0)}%`
                  }
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="status"
                >
                  {data.bookingsByStatus.map((_entry, index) => (
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
              Top 5 Veranstaltungen
            </h3>
            <div className="space-y-3">
              {data.topEvents.map((event, index) => (
                <div key={event.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-semibold flex-shrink-0">
                      {index + 1}
                    </div>
                    <Link
                      href={`/events/${event.id}`}
                      target="_blank"
                      className="text-gray-900 hover:text-indigo-600 font-medium truncate transition-colors"
                    >
                      {event.title}
                    </Link>
                  </div>
                  <span className="text-gray-500 font-semibold whitespace-nowrap ml-3 text-sm">
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
