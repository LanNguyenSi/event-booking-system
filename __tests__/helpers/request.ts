/**
 * Test helpers for creating NextRequest objects
 */

import { NextRequest } from 'next/server';

export function createRequest(
  url: string,
  options?: {
    method?: string;
    body?: Record<string, unknown>;
    headers?: Record<string, string>;
  }
): NextRequest {
  const fullUrl = url.startsWith('http') ? url : `http://localhost:3000${url}`;
  const init: RequestInit = {
    method: options?.method || 'GET',
    headers: options?.headers || {},
  };

  if (options?.body) {
    init.body = JSON.stringify(options.body);
    (init.headers as Record<string, string>)['Content-Type'] = 'application/json';
  }

  return new NextRequest(fullUrl, init as any);
}

export function withAuth(headers?: Record<string, string>, token = 'valid-token'): Record<string, string> {
  return {
    ...headers,
    Authorization: `Bearer ${token}`,
  };
}
