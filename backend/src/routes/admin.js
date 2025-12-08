import express from 'express';
import { query } from '../db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all users (admin only)
router.get('/users', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await query(`
      SELECT
        u.id, u.name, u.email, u.role, u."createdAt", u."updatedAt",
        COUNT(DISTINCT e.id)::int as events_created,
        COUNT(DISTINCT ea.id)::int as events_attended
      FROM users u
      LEFT JOIN events e ON u.id = e.user_id
      LEFT JOIN event_attendees ea ON u.id = ea.user_id
      GROUP BY u.id
      ORDER BY u."createdAt" DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID (admin only)
router.get('/users/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const userResult = await query(
      `
      SELECT u.id, u.name, u.email, u.role, u."createdAt", u."updatedAt",
             up.bio
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id = $1
    `,
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Get user's created events
    const eventsResult = await query(
      `
      SELECT e.id, e.title, e.start_date, e.end_date,
             COUNT(ea.id)::int as attendee_count
      FROM events e
      LEFT JOIN event_attendees ea ON e.id = ea.event_id
      WHERE e.user_id = $1
      GROUP BY e.id
      ORDER BY e.start_date DESC
    `,
      [id]
    );

    // Get user's RSVPs
    const rsvpsResult = await query(
      `
      SELECT ea.id, ea.status, e.id as event_id, e.title, e.start_date, e.end_date
      FROM event_attendees ea
      JOIN events e ON ea.event_id = e.id
      WHERE ea.user_id = $1
      ORDER BY e.start_date DESC
    `,
      [id]
    );

    res.json({
      ...user,
      eventsCreated: eventsResult.rows,
      eventsAttended: rsvpsResult.rows,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user role (admin only)
router.put('/users/:id/role', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['student', 'organizer', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const result = await query(
      `
      UPDATE users
      SET role = $1, "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, name, email, role, "createdAt", "updatedAt"
    `,
      [role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Delete user (admin only)
router.delete('/users/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (parseInt(id) === req.user.id || parseInt(id) === req.user.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const userCheck = await query('SELECT id FROM users WHERE id = $1', [id]);

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    await query('DELETE FROM users WHERE id = $1', [id]);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get all events (admin only)
router.get('/events', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await query(`
      SELECT
        e.id, e.title, e.description, e.start_date, e.end_date, e.capacity,
        e.location, e.category, e.image_url, e."createdAt", e."updatedAt",
        u.id as organizer_id, u.name as organizer_name, u.email as organizer_email, u.role as organizer_role,
        COUNT(ea.id)::int as attendee_count
      FROM events e
      JOIN users u ON e.user_id = u.id
      LEFT JOIN event_attendees ea ON e.id = ea.event_id
      GROUP BY e.id, u.id
      ORDER BY e."createdAt" DESC
    `);

    const events = result.rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      startDate: row.start_date,
      endDate: row.end_date,
      capacity: row.capacity,
      location: row.location,
      category: row.category,
      imageUrl: row.image_url,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      organizer: {
        id: row.organizer_id,
        name: row.organizer_name,
        email: row.organizer_email,
        role: row.organizer_role,
      },
      attendeeCount: row.attendee_count,
    }));

    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Delete any event (admin only)
router.delete('/events/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const eventCheck = await query('SELECT id, title FROM events WHERE id = $1', [id]);

    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    await query('DELETE FROM events WHERE id = $1', [id]);

    res.json({
      message: 'Event deleted successfully',
      eventTitle: eventCheck.rows[0].title
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// Get system statistics (admin only)
router.get('/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    // Total counts
    const totalUsersResult = await query(
      'SELECT COUNT(*)::int AS count FROM users'
    );

    const totalEventsResult = await query(
      'SELECT COUNT(*)::int AS count FROM events'
    );

    const totalRsvpsResult = await query(
      'SELECT COUNT(*)::int AS count FROM event_attendees'
    );

    // Users by role
    const usersByRoleResult = await query(`
      SELECT role, COUNT(*)::int AS count
      FROM users
      GROUP BY role
      ORDER BY count DESC
    `);

    // Events by status
    const eventsByStatusResult = await query(`
      SELECT status, COUNT(*)::int AS count
      FROM events
      GROUP BY status
      ORDER BY count DESC
    `);

    // Recent users
    const recentUsersResult = await query(`
      SELECT id, name, email, role, "createdAt"
      FROM users
      ORDER BY "createdAt" DESC
      LIMIT 10
    `);

    // Upcoming events – join on user_id and event_attendees
    const upcomingEventsResult = await query(`
      SELECT 
        e.id,
        e.title,
        e.start_date,
        e.end_date,
        e.status,
        u.name AS organizer_name,
        COUNT(ea.id)::int AS attendee_count
      FROM events e
      JOIN users u ON e.user_id = u.id
      LEFT JOIN event_attendees ea ON e.id = ea.event_id
      WHERE e.start_date > NOW()
        AND e.status = 'active'
      GROUP BY e.id, u.name
      ORDER BY e.start_date ASC
      LIMIT 10
    `);

    // Events by category
    const eventsByCategoryResult = await query(`
      SELECT category, COUNT(*)::int AS count
      FROM events
      WHERE category IS NOT NULL
      GROUP BY category
      ORDER BY count DESC
`);

    // Recent RSVPs – from event_attendees
    const recentRsvpsResult = await query(`
      SELECT 
        ea.id,
        ea."createdAt" AS rsvp_date,
        u.name AS user_name,
        e.title AS event_title
      FROM event_attendees ea
      JOIN users u ON ea.user_id = u.id
      JOIN events e ON ea.event_id = e.id
      ORDER BY ea."createdAt" DESC
      LIMIT 10
    `);

    res.json({
      totals: {
        users: totalUsersResult.rows[0].count,
        events: totalEventsResult.rows[0].count,
        rsvps: totalRsvpsResult.rows[0].count,
      },
      usersByRole: usersByRoleResult.rows,
      eventsByStatus: eventsByStatusResult.rows,
      recentUsers: recentUsersResult.rows.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
        createdAt: row.createdAt,
      })),
      upcomingEvents: upcomingEventsResult.rows.map((row) => ({
        id: row.id,
        title: row.title,
        startDate: row.start_date,
        endDate: row.end_date,
        status: row.status,
        organizerName: row.organizer_name,
        attendeeCount: row.attendee_count,
      })),
      eventsByCategory: eventsByCategoryResult.rows,
      recentRsvps: recentRsvpsResult.rows.map((row) => ({
        id: row.id,
        rsvpDate: row.rsvp_date,
        userName: row.user_name,
        eventTitle: row.event_title,
      })),
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});


export default router;
