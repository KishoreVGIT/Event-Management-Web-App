import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Send email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 * @param {string} options.text - Email plain text content
 */
export async function sendEmail({ to, subject, html, text }) {
  try {
    const info = await transporter.sendMail({
      from: `"Campus Connect" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send RSVP confirmation email
 * @param {Object} user - User object
 * @param {Object} event - Event object
 */
export async function sendRsvpConfirmationEmail(user, event) {
  const subject = `RSVP Confirmed: ${event.title}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .event-details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { margin: 10px 0; }
        .label { font-weight: bold; color: #4b5563; }
        .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 RSVP Confirmed!</h1>
        </div>
        <div class="content">
          <p>Hi ${user.name},</p>
          <p>Your RSVP for the following event has been confirmed:</p>

          <div class="event-details">
            <h2 style="margin-top: 0; color: #1f2937;">${event.title}</h2>

            <div class="detail-row">
              <span class="label">📅 Date:</span>
              <span>${new Date(event.startDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>

            <div class="detail-row">
              <span class="label">🕒 Time:</span>
              <span>${new Date(event.startDate).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>

            ${event.location ? `
            <div class="detail-row">
              <span class="label">📍 Location:</span>
              <span>${event.location}</span>
            </div>
            ` : ''}

            ${event.category ? `
            <div class="detail-row">
              <span class="label">🏷️ Category:</span>
              <span>${event.category}</span>
            </div>
            ` : ''}

            ${event.description ? `
            <div class="detail-row" style="margin-top: 20px;">
              <span class="label">📝 Description:</span>
              <p style="margin: 10px 0;">${event.description}</p>
            </div>
            ` : ''}
          </div>

          <p>We look forward to seeing you there!</p>

          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/events/${event.id}" class="button">View Event Details</a>
          </div>

          <div class="footer">
            <p>This is an automated message from Campus Connect.</p>
            <p>If you need to cancel your RSVP, please visit the event page.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
RSVP Confirmed!

Hi ${user.name},

Your RSVP for the following event has been confirmed:

Event: ${event.title}
Date: ${new Date(event.startDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Time: ${new Date(event.startDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
${event.location ? `Location: ${event.location}` : ''}
${event.category ? `Category: ${event.category}` : ''}

${event.description ? `Description: ${event.description}` : ''}

We look forward to seeing you there!

View event details: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/events/${event.id}

---
This is an automated message from Campus Connect.
If you need to cancel your RSVP, please visit the event page.
  `;

  return await sendEmail({ to: user.email, subject, html, text });
}

/**
 * Send event reminder email (24 hours before)
 * @param {Object} user - User object
 * @param {Object} event - Event object
 */
export async function sendEventReminderEmail(user, event) {
  const subject = `Reminder: ${event.title} is Tomorrow!`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .event-details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { margin: 10px 0; }
        .label { font-weight: bold; color: #4b5563; }
        .button { display: inline-block; background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Event Reminder</h1>
        </div>
        <div class="content">
          <p>Hi ${user.name},</p>
          <p>This is a friendly reminder that you have an event coming up tomorrow:</p>

          <div class="event-details">
            <h2 style="margin-top: 0; color: #1f2937;">${event.title}</h2>

            <div class="detail-row">
              <span class="label">📅 Date:</span>
              <span>${new Date(event.startDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>

            <div class="detail-row">
              <span class="label">🕒 Time:</span>
              <span>${new Date(event.startDate).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>

            ${event.location ? `
            <div class="detail-row">
              <span class="label">📍 Location:</span>
              <span>${event.location}</span>
            </div>
            ` : ''}
          </div>

          <p>Don't forget to attend! See you there!</p>

          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/events/${event.id}" class="button">View Event Details</a>
          </div>

          <div class="footer">
            <p>This is an automated reminder from Campus Connect.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Event Reminder

Hi ${user.name},

This is a friendly reminder that you have an event coming up tomorrow:

Event: ${event.title}
Date: ${new Date(event.startDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Time: ${new Date(event.startDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
${event.location ? `Location: ${event.location}` : ''}

Don't forget to attend! See you there!

View event details: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/events/${event.id}

---
This is an automated reminder from Campus Connect.
  `;

  return await sendEmail({ to: user.email, subject, html, text });
}

/**
 * Send event update notification
 * @param {Object} user - User object
 * @param {Object} event - Event object
 */
export async function sendEventUpdateEmail(user, event) {
  const subject = `Event Updated: ${event.title}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #0ea5e9; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📢 Event Updated</h1>
        </div>
        <div class="content">
          <p>Hi ${user.name},</p>
          <p>The event "<strong>${event.title}</strong>" that you RSVP'd to has been updated.</p>

          <p>Please review the latest event details to make sure you have the most current information.</p>

          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/events/${event.id}" class="button">View Updated Event</a>
          </div>

          <div class="footer">
            <p>This is an automated notification from Campus Connect.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Event Updated

Hi ${user.name},

The event "${event.title}" that you RSVP'd to has been updated.

Please review the latest event details to make sure you have the most current information.

View updated event: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/events/${event.id}

---
This is an automated notification from Campus Connect.
  `;

  return await sendEmail({ to: user.email, subject, html, text });
}

/**
 * Send event cancellation notification
 * @param {Object} user - User object
 * @param {Object} event - Event object
 */
export async function sendEventCancellationEmail(user, event) {
  const subject = `Event Cancelled: ${event.title}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>❌ Event Cancelled</h1>
        </div>
        <div class="content">
          <p>Hi ${user.name},</p>
          <p>We regret to inform you that the event "<strong>${event.title}</strong>" has been cancelled.</p>

          <p>We apologize for any inconvenience this may cause.</p>

          <div class="footer">
            <p>This is an automated notification from Campus Connect.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Event Cancelled

Hi ${user.name},

We regret to inform you that the event "${event.title}" has been cancelled.

We apologize for any inconvenience this may cause.

---
This is an automated notification from Campus Connect.
  `;

  return await sendEmail({ to: user.email, subject, html, text });
}
