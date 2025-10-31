import express from 'express';
import { query } from '../db.js';
import {
  authenticate,
  requireOrganizer,
} from '../middleware/auth.js';

const router = express.Router();

// Helper function to validate UUID format
const isValidUUID = (str) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

// Helper function to validate and parse date
const parseDate = (dateString, fieldName) => {
  if (!dateString) return null;
  if (
    typeof dateString !== 'string' &&
    !(dateString instanceof Date)
  ) {
    throw new Error(`${fieldName} must be a valid date string`);
  }
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error(`${fieldName} is not a valid date`);
  }
  return date;
};

// Helper function to validate date range
const validateDateRange = (startDate, endDate) => {
  if (
    startDate &&
    endDate &&
    new Date(startDate) > new Date(endDate)
  ) {
    throw new Error('End date must be after start date');
  }
};

// Helper function to handle database errors
const handleDatabaseError = (error, res, defaultMessage) => {
  console.error('Database error:', error);

  // PostgreSQL error codes
  const pgErrorCodes = {
    23505: {
      status: 409,
      message: 'Duplicate entry. This event already exists.',
    },
    23503: {
      status: 400,
      message: 'Invalid reference. Related record not found.',
    },
    23502: { status: 400, message: 'Required field is missing.' },
    '22P02': { status: 400, message: 'Invalid input format.' },
    '42P01': { status: 500, message: 'Database table not found.' },
    '08003': { status: 503, message: 'Database connection lost.' },
    '57P01': {
      status: 503,
      message: 'Database server is shutting down.',
    },
  };

  const errorCode = error.code;
  if (errorCode && pgErrorCodes[errorCode]) {
    const errorInfo = pgErrorCodes[errorCode];
    return res.status(errorInfo.status).json({
      success: false,
      error: errorInfo.message,
      code: errorCode,
    });
  }

  // Handle connection errors
  if (error.message && error.message.includes('connection')) {
    return res.status(503).json({
      success: false,
      error: 'Database connection error. Please try again later.',
    });
  }

  // Default error response
  return res.status(500).json({
    success: false,
    error: defaultMessage || 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' && {
      details: error.message,
    }),
  });
};

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
      organizer: {
        id: row.organizer_id,
        name: row.organizer_name,
        email: row.organizer_email,
      },
      attendeeCount: row.attendee_count,
      attendees: [], // Will be populated if needed in detail view
    }));

    res.status(200).json({
      success: true,
      message: 'Events retrieved successfully',
      data: events,
      count: events.length,
    });
  } catch (error) {
    return handleDatabaseError(error, res, 'Failed to fetch events');
  }
});

// Get single event by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid event ID format',
      });
    }

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
      return res.status(404).json({
        success: false,
        error: 'Event not found',
      });
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
      organizer: {
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

    res.status(200).json({
      success: true,
      message: 'Event retrieved successfully',
      data: event,
    });
  } catch (error) {
    return handleDatabaseError(error, res, 'Failed to fetch event');
  }
});

// Get events created by the authenticated organizer
router.get(
  '/organizer/my-events',
  authenticate,
  requireOrganizer,
  async (req, res) => {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({
          success: false,
          error: 'User ID not found in token',
        });
      }

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
          try {
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
          } catch (innerError) {
            // If fetching attendees fails, return event without attendees
            console.error(
              `Error fetching attendees for event ${event.id}:`,
              innerError
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
              attendees: [],
              attendeeCount: 0,
            };
          }
        })
      );

      res.status(200).json({
        success: true,
        message: 'Your events retrieved successfully',
        data: events,
        count: events.length,
      });
    } catch (error) {
      return handleDatabaseError(
        error,
        res,
        'Failed to fetch your events'
      );
    }
  }
);

// Create new event (organizer only)
router.post('/', authenticate, requireOrganizer, async (req, res) => {
  try {
    const { title, description, startDate, endDate } = req.body;

    // Validate required fields
    if (
      !title ||
      typeof title !== 'string' ||
      title.trim().length === 0
    ) {
      return res.status(400).json({
        success: false,
        error: 'Title is required and must be a non-empty string',
      });
    }

    if (title.length > 255) {
      return res.status(400).json({
        success: false,
        error: 'Title must be 255 characters or less',
      });
    }

    // Validate and parse dates
    let parsedStartDate = null;
    let parsedEndDate = null;

    try {
      if (startDate) {
        parsedStartDate = parseDate(startDate, 'Start date');
      }
      if (endDate) {
        parsedEndDate = parseDate(endDate, 'End date');
      }

      // Validate date range
      validateDateRange(parsedStartDate, parsedEndDate);
    } catch (dateError) {
      return res.status(400).json({
        success: false,
        error: dateError.message,
      });
    }

    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        error: 'User ID not found in token',
      });
    }

    const result = await query(
      `
        INSERT INTO events (title, description, start_date, end_date, user_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, title, description, start_date, end_date, user_id, "createdAt", "updatedAt"
      `,
      [
        title.trim(),
        description?.trim() || null,
        parsedStartDate,
        parsedEndDate,
        req.user.userId,
      ]
    );

    const event = result.rows[0];

    // Get organizer info
    const userResult = await query(
      'SELECT id, name, email FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Organizer not found',
      });
    }

    const eventData = {
      id: event.id,
      title: event.title,
      description: event.description,
      startDate: event.start_date,
      endDate: event.end_date,
      userId: event.user_id,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      organizer: {
        id: userResult.rows[0].id,
        name: userResult.rows[0].name,
        email: userResult.rows[0].email,
      },
    };

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: eventData,
    });
  } catch (error) {
    // Check if it's a validation error we threw
    if (error.message && !error.code) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
    return handleDatabaseError(error, res, 'Failed to create event');
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

      // Validate ID format
      if (!isValidUUID(id)) {
        return res
          .status(400)
          .json({ error: 'Invalid event ID format' });
      }

      if (!req.user?.userId) {
        return res.status(401).json({
          success: false,
          error: 'User ID not found in token',
        });
      }

      // Check if event exists and belongs to user
      const existingEvent = await query(
        'SELECT user_id, start_date, end_date FROM events WHERE id = $1',
        [id]
      );

      if (existingEvent.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Event not found',
        });
      }

      if (existingEvent.rows[0].user_id !== req.user.userId) {
        return res.status(403).json({
          success: false,
          error: 'You can only edit your own events',
        });
      }

      const existingStartDate = existingEvent.rows[0].start_date;
      const existingEndDate = existingEvent.rows[0].end_date;

      // Validate input fields
      if (title !== undefined) {
        if (typeof title !== 'string' || title.trim().length === 0) {
          return res.status(400).json({
            success: false,
            error: 'Title must be a non-empty string if provided',
          });
        }
        if (title.length > 255) {
          return res.status(400).json({
            success: false,
            error: 'Title must be 255 characters or less',
          });
        }
      }

      // Validate and parse dates
      let parsedStartDate = undefined;
      let parsedEndDate = undefined;

      try {
        if (startDate !== undefined) {
          parsedStartDate = startDate
            ? parseDate(startDate, 'Start date')
            : null;
        }
        if (endDate !== undefined) {
          parsedEndDate = endDate
            ? parseDate(endDate, 'End date')
            : null;
        }

        // Validate date range if both are provided
        if (
          parsedStartDate !== undefined &&
          parsedEndDate !== undefined
        ) {
          validateDateRange(parsedStartDate, parsedEndDate);
        }
        // If updating only one date, check against existing date
        else if (
          parsedStartDate !== undefined &&
          endDate === undefined
        ) {
          if (existingEndDate) {
            validateDateRange(parsedStartDate, existingEndDate);
          }
        } else if (
          parsedEndDate !== undefined &&
          startDate === undefined
        ) {
          if (existingStartDate) {
            validateDateRange(existingStartDate, parsedEndDate);
          }
        }
      } catch (dateError) {
        return res.status(400).json({
          success: false,
          error: dateError.message,
        });
      }

      // Build update query dynamically based on provided fields
      const updateFields = [];
      const updateValues = [];
      let paramIndex = 1;

      if (title !== undefined) {
        updateFields.push(`title = $${paramIndex++}`);
        updateValues.push(title.trim());
      }
      if (description !== undefined) {
        updateFields.push(`description = $${paramIndex++}`);
        updateValues.push(description?.trim() || null);
      }
      if (parsedStartDate !== undefined) {
        updateFields.push(`start_date = $${paramIndex++}`);
        updateValues.push(parsedStartDate);
      }
      if (parsedEndDate !== undefined) {
        updateFields.push(`end_date = $${paramIndex++}`);
        updateValues.push(parsedEndDate);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No fields to update',
        });
      }

      updateFields.push(`"updatedAt" = CURRENT_TIMESTAMP`);
      updateValues.push(id);

      // Update event
      const result = await query(
        `
        UPDATE events
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING id, title, description, start_date, end_date, user_id, "createdAt", "updatedAt"
      `,
        updateValues
      );

      const event = result.rows[0];

      // Get organizer info and attendees
      const userResult = await query(
        'SELECT id, name, email FROM users WHERE id = $1',
        [event.user_id]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'Organizer not found' });
      }

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

      const eventData = {
        id: event.id,
        title: event.title,
        description: event.description,
        startDate: event.start_date,
        endDate: event.end_date,
        userId: event.user_id,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
        organizer: {
          id: userResult.rows[0].id,
          name: userResult.rows[0].name,
          email: userResult.rows[0].email,
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

      res.status(200).json({
        success: true,
        message: 'Event updated successfully',
        data: eventData,
      });
    } catch (error) {
      // Check if it's a validation error we threw
      if (error.message && !error.code) {
        return res.status(400).json({ error: error.message });
      }
      return handleDatabaseError(
        error,
        res,
        'Failed to update event'
      );
    }
  }
);

// Delete event (organizer only - must own the event)
router.delete(
  '/:id',
  authenticate,
  requireOrganizer,
  async (req, res) => {
    try {
      const { id } = req.params;

      // Validate ID format
      if (!isValidUUID(id)) {
        return res
          .status(400)
          .json({ error: 'Invalid event ID format' });
      }

      if (!req.user?.userId) {
        return res.status(401).json({
          success: false,
          error: 'User ID not found in token',
        });
      }

      // Check if event exists and belongs to user
      const existingEvent = await query(
        'SELECT user_id FROM events WHERE id = $1',
        [id]
      );

      if (existingEvent.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Event not found',
        });
      }

      if (existingEvent.rows[0].user_id !== req.user.userId) {
        return res.status(403).json({
          success: false,
          error: 'You can only delete your own events',
        });
      }

      // Delete event (attendees will be deleted automatically due to CASCADE)
      const deleteResult = await query(
        'DELETE FROM events WHERE id = $1',
        [id]
      );

      if (deleteResult.rowCount === 0) {
        // This shouldn't happen since we checked above, but handle it anyway
        return res.status(404).json({
          success: false,
          error: 'Event not found or already deleted',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Event deleted successfully',
      });
    } catch (error) {
      return handleDatabaseError(
        error,
        res,
        'Failed to delete event'
      );
    }
  }
);

export default router;
