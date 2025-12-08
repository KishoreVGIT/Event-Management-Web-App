-- Migration: Add status column to events table

-- Create enum type for event status
CREATE TYPE event_status AS ENUM ('active', 'cancelled', 'postponed');

-- Add status column to events table
ALTER TABLE events
ADD COLUMN status event_status NOT NULL DEFAULT 'active';

-- Add index for faster queries on status
CREATE INDEX idx_events_status ON events(status);

-- Add columns to track cancellation/postponement details
ALTER TABLE events
ADD COLUMN cancelled_at TIMESTAMP(6),
ADD COLUMN cancellation_reason TEXT,
ADD COLUMN postponed_from_start TIMESTAMP(6),
ADD COLUMN postponed_from_end TIMESTAMP(6);

-- Comments for documentation
COMMENT ON COLUMN events.status IS 'Current status of the event: active, cancelled, or postponed';
COMMENT ON COLUMN events.cancelled_at IS 'Timestamp when event was cancelled';
COMMENT ON COLUMN events.cancellation_reason IS 'Reason provided for cancelling the event';
COMMENT ON COLUMN events.postponed_from_start IS 'Original start date if event was postponed';
COMMENT ON COLUMN events.postponed_from_end IS 'Original end date if event was postponed';
