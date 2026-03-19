# Task 006: Event Filters & Search

**Priority:** P1  
**Estimate:** 2 hours  
**Status:** Open

## Problem

Public event listing shows all events without filtering options.

## Requirements

### Public Event Page
- Filter by: Event Type (Workshop, Talk, Webinar, etc.)
- Filter by: Format (Remote, In Person, Hybrid)
- Filter by: Date range (upcoming week, month, custom)
- Search by: Title (text search)
- Sort by: Date (default), Title

### API
- `GET /api/events` already supports query params
- Verify/extend: `?type=WORKSHOP&format=REMOTE&search=AI&from=2026-03-19&sort=date`

## Files to Modify

```
app/(public)/events/page.tsx      — ADD: Filter bar, search input
app/api/events/route.ts           — VERIFY: Query param support
```

## Implementation Notes

- Use URL search params for state (shareable filtered URLs)
- Debounce search input (300ms)
- Show "No events found" when filters return empty
- Reset filters button
