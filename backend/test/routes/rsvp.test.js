import 'dotenv/config';
import { request, expect, sinon } from '../chai-setup.js';
import app from '../../src/index.js';
import pool from '../../src/db.js'; // Import pool directly
import * as db from '../../src/db.js';
import jwt from 'jsonwebtoken';

describe('RSVP Routes', () => {
  let connectStub;
  let mockClient;
  let authHeader;

  beforeEach(() => {
     // Mock the DB client and its query method
     mockClient = {
       query: sinon.stub(),
       release: sinon.stub(),
     };
     
     // Stub pool.connect to return our mock client
     // This works because pool is an object instance, not a readonly export
     connectStub = sinon.stub(pool, 'connect').resolves(mockClient);

     // Create auth token
     const token = jwt.sign(
      { userId: 1, email: 'student@example.com', role: 'student' },
      process.env.JWT_SECRET || 'your-secret-key-change-this',
      { expiresIn: '1h' }
    );
    authHeader = `Bearer ${token}`;
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('POST /api/rsvp/:eventId', () => {
    it('should RSVP successfully', async () => {
      // Sequence of queries expected in the user flow:
      // 1. BEGIN
      // 2. SELECT event (check exists)
      // 3. SELECT existing RSVP (check duplicate)
      // 4. SELECT count (check capacity) - optional if capacity set, let's assume capacity=100
      // 5. INSERT RSVP
      // 6. SELECT event details (for response)
      // 7. COMMIT
      // 8. SELECT user (for email)... Wait, the route does `await query(...)` for user info, NOT client.query
      
      // We also need to stub pool.query for the email user fetch part
      // The code uses `query` helper which calls `pool.query`.
      sinon.stub(pool, 'query').resolves({ rows: [{ name: 'Student', email: 'student@example.com' }] });

      mockClient.query.withArgs('BEGIN').resolves();
      
      // Event check
      mockClient.query.withArgs(sinon.match(/SELECT id, capacity FROM events/)).resolves({
        rows: [{ id: 1, capacity: 100 }]
      });

      // Existing RSVP check
      mockClient.query.withArgs(sinon.match(/SELECT id FROM event_attendees/)).resolves({
        rows: [] // No existing RSVP
      });

      // Capacity check
      mockClient.query.withArgs(sinon.match(/SELECT COUNT\(\*\)/)).resolves({
        rows: [{ count: 10 }]
      });

      // Insert
      mockClient.query.withArgs(sinon.match(/INSERT INTO event_attendees/)).resolves({
        rows: [{ id: 101, user_id: 1, event_id: 1, status: 'confirmed' }]
      });

      // Fetch event details (catch-all for the big select, or match loosely)
      mockClient.query.withArgs(sinon.match(/SELECT.*FROM events/s)).resolves({
        rows: [{ 
          id: 1, title: 'Test Event', start_date: new Date(), 
          organizer_email: 'org@example.com' 
        }]
      });

      mockClient.query.withArgs('COMMIT').resolves();

      const res = await request(app)
        .post('/api/rsvp/1')
        .set('Authorization', authHeader);

      expect(res.status).to.equal(201);
      expect(res.body.message).to.equal('RSVP successful');
      expect(mockClient.release.called).to.be.true;
    });

    it('should prevent duplicate RSVP', async () => {
      sinon.stub(pool, 'query'); // Just in case
      mockClient.query.withArgs('BEGIN').resolves();
      
      // Event check
      mockClient.query.withArgs(sinon.match(/SELECT id, capacity/)).resolves({
        rows: [{ id: 1, capacity: 100 }]
      });

      // Existing RSVP check - Found One!
      mockClient.query.withArgs(sinon.match(/SELECT id FROM event_attendees/)).resolves({
        rows: [{ id: 50 }]
      });

      mockClient.query.withArgs('ROLLBACK').resolves();

      const res = await request(app)
        .post('/api/rsvp/1')
        .set('Authorization', authHeader);

      expect(res.status).to.equal(400);
      expect(res.body.error).to.contain('already RSVP');
    });
  });
});
