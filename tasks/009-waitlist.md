# Task 009: Waitlist

**Priority:** P2  
**Estimate:** 3 hours  
**Status:** Open

## Summary

When an event is fully booked, users can join a waitlist. When a booking is cancelled, first waitlist entry gets auto-promoted to confirmed booking (with email notification).

## Schema Changes

- New `WaitlistEntry` model OR use `Booking` with `status: "WAITLISTED"`
- Position tracking (FIFO)

## Key Logic

- `POST /api/bookings` → if no slots available, create waitlisted booking
- On cancel → check waitlist → auto-confirm first entry → send email
- Public UI: Show "Join Waitlist" button when full
- Admin UI: Show waitlist count per event
