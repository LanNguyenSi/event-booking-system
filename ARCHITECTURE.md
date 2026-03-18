# Event Booking System - Technical Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│  Public Pages: Event List, Event Detail, Booking Form       │
│  Admin Pages: Dashboard, Event CRUD, Booking Management     │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST
        ┌──────────────┴──────────────┐
        │                             │
┌───────▼────────┐          ┌─────────▼─────────┐
│  Public API    │          │   Admin API       │
│  /api/events   │          │   /api/admin/*    │
│  (unprotected) │          │   (JWT protected) │
└───────┬────────┘          └─────────┬─────────┘
        │                             │
        └──────────────┬──────────────┘
                       │
              ┌────────▼────────┐
              │   Business       │
              │   Logic Layer    │
              ├──────────────────┤
              │ - EventService   │
              │ - BookingService │
              │ - AuthService    │
              │ - EmailService   │
              └────────┬─────────┘
                       │
              ┌────────▼────────┐
              │   Database       │
              │   (PostgreSQL)   │
              ├──────────────────┤
              │ - events         │
              │ - bookings       │
              │ - admins         │
              └──────────────────┘
```

## Technology Stack

### Frontend

**Framework:** Next.js 14
- Server-side rendering (SSR) for SEO
- API routes (backend in same repo)
- Image optimization
- TypeScript support

**UI Library:** React 18
- Hooks for state management
- Context API for global state
- Suspense for loading states

**Styling:** Tailwind CSS
- Utility-first CSS
- Responsive design
- Dark mode support (optional)
- Custom design system

**Form Handling:** React Hook Form
- Client-side validation
- Type-safe forms
- Error handling

**HTTP Client:** Fetch API + React Query
- Data caching
- Automatic refetching
- Optimistic updates

**Date Handling:** date-fns
- Timezone support
- Format dates
- Calendar helpers

**Routing:** Next.js App Router
- File-based routing
- Dynamic routes
- Nested layouts

### Backend

**Runtime:** Node.js 20
- ES Modules
- TypeScript
- Async/await

**Framework:** Next.js API Routes
- Serverless functions
- Type-safe endpoints
- Middleware support

**ORM:** Prisma
- Type-safe database access
- Schema migrations
- Query builder
- Connection pooling

**Authentication:** JWT
- Stateless auth
- Token-based
- Refresh tokens (optional)

**Password Hashing:** bcrypt
- Secure password storage
- Salt rounds: 10

**Email:** Nodemailer
- SMTP support
- HTML emails
- Template rendering

### Database

**Primary:** PostgreSQL 15
- Relational data
- ACID compliance
- JSON support (for metadata)
- Full-text search

**Alternative (Simpler MVP):** SQLite
- File-based
- Zero-config
- Good for prototyping
- Easy migration to PostgreSQL later

### DevOps

**Containerization:** Docker
- Multi-stage builds
- Production-ready
- Environment variables

**Reverse Proxy:** Nginx (if VPS deployment)
- SSL termination
- Static file serving
- Rate limiting

**Process Manager:** PM2 (if VPS deployment)
- Auto-restart
- Load balancing
- Log management

**Deployment Options:**
1. **Vercel** (easiest, Next.js optimized)
2. **VPS** (Ubuntu + Docker + Nginx)
3. **AWS/GCP/Azure** (scalable)

## Database Schema (Prisma)

```prisma
// schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Admin {
  id           String   @id @default(cuid())
  username     String   @unique
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Event {
  id              String    @id @default(cuid())
  title           String
  description     String    @db.Text
  date            DateTime
  duration        Int       // minutes
  timezone        String    @default("Europe/Berlin")
  format          EventFormat
  location        String?   // Meeting link or physical address
  totalSlots      Int
  availableSlots  Int
  coverImage      String?
  metadata        Json      @default("[]") // MetadataField[]
  status          EventStatus @default(DRAFT)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  bookings        Booking[]
  
  @@index([status, date])
}

model Booking {
  id                String   @id @default(cuid())
  eventId           String
  attendeeName      String
  attendeeEmail     String
  metadata          Json     @default("{}") // Custom field responses
  bookedAt          DateTime @default(now())
  status            BookingStatus @default(CONFIRMED)
  confirmationSent  Boolean  @default(false)
  
  event             Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  
  @@index([eventId])
  @@index([attendeeEmail])
}

enum EventFormat {
  REMOTE
  IN_PERSON
  HYBRID
}

enum EventStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum BookingStatus {
  CONFIRMED
  CANCELLED
  WAITLIST
}
```

## API Design

### Authentication Flow

```typescript
// 1. Admin login
POST /api/auth/login
{
  "username": "lan",
  "password": "..."
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "username": "lan",
    "email": "..."
  }
}

// 2. Subsequent requests include token
GET /api/admin/events
Headers: {
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Public API Endpoints

#### GET /api/events
List all published events.

**Query Parameters:**
- `status=published` (default)
- `format=remote|in-person|hybrid` (filter)
- `date_from=YYYY-MM-DD` (filter)
- `date_to=YYYY-MM-DD` (filter)
- `limit=20` (pagination)
- `offset=0` (pagination)

**Response:**
```json
{
  "events": [
    {
      "id": "evt_123",
      "title": "Introduction to AI Agents",
      "description": "Learn how AI agents work...",
      "date": "2026-04-15T18:00:00Z",
      "duration": 90,
      "timezone": "Europe/Berlin",
      "format": "remote",
      "totalSlots": 12,
      "availableSlots": 5,
      "coverImage": "https://..."
    }
  ],
  "total": 1,
  "hasMore": false
}
```

#### GET /api/events/:id
Get single event details.

**Response:**
```json
{
  "id": "evt_123",
  "title": "Introduction to AI Agents",
  "description": "Learn how AI agents work...",
  "date": "2026-04-15T18:00:00Z",
  "duration": 90,
  "timezone": "Europe/Berlin",
  "format": "remote",
  "location": "Zoom link will be sent after booking",
  "totalSlots": 12,
  "availableSlots": 5,
  "coverImage": "https://...",
  "metadata": [
    {
      "id": "field_1",
      "label": "Company",
      "type": "text",
      "required": false
    },
    {
      "id": "field_2",
      "label": "Why are you interested?",
      "type": "textarea",
      "required": true
    }
  ]
}
```

#### POST /api/events/:id/book
Create a booking.

**Request:**
```json
{
  "attendeeName": "John Doe",
  "attendeeEmail": "john@example.com",
  "metadata": {
    "field_1": "Acme Corp",
    "field_2": "I want to learn about AI agents"
  }
}
```

**Response:**
```json
{
  "booking": {
    "id": "bkg_456",
    "eventId": "evt_123",
    "attendeeName": "John Doe",
    "attendeeEmail": "john@example.com",
    "bookedAt": "2026-03-18T19:30:00Z",
    "status": "confirmed"
  },
  "event": {
    "title": "Introduction to AI Agents",
    "date": "2026-04-15T18:00:00Z",
    "location": "Zoom: https://zoom.us/j/123456789"
  }
}
```

**Errors:**
```json
{
  "error": "EVENT_FULL",
  "message": "No slots available",
  "availableSlots": 0
}
```

#### GET /api/events/:id/ics
Download ICS calendar file.

**Response:** `Content-Type: text/calendar`

### Admin API Endpoints (Protected)

#### POST /api/auth/login
Admin login.

#### POST /api/auth/logout
Admin logout (invalidate token).

#### GET /api/admin/events
List all events (including drafts).

**Query Parameters:**
- `status=all|draft|published|archived`
- `limit`, `offset`

#### POST /api/admin/events
Create new event.

**Request:**
```json
{
  "title": "Introduction to AI Agents",
  "description": "Learn how AI agents work...",
  "date": "2026-04-15T18:00:00Z",
  "duration": 90,
  "timezone": "Europe/Berlin",
  "format": "remote",
  "location": "Zoom link TBD",
  "totalSlots": 12,
  "metadata": [
    {
      "label": "Company",
      "type": "text",
      "required": false
    }
  ],
  "status": "published"
}
```

#### PUT /api/admin/events/:id
Update event.

#### DELETE /api/admin/events/:id
Delete event (cascade deletes bookings).

#### GET /api/admin/events/:id/bookings
List bookings for event.

**Response:**
```json
{
  "bookings": [
    {
      "id": "bkg_456",
      "attendeeName": "John Doe",
      "attendeeEmail": "john@example.com",
      "metadata": { "field_1": "Acme Corp" },
      "bookedAt": "2026-03-18T19:30:00Z",
      "status": "confirmed"
    }
  ],
  "total": 1
}
```

#### DELETE /api/admin/events/:eventId/bookings/:id
Cancel booking (send email notification).

#### GET /api/admin/events/:id/export
Export bookings as CSV.

**Response:** `Content-Type: text/csv`

## Frontend Architecture

### Page Structure (Next.js App Router)

```
app/
├── (public)/
│   ├── page.tsx                    # Home: Event listing
│   ├── events/
│   │   └── [id]/
│   │       └── page.tsx            # Event detail + booking form
│   └── bookings/
│       └── [id]/
│           └── confirmed/
│               └── page.tsx        # Booking confirmation
├── admin/
│   ├── layout.tsx                  # Admin layout (protected)
│   ├── login/
│   │   └── page.tsx                # Admin login
│   ├── dashboard/
│   │   └── page.tsx                # Admin dashboard
│   ├── events/
│   │   ├── page.tsx                # Event list
│   │   ├── new/
│   │   │   └── page.tsx            # Create event
│   │   └── [id]/
│   │       ├── edit/
│   │       │   └── page.tsx        # Edit event
│   │       └── bookings/
│   │           └── page.tsx        # Manage bookings
│   └── settings/
│       └── page.tsx                # Admin settings
├── api/
│   ├── auth/
│   │   └── login/
│   │       └── route.ts
│   ├── events/
│   │   ├── route.ts                # GET /api/events (list)
│   │   └── [id]/
│   │       ├── route.ts            # GET /api/events/:id (detail)
│   │       ├── book/
│   │       │   └── route.ts        # POST /api/events/:id/book
│   │       └── ics/
│   │           └── route.ts        # GET /api/events/:id/ics
│   └── admin/
│       ├── events/
│       │   ├── route.ts            # GET/POST /api/admin/events
│       │   └── [id]/
│       │       ├── route.ts        # GET/PUT/DELETE
│       │       ├── bookings/
│       │       │   ├── route.ts    # GET bookings
│       │       │   └── [bookingId]/
│       │       │       └── route.ts # DELETE booking
│       │       └── export/
│       │           └── route.ts    # GET export CSV
└── layout.tsx                      # Root layout
```

### Component Structure

```
components/
├── public/
│   ├── EventCard.tsx               # Event card (list view)
│   ├── EventDetail.tsx             # Event detail view
│   ├── BookingForm.tsx             # Booking form
│   ├── BookingConfirmation.tsx    # Success message
│   └── CalendarView.tsx            # Calendar grid (optional)
├── admin/
│   ├── EventForm.tsx               # Create/Edit event form
│   ├── EventList.tsx               # Admin event list
│   ├── BookingList.tsx             # Admin booking list
│   └── Dashboard.tsx               # Dashboard widgets
├── shared/
│   ├── Button.tsx                  # Reusable button
│   ├── Input.tsx                   # Form input
│   ├── Modal.tsx                   # Modal dialog
│   ├── Toast.tsx                   # Toast notifications
│   └── Layout.tsx                  # Page layout wrapper
└── ui/
    └── ... (shadcn/ui components if using)
```

### State Management

**Global State (Context API):**
- Auth state (current admin user, token)
- Toast notifications

**Server State (React Query):**
- Events data
- Bookings data
- Cache management
- Automatic refetching

**Local State (useState):**
- Form inputs
- UI toggles (modals, dropdowns)

## Security Considerations

### Authentication
- JWT tokens (short expiry: 1 hour)
- Refresh tokens (optional, longer expiry)
- HttpOnly cookies (if using cookies instead of localStorage)
- CSRF protection

### Authorization
- Admin-only routes check JWT
- Middleware validates token before API access
- Role-based access (future: multiple admins)

### Input Validation
- Server-side validation (all inputs)
- Client-side validation (UX)
- Sanitize HTML in descriptions (XSS prevention)
- Email format validation
- SQL injection prevention (Prisma handles this)

### Rate Limiting
- Booking endpoint: 5 requests/minute per IP
- Login endpoint: 3 attempts/minute per IP
- Prevent spam bookings

### Data Protection
- HTTPS only (force SSL)
- Environment variables for secrets
- Password hashing (bcrypt, 10 rounds)
- No sensitive data in logs

## Email Templates

### Booking Confirmation

```
Subject: Your booking for [Event Title] is confirmed!

Hi [Attendee Name],

Great news! Your spot for "[Event Title]" is confirmed.

Event Details:
- Date: [Date & Time]
- Duration: [Duration] minutes
- Format: [Remote/In-person]
- Location: [Meeting Link or Address]

Your Booking:
- Name: [Attendee Name]
- Email: [Attendee Email]
- Slot: [Slot Number]

Add to Calendar: [ICS Download Link]

Looking forward to seeing you there!

Questions? Reply to this email.

Best regards,
[Speaker Name]
```

### Reminder Email (1 Day Before)

```
Subject: Reminder: [Event Title] tomorrow!

Hi [Attendee Name],

Just a friendly reminder that "[Event Title]" is happening tomorrow!

When: [Date & Time]
Where: [Meeting Link]

See you soon!
```

## Deployment Architecture

### Option 1: Vercel (Recommended for MVP)

```
Vercel (Next.js)
├── Frontend (SSR)
├── API Routes
└── PostgreSQL (Vercel Postgres or external)

Pros:
- Zero-config deployment
- Auto-scaling
- Built-in CDN
- Free SSL
- Git integration

Cons:
- Serverless (cold starts)
- Vendor lock-in
```

### Option 2: VPS (Self-Hosted)

```
VPS (Ubuntu)
├── Nginx (reverse proxy + SSL)
├── Docker Container
│   ├── Next.js app (PM2)
│   └── PostgreSQL
└── Let's Encrypt (SSL)

Pros:
- Full control
- Predictable costs
- No cold starts

Cons:
- More setup
- Manual scaling
- Maintenance overhead
```

## Performance Optimization

**Frontend:**
- Image optimization (Next.js Image)
- Lazy loading (Suspense)
- Code splitting (dynamic imports)
- Prefetching (Link component)
- Caching (React Query)

**Backend:**
- Database indexing (event.status, event.date, booking.eventId)
- Connection pooling (Prisma)
- Query optimization (select only needed fields)
- Caching (Redis for popular events - future)

**Infrastructure:**
- CDN for static assets
- Gzip compression
- HTTP/2

## Testing Strategy

**Unit Tests:**
- API endpoints (Vitest)
- Service functions
- Utility functions

**Integration Tests:**
- Full booking flow
- Admin CRUD operations
- Auth flow

**E2E Tests (Optional):**
- Playwright for critical flows
- Public booking flow
- Admin event creation

**Test Coverage Target:** >80%

## Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/talkbooking"

# Auth
JWT_SECRET="your-secret-key-here"
JWT_EXPIRY="1h"

# Email (Nodemailer SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
EMAIL_FROM="Lan Nguyen Si <lan@example.com>"

# App
NEXT_PUBLIC_APP_URL="https://talks.lan-nguyen-si.de"

# Admin
ADMIN_USERNAME="lan"
ADMIN_PASSWORD_HASH="$2b$10$..." # Generated via bcrypt

# Optional
SENTRY_DSN="..." # Error tracking
ANALYTICS_ID="..." # Google Analytics
```

## Monitoring & Logging

**Error Tracking:**
- Sentry (client + server errors)
- Automatic error reports

**Logging:**
- Winston or Pino (structured logs)
- Log levels: error, warn, info, debug
- Log rotation (PM2 or Docker)

**Metrics:**
- Total events
- Total bookings
- Booking conversion rate
- Most popular events

---

**Architect:** Ice 🧊  
**Implementation:** Lava 🌋  
**Status:** Architecture Complete  
**Next:** Implementation Tasks Breakdown
