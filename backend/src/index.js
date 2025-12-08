import dotenv from 'dotenv';

dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pool, { end } from './db.js';
import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';
import rsvpRoutes from './routes/rsvp.js';
import adminRoutes from './routes/admin.js';
import uploadRoutes from './routes/upload.js';
import profileRoutes from './routes/profile.js';
import { apiLimiter } from './middleware/rate-limit.js';
import { transporter } from './services/email.js';
const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply general rate limiting to all API routes
app.use('/api/', apiLimiter);

app.get('/health', (_req, res) => {
  res
    .status(200)
    .json({ status: 'OK', message: 'Server is running' });
});

app.get('/', (_req, res) => {
  res.json({ message: 'Event Management API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/rsvp', rsvpRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/profile', profileRoutes);
// Health‑check endpoint for email transporter
app.get('/api/email-status', async (req, res) => {
  try {
    await transporter.verify();
    res.json({ success: true });
  } catch (error) {
    console.error('Email transporter verification failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

async function startServer() {
  try {
    await pool.query('SELECT NOW()');
    console.log('Database connected successfully');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await end();
  process.exit(0);
});

if (process.env.NODE_ENV !== 'test') {
  startServer().catch(console.error);
}

export default app;
