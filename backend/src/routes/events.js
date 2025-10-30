import express from 'express';
import { query } from '../db.js';
import {
  authenticate,
  requireOrganizer,
} from '../middleware/auth.js';

const router = express.Router();

// Get all events (public - no auth required)
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT
        e.id, e.title, e.description, e.start_date, e.end_date, e.user_id, e."createdAt", e."updatedAt",
        u.id as organizer_id, u.name as organizer_name, u.email as organizer_email,
        COUNT(ea.id)::int as attendee_count
      FROM events e
      JOIN users u ON e.user_id = u.id
      LEFT JOIN event_attendees ea ON e.id = ea.event_id
      GROUP BY e.id, u.id
      ORDER BY e.start_date ASC NULLS LAST
    `);

    const events = result.rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      startDate: row.start_date,
      endDate: row.end_date,
      userId: row.user_id,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      user: {
        id: row.organizer_id,
        name: row.organizer_name,
        email: row.organizer_email,
      },
      attendeeCount: row.attendee_count,
      attendees: [], // Will be populated if needed in detail view
    }));

    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get single event by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get event with organizer info
    const eventResult = await query(
      `
        SELECT
          e.id, e.title, e.description, e.start_date, e.end_date, e.user_id, e."createdAt", e."updatedAt",
          u.id as organizer_id, u.name as organizer_name, u.email as organizer_email
        FROM events e
        JOIN users u ON e.user_id = u.id
        WHERE e.id = $1
      `,
      [id]
    );

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const eventRow = eventResult.rows[0];

    // Get attendees
    const attendeesResult = await query(
      `
        SELECT
          ea.id, ea.user_id, ea.status,
          u.id as user_id, u.name as user_name, u.email as user_email
        FROM event_attendees ea
        JOIN users u ON ea.user_id = u.id
        WHERE ea.event_id = $1
      `,
      [id]
    );

    const event = {
      id: eventRow.id,
      title: eventRow.title,
      description: eventRow.description,
      startDate: eventRow.start_date,
      endDate: eventRow.end_date,
      userId: eventRow.user_id,
      createdAt: eventRow.createdAt,
      updatedAt: eventRow.updatedAt,
      user: {
        id: eventRow.organizer_id,
        name: eventRow.organizer_name,
        email: eventRow.organizer_email,
      },
      attendees: attendeesResult.rows.map((a) => ({
        id: a.id,
        userId: a.user_id,
        status: a.status,
        user: {
          id: a.user_id,
          name: a.user_name,
          email: a.user_email,
        },
      })),
      attendeeCount: attendeesResult.rows.length,
    };

    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Get events created by the authenticated organizer
router.get(
  '/organizer/my-events',
  authenticate,
  requireOrganizer,
  async (req, res) => {
    try {
      const result = await query(
        `
        SELECT
          e.id, e.title, e.description, e.start_date, e.end_date, e.user_id, e."createdAt", e."updatedAt"
        FROM events e
        WHERE e.user_id = $1
        ORDER BY e.start_date ASC NULLS LAST
      `,
        [req.user.userId]
      );

      // Get attendees for each event
      const events = await Promise.all(
        result.rows.map(async (event) => {
          const attendeesResult = await query(
            `
          SELECT
            ea.id, ea.user_id, ea.status,
            u.id as user_id, u.name as user_name, u.email as user_email
          FROM event_attendees ea
          JOIN users u ON ea.user_id = u.id
          WHERE ea.event_id = $1
        `,
            [event.id]
          );

          return {
            id: event.id,
            title: event.title,
            description: event.description,
            startDate: event.start_date,
            endDate: event.end_date,
            userId: event.user_id,
            createdAt: event.createdAt,
            updatedAt: event.updatedAt,
            attendees: attendeesResult.rows.map((a) => ({
              id: a.id,
              userId: a.user_id,
              status: a.status,
              user: {
                id: a.user_id,
                name: a.user_name,
                email: a.user_email,
              },
            })),
            attendeeCount: attendeesResult.rows.length,
          };
        })
      );

      res.json(events);
    } catch (error) {
      console.error('Error fetching organizer events:', error);
      res.status(500).json({ error: 'Failed to fetch your events' });
    }
  }
);

// Create new event (organizer only)
router.post('/', authenticate, requireOrganizer, async (req, res) => {
  try {
    const { title, description, startDate, endDate } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const result = await query(
      `
        INSERT INTO events (title, description, start_date, end_date, user_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, title, description, start_date, end_date, user_id, "createdAt", "updatedAt"
      `,
      [
        title,
        description,
        startDate ? new Date(startDate) : null,
        endDate ? new Date(endDate) : null,
        req.user.userId,
      ]
    );

    const event = result.rows[0];

    // Get organizer info
    const userResult = await query(
      'SELECT id, name, email FROM users WHERE id = $1',
      [req.user.userId]
    );

    res.status(201).json({
      id: event.id,
      title: event.title,
      description: event.description,
      startDate: event.start_date,
      endDate: event.end_date,
      userId: event.user_id,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      user: userResult.rows[0],
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Update event (organizer only - must own the event)
router.put(
  '/:id',
  authenticate,
  requireOrganizer,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, startDate, endDate } = req.body;

      // Check if event exists and belongs to user
      const existingEvent = await query(
        'SELECT user_id FROM events WHERE id = $1',
        [id]
      );

      if (existingEvent.rows.length === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }

      if (existingEvent.rows[0].user_id !== req.user.userId) {
        return res
          .status(403)
          .json({ error: 'You can only edit your own events' });
      }

      // Update event
      const result = await query(
        `
        UPDATE events
        SET title = $1, description = $2, start_date = $3, end_date = $4, "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING id, title, description, start_date, end_date, user_id, "createdAt", "updatedAt"
      `,
        [
          title,
          description,
          startDate ? new Date(startDate) : null,
          endDate ? new Date(endDate) : null,
          id,
        ]
      );

      const event = result.rows[0];

      // Get organizer info and attendees
      const userResult = await query(
        'SELECT id, name, email FROM users WHERE id = $1',
        [event.user_id]
      );

      const attendeesResult = await query(
        `
        SELECT
          ea.id, ea.user_id, ea.status,
          u.id as user_id, u.name as user_name, u.email as user_email
        FROM event_attendees ea
        JOIN users u ON ea.user_id = u.id
        WHERE ea.event_id = $1
      `,
        [id]
      );

      res.json({
        id: event.id,
        title: event.title,
        description: event.description,
        startDate: event.start_date,
        endDate: event.end_date,
        userId: event.user_id,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
        user: userResult.rows[0],
        attendees: attendeesResult.rows.map((a) => ({
          id: a.id,
          userId: a.user_id,
          status: a.status,
          user: {
            id: a.user_id,
            name: a.user_name,
            email: a.user_email,
          },
        })),
      });
    } catch (error) {
      console.error('Error updating event:', error);
      res.status(500).json({ error: 'Failed to update event' });
    }
  }
);
