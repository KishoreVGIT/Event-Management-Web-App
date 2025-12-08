
export function generateRsvpConfirmationContent(user, event) {
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

          <p style="margin-top: 20px; padding: 15px; background-color: #eff6ff; border-left: 4px solid #2563eb; border-radius: 4px;">
            <strong>📅 Add to Calendar:</strong> A calendar file (.ics) is attached to this email. Click it to add this event to your calendar app (Google Calendar, Outlook, Apple Calendar, etc.).
          </p>

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

ADD TO CALENDAR: A calendar file (.ics) is attached to this email. Open it to add this event to your calendar.

View event details: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/events/${event.id}

---
This is an automated message from Campus Connect.
If you need to cancel your RSVP, please visit the event page.
  `;

  return { subject, html, text };
}

export function generateEventReminderContent(user, event) {
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

  return { subject, html, text };
}

export function generateEventUpdateContent(user, event) {
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

  return { subject, html, text };
}

export function generateEventCancellationContent(user, event) {
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

  return { subject, html, text };
}

export function generateWelcomeContent(user) {
  const roleMessages = {
    student: {
      greeting: 'Welcome to Campus Connect!',
      message: 'You can now browse campus events, RSVP to activities, and manage your participation all in one place.',
      features: [
        'Browse all campus events',
        'RSVP to events with one click',
        'View your participation history',
        'Add events to your calendar',
        'Receive email notifications for event updates'
      ]
    },
    organizer: {
      greeting: 'Welcome to Campus Connect, Event Organizer!',
      message: 'You now have access to powerful tools to create and manage campus events.',
      features: [
        'Create and manage events',
        'Track attendee RSVPs',
        'Send notifications to attendees',
        'Edit, postpone, or cancel events',
        'View detailed event analytics'
      ]
    },
    admin: {
      greeting: 'Welcome to Campus Connect, Administrator!',
      message: 'You have full administrative access to manage the platform.',
      features: [
        'Manage all users and events',
        'View platform analytics',
        'Oversee event activities',
        'Assign user roles',
        'Monitor platform health'
      ]
    }
  };

  const roleInfo = roleMessages[user.role] || roleMessages.student;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  const subject = `${roleInfo.greeting}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin: 0;">Campus Connect</h1>
        <p style="color: #6b7280; margin-top: 5px;">Your Campus Event Hub</p>
      </div>
      
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; color: white; margin-bottom: 30px;">
        <h2 style="margin: 0 0 10px 0;">${roleInfo.greeting}</h2>
        <p style="margin: 0; font-size: 16px;">Hi ${user.name}! 👋</p>
      </div>

      <div style="background-color: #f9fafb; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
        <p style="margin-top: 0; color: #374151; font-size: 15px;">${roleInfo.message}</p>
        
        <h3 style="color: #1f2937; margin-top: 20px; margin-bottom: 15px;">What you can do:</h3>
        <ul style="color: #4b5563; line-height: 1.8; padding-left: 20px;">
          ${roleInfo.features.map(feature => `<li>${feature}</li>`).join('')}
        </ul>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${frontendUrl}/events" 
           style="background-color: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
          Get Started
        </a>
      </div>

      <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
        <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
          Need help? Contact us at <a href="mailto:${process.env.EMAIL_USER}" style="color: #2563eb;">${process.env.EMAIL_USER}</a>
        </p>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 15px;">
          © ${new Date().getFullYear()} Campus Connect. All rights reserved.
        </p>
      </div>
    </div>
  `;

  const text = `
${roleInfo.greeting}

Hi ${user.name}!

${roleInfo.message}

What you can do:
${roleInfo.features.map((feature, index) => `${index + 1}. ${feature}`).join('\n')}

Get started now: ${frontendUrl}/events

Need help? Contact us at ${process.env.EMAIL_USER}

© ${new Date().getFullYear()} Campus Connect. All rights reserved.
  `;

  return { subject, html, text };
}
