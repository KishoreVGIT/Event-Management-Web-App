import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import pool, { end } from './db.js';
import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';
import rsvpRoutes from './routes/rsvp.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));