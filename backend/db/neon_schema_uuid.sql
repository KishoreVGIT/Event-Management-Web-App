-- Campus Connect Event Management Database Schema (UUID Version)
-- For Neon PostgreSQL Database
-- Run this in Neon's SQL Editor to set up your database with UUID primary keys

-- ============================================
-- STEP 1: Enable UUID Extension
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- STEP 2: Drop existing tables if they exist
-- ============================================

DROP TABLE IF EXISTS event_attendees CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS event_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- ============================================
-- STEP 3: Create Enum Types
-- ============================================

CREATE TYPE user_role AS ENUM ('student', 'organizer', 'admin');
CREATE TYPE event_status AS ENUM ('active', 'cancelled', 'postponed');

-- ============================================
-- STEP 4: Create Tables with UUID
-- ============================================

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  "passwordHash" VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- User Profiles Table (One-to-One with Users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL,
  bio VARCHAR(500),
  "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Events Table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date TIMESTAMP(6),
  end_date TIMESTAMP(6),
  capacity INTEGER,
  location VARCHAR(500),
  category VARCHAR(100),
  image_url VARCHAR(500),
  user_id UUID NOT NULL,
  status event_status NOT NULL DEFAULT 'active',
  cancelled_at TIMESTAMP(6),
  cancellation_reason TEXT,
  postponed_from_start TIMESTAMP(6),
  postponed_from_end TIMESTAMP(6),
  "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_event_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Event Attendees Table (Junction table for Many-to-Many)
CREATE TABLE event_attendees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  event_id UUID NOT NULL,
  status VARCHAR(50) DEFAULT 'confirmed',
  CONSTRAINT fk_attendee_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_attendee_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  CONSTRAINT unique_user_event UNIQUE(user_id, event_id)
);

-- ============================================
-- STEP 5: Create Indexes
-- ============================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Events indexes
CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_status ON events(status);

-- Event Attendees indexes
CREATE INDEX idx_event_attendees_user_id ON event_attendees(user_id);
CREATE INDEX idx_event_attendees_event_id ON event_attendees(event_id);

-- ============================================
-- STEP 6: Create Triggers for Updated_At
-- ============================================

-- Function to update the updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user_profiles table
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for events table
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STEP 7: Add Comments for Documentation
-- ============================================

COMMENT ON TABLE users IS 'Stores user accounts (students, organizers, admins)';
COMMENT ON TABLE user_profiles IS 'Extended user information';
COMMENT ON TABLE events IS 'Campus events created by organizers';
COMMENT ON TABLE event_attendees IS 'Tracks which users RSVP to which events';

COMMENT ON COLUMN events.status IS 'Current status of the event: active, cancelled, or postponed';
COMMENT ON COLUMN events.cancelled_at IS 'Timestamp when event was cancelled';
COMMENT ON COLUMN events.cancellation_reason IS 'Reason provided for cancelling the event';
COMMENT ON COLUMN events.postponed_from_start IS 'Original start date if event was postponed';
COMMENT ON COLUMN events.postponed_from_end IS 'Original end date if event was postponed';

-- ============================================
-- DONE! Your database is ready with UUIDs
-- ============================================
