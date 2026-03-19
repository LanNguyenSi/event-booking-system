# Task 012: Multi-Admin Support

**Priority:** P2  
**Estimate:** 3 hours  
**Status:** Open

## Summary

Support multiple admin accounts with role-based permissions.

## Requirements

- Admin user management page
- Roles: `SUPER_ADMIN` (full access), `ADMIN` (manage events + bookings)
- Invite flow: Super admin creates invite, new admin registers
- Audit log: Who created/edited/deleted what

## Schema Changes

- `AdminUser` model: Add `role` field
- `AuditLog` model: action, adminId, resourceType, resourceId, timestamp

## Technical

- Seed script: Create initial super admin
- JWT: Include role in token
- Middleware: `requireRole('SUPER_ADMIN')` for user management
