/**
 * Tests for lib/auth.ts - Pure utility functions
 */

import { describe, it, expect } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  extractToken,
} from '@/lib/auth';

describe('hashPassword / verifyPassword', () => {
  it('should hash a password and verify it correctly', async () => {
    const password = 'test-password-123';
    const hash = await hashPassword(password);

    expect(hash).not.toBe(password);
    expect(await verifyPassword(password, hash)).toBe(true);
  });

  it('should reject a wrong password', async () => {
    const hash = await hashPassword('correct-password');
    expect(await verifyPassword('wrong-password', hash)).toBe(false);
  });

  it('should produce different hashes for the same password', async () => {
    const password = 'same-password';
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);

    expect(hash1).not.toBe(hash2);
  });
});

describe('generateToken / verifyToken', () => {
  const payload = {
    adminId: 'admin-1',
    username: 'testadmin',
    role: 'ADMIN',
  };

  it('should generate a token and verify it', () => {
    const token = generateToken(payload);

    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // JWT format

    const decoded = verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded!.adminId).toBe(payload.adminId);
    expect(decoded!.username).toBe(payload.username);
    expect(decoded!.role).toBe(payload.role);
  });

  it('should return null for an invalid token', () => {
    expect(verifyToken('invalid-token')).toBeNull();
  });

  it('should return null for a tampered token', () => {
    const token = generateToken(payload);
    const tampered = token.slice(0, -5) + 'XXXXX';
    expect(verifyToken(tampered)).toBeNull();
  });
});

describe('extractToken', () => {
  it('should extract token from Bearer header', () => {
    expect(extractToken('Bearer my-token-123')).toBe('my-token-123');
  });

  it('should return null for null input', () => {
    expect(extractToken(null)).toBeNull();
  });

  it('should return null for non-Bearer header', () => {
    expect(extractToken('Basic abc123')).toBeNull();
  });

  it('should return null for empty string', () => {
    expect(extractToken('')).toBeNull();
  });
});
