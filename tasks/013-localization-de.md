# Task 013: German Localization (i18n)

**Priority:** P0  
**Estimate:** 3 hours  
**Status:** Open

## Problem

The entire UI is in English. Target audience is primarily German-speaking users. All public-facing pages need German text.

## Requirements

### Phase 1: Static German (MVP — this task)
- Translate all public pages to German
- Translate admin pages to German
- German date/time formatting (DD.MM.YYYY, HH:mm Uhr)
- German error messages

### Pages to Translate

**Public:**
- `/` — Homepage (Hero, CTA, Footer)
- `/events` — Event listing (headers, filters, empty state)
- `/events/[id]` — Event detail (labels, booking form, button text)
- Booking confirmation messages

**Admin:**
- `/admin/login` — Login form
- `/admin/dashboard` — Dashboard labels, stats
- `/admin/events` — Event list, action buttons
- `/admin/events/new` — Create form labels
- `/admin/events/[id]/edit` — Edit form labels
- `/admin/bookings` — Booking list, cancel dialog

**API Responses:**
- Error messages (e.g., "Event not found" → "Veranstaltung nicht gefunden")
- Success messages (e.g., "Booking confirmed" → "Buchung bestätigt")

### Translation Map (Key Strings)

```
Events → Veranstaltungen
Bookings → Buchungen
Dashboard → Dashboard (same)
Create Event → Veranstaltung erstellen
Edit Event → Veranstaltung bearbeiten
Book Now → Jetzt buchen
Cancel → Stornieren
Confirm → Bestätigen
Available Slots → Verfügbare Plätze
Date → Datum
Location → Ort
Format → Format
Remote → Online
In Person → Vor Ort
Hybrid → Hybrid
Workshop → Workshop (same)
Talk → Vortrag
Webinar → Webinar (same)
Meetup → Meetup (same)
Draft → Entwurf
Published → Veröffentlicht
Cancelled → Abgesagt
Name → Name (same)
Email → E-Mail
Status → Status (same)
Actions → Aktionen
Back to Events → Zurück zu Veranstaltungen
No events found → Keine Veranstaltungen gefunden
Are you sure? → Bist du sicher?
Yes → Ja
No → Nein
Loading... → Laden...
Save Changes → Änderungen speichern
Create → Erstellen
Login → Anmelden
Username → Benutzername
Password → Passwort
Total Slots → Gesamtplätze
Max per User → Max. pro Person
Organizer → Veranstalter
Description → Beschreibung
Start Date & Time → Startdatum & Uhrzeit
Timezone → Zeitzone
Meeting Link → Meeting-Link
```

## Approach

**Option A: Simple string replacement (recommended for now)**
- Replace all English strings directly in components
- Hardcode German
- Fast, simple, no dependencies

**Option B: i18n library (future)**
- `next-intl` or `react-i18next`
- Language switcher
- Multiple languages
- More complex, overkill for MVP

**→ Use Option A for this task. Option B can be a future P2 task.**

## Files to Modify

Every `.tsx` file in `app/` and `components/` — systematic string replacement.

## Implementation Notes

- Keep component/variable names in English (code stays English)
- Only user-facing strings get translated
- Date formatting: Use `toLocaleDateString('de-DE')` and `toLocaleTimeString('de-DE')`
- Number formatting: German uses `,` as decimal separator
- Don't translate technical terms in admin if they're universally understood (Dashboard, Status, Format)
