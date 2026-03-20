/**
 * Tests for POST /api/bookings (create booking)
 * Tests for GET /api/bookings (admin list)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prismaMock } from '../helpers/prisma-mock';
import { createRequest, withAuth } from '../helpers/request';

vi.mock('@/lib/auth', async () => {
  const actual = await vi.importActual<typeof import('@/lib/auth')>('@/lib/auth');
  return {
    ...actual,
    verifyToken: vi.fn((token: string) =>
      token === 'valid-token'
        ? { adminId: 'admin-1', username: 'admin', role: 'ADMIN' }
        : null
    ),
  };
});

vi.mock('@/lib/email', () => ({
  sendBookingConfirmation: vi.fn().mockResolvedValue(undefined),
}));

import { POST, GET } from '@/app/api/bookings/route';

const mockEvent = {
  id: 'event-1',
  title: 'Test Workshop',
  status: 'PUBLISHED',
  availableSlots: 10,
  totalSlots: 20,
  maxSlotsPerUser: 1,
  bookings: [],
};

const mockBooking = {
  id: 'booking-1',
  eventId: 'event-1',
  name: 'Max Mustermann',
  email: 'max@test.de',
  status: 'CONFIRMED',
  confirmationToken: 'EVT-ABC123',
  event: mockEvent,
};

describe('POST /api/bookings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 if required fields are missing', async () => {
    const req = createRequest('/api/bookings', {
      method: 'POST',
      body: { eventId: 'event-1', name: 'Max' },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('should return 404 if event not found', async () => {
    prismaMock.event.findUnique.mockResolvedValue(null);

    const req = createRequest('/api/bookings', {
      method: 'POST',
      body: { eventId: 'nonexistent', name: 'Max', email: 'max@test.de' },
    });

    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  it('should return 400 if event is not published', async () => {
    prismaMock.event.findUnique.mockResolvedValue({
      ...mockEvent,
      status: 'DRAFT',
    });

    const req = createRequest('/api/bookings', {
      method: 'POST',
      body: { eventId: 'event-1', name: 'Max', email: 'max@test.de' },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('should return 400 if user already has max bookings', async () => {
    prismaMock.event.findUnique.mockResolvedValue({
      ...mockEvent,
      maxSlotsPerUser: 1,
      bookings: [{ id: 'existing', email: 'max@test.de', status: 'CONFIRMED' }],
    });

    const req = createRequest('/api/bookings', {
      method: 'POST',
      body: { eventId: 'event-1', name: 'Max', email: 'max@test.de' },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('should create confirmed booking when slots available', async () => {
    prismaMock.event.findUnique.mockResolvedValue(mockEvent);
    prismaMock.$transaction.mockResolvedValue([mockBooking, {}]);

    const req = createRequest('/api/bookings', {
      method: 'POST',
      body: { eventId: 'event-1', name: 'Max Mustermann', email: 'max@test.de' },
    });

    const res = await POST(req);
    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data.waitlisted).toBe(false);
  });

  it('should create waitlisted booking when no slots available', async () => {
    prismaMock.event.findUnique.mockResolvedValue({
      ...mockEvent,
      availableSlots: 0,
    });
    prismaMock.booking.create.mockResolvedValue({
      ...mockBooking,
      status: 'WAITLISTED',
    });

    const req = createRequest('/api/bookings', {
      method: 'POST',
      body: { eventId: 'event-1', name: 'Max Mustermann', email: 'max@test.de' },
    });

    const res = await POST(req);
    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data.waitlisted).toBe(true);
  });
});

describe('GET /api/bookings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 without auth token', async () => {
    const req = createRequest('/api/bookings');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('should return bookings with valid auth', async () => {
    prismaMock.booking.findMany.mockResolvedValue([mockBooking]);

    const req = createRequest('/api/bookings', {
      headers: withAuth(),
    });
    const res = await GET(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.bookings).toHaveLength(1);
  });

  it('should filter bookings by eventId', async () => {
    prismaMock.booking.findMany.mockResolvedValue([]);

    const req = createRequest('/api/bookings?eventId=event-1', {
      headers: withAuth(),
    });
    await GET(req);

    expect(prismaMock.booking.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { eventId: 'event-1' },
      })
    );
  });
});
