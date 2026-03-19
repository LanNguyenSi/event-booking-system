/**
 * DELETE /api/admin/users/[id] - Delete admin (SUPER_ADMIN only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const authHeader = request.headers.get('Authorization');
    const token = extractToken(authHeader);
    if (!token) {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Nur Super-Admins erlaubt' }, { status: 403 });
    }

    // Prevent deleting own account
    if (payload.adminId === id) {
      return NextResponse.json({ error: 'Kann eigenen Account nicht löschen' }, { status: 400 });
    }

    // Prevent deleting SUPER_ADMIN
    const user = await prisma.admin.findUnique({ where: { id } });
    if (user?.role === 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Super-Admins können nicht gelöscht werden' }, { status: 400 });
    }

    await prisma.admin.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
