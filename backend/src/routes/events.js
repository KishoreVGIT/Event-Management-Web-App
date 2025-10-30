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
