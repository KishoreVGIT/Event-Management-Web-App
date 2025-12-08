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
## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=4000
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/event_management
JWT_SECRET=your_super_secret_key_change_me
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587     # Use 465 for Production
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
```

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Event-Management-Web-App
   ```

2. **Install Dependencies**
   ```bash
   # Install Backend
   cd backend
   npm install

   # Install Frontend
   cd ../frontend
   npm install
   ```

3. **Database Setup**
   Ensure PostgreSQL is running and create the database:
   ```bash
   createdb event_management
   ```
   Run the setup scripts located in `backend/db/` (see `backend/db/README.md` for details).

### Running Locally

To run both frontend and backend concurrently (recommended):
*Note: You may need to set up a `concurrently` script in the root package.json, otherwise run in two terminals:*

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000` to browse the app.

## 🧪 Testing

We have a comprehensive test suite for both backend logic and frontend user flows.

### Backend Unit Tests

Run the Mocha test suite to verify API endpoints, authentication, and services.

```bash
cd backend
npm test
```

### Frontend End-to-End (E2E) Tests

Run Cypress tests to verify user journeys (Sign up, RSVP, Event Creation).

**Option 1: Headless (CI/CD style)**
```bash
cd frontend
npm run test:e2e:run
```

**Option 2: Interactive Runner**
```bash
cd frontend
npm run test:e2e
```

## 🚢 Deployment

### Production Email Configuration
**Important**: When deploying to cloud services like Render, AWS, or Heroku, the default SMTP port `587` is often blocked to prevent spam.

- **Set `EMAIL_PORT` to `465`** in your production environment variables.
- The application automatically switches to secure SSL mode when port 465 is detected.

### Build
```bash
# Frontend Build
cd frontend
npm run build
```
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
