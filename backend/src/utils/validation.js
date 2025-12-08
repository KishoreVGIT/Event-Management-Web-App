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

export function validateCapacity(capacity) {
  if (capacity !== null && capacity !== undefined) {
    const capacityNum = parseInt(capacity);
    if (isNaN(capacityNum) || capacityNum < 1) {
      return 'Capacity must be a positive number';
    }
  }
  return null;
}
