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

      // Fetch event details 
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
      sinon.stub(pool, 'query');
      mockClient.query.withArgs('BEGIN').resolves();
      
      // Event check
      mockClient.query.withArgs(sinon.match(/SELECT id, capacity/)).resolves({
        rows: [{ id: 1, capacity: 100 }]
      });

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
