/**
 * Tests for GET/POST /api/events
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

import { GET, POST } from '@/app/api/events/route';

const mockEvent = {
  id: 'event-1',
  title: 'Test Workshop',
  description: 'Ein Test-Workshop',
  eventType: 'WORKSHOP',
  format: 'REMOTE',
  startTime: new Date('2026-04-01'),
  timezone: 'Europe/Berlin',
  totalSlots: 20,
  availableSlots: 15,
  maxSlotsPerUser: 1,
  status: 'PUBLISHED',
  _count: { bookings: 5 },
};

describe('GET /api/events', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return published events', async () => {
    prismaMock.event.findMany.mockResolvedValue([mockEvent]);

    const req = createRequest('/api/events');
    const res = await GET(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.events).toHaveLength(1);
    expect(data.events[0].title).toBe('Test Workshop');
  });

  it('should filter by event type', async () => {
    prismaMock.event.findMany.mockResolvedValue([]);

    const req = createRequest('/api/events?type=TALK');
    await GET(req);

    expect(prismaMock.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          eventType: 'TALK',
        }),
      })
    );
  });
});

describe('POST /api/events', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 without auth token', async () => {
    const req = createRequest('/api/events', {
      method: 'POST',
      body: { title: 'Test' },
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('should return 401 with invalid token', async () => {
    const req = createRequest('/api/events', {
      method: 'POST',
      body: { title: 'Test' },
      headers: withAuth({}, 'invalid-token'),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('should return 400 if required fields are missing', async () => {
    const req = createRequest('/api/events', {
      method: 'POST',
      body: { title: 'Test' },
      headers: withAuth(),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('should create event with valid data', async () => {
    prismaMock.event.create.mockResolvedValue({ ...mockEvent, id: 'new-event' });

    const req = createRequest('/api/events', {
      method: 'POST',
      body: {
        title: 'Neuer Workshop',
        description: 'Beschreibung',
        eventType: 'WORKSHOP',
        format: 'REMOTE',
        startTime: '2026-04-01T10:00:00Z',
        totalSlots: '20',
      },
      headers: withAuth(),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);

    expect(prismaMock.event.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: 'Neuer Workshop',
          totalSlots: 20,
          availableSlots: 20,
        }),
      })
    );
  });
});
