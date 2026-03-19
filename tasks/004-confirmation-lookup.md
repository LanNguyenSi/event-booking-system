# Task 004: Confirmation Code Lookup

**Priority:** P0  
**Estimate:** 2 hours  
**Status:** Open

## Problem

Users can't look up their booking status after booking. No public-facing booking detail page.

## Requirements

### Public Lookup Page
- Route: `/bookings/lookup`
- Form: Email + Confirmation Code
- Shows booking details (event, status, date)
- Cancel button (uses Task 001 API)

### API
- `GET /api/bookings/lookup?email=...&code=...` — Public lookup
  - Returns booking + event details
  - No auth required (email + code is auth)

### Confirmation Code
- Already generated during booking (`confirmationCode` field in schema)
- Verify: Is it actually generated and returned? Check `POST /api/bookings`

## Files to Create/Modify

```
app/(public)/bookings/lookup/page.tsx  — NEW: Lookup form + result
app/api/bookings/lookup/route.ts       — NEW: GET handler
```

## Implementation Notes

- Confirmation code should be short, uppercase, human-readable (e.g., `EVT-A3B7K9`)
- Show cancel option only for CONFIRMED bookings
- Show "Already cancelled" for CANCELLED bookings
- Link to this page from booking confirmation (and email, once Task 003 is done)
