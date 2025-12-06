import { createEvent } from 'ics';

/**
 * Generate iCal file for an event
 * @param {Object} event - Event object with details
 * @returns {Promise<string>} - iCal file content
 */
export async function generateICalFile(event) {
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);

  const eventConfig = {
    start: [
      startDate.getFullYear(),
      startDate.getMonth() + 1,
      startDate.getDate(),
      startDate.getHours(),
      startDate.getMinutes(),
    ],
    end: [
      endDate.getFullYear(),
      endDate.getMonth() + 1,
      endDate.getDate(),
      endDate.getHours(),
      endDate.getMinutes(),
    ],
    title: event.title,
    description: event.description,
    location: event.location || '',
    url: typeof window !== 'undefined' ? window.location.href : '',
    status: 'CONFIRMED',
    busyStatus: 'BUSY',
    organizer: {
      name: event.organizer?.name || 'Campus Connect',
      email: event.organizer?.email || 'noreply@campusconnect.com',
    },
    attendees: event.attendees?.map((attendee) => ({
      name: attendee.name,
      email: attendee.email || '',
      rsvp: true,
    })) || [],
  };

  return new Promise((resolve, reject) => {
    createEvent(eventConfig, (error, value) => {
      if (error) {
        reject(error);
      } else {
        resolve(value);
      }
    });
  });
}

/**
 * Download iCal file
 * @param {Object} event - Event object
 */
export async function downloadICalFile(event) {
  try {
    const icsContent = await generateICalFile(event);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating iCal file:', error);
    throw error;
  }
}

/**
 * Generate Google Calendar URL
 * @param {Object} event - Event object
 * @returns {string} - Google Calendar URL
 */
export function generateGoogleCalendarUrl(event) {
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);

  const formatDateForGoogle = (date) => {
    return date.toISOString().replace(/-|:|\.\d+/g, '');
  };

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    details: event.description,
    location: event.location || '',
    dates: `${formatDateForGoogle(startDate)}/${formatDateForGoogle(endDate)}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
