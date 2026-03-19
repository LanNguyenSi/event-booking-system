# Task 011: Analytics Dashboard

**Priority:** P2  
**Estimate:** 4 hours  
**Status:** Open

## Summary

Enhanced admin dashboard with charts and metrics.

## Metrics

- Bookings over time (line chart)
- Popular event types (bar chart)
- Booking conversion rate (views → bookings)
- Cancellation rate
- Top events by bookings
- Upcoming events timeline

## Technical

- Use Recharts (already a proven choice from Frost Dashboard)
- API: `GET /api/admin/analytics` with date range params
- Aggregate queries with Prisma `groupBy`
