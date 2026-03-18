# Deployment Guide

## Quick Start (Local)

```bash
# 1. Install dependencies
make install

# 2. Setup database
make db-setup

# 3. Run migrations
make db-migrate

# 4. Create admin user
make seed

# 5. Start dev server
make dev
```

Visit: http://localhost:3000

## Production Deployment

### Prerequisites

- Node.js 20+
- PostgreSQL 16
- Docker (optional)

### Environment Variables

Create `.env` file:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/event_booking?schema=public"

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# App URL
NEXT_PUBLIC_APP_URL="https://yourdomain.com"

# Email (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="Event Booking <noreply@yourdomain.com>"
```

### Option 1: VPS Deployment

```bash
# 1. Clone repository
git clone https://github.com/LanNguyenSi/event-booking-system.git
cd event-booking-system

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env with your values

# 4. Setup database
docker compose up -d

# 5. Run migrations
npx prisma migrate deploy

# 6. Create admin user
node scripts/create-admin.js

# 7. Build
npm run build

# 8. Start with PM2
pm2 start npm --name "event-booking" -- start
pm2 save
```

### Option 2: Docker Deployment

```bash
# 1. Build image
make docker-build

# 2. Setup database
make db-setup

# 3. Run migrations
make db-migrate

# 4. Create admin
make seed

# 5. Run container
make docker-run

# View logs
make docker-logs
```

### Option 3: Vercel Deployment

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Setup PostgreSQL (e.g., Supabase, Railway)

# 3. Configure environment variables in Vercel Dashboard:
#    - DATABASE_URL
#    - JWT_SECRET
#    - NEXT_PUBLIC_APP_URL

# 4. Deploy
vercel --prod

# 5. Run migrations (after first deploy)
DATABASE_URL="your-prod-db-url" npx prisma migrate deploy

# 6. Create admin user (locally with prod DB)
DATABASE_URL="your-prod-db-url" node scripts/create-admin.js
```

## Post-Deployment

### Create First Admin User

```bash
node scripts/create-admin.js
```

### Access Admin Panel

Visit: `https://yourdomain.com/admin/login`

### Create First Event

1. Login to admin panel
2. Go to "Create Event"
3. Fill in event details
4. Set status to "Published"
5. Share event link!

## Nginx Configuration (Optional)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## SSL/HTTPS Setup

```bash
# Using certbot
sudo certbot --nginx -d yourdomain.com
```

## Monitoring

```bash
# View logs
pm2 logs event-booking

# Restart
pm2 restart event-booking

# Status
pm2 status
```

## Backup Database

```bash
# Backup
docker exec event-booking-db pg_dump -U postgres event_booking > backup.sql

# Restore
docker exec -i event-booking-db psql -U postgres event_booking < backup.sql
```

## Troubleshooting

### Database Connection Issues

Check DATABASE_URL format:
```
postgresql://user:password@host:5432/database?schema=public
```

### Admin Can't Login

Recreate admin user:
```bash
node scripts/create-admin.js
```

### Port Already in Use

Change port in .env:
```bash
PORT=3001
```

## Performance Optimization

1. Enable Next.js output standalone:
```js
// next.config.js
module.exports = {
  output: 'standalone',
}
```

2. Database connection pooling (already configured in Prisma)

3. Add Redis caching (optional)

## Security Checklist

- [ ] Change JWT_SECRET to random string
- [ ] Use strong admin password
- [ ] Enable HTTPS
- [ ] Setup firewall (only 80/443 open)
- [ ] Regular database backups
- [ ] Update dependencies regularly
- [ ] Monitor error logs

## Support

Issues: https://github.com/LanNguyenSi/event-booking-system/issues
