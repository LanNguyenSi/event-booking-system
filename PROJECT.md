# Talk Booking System

**Event booking platform for talks, workshops, and presentations**

## Mission

Enable speakers to share their talks publicly and manage attendee bookings efficiently through a simple, beautiful web interface.

## Problem Statement

**For Speakers:**
- Need an easy way to announce talks on social media
- Want to limit attendees (slot management)
- Need to collect attendee information
- Want to manage multiple events easily
- Don't want complex event management platforms (overkill)

**For Attendees:**
- Want to see what talks are available
- Need to quickly reserve a spot
- Want confirmation of their booking
- Simple registration process (no account needed)

## Solution

A lightweight event booking system with two interfaces:

1. **Public View** - Browse events and book slots (no login required)
2. **Admin Panel** - Manage events and view bookings (login required)

## Core Features

### 1. Public Interface (No Login)

**Event Listing Page:**
- Display all upcoming events
- Show event details (title, description, date, time, format)
- Show available/total slots
- Calendar view (optional)
- Filter/search events

**Event Detail Page:**
- Full event information
- Speaker details
- Date, time, timezone
- Format (remote/in-person)
- Location/meeting link (revealed after booking)
- Available slots counter
- Booking form

**Booking Form:**
- Required fields: Name, Email
- Optional metadata fields (configurable per event):
  - Company/Organization
  - Job title
  - LinkedIn/Twitter
  - Motivation/Interest
  - Custom questions
- One-click booking
- Email confirmation (optional)

**Booking Confirmation:**
- Success message
- Booking details (event, time, slot number)
- Add to calendar button (ICS file)
- Meeting link/location (if provided)

### 2. Admin Interface (Login Required)

**Authentication:**
- Simple username/password (Lan only)
- JWT-based session
- Secure password hashing

**Dashboard:**
- Overview of all events
- Quick stats (total events, total bookings, upcoming events)
- Recent bookings
- Quick actions (create event, view bookings)

**Event Management:**
- Create new event
- Edit existing event
- Delete event
- Duplicate event (template)
- Archive past events

**Event Form Fields:**
- Title (required)
- Description (rich text, Markdown)
- Date & Time (with timezone)
- Duration
- Format (remote/in-person/hybrid)
- Location or meeting link
- Total slots (max attendees)
- Cover image (optional)
- Custom metadata fields to collect

**Booking Management:**
- View all bookings for an event
- Search/filter bookings
- Export bookings (CSV, JSON)
- Cancel booking (with email notification)
- Manual booking entry
- Waitlist management (if slots full)

**Settings:**
- Account settings (change password)
- Email notification preferences
- Default event settings
- Custom branding (logo, colors)

### 3. Sharing & Integration

**Social Media Sharing:**
- Unique shareable URL per event
- Open Graph meta tags (preview on Twitter/FB/LinkedIn)
- QR code generation (for posters)

**Email Notifications (Optional):**
- Booking confirmation to attendee
- Reminder email (1 day before event)
- Cancellation notification
- Admin notification on new booking

**Calendar Integration:**
- ICS file download (import to Google/Apple/Outlook)
- Add to calendar button

**Analytics (Future):**
- Booking trends
- Popular events
- Attendee demographics

## User Flows

### Public User Flow (Booking)

1. User clicks shared link or visits event listing page
2. User browses available events (calendar or list view)
3. User clicks on event of interest
4. User reads event details
5. User fills booking form (name, email, metadata)
6. User submits form
7. System validates slot availability
8. System creates booking
9. User sees confirmation page
10. (Optional) User receives confirmation email

### Admin Flow (Create Event)

1. Admin logs in
2. Admin navigates to "Create Event"
3. Admin fills event form (title, description, date, slots, etc.)
4. Admin configures custom metadata fields (optional)
5. Admin saves event
6. System generates shareable URL
7. Admin copies link to share on social media

### Admin Flow (Manage Bookings)

1. Admin logs in
2. Admin selects event
3. Admin views booking list
4. Admin can:
   - Export bookings
   - Cancel booking
   - Send reminder email
   - View attendee details

## Technical Requirements

### MVP Scope (Week 1)

**Must Have:**
- ✅ Public event listing page
- ✅ Event detail page with booking form
- ✅ Admin login
- ✅ Admin dashboard
- ✅ Create/Edit/Delete events
- ✅ View bookings
- ✅ Basic email notifications (confirmation)
- ✅ Responsive design (mobile-friendly)
- ✅ Shareable URLs with Open Graph

**Should Have:**
- ✅ Calendar view
- ✅ Export bookings (CSV)
- ✅ Slot validation (prevent overbooking)
- ✅ Search/filter events
- ✅ Markdown support for descriptions

**Nice to Have (Future):**
- ⏳ Waitlist management
- ⏳ Multiple admin users
- ⏳ Custom branding per event
- ⏳ Analytics dashboard
- ⏳ SMS notifications
- ⏳ Payment integration (for paid events)
- ⏳ Multi-language support

### Non-Functional Requirements

**Performance:**
- Page load time <2 seconds
- Booking submission <1 second
- Support 100 concurrent users

**Security:**
- HTTPS only
- Password hashing (bcrypt)
- JWT token authentication
- Input validation & sanitization
- Rate limiting (prevent spam bookings)

**Usability:**
- Mobile-responsive
- Accessible (WCAG 2.1 AA)
- Simple, intuitive UI
- No complex onboarding

**Reliability:**
- 99% uptime
- Database backups
- Error logging
- Graceful error handling

## Data Model

### Event

```typescript
interface Event {
  id: string;
  title: string;
  description: string; // Markdown
  date: Date;
  duration: number; // minutes
  timezone: string;
  format: 'remote' | 'in-person' | 'hybrid';
  location?: string; // Physical address or meeting link
  totalSlots: number;
  availableSlots: number;
  coverImage?: string; // URL
  metadata: MetadataField[]; // Custom fields to collect
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'published' | 'archived';
}

interface MetadataField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'url' | 'textarea' | 'select';
  required: boolean;
  options?: string[]; // For select type
}
```

### Booking

```typescript
interface Booking {
  id: string;
  eventId: string;
  attendeeName: string;
  attendeeEmail: string;
  metadata: Record<string, string>; // Custom field responses
  bookedAt: Date;
  status: 'confirmed' | 'cancelled' | 'waitlist';
  confirmationSent: boolean;
}
```

### Admin User

```typescript
interface Admin {
  id: string;
  username: string;
  passwordHash: string;
  email: string;
  createdAt: Date;
}
```

## UI/UX Design Principles

**Visual Style:**
- Clean, modern design
- Minimal clutter
- Clear call-to-actions
- Professional color scheme (blue/white default, customizable)

**User Experience:**
- Fast loading (lazy load images)
- Clear navigation
- Mobile-first responsive
- Accessible (keyboard navigation, screen readers)

**Interaction Patterns:**
- Instant feedback (loading states)
- Clear error messages
- Success confirmations
- Undo actions (where applicable)

## Example Use Case

**Lan's AI Workshop:**

1. Lan logs into admin panel
2. Creates event:
   - Title: "Introduction to AI Agents"
   - Description: "Learn how AI agents work and build your first chatbot"
   - Date: April 15, 2026, 18:00 CET
   - Format: Remote
   - Slots: 12
   - Custom fields: Company, LinkedIn, "Why are you interested?"
3. Copies shareable URL: `https://talks.lan-nguyen-si.de/events/intro-ai-agents`
4. Posts on Twitter/LinkedIn
5. Attendees visit link, read details, book slots
6. Lan receives email notification on new bookings
7. Before event, Lan exports attendee list (CSV)
8. Lan sends meeting link via email (manual or automated)
9. Event happens
10. Lan archives event, reviews attendee feedback

## Tech Stack (Recommendations)

**Frontend:**
- React 18 + TypeScript
- Tailwind CSS (styling)
- React Router (navigation)
- React Hook Form (form handling)
- date-fns (date manipulation)
- React Query (data fetching)

**Backend:**
- Next.js 14 (API routes + SSR)
- OR Express.js + Node.js (if separate backend preferred)

**Database:**
- PostgreSQL (production)
- OR SQLite (simple MVP)
- Prisma ORM (type-safe database access)

**Authentication:**
- JWT tokens
- bcrypt (password hashing)

**Email:**
- Nodemailer (SMTP)
- OR SendGrid/Mailgun (cloud service)

**Deployment:**
- Docker container
- Vercel/Netlify (Next.js)
- OR VPS (Ubuntu + Nginx + PM2)

**Development:**
- TypeScript (strict mode)
- ESLint + Prettier
- Vitest (testing)
- Makefile (DX)

## API Endpoints (REST)

### Public API

```
GET    /api/events              # List all published events
GET    /api/events/:id          # Get event details
POST   /api/events/:id/book     # Create booking
GET    /api/events/:id/ics      # Download ICS file
```

### Admin API (Protected)

```
POST   /api/auth/login          # Login
POST   /api/auth/logout         # Logout

GET    /api/admin/events        # List all events (incl. drafts)
POST   /api/admin/events        # Create event
GET    /api/admin/events/:id    # Get event (admin view)
PUT    /api/admin/events/:id    # Update event
DELETE /api/admin/events/:id    # Delete event

GET    /api/admin/events/:id/bookings      # List bookings
DELETE /api/admin/events/:id/bookings/:id  # Cancel booking
GET    /api/admin/events/:id/export        # Export CSV
```

## Timeline (1 Week MVP)

**Day 1-2: Setup + Backend**
- Project scaffolding (Next.js + TypeScript)
- Database schema (Prisma)
- API endpoints (REST)
- Authentication (JWT)

**Day 3-4: Public Interface**
- Event listing page
- Event detail page
- Booking form
- Confirmation page
- Responsive design

**Day 5-6: Admin Interface**
- Login page
- Dashboard
- Event management (CRUD)
- Booking management
- Export functionality

**Day 7: Polish + Deploy**
- Email notifications
- Error handling
- Performance optimization
- Docker setup
- Deployment

## Success Metrics

**Technical:**
- ✅ All API endpoints working
- ✅ No critical bugs
- ✅ Mobile responsive
- ✅ <2s page load
- ✅ 100% TypeScript coverage

**Business:**
- ✅ Lan can create events easily
- ✅ Users can book without friction
- ✅ Email confirmations working
- ✅ Export bookings works
- ✅ Shareable links have previews

## Future Enhancements (Post-MVP)

1. **Waitlist Management** - Auto-promote from waitlist when slot opens
2. **Multiple Admins** - Team management for organizations
3. **Analytics** - Booking trends, popular times, demographics
4. **Payment Integration** - Stripe for paid events
5. **Custom Branding** - Per-event or per-admin branding
6. **SMS Notifications** - Twilio integration
7. **Multi-language** - i18n support
8. **Recurring Events** - Series of talks
9. **Attendee Check-in** - QR code scanning
10. **Feedback Collection** - Post-event surveys

---

**Project Lead:** Ice 🧊  
**Implementation:** Lava 🌋  
**Deployment:** Lan 👨‍💻  

**Status:** Architecture Phase  
**Repo:** https://github.com/LanNguyenSi/talk-booking-system  
**License:** MIT
