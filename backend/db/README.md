# Database Scripts

This folder contains all SQL scripts for the Campus Connect database.

## Database Setup

The application uses PostgreSQL as the database.

### Prerequisites

- PostgreSQL installed and running
- Database created: `event_management`
- User with appropriate permissions

### Initial Setup

Run the SQL scripts in order:

```bash
# 1. Create the initial schema
PGPASSWORD=postgres psql -h localhost -U postgres -d event_management -f 01_initial_schema.sql

# 2. Add enhanced fields (capacity, location, category, image_url)
PGPASSWORD=postgres psql -h localhost -U postgres -d event_management -f 02_add_enhanced_fields.sql
```

Or use the provided setup script:

```bash
./setup_database.sh
```

## Scripts

### 01_initial_schema.sql
Creates the initial database schema:
- User roles enum (student, organizer, admin)
- `users` table
- `user_profiles` table
- `events` table (basic fields)
- `event_attendees` table (junction table for RSVPs)
- Indexes for performance

### 02_add_enhanced_fields.sql
Adds enhanced fields to events table:
- `capacity` - Maximum number of attendees (NULL = unlimited)
- `location` - Event venue/location
- `category` - Event category for filtering
- `image_url` - Cover image URL
- Index on category field

## Database Schema

### Tables

#### users
- id (BIGINT, PK)
- name (VARCHAR)
- email (VARCHAR, UNIQUE)
- passwordHash (VARCHAR)
- role (UserRole ENUM)
- createdAt, updatedAt

#### user_profiles
- id (BIGINT, PK)
- user_id (BIGINT, FK → users.id)
- bio (VARCHAR)
- createdAt, updatedAt

#### events
- id (BIGINT, PK)
- title (VARCHAR)
- description (TEXT)
- start_date (TIMESTAMP)
- end_date (TIMESTAMP)
- capacity (INTEGER, nullable)
- location (VARCHAR)
- category (VARCHAR)
- image_url (VARCHAR)
- user_id (BIGINT, FK → users.id)
- createdAt, updatedAt

#### event_attendees
- id (BIGINT, PK)
- user_id (BIGINT, FK → users.id)
- event_id (BIGINT, FK → events.id)
- status (VARCHAR)
- UNIQUE constraint on (user_id, event_id)

## Connection

The application connects to PostgreSQL using the `DATABASE_URL` environment variable:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/event_management
```

## Backup

To backup the database:

```bash
pg_dump -h localhost -U postgres event_management > backup_$(date +%Y%m%d).sql
```

## Reset Database

To reset the database (⚠️ WARNING: This will delete all data):

```bash
# Drop and recreate database
dropdb -h localhost -U postgres event_management
createdb -h localhost -U postgres event_management

# Run all migrations
PGPASSWORD=postgres psql -h localhost -U postgres -d event_management -f 01_initial_schema.sql
PGPASSWORD=postgres psql -h localhost -U postgres -d event_management -f 02_add_enhanced_fields.sql
```
