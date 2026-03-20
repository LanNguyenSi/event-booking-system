/**
 * Tests for GET /api/bookings/lookup
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prismaMock } from '../helpers/prisma-mock';
import { createRequest } from '../helpers/request';

import { GET } from '@/app/api/bookings/lookup/route';

const mockBooking = {
  id: 'booking-1',
  name: 'Max Mustermann',
  email: 'max@test.de',
  status: 'CONFIRMED',
  confirmationToken: 'EVT-ABC123',
  event: {
    id: 'event-1',
    title: 'Test Workshop',
    description: 'Beschreibung',
    startTime: new Date('2026-04-01'),
    timezone: 'Europe/Berlin',
    location: null,
    meetingLink: null,
    format: 'REMOTE',
    eventType: 'WORKSHOP',
  },
};

describe('GET /api/bookings/lookup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 if email is missing', async () => {
    const req = createRequest('/api/bookings/lookup?code=EVT-ABC123');
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it('should return 400 if code is missing', async () => {
    const req = createRequest('/api/bookings/lookup?email=max@test.de');
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it('should return 404 if no booking matches', async () => {
    prismaMock.booking.findFirst.mockResolvedValue(null);

    const req = createRequest('/api/bookings/lookup?email=max@test.de&code=EVT-WRONG');
    const res = await GET(req);
    expect(res.status).toBe(404);
  });

  it('should return booking with event details', async () => {
    prismaMock.booking.findFirst.mockResolvedValue(mockBooking);

    const req = createRequest('/api/bookings/lookup?email=max@test.de&code=EVT-ABC123');
    const res = await GET(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.booking.name).toBe('Max Mustermann');
    expect(data.booking.event.title).toBe('Test Workshop');
  });

  it('should normalize email and code', async () => {
    prismaMock.booking.findFirst.mockResolvedValue(mockBooking);

    const req = createRequest('/api/bookings/lookup?email=Max%40Test.de&code=evt-abc123');
    await GET(req);

    expect(prismaMock.booking.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          email: 'max@test.de',
          confirmationToken: 'EVT-ABC123',
        }),
      })
    );
  });
});
