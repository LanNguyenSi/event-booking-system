/**
 * Email Service
 * Handles sending emails via nodemailer
 */

import nodemailer from 'nodemailer';
import type { Booking, Event } from '@prisma/client';

// SMTP Configuration from environment
const transportConfig = {
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: process.env.SMTP_USER && process.env.SMTP_PASS
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    : undefined,
};

const transporter = nodemailer.createTransport(transportConfig);

const FROM_EMAIL = process.env.SMTP_FROM || '"Veranstaltungsbuchung" <noreply@example.com>';

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmation(
  booking: Booking & { event: Event }
): Promise<void> {
  try {
    const { name, email, confirmationToken } = booking;
    const { title, startTime, timezone, location, meetingLink, format } = booking.event;

    const eventDate = new Date(startTime).toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const eventTime = new Date(startTime).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const lookupUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/bookings/lookup`;
    const eventUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/events/${booking.event.id}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
    .code { background: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 3px; border-radius: 8px; margin: 20px 0; font-family: monospace; }
    .details { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .details h3 { margin-top: 0; color: #1f2937; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Buchung bestätigt!</h1>
    </div>
    
    <div class="content">
      <p>Hallo ${name},</p>
      
      <p>Ihre Buchung für <strong>${title}</strong> wurde erfolgreich bestätigt!</p>
      
      <div class="code">
        ${confirmationToken}
      </div>
      
      <p style="text-align: center; color: #6b7280; font-size: 14px;">
        Ihr Bestätigungscode - Bitte aufbewahren!
      </p>
      
      <div class="details">
        <h3>📅 Veranstaltungsdetails</h3>
        <p><strong>Veranstaltung:</strong> ${title}</p>
        <p><strong>Datum:</strong> ${eventDate}</p>
        <p><strong>Uhrzeit:</strong> ${eventTime} Uhr (${timezone})</p>
        <p><strong>Format:</strong> ${format === 'REMOTE' ? 'Online' : format === 'IN_PERSON' ? 'Vor Ort' : 'Hybrid'}</p>
        ${location ? `<p><strong>Ort:</strong> ${location}</p>` : ''}
        ${meetingLink ? `<p><strong>Meeting-Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ''}
      </div>
      
      <div style="text-align: center; margin-top: 30px;">
        <a href="${lookupUrl}" class="button">Buchung verwalten</a>
        <a href="${eventUrl}" class="button" style="background: #6b7280;">Veranstaltung ansehen</a>
      </div>
      
      <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
        Sie können Ihre Buchung jederzeit mit Ihrer E-Mail-Adresse und dem Bestätigungscode einsehen oder stornieren.
      </p>
    </div>
    
    <div class="footer">
      <p>Veranstaltungsbuchung</p>
      <p>Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht auf diese E-Mail.</p>
    </div>
  </div>
</body>
</html>
    `;

    const text = `
Buchung bestätigt!

Hallo ${name},

Ihre Buchung für "${title}" wurde erfolgreich bestätigt!

Bestätigungscode: ${confirmationToken}

Veranstaltungsdetails:
- Veranstaltung: ${title}
- Datum: ${eventDate}
- Uhrzeit: ${eventTime} Uhr (${timezone})
- Format: ${format === 'REMOTE' ? 'Online' : format === 'IN_PERSON' ? 'Vor Ort' : 'Hybrid'}
${location ? `- Ort: ${location}` : ''}
${meetingLink ? `- Meeting-Link: ${meetingLink}` : ''}

Buchung verwalten: ${lookupUrl}
Veranstaltung ansehen: ${eventUrl}

Sie können Ihre Buchung jederzeit mit Ihrer E-Mail-Adresse und dem Bestätigungscode einsehen oder stornieren.

---
Veranstaltungsbuchung
Diese E-Mail wurde automatisch generiert.
    `;

    await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: `✅ Buchung bestätigt: ${title}`,
      text,
      html,
    });

    console.log(`Booking confirmation email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send booking confirmation email:', error);
    // Don't throw - email failure shouldn't break booking
  }
}

/**
 * Send booking cancellation email
 */
export async function sendBookingCancellation(
  booking: Booking & { event: Event }
): Promise<void> {
  try {
    const { name, email } = booking;
    const { title, startTime } = booking.event;

    const eventDate = new Date(startTime).toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #dc2626; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>❌ Buchung storniert</h1>
    </div>
    
    <div class="content">
      <p>Hallo ${name},</p>
      
      <p>Ihre Buchung für <strong>${title}</strong> wurde storniert.</p>
      
      <p><strong>Veranstaltung:</strong> ${title}<br>
      <strong>Datum:</strong> ${eventDate}</p>
      
      <p style="margin-top: 30px; color: #6b7280;">
        Ihr Platz wurde freigegeben und steht nun anderen Teilnehmern zur Verfügung.
      </p>
    </div>
    
    <div class="footer">
      <p>Veranstaltungsbuchung</p>
    </div>
  </div>
</body>
</html>
    `;

    const text = `
Buchung storniert

Hallo ${name},

Ihre Buchung für "${title}" wurde storniert.

Veranstaltung: ${title}
Datum: ${eventDate}

Ihr Platz wurde freigegeben und steht nun anderen Teilnehmern zur Verfügung.

---
Veranstaltungsbuchung
    `;

    await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: `❌ Buchung storniert: ${title}`,
      text,
      html,
    });

    console.log(`Booking cancellation email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send booking cancellation email:', error);
  }
}

/**
 * Send event cancelled email to all attendees
 */
export async function sendEventCancelled(
  event: Event,
  bookings: Booking[]
): Promise<void> {
  try {
    const { title, startTime } = event;

    const eventDate = new Date(startTime).toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    for (const booking of bookings) {
      const { name, email } = booking;

      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #dc2626; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Veranstaltung abgesagt</h1>
    </div>
    
    <div class="content">
      <p>Hallo ${name},</p>
      
      <p>Leider müssen wir Ihnen mitteilen, dass die Veranstaltung <strong>${title}</strong> abgesagt wurde.</p>
      
      <p><strong>Veranstaltung:</strong> ${title}<br>
      <strong>Geplantes Datum:</strong> ${eventDate}</p>
      
      <p style="margin-top: 30px;">
        Ihre Buchung wurde automatisch storniert. Wir entschuldigen uns für die Unannehmlichkeiten.
      </p>
    </div>
    
    <div class="footer">
      <p>Veranstaltungsbuchung</p>
    </div>
  </div>
</body>
</html>
      `;

      const text = `
Veranstaltung abgesagt

Hallo ${name},

Leider müssen wir Ihnen mitteilen, dass die Veranstaltung "${title}" abgesagt wurde.

Veranstaltung: ${title}
Geplantes Datum: ${eventDate}

Ihre Buchung wurde automatisch storniert. Wir entschuldigen uns für die Unannehmlichkeiten.

---
Veranstaltungsbuchung
      `;

      await transporter.sendMail({
        from: FROM_EMAIL,
        to: email,
        subject: `⚠️ Veranstaltung abgesagt: ${title}`,
        text,
        html,
      });

      console.log(`Event cancellation email sent to ${email}`);
    }
  } catch (error) {
    console.error('Failed to send event cancellation emails:', error);
  }
}
