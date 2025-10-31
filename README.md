# Campus Connect - Event Management System

A full-stack web application for managing campus events at Purdue Fort Wayne. Students can browse events and RSVP, while organizers can create and manage events.

## ✨ Features

### For Students

- Browse all campus events
- View event details and attendee lists
- RSVP to events
- Cancel RSVPs
- View participation history

### For Organizers

- Create events with title, description, date/time
- Edit own events
- Delete own events
- View attendee lists and RSVP counts
- Dedicated organizer dashboard

### Technical Features

- User authentication with JWT
- Role-based access control (Student, Organizer, Admin)
- Responsive design with dark mode
- Form validation
- Protected routes
- RESTful API

## 🛠 Tech Stack

**Frontend:** Next.js 15, React, Shadcn/ui, Tailwind CSS

**Backend:** Express.js, PostgreSQL with `pg` library (raw SQL)

**Authentication:** JWT with bcrypt password hashing

**Why Raw SQL?** Switched from Prisma to native PostgreSQL `pg` library for:

- Simpler setup (no code generation)
- Direct SQL control
- Easier to understand and debug
- More educational for learning databases

## 📁 Project Structure

```
Event-Management-Web-App/
├── backend/
│   ├── src/
│   │   ├── db.js              # PostgreSQL connection pool
│   │   ├── index.js           # Express server
│   │   ├── routes/
│   │   │   ├── auth.js       # Authentication (signup, signin)
│   │   │   ├── events.js     # Event CRUD operations
│   │   │   └── rsvp.js       # RSVP management
│   │   └── middleware/
│   │       └── auth.js       # JWT authentication middleware
│   └── prisma/
│       └── databasescript.sql # Database schema
└── frontend/
    ├── app/
    │   ├── events/           # Browse events (public)
    │   ├── signin/           # Sign in page
    │   ├── signup/           # Sign up page
    │   └── organizer/        # Organizer dashboard
    └── lib/
        └── auth-context.js   # Authentication state management
```

## 🔌 API Endpoints

### Authentication

```
POST /api/auth/signup - Create account
POST /api/auth/signin - Sign in
GET  /api/auth/me     - Get current user
```

### Events

```
GET    /api/events           - Get all events (public)
GET    /api/events/:id       - Get single event
POST   /api/events           - Create event (organizer)
PUT    /api/events/:id       - Update event (organizer)
DELETE /api/events/:id       - Delete event (organizer)
GET    /api/events/organizer/my-events - Get organizer's events
```

### RSVP

```
POST   /api/rsvp/:eventId    - RSVP to event
DELETE /api/rsvp/:eventId    - Cancel RSVP
GET    /api/rsvp/my-rsvps    - Get user's RSVPs
GET    /api/rsvp/check/:eventId - Check RSVP status
```

## 📊 Database Schema

**users**: id, name, email, password_hash, role, created_at, updated_at

**events**: id, title, description, date, user_id, created_at, updated_at

**event_attendees**: id, user_id, event_id, status

**user_profiles**: id, user_id, bio, created_at, updated_at
