-- Add event_time_slots table for multi-day events
-- This allows events spanning multiple days to have different time ranges for each day

CREATE TABLE event_time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  day_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_time_slot_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  CONSTRAINT unique_event_day UNIQUE (event_id, day_date)
);

-- Index for fast lookups by event
CREATE INDEX idx_time_slots_event_id ON event_time_slots(event_id);

-- Index for date-based queries
CREATE INDEX idx_time_slots_day_date ON event_time_slots(day_date);

COMMENT ON TABLE event_time_slots IS 'Time slots for multi-day events. Each row represents the time range for a specific day of an event.';
COMMENT ON COLUMN event_time_slots.day_date IS 'The specific date this time slot applies to';
COMMENT ON COLUMN event_time_slots.start_time IS 'Start time for this specific day';
COMMENT ON COLUMN event_time_slots.end_time IS 'End time for this specific day';
