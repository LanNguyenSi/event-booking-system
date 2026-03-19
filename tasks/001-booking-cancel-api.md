# Task 001: Booking Cancel API

**Priority:** P0  
**Estimate:** 2 hours  
**Status:** Open

## Problem

Users cannot cancel their bookings. Admins cannot cancel bookings from the admin panel.

## Requirements

### API Endpoint
- `PATCH /api/bookings/[id]` — Update booking status
  - Accept: `{ status: "CANCELLED" }`
  - Auth: Admin token OR matching email + confirmation code
  - On cancel: Increment `event.availableSlots` by booking slot count
  - Use database transaction (slot increment + status update atomic)

### Public Cancel Flow
- User receives confirmation code in booking response
- `PATCH /api/bookings/[id]` with `{ status: "CANCELLED", email: "...", confirmationCode: "..." }`
- Returns success message

### Admin Cancel Flow
- Admin can cancel any booking via dashboard
- Add "Cancel" button to bookings list page (`app/admin/bookings/page.tsx`)
- Confirmation dialog before cancel

## Files to Create/Modify

```
app/api/bookings/[id]/route.ts    — NEW: PATCH handler
app/admin/bookings/page.tsx       — MODIFY: Add cancel button
```

## Implementation Notes

- Booking already has `status` field (CONFIRMED, CANCELLED, PENDING)
- Slot restoration MUST be in a transaction
- Don't allow cancelling already-cancelled bookings
- Return 404 for non-existent bookings

## Testing

```bash
# Admin cancel
curl -X PATCH https://termine.lan-nguyen-si.de/api/bookings/BOOKING_ID \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "CANCELLED"}'

# Public cancel
curl -X PATCH https://termine.lan-nguyen-si.de/api/bookings/BOOKING_ID \
  -H "Content-Type: application/json" \
  -d '{"status": "CANCELLED", "email": "user@example.com", "confirmationCode": "ABC123"}'
```
