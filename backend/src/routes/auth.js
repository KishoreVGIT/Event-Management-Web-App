import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';
import { authLimiter } from '../middleware/rate-limit.js';
import { sendWelcomeEmail } from '../services/email.js';

const router = express.Router();

const JWT_SECRET =
  process.env.JWT_SECRET || 'your-secret-key-change-this';

router.post('/signup', authLimiter, async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, organizationName } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res
        .status(400)
        .json({ error: 'All fields are required' });
    }

    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res
        .status(400)
        .json({ error: 'User already exists with this email' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await query(
      'INSERT INTO users (name, email, "passwordHash", role, organization_name) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, organization_name',
      [
        `${firstName} ${lastName}`,
        email,
        passwordHash,
        role || 'student',
        organizationName || null,
      ]
    );

    const user = result.rows[0];

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Send welcome email
    try {
      await sendWelcomeEmail(user);
    } catch (err) {
      console.error('Failed to send welcome email:', err);
    }

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationName: user.organization_name,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.post('/signin', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: 'Email and password are required' });
    }

    const result = await query(
      'SELECT id, name, email, "passwordHash", role, organization_name FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res
        .status(401)
        .json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    const isValidPassword = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!isValidPassword) {
      return res
        .status(401)
        .json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Signed in successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationName: user.organization_name,
      },
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Failed to sign in' });
  }
});

router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const result = await query(
      'SELECT id, name, email, role, organization_name FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationName: user.organization_name,
      },
    });
  } catch (error) {
    console.error('Auth verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
