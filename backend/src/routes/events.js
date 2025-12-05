import express from 'express';
import { query } from '../db.js';
import {
  authenticate,
  requireOrganizer,
} from '../middleware/auth.js';
import {
  sendEventUpdateEmail,
  sendEventCancellationEmail,
} from '../services/email.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT
        e.id, e.title, e.description, e.start_date, e.end_date, e.user_id, e."createdAt", e."updatedAt",
        e.capacity, e.location, e.category, e.image_url, e.status,
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
      capacity: row.capacity,
      location: row.location,
      category: row.category,
      imageUrl: row.image_url,
      status: row.status,
      userId: row.user_id,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      user: {
        id: row.organizer_id,
        name: row.organizer_name,
        email: row.organizer_email,
      },
      attendeeCount: row.attendee_count,
      attendees: [],
    }));

    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const eventResult = await query(
      `
      SELECT
        e.id, e.title, e.description, e.start_date, e.end_date, e.user_id, e."createdAt", e."updatedAt",
        e.capacity, e.location, e.category, e.image_url, e.status, e.cancelled_at, e.cancellation_reason,
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
      capacity: eventRow.capacity,
      location: eventRow.location,
      category: eventRow.category,
      imageUrl: eventRow.image_url,
      status: eventRow.status,
      cancelledAt: eventRow.cancelled_at,
      cancellationReason: eventRow.cancellation_reason,
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

router.get(
  '/organizer/my-events',
  authenticate,
  requireOrganizer,
  async (req, res) => {
    try {
      const result = await query(
        `
      SELECT
        e.id, e.title, e.description, e.start_date, e.end_date, e.user_id, e."createdAt", e."updatedAt",
        e.capacity, e.location, e.category, e.image_url, e.status, e.cancelled_at, e.cancellation_reason
      FROM events e
      WHERE e.user_id = $1
      ORDER BY e.start_date ASC NULLS LAST
    `,
        [req.user.userId]
      );

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
            capacity: event.capacity,
            location: event.location,
            category: event.category,
            imageUrl: event.image_url,
            userId: event.user_id,
            status: event.status,
            cancelledAt: event.cancelled_at,
            cancellationReason: event.cancellation_reason,
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

router.post('/', authenticate, requireOrganizer, async (req, res) => {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      capacity,
      location,
      category,
      imageUrl,
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Validate that end date is after start date
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end <= start) {
        return res.status(400).json({
          error: 'End date/time must be after start date/time'
        });
      }
    }

    // Validate capacity if provided
    if (capacity !== null && capacity !== undefined) {
      const capacityNum = parseInt(capacity);
      if (isNaN(capacityNum) || capacityNum < 1) {
        return res
          .status(400)
          .json({ error: 'Capacity must be a positive number' });
      }
    }

    const result = await query(
      `
      INSERT INTO events (title, description, start_date, end_date, capacity, location, category, image_url, user_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, title, description, start_date, end_date, capacity, location, category, image_url, user_id, "createdAt", "updatedAt"
    `,
      [
        title,
        description,
        startDate ? new Date(startDate) : null,
        endDate ? new Date(endDate) : null,
        capacity || null,
        location || null,
        category || null,
        imageUrl || null,
        req.user.userId,
      ]
    );

    const event = result.rows[0];

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
      capacity: event.capacity,
      location: event.location,
      category: event.category,
      imageUrl: event.image_url,
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

router.put(
  '/:id',
  authenticate,
  requireOrganizer,
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        title,
        description,
        startDate,
        endDate,
        capacity,
        location,
        category,
        imageUrl,
      } = req.body;

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

      // Validate that end date is after start date
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end <= start) {
          return res.status(400).json({
            error: 'End date/time must be after start date/time'
          });
        }
      }

      // Validate capacity if provided
      if (capacity !== null && capacity !== undefined) {
        const capacityNum = parseInt(capacity);
        if (isNaN(capacityNum) || capacityNum < 1) {
          return res
            .status(400)
            .json({ error: 'Capacity must be a positive number' });
        }
      }

      const result = await query(
        `
      UPDATE events
      SET title = $1, description = $2, start_date = $3, end_date = $4, capacity = $5, location = $6, category = $7, image_url = $8, "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING id, title, description, start_date, end_date, capacity, location, category, image_url, user_id, "createdAt", "updatedAt"
    `,
        [
          title,
          description,
          startDate ? new Date(startDate) : null,
          endDate ? new Date(endDate) : null,
          capacity || null,
          location || null,
          category || null,
          imageUrl || null,
          id,
        ]
      );

      const event = result.rows[0];

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

      // Send update notification emails to all attendees (don't wait)
      const eventData = {
        id: event.id,
        title: event.title,
        description: event.description,
        startDate: event.start_date,
        endDate: event.end_date,
        location: event.location,
        category: event.category,
      };

      attendeesResult.rows.forEach((attendee) => {
        const userData = {
          id: attendee.user_id,
          name: attendee.user_name,
          email: attendee.user_email,
        };
        sendEventUpdateEmail(userData, eventData).catch((err) => {
          console.error(
            `Failed to send update email to ${attendee.user_email}:`,
            err
          );
        });
      });

      res.json({
        id: event.id,
        title: event.title,
        description: event.description,
        startDate: event.start_date,
        endDate: event.end_date,
        capacity: event.capacity,
        location: event.location,
        category: event.category,
        imageUrl: event.image_url,
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

/**
 * POST /api/events/:id/cancel
 * Cancel an event - sends notification emails to all attendees
 */
router.post(
  '/:id/cancel',
  authenticate,
  requireOrganizer,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      // Check if event exists and user owns it
      const eventCheck = await query(
        'SELECT e.*, u.id as user_id, u.name as user_name, u.email as user_email FROM events e JOIN users u ON e.user_id = u.id WHERE e.id = $1',
        [id]
      );

      if (eventCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }

      const event = eventCheck.rows[0];

      if (event.user_id !== req.user.userId) {
        return res
          .status(403)
          .json({ error: 'You can only cancel your own events' });
      }

      if (event.status === 'cancelled') {
        return res.status(400).json({ error: 'Event is already cancelled' });
      }

      // Update event status to cancelled
      const result = await query(
        `UPDATE events
         SET status = 'cancelled',
             cancelled_at = CURRENT_TIMESTAMP,
             cancellation_reason = $1,
             "updatedAt" = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [reason || null, id]
      );

      // Get all attendees to send cancellation emails
      const attendeesResult = await query(
        `SELECT u.id, u.name, u.email
         FROM event_attendees ea
         JOIN users u ON ea.user_id = u.id
         WHERE ea.event_id = $1`,
        [id]
      );

      // Send cancellation emails to all attendees (don't wait)
      const eventData = {
        id: event.id,
        title: event.title,
        description: event.description,
        startDate: event.start_date,
        endDate: event.end_date,
        location: event.location,
        category: event.category,
      };

      attendeesResult.rows.forEach((attendee) => {
        sendEventCancellationEmail(attendee, eventData).catch((err) => {
          console.error(
            `Failed to send cancellation email to ${attendee.email}:`,
            err
          );
        });
      });

      res.json({
        message: 'Event cancelled successfully',
        event: {
          id: result.rows[0].id,
          title: result.rows[0].title,
          status: result.rows[0].status,
          cancelledAt: result.rows[0].cancelled_at,
          cancellationReason: result.rows[0].cancellation_reason,
        },
        emailsSent: attendeesResult.rows.length,
      });
    } catch (error) {
      console.error('Error cancelling event:', error);
      res.status(500).json({ error: 'Failed to cancel event' });
    }
  }
);

/**
 * POST /api/events/:id/postpone
 * Postpone/reschedule an event - sends notification emails to all attendees
 */
router.post(
  '/:id/postpone',
  authenticate,
  requireOrganizer,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { newStartDate, newEndDate } = req.body;

      if (!newStartDate) {
        return res.status(400).json({ error: 'New start date is required' });
      }

      // Validate that new end date is after new start date
      if (newStartDate && newEndDate) {
        const start = new Date(newStartDate);
        const end = new Date(newEndDate);
        if (end <= start) {
          return res.status(400).json({
            error: 'End date/time must be after start date/time'
          });
        }
      }

      // Check if event exists and user owns it
      const eventCheck = await query(
        'SELECT e.*, u.id as user_id, u.name as user_name, u.email as user_email FROM events e JOIN users u ON e.user_id = u.id WHERE e.id = $1',
        [id]
      );

      if (eventCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }

      const event = eventCheck.rows[0];

      if (event.user_id !== req.user.userId) {
        return res
          .status(403)
          .json({ error: 'You can only postpone your own events' });
      }

      if (event.status === 'cancelled') {
        return res
          .status(400)
          .json({ error: 'Cannot postpone a cancelled event' });
      }

      // Save original dates if not already postponed
      const postponedFromStart =
        event.status === 'postponed'
          ? event.postponed_from_start
          : event.start_date;
      const postponedFromEnd =
        event.status === 'postponed' ? event.postponed_from_end : event.end_date;

      // Update event with new dates and mark as postponed
      const result = await query(
        `UPDATE events
         SET start_date = $1,
             end_date = $2,
             status = 'postponed',
             postponed_from_start = $3,
             postponed_from_end = $4,
             "updatedAt" = CURRENT_TIMESTAMP
         WHERE id = $5
         RETURNING *`,
        [
          new Date(newStartDate),
          newEndDate ? new Date(newEndDate) : null,
          postponedFromStart,
          postponedFromEnd,
          id,
        ]
      );

      // Get all attendees to send update emails
      const attendeesResult = await query(
        `SELECT u.id, u.name, u.email
         FROM event_attendees ea
         JOIN users u ON ea.user_id = u.id
         WHERE ea.event_id = $1`,
        [id]
      );

      // Send update emails to all attendees (don't wait)
      const eventData = {
        id: result.rows[0].id,
        title: result.rows[0].title,
        description: result.rows[0].description,
        startDate: result.rows[0].start_date,
        endDate: result.rows[0].end_date,
        location: result.rows[0].location,
        category: result.rows[0].category,
      };

      attendeesResult.rows.forEach((attendee) => {
        sendEventUpdateEmail(attendee, eventData).catch((err) => {
          console.error(
            `Failed to send update email to ${attendee.email}:`,
            err
          );
        });
      });

      res.json({
        message: 'Event postponed successfully',
        event: {
          id: result.rows[0].id,
          title: result.rows[0].title,
          startDate: result.rows[0].start_date,
          endDate: result.rows[0].end_date,
          status: result.rows[0].status,
          postponedFromStart: result.rows[0].postponed_from_start,
          postponedFromEnd: result.rows[0].postponed_from_end,
        },
        emailsSent: attendeesResult.rows.length,
      });
    } catch (error) {
      console.error('Error postponing event:', error);
      res.status(500).json({ error: 'Failed to postpone event' });
    }
  }
);

router.delete(
  '/:id',
  authenticate,
  requireOrganizer,
  async (req, res) => {
    try {
      const { id } = req.params;

      // Check if event exists and get status
      const existingEvent = await query(
        'SELECT user_id, status, title FROM events WHERE id = $1',
        [id]
      );

      if (existingEvent.rows.length === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }

      const event = existingEvent.rows[0];

      if (event.user_id !== req.user.userId) {
        return res
          .status(403)
          .json({ error: 'You can only delete your own events' });
      }

      // Require event to be cancelled before deletion
      if (event.status !== 'cancelled') {
        return res.status(400).json({
          error: 'Event must be cancelled before it can be deleted',
          hint: `Please cancel "${event.title}" first using the cancel button`,
        });
      }

      await query('DELETE FROM events WHERE id = $1', [id]);

      res.json({ message: 'Event deleted successfully' });
    } catch (error) {
      console.error('Error deleting event:', error);
      res.status(500).json({ error: 'Failed to delete event' });
    }
  }
);

export default router;
