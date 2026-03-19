# Event Booking System

A modern event booking platform for creating, managing, and booking workshops, talks, webinars, and meetups. The user-facing interface is in German.

## Tech Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS 4
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL 16 with Prisma ORM
- **Auth:** JWT + bcrypt
- **Email:** Nodemailer (SMTP)
- **Charts:** Recharts

## Features

- Public event listing with filters (type, format, search)
- Online booking with confirmation codes and email confirmations
- Waitlist system for fully booked events
- Markdown descriptions (GitHub Flavored Markdown)
- Admin dashboard with statistics and analytics
- Full event lifecycle: create, edit, cancel (soft-delete), and permanently delete
- Booking management with CSV export
- Reminder emails via cron endpoint
- Multi-admin support with roles (Super Admin / Admin)
- Responsive design

## Quick Start

### Prerequisites

- Node.js 20+
- Docker (for PostgreSQL)

### Setup

```bash
# Install dependencies
make install

# Start PostgreSQL
make db-setup

# Configure environment variables
cp .env.example .env
# Edit .env (DATABASE_URL, JWT_SECRET, etc.)

# Run database migrations
make db-migrate

# Create admin user
make seed

# Start development server
make dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Environment Variables

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `NEXT_PUBLIC_APP_URL` | Public URL of the app | Yes |
| `NEXT_PUBLIC_BASE_URL` | Base URL of the app | Yes |
| `SMTP_HOST` | SMTP server | No |
| `SMTP_PORT` | SMTP port | No |
| `SMTP_USER` | SMTP username | No |
| `SMTP_PASS` | SMTP password | No |
| `SMTP_FROM` | Sender address | No |

## Commands

```bash
make help             # Show all commands
make dev              # Development server
make build            # Production build
make start            # Start production server
make db-setup         # Start PostgreSQL via Docker
make db-migrate       # Run migrations
make db-studio        # Open Prisma Studio
make seed             # Create admin user
make docker-build     # Build Docker image
make docker-run       # Run in Docker
make deploy-local     # Full local deployment
```

## Project Structure

```
app/
├── (public)/              # Public pages
│   ├── events/            # Event list and detail page
│   └── bookings/lookup/   # Booking lookup
├── admin/                 # Admin area
│   ├── dashboard/         # Dashboard with statistics
│   ├── events/            # Event management (CRUD)
│   ├── bookings/          # Booking management
│   ├── analytics/         # Analytics
│   ├── users/             # Admin user management
│   └── login/             # Admin login
├── api/                   # REST API
│   ├── events/            # GET, POST, PUT, DELETE
│   ├── bookings/          # Bookings, lookup, export
│   ├── auth/              # Login
│   ├── admin/             # Admin operations
│   └── cron/              # Reminder emails
components/
├── public/                # Public-facing components
└── admin/                 # Admin components
lib/                       # Utilities (auth, email, Prisma)
prisma/                    # Schema and migrations
```

## Data Model

- **Event** — Type (Workshop, Talk, Webinar, Meetup, Consultation, Other), format (Remote, In-Person, Hybrid), slots, status (Draft, Published, Cancelled, Completed)
- **Booking** — Confirmation code, status (Confirmed, Cancelled, Waitlisted, Attended), metadata (company, role)
- **Admin** — Roles (Super Admin, Admin)

## Docker

```bash
# Build and run
make docker-build
make docker-run

# Or with Traefik reverse proxy
docker compose -f docker-compose.traefik.yml up -d
```

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/events` | - | List published events |
| POST | `/api/events` | Admin | Create event |
| GET | `/api/events/:id` | - | Get event details |
| PUT | `/api/events/:id` | Admin | Update event |
| DELETE | `/api/events/:id` | Admin | Cancel event (soft-delete) |
| DELETE | `/api/events/:id?permanent=true` | Admin | Permanently delete event |
| POST | `/api/bookings` | - | Create booking |
| GET | `/api/bookings/lookup` | - | Look up booking |
| GET | `/api/bookings/export` | Admin | CSV export |
| POST | `/api/auth/login` | - | Admin login |
