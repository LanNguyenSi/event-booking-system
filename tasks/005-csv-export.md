# Task 005: CSV Export

**Priority:** P1  
**Estimate:** 1.5 hours  
**Status:** Open

## Problem

Admin cannot export booking data for external use (spreadsheets, mailing lists).

## Requirements

### API
- `GET /api/bookings/export?eventId=...&format=csv` — Admin only
  - Returns CSV file with headers: Name, Email, Event, Status, Booked At
  - Filter by event (optional)
  - `Content-Type: text/csv`
  - `Content-Disposition: attachment; filename="bookings-YYYY-MM-DD.csv"`

### Admin UI
- Add "Export CSV" button to bookings page
- Optional: Event-specific export from event detail

## Files to Create/Modify

```
app/api/bookings/export/route.ts   — NEW: CSV export endpoint
app/admin/bookings/page.tsx        — MODIFY: Add export button
```

## Implementation Notes

- No external library needed — generate CSV string manually
- Escape commas and quotes in fields
- UTF-8 BOM for Excel compatibility: `\uFEFF` prefix
