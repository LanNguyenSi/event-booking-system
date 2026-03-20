/**
 * Tests for POST /api/auth/login
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prismaMock } from '../helpers/prisma-mock';
import { createRequest } from '../helpers/request';

// Mock auth module partially - keep real extractToken/verifyToken but mock verifyPassword
vi.mock('@/lib/auth', async () => {
  const actual = await vi.importActual<typeof import('@/lib/auth')>('@/lib/auth');
  return {
    ...actual,
    verifyPassword: vi.fn(),
  };
});

import { POST } from '@/app/api/auth/login/route';
import { verifyPassword } from '@/lib/auth';

const mockVerifyPassword = vi.mocked(verifyPassword);

const mockAdmin = {
  id: 'admin-1',
  username: 'testadmin',
  email: 'admin@test.de',
  passwordHash: '$2b$10$hashedpassword',
  role: 'ADMIN',
  createdAt: new Date(),
};

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 if username is missing', async () => {
    const req = createRequest('/api/auth/login', {
      method: 'POST',
      body: { password: 'test' },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('should return 400 if password is missing', async () => {
    const req = createRequest('/api/auth/login', {
      method: 'POST',
      body: { username: 'admin' },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('should return 401 if admin not found', async () => {
    prismaMock.admin.findUnique.mockResolvedValue(null);

    const req = createRequest('/api/auth/login', {
      method: 'POST',
      body: { username: 'nonexistent', password: 'test' },
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('should return 401 if password is wrong', async () => {
    prismaMock.admin.findUnique.mockResolvedValue(mockAdmin);
    mockVerifyPassword.mockResolvedValue(false);

    const req = createRequest('/api/auth/login', {
      method: 'POST',
      body: { username: 'testadmin', password: 'wrongpassword' },
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('should return 200 with token on valid login', async () => {
    prismaMock.admin.findUnique.mockResolvedValue(mockAdmin);
    mockVerifyPassword.mockResolvedValue(true);

    const req = createRequest('/api/auth/login', {
      method: 'POST',
      body: { username: 'testadmin', password: 'correctpassword' },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.token).toBeDefined();
    expect(data.admin.id).toBe('admin-1');
    expect(data.admin.username).toBe('testadmin');
    expect(data.admin.role).toBe('ADMIN');
    // Should not expose password hash
    expect(data.admin.passwordHash).toBeUndefined();
  });
});
