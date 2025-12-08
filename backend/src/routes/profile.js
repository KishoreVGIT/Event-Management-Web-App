import express from 'express';
import { query } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get current user's profile
router.get('/me', authenticate, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;


    // Get user details
    const userResult = await query(
      'SELECT id, email, name, role, organization_name, "createdAt" FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Get user's RSVPs if student
    if (user.role === 'student') {
  const rsvpResult = await query(
    `SELECT
      ea.id,
      ea.status as rsvp_status,
      e.id as event_id,
      e.title as event_title,
      e.description as event_description,
      e.start_date,
      e.end_date,
      e.location,
      e.category,
      e.image_url,
      e.status as event_status,
      u.name as organizer_name,
      u.organization_name
    FROM event_attendees ea
    JOIN events e ON ea.event_id = e.id
    JOIN users u ON e.user_id = u.id
    WHERE ea.user_id = $1
    ORDER BY e.start_date ASC`,
    [userId]
  );

  user.rsvps = rsvpResult.rows.map((row) => ({
    id: row.id,
    rsvpDate: null,
    status: row.rsvp_status,
    event: {
      id: row.event_id,
      title: row.event_title,
      description: row.event_description,
      startDate: row.start_date,
      endDate: row.end_date,
      location: row.location,
      category: row.category,
      imageUrl: row.image_url,
      status: row.event_status,
      organizerName: row.organization_name || row.organizer_name,
    },
  }));
}


    // Get user's created events if organizer
    if (user.role === 'organizer') {
  const eventsResult = await query(
    `SELECT
      e.id,
      e.title,
      e.description,
      e.start_date,
      e.end_date,
      e.location,
      e.category,
      e.capacity,
      e.image_url,
      e.status,
      e."createdAt",
      COUNT(ea.id) AS attendee_count
    FROM events e
    LEFT JOIN event_attendees ea ON e.id = ea.event_id
    WHERE e.user_id = $1
    GROUP BY e.id
    ORDER BY e.start_date DESC`,
    [userId]
  );

  user.events = eventsResult.rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    startDate: row.start_date,
    endDate: row.end_date,
    location: row.location,
    category: row.category,
    capacity: row.capacity,
    imageUrl: row.image_url,
    status: row.status,
    createdAt: row.createdAt,
    attendeeCount: Number(row.attendee_count) || 0,
  }));
}


    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update current user's profile
router.put('/me', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, organizationName } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters' });
    }

    let updateQuery = 'UPDATE users SET name = $1';
    const params = [name.trim()];

    if (organizationName !== undefined) {
      updateQuery += ', organization_name = $2';
      params.push(organizationName && organizationName.trim() ? organizationName.trim() : null);
    }

    updateQuery += ` WHERE id = $${params.length + 1} RETURNING id, email, name, role, organization_name, "createdAt"`;
    params.push(userId);

    const result = await query(updateQuery, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
