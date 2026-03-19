# Task 002: Event Soft Delete

**Priority:** P0  
**Estimate:** 1.5 hours  
**Status:** Open

## Problem

Admins cannot delete events. Events with existing bookings should never be hard-deleted.

## Requirements

### API
- `DELETE /api/events/[id]` — Soft delete (set `status: "CANCELLED"`)
  - Auth: Admin only
  - If event has confirmed bookings: return warning, require `?force=true`
  - Cancelled events hidden from public listing
  - Cancelled events shown in admin with "Cancelled" badge

### Admin UI
- Add "Delete" button to events list (`app/admin/events/page.tsx`)
- Add "Delete" button to edit page (`app/admin/events/[id]/edit/page.tsx`)
- Confirmation dialog: "This event has X bookings. Are you sure?"
- If forced: All bookings auto-cancelled (trigger email if Task 003 is done)

## Files to Modify

```
app/api/events/[id]/route.ts      — ADD: DELETE handler
app/admin/events/page.tsx          — ADD: Delete button
app/admin/events/[id]/edit/page.tsx — ADD: Delete button
```

## Implementation Notes

- Use `status: "CANCELLED"` (already exists in schema)
- Public event listing already filters by `status: "PUBLISHED"`
- Admin listing should show all statuses with color badges
- Consider: Should cancelled events be restorable? (status → DRAFT)
