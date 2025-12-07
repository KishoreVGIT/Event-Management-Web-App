/**
 * Validate event dates
 * @param {string|Date} startDate 
 * @param {string|Date} endDate 
 * @returns {string|null} Error message or null if valid
 */
export function validateEventDates(startDate, endDate) {
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) {
      return 'End date/time must be after start date/time';
    }
  }
  return null;
}

/**
 * Validate event capacity
 * @param {string|number} capacity 
 * @returns {string|null} Error message or null if valid
 */
export function validateCapacity(capacity) {
  if (capacity !== null && capacity !== undefined) {
    const capacityNum = parseInt(capacity);
    if (isNaN(capacityNum) || capacityNum < 1) {
      return 'Capacity must be a positive number';
    }
  }
  return null;
}
