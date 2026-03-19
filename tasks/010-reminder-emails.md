# Task 010: Reminder Emails

**Priority:** P2  
**Estimate:** 3 hours  
**Status:** Open  
**Depends on:** Task 003 (Email Notifications)

## Summary

Send reminder emails to attendees X hours before event start.

## Requirements

- Configurable reminder time per event (default: 24h before)
- Cron job or scheduled task to check upcoming events
- Email template with event details + meeting link
- Don't send reminders for cancelled bookings/events

## Technical Options

1. **Cron job** — Script that runs every hour, checks for events starting in next 24h
2. **Next.js API route** — Called by external cron (e.g., cron-job.org)
3. **Database flag** — `reminderSent: Boolean` on booking to prevent duplicates
