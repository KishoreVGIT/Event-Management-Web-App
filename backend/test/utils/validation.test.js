import { expect } from 'chai';
import { validateEventDates, validateCapacity } from '../../src/utils/validation.js';

describe('Event Validation', () => {
  describe('validateEventDates', () => {
    it('should return null for valid dates', () => {
      const start = new Date('2023-01-01T10:00:00Z');
      const end = new Date('2023-01-01T11:00:00Z');
      expect(validateEventDates(start, end)).to.be.null;
    });

    it('should return error if end date is before start date', () => {
      const start = new Date('2023-01-01T10:00:00Z');
      const end = new Date('2023-01-01T09:00:00Z');
      expect(validateEventDates(start, end)).to.equal('End date/time must be after start date/time');
    });

    it('should return error if end date is equal to start date', () => {
      const start = new Date('2023-01-01T10:00:00Z');
      const end = new Date('2023-01-01T10:00:00Z');
      expect(validateEventDates(start, end)).to.equal('End date/time must be after start date/time');
    });

    it('should handle string inputs', () => {
        const start = '2023-01-01T10:00:00Z';
        const end = '2023-01-01T09:00:00Z';
        expect(validateEventDates(start, end)).to.equal('End date/time must be after start date/time');
    });
  });

  describe('validateCapacity', () => {
    it('should return null for valid positive capacity', () => {
      expect(validateCapacity(100)).to.be.null;
      expect(validateCapacity('50')).to.be.null;
    });

    it('should return error for negative capacity', () => {
      expect(validateCapacity(-1)).to.equal('Capacity must be a positive number');
    });
    
    it('should return error for zero capacity', () => {
      expect(validateCapacity(0)).to.equal('Capacity must be a positive number');
    });

    it('should return error for non-numeric capacity', () => {
      expect(validateCapacity('abc')).to.equal('Capacity must be a positive number');
    });

    it('should return null for null/undefined capacity', () => {
        expect(validateCapacity(null)).to.be.null;
        expect(validateCapacity(undefined)).to.be.null;
    });
  });
});
