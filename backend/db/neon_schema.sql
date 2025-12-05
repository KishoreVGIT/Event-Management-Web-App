-- Campus Connect Event Management Database Schema
-- For Neon PostgreSQL Database
-- Run this in Neon's SQL Editor to set up your database

-- ============================================
-- STEP 1: Create Enum Type for User Roles
-- ============================================

CREATE TYPE user_role AS ENUM ('student', 'organizer', 'admin');

-- ============================================
-- STEP 2: Create Tables
-- ============================================

-- Users Table
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  "passwordHash" VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- User Profiles Table (One-to-One with Users)
CREATE TABLE user_profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT UNIQUE NOT NULL,
  bio VARCHAR(500),
  "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Events Table
CREATE TABLE events (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date TIMESTAMP(6),
  end_date TIMESTAMP(6),
  capacity INTEGER,
  location VARCHAR(500),
  category VARCHAR(100),
  image_url VARCHAR(500),
  user_id BIGINT NOT NULL,
  "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_event_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Event Attendees Table (Junction table for Many-to-Many)
CREATE TABLE event_attendees (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  event_id BIGINT NOT NULL,
  status VARCHAR(50) DEFAULT 'confirmed',
  CONSTRAINT fk_attendee_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_attendee_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  CONSTRAINT unique_user_event UNIQUE (user_id, event_id)
);

-- ============================================
-- STEP 3: Create Indexes for Performance
-- ============================================

-- Index on user email for fast lookups
CREATE INDEX idx_users_email ON users(email);

-- Index on event user_id for organizer queries
CREATE INDEX idx_events_user_id ON events(user_id);

-- Index on event dates for filtering
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_end_date ON events(end_date);

-- Index on event category for filtering
CREATE INDEX idx_events_category ON events(category);

-- Indexes on event_attendees for RSVP queries
CREATE INDEX idx_attendees_user_id ON event_attendees(user_id);
CREATE INDEX idx_attendees_event_id ON event_attendees(event_id);

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
COMMENT ON TABLE user_profiles IS 'Extended user profile information (one-to-one with users)';
COMMENT ON TABLE events IS 'Event listings created by organizers';
COMMENT ON TABLE event_attendees IS 'Junction table managing RSVPs (many-to-many between users and events)';

COMMENT ON COLUMN events.capacity IS 'Maximum number of attendees. NULL means unlimited capacity';
COMMENT ON COLUMN events.image_url IS 'Cloudinary URL for event cover image';
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
);

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
  AND table_name IN ('users', 'user_profiles', 'events', 'event_attendees')
ORDER BY
  table_name;

-- ============================================
-- DONE! Your database is ready.
-- ============================================
