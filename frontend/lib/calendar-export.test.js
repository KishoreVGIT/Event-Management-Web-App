import { expect } from 'chai';
import { generateICalFile, generateGoogleCalendarUrl } from './calendar-export.js';

describe('Calendar Export', () => {
  const mockEvent = {
    title: 'Test Event',
    description: 'This is a test event',
    startDate: '2023-12-25T10:00:00Z',
    endDate: '2023-12-25T11:00:00Z',
    location: 'Test Location',
    organizer: {
      name: 'Organizer Name',
      email: 'organizer@example.com',
    },
    attendees: [
      { name: 'Attendee 1', email: 'attendee1@example.com' },
    ],
  };

  describe('generateICalFile', () => {
    it('should generate valid iCal content', async () => {
      const icsContent = await generateICalFile(mockEvent);

      expect(icsContent).to.contain('BEGIN:VCALENDAR');
      expect(icsContent).to.contain('VERSION:2.0');
      expect(icsContent).to.contain('SUMMARY:Test Event');
      expect(icsContent).to.contain('DESCRIPTION:This is a test event');
      expect(icsContent).to.contain('LOCATION:Test Location');
      // Check for presence of key parts to be robust against formatting differences (quotes, etc.)
      expect(icsContent).to.contain('ORGANIZER;');
      expect(icsContent).to.contain('Organizer Name');
      expect(icsContent).to.match(/MAILTO:organizer@example.com/i);
      expect(icsContent).to.contain('END:VCALENDAR');
    });

    it('should handle optional fields', async () => {
       const minimalEvent = {
        title: 'Minimal Event',
        startDate: '2023-12-25T10:00:00Z',
        endDate: '2023-12-25T11:00:00Z',
      };

      const icsContent = await generateICalFile(minimalEvent);
      expect(icsContent).to.contain('SUMMARY:Minimal Event');
      // Expect default organizer
      expect(icsContent).to.contain('Campus Connect');
    });
  });

  describe('generateGoogleCalendarUrl', () => {
    it('should generate correct Google Calendar URL', () => {
      const url = generateGoogleCalendarUrl(mockEvent);
      
      // Parse query params
      const urlObj = new URL(url);
      const params = urlObj.searchParams;

      expect(url).to.contain('https://calendar.google.com/calendar/render');
      expect(params.get('action')).to.equal('TEMPLATE');
      expect(params.get('text')).to.equal('Test Event');
      expect(params.get('details')).to.equal('This is a test event');
      expect(params.get('location')).to.equal('Test Location');
      
      // Dates format YYYYMMDDTHHMMSSZ (approx check)
      const dates = params.get('dates');
      expect(dates).to.match(/\d{8}T\d{6}Z\/\d{8}T\d{6}Z/);
    });
  });
});
