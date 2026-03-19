# Task 008: Open Graph Tags

**Priority:** P1  
**Estimate:** 1 hour  
**Status:** Open

## Problem

Sharing event links on social media shows no preview (no title, description, image).

## Requirements

- Dynamic OG tags per event page:
  - `og:title` — Event title
  - `og:description` — First 160 chars of description
  - `og:type` — "event"
  - `og:url` — Event URL
  - `og:image` — Event cover image or default
- Twitter Card tags
- Global OG tags for homepage and events listing

## Files to Modify

```
app/(public)/events/[id]/page.tsx  — ADD: generateMetadata() export
app/layout.tsx                     — ADD: Default OG tags
```

## Implementation Notes

- Next.js `generateMetadata()` is the standard approach
- For event pages, fetch event data in metadata function
- Default image: Create a generic branded OG image (1200x630)
- Test with: https://www.opengraph.xyz/
