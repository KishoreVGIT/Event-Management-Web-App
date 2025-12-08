-- Campus Connect Event Management Database Schema
-- Complete schema including all migrations and update

-- ============================================
-- STEP 1: Create Enum Type for User Roles
-- ============================================

CREATE TYPE user_role AS ENUM ('student', 'organizer', 'admin');

-- ============================================
-- STEP 2: Create Tables
-- ============================================

-- Users Table (Updated with organization_name)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  "passwordHash" VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  organization_name VARCHAR(200),
  "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- User Profiles Table (One-to-One with Users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  bio VARCHAR(500),
  "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Events Table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date TIMESTAMP(6),
  end_date TIMESTAMP(6),
  capacity INTEGER,
  location VARCHAR(500),
  category VARCHAR(100),
  image_url VARCHAR(500),
  user_id UUID NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  cancelled_at TIMESTAMP(6),
  cancellation_reason TEXT,
  "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_event_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Event Time Slots Table (NEW - for multi-day events with different times)
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

-- Event Attendees Table (Junction table for Many-to-Many)
CREATE TABLE event_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  event_id UUID NOT NULL,
  status VARCHAR(50) DEFAULT 'confirmed',
  "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_attendee_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_attendee_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  CONSTRAINT unique_user_event UNIQUE (user_id, event_id)
);

-- RSVPs Table (if exists in your schema)
CREATE TABLE IF NOT EXISTS rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  event_id UUID NOT NULL,
  rsvp_date TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'confirmed',
  CONSTRAINT fk_rsvp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_rsvp_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  CONSTRAINT unique_rsvp_user_event UNIQUE (user_id, event_id)
);

-- ============================================
-- STEP 3: Create Indexes for Performance
-- ============================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Events indexes
CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_end_date ON events(end_date);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_status ON events(status);

-- Event time slots indexes
CREATE INDEX idx_time_slots_event_id ON event_time_slots(event_id);
CREATE INDEX idx_time_slots_day_date ON event_time_slots(day_date);

-- Event attendees indexes
CREATE INDEX idx_attendees_user_id ON event_attendees(user_id);
CREATE INDEX idx_attendees_event_id ON event_attendees(event_id);

-- RSVPs indexes
CREATE INDEX IF NOT EXISTS idx_rsvps_user_id ON rsvps(user_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_event_id ON rsvps(event_id);

-- ============================================
-- STEP 4: Create Function for Updated Timestamp
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 5: Create Triggers for Auto-Update Timestamps
-- ============================================

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON events
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STEP 6: Add Comments for Documentation
-- ============================================

COMMENT ON TABLE users IS 'Core user accounts table with authentication and role management';
COMMENT ON COLUMN users.organization_name IS 'Organization name for organizers. If set, this will be displayed instead of the user name.';

COMMENT ON TABLE user_profiles IS 'Extended user profile information (one-to-one with users)';

COMMENT ON TABLE events IS 'Event listings created by organizers';
COMMENT ON COLUMN events.capacity IS 'Maximum number of attendees. NULL means unlimited capacity';
COMMENT ON COLUMN events.image_url IS 'Cloudinary URL for event cover image';
COMMENT ON COLUMN events.status IS 'Event status: active, cancelled, postponed, completed';
COMMENT ON COLUMN events.cancelled_at IS 'Timestamp when event was cancelled';
COMMENT ON COLUMN events.cancellation_reason IS 'Reason provided for event cancellation';

COMMENT ON TABLE event_time_slots IS 'Time slots for multi-day events. Each row represents the time range for a specific day of an event.';
COMMENT ON COLUMN event_time_slots.day_date IS 'The specific date this time slot applies to';
COMMENT ON COLUMN event_time_slots.start_time IS 'Start time for this specific day';
COMMENT ON COLUMN event_time_slots.end_time IS 'End time for this specific day';

COMMENT ON TABLE event_attendees IS 'Junction table managing RSVPs (many-to-many between users and events)';
COMMENT ON COLUMN event_attendees.status IS 'RSVP status: confirmed, cancelled, waitlist, etc.';

-- ============================================
-- STEP 7: Insert Test Admin User (Optional)
-- ============================================

-- Password: "admin123" (hashed with bcrypt, 10 rounds)
-- You can use this to test admin features
INSERT INTO users (name, email, "passwordHash", role)
VALUES (
  'Admin User',
  'admin@campusconnect.com',
  '$2b$10$rX8jzPZqH5V3qY8KjL9xH.9Z8jJ7fN4kF2mW6qN8tY5vL3pK9zR8u',
  'admin'
) ON CONFLICT (email) DO NOTHING;

-- ============================================
-- STEP 8: Sample Data (Optional)
-- ============================================

-- Insert sample organizer with organization name
INSERT INTO users (name, email, "passwordHash", role, organization_name)
VALUES (
  'John Organizer',
  'organizer@campusconnect.com',
  '$2b$10$rX8jzPZqH5V3qY8KjL9xH.9Z8jJ7fN4kF2mW6qN8tY5vL3pK9zR8u',
  'organizer',
  'Computer Science Club'
) ON CONFLICT (email) DO NOTHING;

-- Insert sample student
INSERT INTO users (name, email, "passwordHash", role)
VALUES (
  'Jane Student',
  'student@campusconnect.com',
  '$2b$10$rX8jzPZqH5V3qY8KjL9xH.9Z8jJ7fN4kF2mW6qN8tY5vL3pK9zR8u',
  'student'
) ON CONFLICT (email) DO NOTHING;

-- ============================================
-- VERIFICATION QUERY
-- ============================================

-- Run this after the schema to verify everything was created:
SELECT
  table_name,
  table_type
FROM
  information_schema.tables
WHERE
  table_schema = 'public'
  AND table_name IN ('users', 'user_profiles', 'events', 'event_time_slots', 'event_attendees', 'rsvps')
ORDER BY
  table_name;

-- Verify columns in users table
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Verify columns in event_time_slots table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'event_time_slots'
ORDER BY ordinal_position;

-- ============================================
-- SUMMARY OF UPDATES
-- ============================================

/*
MIGRATION 1 - Organization Name:
- Added 'organization_name' column to users table
- Type: VARCHAR(200), nullable
- Purpose: Allow organizers to specify organization name
- Display: Shows organization name instead of personal name when set

MIGRATION 2 - Event Time Slots:
- Created new 'event_time_slots' table
- Supports multi-day events with different times for each day
- Fields: event_id, day_date, start_time, end_time
- Constraint: Unique combination of event_id and day_date
- Cascade delete: Time slots deleted when event is deleted

Example time slots data:
{
  "event_id": "123e4567-e89b-12d3-a456-426614174000",
  "slots": [
    { "day_date": "2025-12-10", "start_time": "18:00", "end_time": "21:00" },
    { "day_date": "2025-12-11", "start_time": "19:00", "end_time": "22:00" },
    { "day_date": "2025-12-12", "start_time": "19:00", "end_time": "22:00" }
  ]
}
*/

-- ============================================
-- DONE! Your database is ready with all updates.
-- ============================================
