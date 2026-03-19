# Task 007: Markdown Descriptions

**Priority:** P1  
**Estimate:** 1 hour  
**Status:** Open

## Problem

Event descriptions are plain text. Organizers need formatting (headers, links, lists, bold).

## Requirements

- Render event description as Markdown on public detail page
- Admin: Textarea remains plain text (Markdown preview optional)
- Sanitize HTML output (XSS prevention)

## Dependencies

```bash
npm install react-markdown remark-gfm
```

## Files to Modify

```
app/(public)/events/[id]/page.tsx  — MODIFY: Render description with ReactMarkdown
```

## Implementation Notes

- `react-markdown` with `remark-gfm` for GitHub-flavored Markdown
- No `dangerouslySetInnerHTML` — react-markdown handles sanitization
- Style Markdown output with Tailwind prose classes (`@tailwindcss/typography`)
