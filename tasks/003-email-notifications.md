# Task 003: Email Notifications

**Priority:** P0  
**Estimate:** 4 hours  
**Status:** Open

## Problem

No email confirmation after booking. Users have no record of their booking.

## Requirements

### Email Types
1. **Booking Confirmation** — Sent after successful booking
   - Event details (title, date, location/link)
   - Booking reference / confirmation code
   - Cancel link
   
2. **Booking Cancellation** — Sent when booking is cancelled
   - Confirmation that booking was cancelled
   - Event details for reference

3. **Event Cancelled** — Sent to all attendees when event is cancelled
   - Apology + event details
   - Bookings auto-cancelled

### Technical

- Use `nodemailer` (already in package.json dependencies)
- SMTP config via environment variables:
  ```env
  SMTP_HOST=smtp.example.com
  SMTP_PORT=587
  SMTP_USER=noreply@lan-nguyen-si.de
  SMTP_PASS=xxx
  SMTP_FROM="Event Booking <noreply@lan-nguyen-si.de>"
  ```
- HTML email templates (inline CSS, responsive)
- Plain text fallback
- Email sending should be async (don't block API response)

## Files to Create/Modify

```
lib/email.ts                      — NEW: Email service (send, templates)
lib/email-templates/
  booking-confirmation.ts         — NEW: HTML template
  booking-cancellation.ts         — NEW: HTML template
  event-cancelled.ts              — NEW: HTML template
app/api/bookings/route.ts         — MODIFY: Send email after booking
app/api/bookings/[id]/route.ts    — MODIFY: Send email on cancel
.env.example                      — MODIFY: Add SMTP vars
```

## Implementation Notes

- Fail gracefully: If email fails, booking still succeeds (log error)
- Rate limit: Don't send duplicate emails
- Consider: Queue system for production (optional, nodemailer is fine for MVP)
- Test with Ethereal (https://ethereal.email) or Mailtrap
