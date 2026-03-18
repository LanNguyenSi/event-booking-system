# Implementation Tasks for Lava 🌋

**Project:** Talk Booking System  
**Lead:** Ice 🧊  
**Implementation:** Lava 🌋  
**Timeline:** 1 Week MVP

---

## Phase 1: Project Setup (Day 1 - 3-4 hours)

### Task 1.1: Initialize Next.js Project
- [ ] Create Next.js 14 app with TypeScript
- [ ] Configure Tailwind CSS
- [ ] Set up ESLint + Prettier
- [ ] Create .gitignore (.env, node_modules, .next)
- [ ] Initialize git repository

**Commands:**
```bash
npx create-next-app@latest talk-booking-system --typescript --tailwind --app --no-src-dir
cd talk-booking-system
git init
```

**Estimated Time:** 30 minutes

### Task 1.2: Set Up Prisma + Database
- [ ] Install Prisma + PostgreSQL client
- [ ] Create `prisma/schema.prisma` (from ARCHITECTURE.md)
- [ ] Set up PostgreSQL database (local or cloud)
- [ ] Configure DATABASE_URL in `.env`
- [ ] Run initial migration: `npx prisma migrate dev --name init`
- [ ] Generate Prisma client: `npx prisma generate`

**Prisma Schema:** See ARCHITECTURE.md → Database Schema section

**Estimated Time:** 1 hour

### Task 1.3: Project Structure
- [ ] Create directory structure:
  ```
  app/
  ├── (public)/
  ├── admin/
  ├── api/
  components/
  ├── public/
  ├── admin/
  ├── shared/
  lib/
  ├── prisma.ts
  ├── auth.ts
  ├── email.ts
  └── utils.ts
  ```
- [ ] Create placeholder files for each route
- [ ] Set up basic layout files

**Estimated Time:** 30 minutes

### Task 1.4: Install Dependencies
```bash
npm install @prisma/client bcrypt jsonwebtoken date-fns react-hook-form nodemailer
npm install -D @types/bcrypt @types/jsonwebtoken @types/nodemailer
```

**Estimated Time:** 15 minutes

---

## Phase 2: Backend - API Routes (Day 1-2 - 4-5 hours)

### Task 2.1: Database Client Setup
- [ ] Create `lib/prisma.ts` (singleton Prisma client)
- [ ] Create `lib/db.ts` (database helpers)

**Reference:** Use Prisma best practices for Next.js

**Estimated Time:** 30 minutes

### Task 2.2: Authentication System
- [ ] Create `lib/auth.ts`:
  - `hashPassword(password: string): Promise<string>`
  - `verifyPassword(password: string, hash: string): Promise<boolean>`
  - `generateToken(userId: string): string`
  - `verifyToken(token: string): { userId: string } | null`
- [ ] Create `lib/middleware.ts`:
  - `requireAuth(handler)` - JWT verification middleware

**Estimated Time:** 1.5 hours

### Task 2.3: Public API Endpoints
- [ ] `app/api/events/route.ts` (GET - list events)
  - Query params: status, format, date_from, date_to, limit, offset
  - Return only published events
- [ ] `app/api/events/[id]/route.ts` (GET - event detail)
  - Include metadata fields
  - Return 404 if not published
- [ ] `app/api/events/[id]/book/route.ts` (POST - create booking)
  - Validate slot availability
  - Decrement availableSlots
  - Send confirmation email
  - Return booking + event details
- [ ] `app/api/events/[id]/ics/route.ts` (GET - download ICS)
  - Generate ICS calendar file
  - Return with proper headers

**Validation:**
- Check slots available before booking
- Validate email format
- Validate required metadata fields

**Error Handling:**
- 404: Event not found
- 400: Invalid input
- 409: No slots available

**Estimated Time:** 3 hours

### Task 2.4: Admin API Endpoints
- [ ] `app/api/auth/login/route.ts` (POST - admin login)
  - Verify username + password
  - Generate JWT token
  - Return token + user data
- [ ] `app/api/admin/events/route.ts`
  - GET: List all events (including drafts)
  - POST: Create event
- [ ] `app/api/admin/events/[id]/route.ts`
  - GET: Event detail (admin view)
  - PUT: Update event
  - DELETE: Delete event (cascade bookings)
- [ ] `app/api/admin/events/[id]/bookings/route.ts` (GET - list bookings)
- [ ] `app/api/admin/events/[id]/bookings/[bookingId]/route.ts` (DELETE - cancel)
- [ ] `app/api/admin/events/[id]/export/route.ts` (GET - CSV export)

**Authentication:**
- All `/api/admin/*` routes require JWT token
- Use middleware to validate token

**Estimated Time:** 4 hours

---

## Phase 3: Frontend - Public Interface (Day 3-4 - 6-8 hours)

### Task 3.1: Event Listing Page
- [ ] `app/(public)/page.tsx`
- [ ] Fetch events from `/api/events`
- [ ] Display event cards (title, date, format, available slots)
- [ ] Filter by format (remote/in-person/hybrid)
- [ ] Search by title (client-side or API)
- [ ] Responsive grid layout

**Components:**
- `components/public/EventCard.tsx`
- `components/public/EventFilters.tsx`

**Styling:** Tailwind CSS, clean card design

**Estimated Time:** 2.5 hours

### Task 3.2: Event Detail Page
- [ ] `app/(public)/events/[id]/page.tsx`
- [ ] Fetch event from `/api/events/:id`
- [ ] Display full event info (description with Markdown support)
- [ ] Show available/total slots
- [ ] Booking form (name, email, dynamic metadata fields)
- [ ] Form validation (React Hook Form)
- [ ] Submit booking to `/api/events/:id/book`
- [ ] Handle errors (no slots, validation)

**Components:**
- `components/public/EventDetail.tsx`
- `components/public/BookingForm.tsx`

**Markdown Rendering:** Use `react-markdown` or render HTML

**Estimated Time:** 3 hours

### Task 3.3: Booking Confirmation Page
- [ ] `app/(public)/bookings/[id]/confirmed/page.tsx`
- [ ] Display booking details
- [ ] Show event info (date, time, location)
- [ ] "Add to Calendar" button (link to ICS download)
- [ ] Success message

**Component:**
- `components/public/BookingConfirmation.tsx`

**Estimated Time:** 1 hour

### Task 3.4: Calendar View (Optional)
- [ ] `components/public/CalendarView.tsx`
- [ ] Display events in calendar grid
- [ ] Click event to navigate to detail page

**Library:** `react-big-calendar` or custom implementation

**Estimated Time:** 2 hours (if included in MVP)

---

## Phase 4: Frontend - Admin Interface (Day 5-6 - 6-8 hours)

### Task 4.1: Admin Login Page
- [ ] `app/admin/login/page.tsx`
- [ ] Login form (username, password)
- [ ] Submit to `/api/auth/login`
- [ ] Store JWT token (localStorage or cookie)
- [ ] Redirect to dashboard on success

**Component:**
- `components/admin/LoginForm.tsx`

**Estimated Time:** 1.5 hours

### Task 4.2: Admin Layout (Protected Routes)
- [ ] `app/admin/layout.tsx`
- [ ] Check JWT token (redirect to login if missing/invalid)
- [ ] Navigation sidebar (Dashboard, Events, Settings, Logout)
- [ ] Header with user info

**Component:**
- `components/admin/AdminNav.tsx`

**Estimated Time:** 1 hour

### Task 4.3: Admin Dashboard
- [ ] `app/admin/dashboard/page.tsx`
- [ ] Display stats:
  - Total events
  - Total bookings
  - Upcoming events
  - Recent bookings
- [ ] Quick actions (Create Event, View All Bookings)

**Component:**
- `components/admin/Dashboard.tsx`

**Estimated Time:** 2 hours

### Task 4.4: Event Management - List
- [ ] `app/admin/events/page.tsx`
- [ ] Fetch events from `/api/admin/events`
- [ ] Display event table (title, date, slots, status)
- [ ] Actions: Edit, Delete, Duplicate
- [ ] Filter by status (all/draft/published/archived)
- [ ] "Create New Event" button

**Component:**
- `components/admin/EventList.tsx`

**Estimated Time:** 2 hours

### Task 4.5: Event Management - Create/Edit
- [ ] `app/admin/events/new/page.tsx` (create)
- [ ] `app/admin/events/[id]/edit/page.tsx` (edit)
- [ ] Event form:
  - Title (text)
  - Description (textarea, Markdown support)
  - Date & Time (datetime-local input)
  - Duration (number)
  - Timezone (select)
  - Format (select: remote/in-person/hybrid)
  - Location (text)
  - Total Slots (number)
  - Cover Image (file upload or URL)
  - Custom Metadata Fields (dynamic array)
  - Status (select: draft/published/archived)
- [ ] Form validation
- [ ] Submit to `/api/admin/events` (POST) or `/api/admin/events/:id` (PUT)

**Components:**
- `components/admin/EventForm.tsx`
- `components/admin/MetadataFieldEditor.tsx`

**Estimated Time:** 4 hours

### Task 4.6: Booking Management
- [ ] `app/admin/events/[id]/bookings/page.tsx`
- [ ] Fetch bookings from `/api/admin/events/:id/bookings`
- [ ] Display booking table (name, email, metadata, date)
- [ ] Actions: Cancel booking, Export CSV
- [ ] Search by name or email

**Component:**
- `components/admin/BookingList.tsx`

**Estimated Time:** 2.5 hours

---

## Phase 5: Email System (Day 6 - 2-3 hours)

### Task 5.1: Email Service
- [ ] Create `lib/email.ts`
- [ ] `sendBookingConfirmation(booking, event)`:
  - HTML email template
  - Include event details, booking info
  - Attach ICS file
- [ ] `sendCancellationNotification(booking, event)`:
  - Email when admin cancels booking
- [ ] Configure Nodemailer (SMTP)

**Email Template:**
See ARCHITECTURE.md → Email Templates section

**Estimated Time:** 2 hours

### Task 5.2: Integrate Email into API
- [ ] Call `sendBookingConfirmation` after booking creation
- [ ] Call `sendCancellationNotification` after booking cancellation
- [ ] Handle email errors gracefully (log, don't fail request)

**Estimated Time:** 30 minutes

---

## Phase 6: Polish & Deploy (Day 7 - 4-6 hours)

### Task 6.1: Error Handling
- [ ] Add error boundaries (React)
- [ ] Toast notifications for user feedback
- [ ] API error responses (consistent format)
- [ ] 404 page
- [ ] 500 error page

**Component:**
- `components/shared/Toast.tsx`

**Estimated Time:** 1.5 hours

### Task 6.2: Loading States
- [ ] Spinner components
- [ ] Skeleton loaders for event cards
- [ ] Loading states in forms
- [ ] Optimistic UI updates (React Query)

**Component:**
- `components/shared/Spinner.tsx`

**Estimated Time:** 1 hour

### Task 6.3: Responsive Design
- [ ] Test on mobile (375px, 768px, 1024px)
- [ ] Fix layout issues
- [ ] Touch-friendly buttons
- [ ] Mobile navigation

**Estimated Time:** 1.5 hours

### Task 6.4: SEO & Open Graph
- [ ] Add meta tags to event detail pages
  - `<title>`, `<description>`
  - Open Graph tags (og:title, og:description, og:image)
- [ ] Generate dynamic OG images (optional)
- [ ] Sitemap.xml (Next.js generates this)

**Estimated Time:** 1 hour

### Task 6.5: Docker Setup
- [ ] Create `Dockerfile`
- [ ] Create `docker-compose.yml` (app + PostgreSQL)
- [ ] Create `.dockerignore`
- [ ] Test local Docker build

**Estimated Time:** 1 hour

### Task 6.6: Makefile
- [ ] Create `Makefile` with commands:
  - `make install` - Install dependencies
  - `make dev` - Run development server
  - `make build` - Build production
  - `make migrate` - Run Prisma migrations
  - `make seed` - Seed database (create admin user)
  - `make docker-build` - Build Docker image
  - `make docker-run` - Run in Docker
  - `make help` - Show all commands

**Estimated Time:** 30 minutes

---

## Phase 7: Testing & QA (Day 7 - 2-3 hours)

### Task 7.1: Manual Testing
- [ ] Test public booking flow (happy path)
- [ ] Test slot exhaustion (booking when full)
- [ ] Test admin login
- [ ] Test event CRUD
- [ ] Test booking management
- [ ] Test email notifications (SMTP test server)

**Estimated Time:** 1.5 hours

### Task 7.2: Unit Tests (Optional for MVP)
- [ ] Test auth functions (hashPassword, verifyPassword, tokens)
- [ ] Test API endpoints (at least critical ones)
- [ ] Test slot decrement logic

**Tool:** Vitest

**Estimated Time:** 2 hours (if time allows)

---

## Total Estimated Time: ~35-45 hours (1 Week)

**Daily Breakdown:**
- Day 1: Setup + Backend (8 hours)
- Day 2: Backend completion (6 hours)
- Day 3: Public frontend (8 hours)
- Day 4: Admin frontend (8 hours)
- Day 5: Admin frontend completion (6 hours)
- Day 6: Email + Polish (6 hours)
- Day 7: Deploy + Testing (6 hours)

---

## Priorities (MVP)

**Must Have (P0):**
- ✅ Public event listing + detail
- ✅ Booking form + confirmation
- ✅ Admin login + dashboard
- ✅ Event CRUD (create/edit/delete)
- ✅ Booking management (view/cancel)
- ✅ Email confirmations
- ✅ Responsive design
- ✅ Docker + Makefile

**Should Have (P1):**
- ✅ Export bookings (CSV)
- ✅ Search/filter events
- ✅ Markdown support in descriptions
- ✅ Calendar view
- ✅ Open Graph tags

**Nice to Have (P2):**
- ⏳ Waitlist management
- ⏳ Reminder emails
- ⏳ Analytics dashboard
- ⏳ Multiple admins

---

## Implementation Tips

**Code Quality:**
- Use TypeScript strict mode
- Follow Next.js best practices
- Component composition > duplication
- Extract reusable logic to `lib/` or `utils/`

**Git Workflow:**
- Commit frequently (small, atomic commits)
- Meaningful commit messages:
  - `feat: add booking form`
  - `fix: slot decrement race condition`
  - `docs: update README`
- Push to GitHub after each major feature

**Testing as You Go:**
- Test each API endpoint with Postman/curl
- Test UI in browser after each component
- Check mobile responsiveness early

**Performance:**
- Use Next.js `<Image>` for images
- Lazy load heavy components
- Cache API responses (React Query)
- Index database (Prisma migrations)

**Security:**
- Validate all inputs (server + client)
- Use parameterized queries (Prisma does this)
- Hash passwords (bcrypt)
- Verify JWT tokens

---

## Questions/Blockers?

If you encounter issues:
1. Check ARCHITECTURE.md for details
2. Check PROJECT.md for requirements
3. Ask Ice for clarification (tag @ice in Triologue)
4. Document workarounds if you deviate from plan

---

**Good luck Lava! 🌋 Let's ship this! 🚀**

**Ice will review your code and provide feedback as you go.**

**Remember:**
- Quality > Speed (but stay on schedule)
- Ask questions early
- Commit often
- Test as you build

🧊🌋 Fire + Ice = Unstoppable!
