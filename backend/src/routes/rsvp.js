import express from 'express';
import { query, getClient } from '../db.js';
import { authenticate } from '../middleware/auth.js';
import { sendRsvpConfirmationEmail } from '../services/email.js';
import { rsvpLimiter } from '../middleware/rate-limit.js';

const router = express.Router();

router.post('/:eventId', authenticate, rsvpLimiter, async (req, res) => {
  const client = await getClient();
  
  try {
    const { eventId } = req.params;
    const userId = req.user.userId;

    // Start transaction
    await client.query('BEGIN');

    // Check if event exists and get capacity info (with row lock)
    const eventCheck = await client.query(
      'SELECT id, capacity FROM events WHERE id = $1 FOR UPDATE',
      [eventId]
    );

    if (eventCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = eventCheck.rows[0];

    // Check if user already has an RSVP
    const existingRsvp = await client.query(
      'SELECT id FROM event_attendees WHERE user_id = $1 AND event_id = $2',
      [userId, eventId]
    );

    if (existingRsvp.rows.length > 0) {
      await client.query('ROLLBACK');
      return res
        .status(400)
        .json({ error: "You have already RSVP'd to this event" });
    }

    // Check capacity if set (atomic check within transaction)
    if (event.capacity !== null) {
      const attendeeCount = await client.query(
        'SELECT COUNT(*)::int as count FROM event_attendees WHERE event_id = $1',
        [eventId]
      );

      if (attendeeCount.rows[0].count >= event.capacity) {
        await client.query('ROLLBACK');
        return res
          .status(400)
          .json({ error: 'This event is at full capacity', isFull: true });
      }
    }

    // Insert RSVP
    const result = await client.query(
      `
      INSERT INTO event_attendees (user_id, event_id, status)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, event_id, status
    `,
      [userId, eventId, 'confirmed']
    );

    const rsvp = result.rows[0];

    // Get event details for response
    const eventResult = await client.query(
      `
      SELECT
        e.id, e.title, e.description, e.start_date, e.end_date, e.capacity, e.location, e.category, e.image_url, e.user_id,
        u.id as organizer_id, u.name as organizer_name, u.email as organizer_email
      FROM events e
      JOIN users u ON e.user_id = u.id
      WHERE e.id = $1
    `,
      [eventId]
    );

    // Commit transaction
    await client.query('COMMIT');

    // Fetch user details for email (JWT doesn't include name)
    const userResult = await query(
      'SELECT id, name, email FROM users WHERE id = $1',
      [userId]
    );

    // Send confirmation email to the student who RSVP'd (don't wait for it)
    const eventData = {
      id: eventResult.rows[0].id,
      title: eventResult.rows[0].title,
      description: eventResult.rows[0].description,
      startDate: eventResult.rows[0].start_date,
      endDate: eventResult.rows[0].end_date,
      location: eventResult.rows[0].location,
      category: eventResult.rows[0].category,
    };

    const userData = {
      name: userResult.rows[0].name,
      email: userResult.rows[0].email,
    };

    sendRsvpConfirmationEmail(userData, eventData).catch(err => {
      console.error('Failed to send RSVP confirmation email:', err);
    });

    res.status(201).json({
      message: 'RSVP successful',
      rsvp: {
        id: rsvp.id,
        userId: rsvp.user_id,
        eventId: rsvp.event_id,
        status: rsvp.status,
        event: {
          id: eventResult.rows[0].id,
          title: eventResult.rows[0].title,
          description: eventResult.rows[0].description,
          startDate: eventResult.rows[0].start_date,
          endDate: eventResult.rows[0].end_date,
          capacity: eventResult.rows[0].capacity,
          location: eventResult.rows[0].location,
          category: eventResult.rows[0].category,
          imageUrl: eventResult.rows[0].image_url,
          userId: eventResult.rows[0].user_id,
          user: {
            id: eventResult.rows[0].organizer_id,
            name: eventResult.rows[0].organizer_name,
            email: eventResult.rows[0].organizer_email,
          },
        },
      },
    });
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Error creating RSVP:', error);
    res.status(500).json({ error: 'Failed to RSVP to event' });
  } finally {
    // Always release the client back to the pool
    client.release();
  }
});

router.delete('/:eventId', authenticate, rsvpLimiter, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.userId;

    const existingRsvp = await query(
      'SELECT id FROM event_attendees WHERE user_id = $1 AND event_id = $2',
      [userId, eventId]
    );

    if (existingRsvp.rows.length === 0) {
      return res.status(404).json({ error: 'RSVP not found' });
    }

    await query('DELETE FROM event_attendees WHERE id = $1', [
      existingRsvp.rows[0].id,
    ]);

    res.json({ message: 'RSVP cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling RSVP:', error);
    res.status(500).json({ error: 'Failed to cancel RSVP' });
  }
});

router.get('/my-rsvps', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await query(
      `
      SELECT
        ea.id, ea.user_id, ea.event_id, ea.status,
        e.id as event_id, e.title, e.description, e.start_date, e.end_date, e.capacity, e.location, e.category, e.image_url, e.user_id as organizer_id,
        u.id as org_id, u.name as org_name, u.email as org_email,
        (SELECT COUNT(*)::int FROM event_attendees WHERE event_id = e.id) as attendee_count
      FROM event_attendees ea
      JOIN events e ON ea.event_id = e.id
      JOIN users u ON e.user_id = u.id
      WHERE ea.user_id = $1
      ORDER BY e.start_date ASC NULLS LAST
    `,
      [userId]
    );

    const rsvps = result.rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      eventId: row.event_id,
      status: row.status,
      event: {
        id: row.event_id,
        title: row.title,
        description: row.description,
        startDate: row.start_date,
        endDate: row.end_date,
        capacity: row.capacity,
        location: row.location,
        category: row.category,
        imageUrl: row.image_url,
        userId: row.organizer_id,
        user: {
          id: row.org_id,
          name: row.org_name,
          email: row.org_email,
        },
        attendeeCount: row.attendee_count,
        attendees: [],
      },
    }));

    res.json(rsvps);
  } catch (error) {
    console.error('Error fetching RSVPs:', error);
    res.status(500).json({ error: 'Failed to fetch your RSVPs' });
  }
});

router.get('/check/:eventId', authenticate, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.userId;

    const result = await query(
      'SELECT id, user_id, event_id, status FROM event_attendees WHERE user_id = $1 AND event_id = $2',
      [userId, eventId]
    );

    const hasRsvp = result.rows.length > 0;
    const rsvp = hasRsvp
      ? {
          id: result.rows[0].id,
          userId: result.rows[0].user_id,
          eventId: result.rows[0].event_id,
          status: result.rows[0].status,
        }
      : null;

    res.json({ hasRsvp, rsvp });
  } catch (error) {
    console.error('Error checking RSVP:', error);
    res.status(500).json({ error: 'Failed to check RSVP status' });
  }
});

export default router;
