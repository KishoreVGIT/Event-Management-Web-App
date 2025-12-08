import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { createEvent } from 'ics';
import {
  generateRsvpConfirmationContent,
  generateEventReminderContent,
  generateEventUpdateContent,
  generateEventCancellationContent,
  generateWelcomeContent,
} from './email-templates.js';

dotenv.config();

const transportConfig = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
};

console.log('Email transporter config:', {
  host: transportConfig.host,
  port: transportConfig.port,
  secure: transportConfig.secure,
  user: transportConfig.auth.user,
});

export const transporter = nodemailer.createTransport(transportConfig);


function generateICalEvent(event) {
  return new Promise((resolve, reject) => {
    const startDate = new Date(event.startDate);
    const endDate = event.endDate ? new Date(event.endDate) : new Date(startDate.getTime() + 60 * 60 * 1000); 

    const icsEvent = {
      start: [
        startDate.getFullYear(),
        startDate.getMonth() + 1,
        startDate.getDate(),
        startDate.getHours(),
        startDate.getMinutes()
      ],
      end: [
        endDate.getFullYear(),
        endDate.getMonth() + 1,
        endDate.getDate(),
        endDate.getHours(),
        endDate.getMinutes()
      ],
      title: event.title,
      description: event.description || '',
      location: event.location || '',
      url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/events/${event.id}`,
      status: 'CONFIRMED',
      busyStatus: 'BUSY',
      organizer: { name: 'Campus Connect', email: process.env.EMAIL_USER },
    };

    createEvent(icsEvent, (error, value) => {
      if (error) {
        reject(error);
      } else {
        resolve(value);
      }
    });
  });
}


export async function sendEmail({ to, subject, html, text, attachments }) {
  try {
    const mailOptions = {
      from: `"Campus Connect" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };

    if (attachments) {
      mailOptions.attachments = attachments;
    }

    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

export async function sendRsvpConfirmationEmail(user, event) {
  const { subject, html, text } = generateRsvpConfirmationContent(user, event);

  try {
    const icsContent = await generateICalEvent(event);
    const attachments = [
      {
        filename: `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`,
        content: icsContent,
        contentType: 'text/calendar',
      },
    ];

    return await sendEmail({ to: user.email, subject, html, text, attachments });
  } catch (error) {
    console.error('Error generating calendar file:', error);
    return await sendEmail({ to: user.email, subject, html, text });
  }
}

export async function sendEventReminderEmail(user, event) {
  const { subject, html, text } = generateEventReminderContent(user, event);
  return await sendEmail({ to: user.email, subject, html, text });
}

export async function sendEventUpdateEmail(user, event) {
  const { subject, html, text } = generateEventUpdateContent(user, event);
  return await sendEmail({ to: user.email, subject, html, text });
}

export async function sendEventCancellationEmail(user, event) {
  const { subject, html, text } = generateEventCancellationContent(user, event);
  return await sendEmail({ to: user.email, subject, html, text });
}

export async function sendWelcomeEmail(user) {
  const { subject, html, text } = generateWelcomeContent(user);
  return sendEmail({
    to: user.email,
    subject,
    html,
    text,
  });
}
