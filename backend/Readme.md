# Campus Connect - Event Management System

A full-stack web application for managing campus events at Purdue Fort Wayne. Students can browse events and RSVP, while organizers can create and manage events.

## 🚀 Quick Links

- **[QUICKSTART.md](QUICKSTART.md)** - Get running in 5 minutes
- **[SETUP_SIMPLIFIED.md](SETUP_SIMPLIFIED.md)** - Understanding the simplified SQL approach
- **[SETUP.md](SETUP.md)** - Detailed setup and API documentation

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

## 📦 Installation

```bash
# 1. Setup database
psql -U postgres
CREATE DATABASE event_management;
\q
cd backend
psql -U postgres -d event_management -f prisma/databasescript.sql

# 2. Backend
cd backend
npm install
echo 'DATABASE_URL=postgresql://postgres:password@localhost:5432/event_management
JWT_SECRET=my-secret-123
PORT=3000' > .env
npm run dev

# 3. Frontend (in new terminal)
cd frontend
npm install
echo 'NEXT_PUBLIC_API_URL=http://localhost:3000' > .env.local
npm run dev
```

Visit http://localhost:3001 to start!

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

## 🧪 Testing

1. Sign up as organizer at http://localhost:3001/signup
2. Create an event from the organizer dashboard
3. Open incognito window, sign up as student
4. RSVP to the event
5. Back in organizer view, see the student in attendee list!

## 📝 Example SQL Queries

The app uses parameterized queries to prevent SQL injection:

```javascript
// Safe query with parameters
const result = await query(
  'SELECT * FROM users WHERE email = $1',
  [email]
);

// Create event
await query(
  'INSERT INTO events (title, description, date, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
  [title, description, date, userId]
);

// Join query
await query(`
  SELECT e.*, u.name as organizer_name
  FROM events e
  JOIN users u ON e.user_id = u.id
  WHERE e.id = $1
`, [eventId]);
```

## 🚧 Development

```bash
# Backend
npm run dev       # Start with auto-reload
npm run lint      # Check code style

# Frontend
npm run dev       # Start dev server
npm run build     # Build for production
```

## 📚 Documentation

- **QUICKSTART.md** - Fast 5-minute setup guide
- **SETUP_SIMPLIFIED.md** - Explains the raw SQL approach with code examples
- **SETUP.md** - Complete setup guide with troubleshooting

## 🎓 School Project Notes

This is intentionally kept simple for a school project:

- ✅ No complex state management - just React Context
- ✅ Direct SQL queries - easy to understand
- ✅ Simple authentication - JWT in localStorage
- ✅ Clear code structure - easy to navigate
- ✅ Comprehensive comments - explains what each part does

## 🔒 Security Notes

For production deployment, consider:

- Use HTTPS
- Store JWT in httpOnly cookies (not localStorage)
- Add rate limiting
- Input sanitization
- CSRF protection
- Use environment variables for secrets
- Add logging and monitoring

## 📞 Support

Having issues? Check:
1. PostgreSQL is running
2. DATABASE_URL is correct in backend/.env
3. Both frontend and backend are running
4. Check browser console for frontend errors
5. Check terminal for backend errors

---

**Made with Node.js, PostgreSQL, and Next.js**
