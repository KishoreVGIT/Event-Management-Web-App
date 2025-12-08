import 'dotenv/config';
import { request, expect, sinon } from '../chai-setup.js';
import app from '../../src/index.js';
import pool from '../../src/db.js';
import jwt from 'jsonwebtoken';

describe('Event Routes', () => {
  let queryStub;
  let authHeader;

  beforeEach(() => {
    queryStub = sinon.stub(pool, 'query');
    
    // Create a valid token for an organizer
    const secret = process.env.JWT_SECRET || 'your-secret-key-change-this';
    
    const token = jwt.sign(
      { userId: 1, email: 'org@example.com', role: 'organizer' },
      secret,
      { expiresIn: '1h' }
    );
    authHeader = `Bearer ${token}`;
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('POST /api/events', () => {
    it('should create an event successfully', async () => {
      // Mock validation queries
      queryStub.resolves({ 
        rows: [{ 
          id: 1, 
          name: 'Org', 
          email: 'org@example.com', 
          organization_name: 'Test Org' 
        }] 
      });

      queryStub.withArgs(sinon.match(/INSERT INTO events/)).resolves({
        rows: [{
          id: 1,
          title: 'New Event',
          description: 'Desc',
          start_date: '2023-12-25T10:00:00Z',
          end_date: '2023-12-25T12:00:00Z',
          capacity: 100,
          location: 'Hall A',
          category: 'Tech',
          user_id: 1,
          created_at: new Date(),
          updated_at: new Date()
        }]
      });

      const res = await request(app)
        .post('/api/events')
        .set('Authorization', authHeader)
        .send({
          title: 'New Event',
          description: 'Desc',
          startDate: '2023-12-25T10:00:00Z',
          endDate: '2023-12-25T12:00:00Z',
          capacity: 100,
          location: 'Hall A',
          category: 'Tech'
        });

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('id', 1);
      expect(res.body.title).to.equal('New Event');
    });

    it('should fail validation (end date before start date)', async () => {
      const res = await request(app)
        .post('/api/events')
        .set('Authorization', authHeader)
        .send({
          title: 'Bad Date Event',
          startDate: '2023-12-25T12:00:00Z',
          endDate: '2023-12-25T10:00:00Z'
        });

      expect(res.status).to.equal(400);
      expect(res.body.error).to.contain('End date/time must be after');
    });
  });

  describe('GET /api/events', () => {
    it('should list events', async () => {
      queryStub.resolves({
        rows: [
          {
            id: 1,
            title: 'Event 1',
            description: 'Desc 1',
            start_date: new Date(),
            end_date: new Date(),
            capacity: 50,
            location: 'Loc 1',
            category: 'Cat 1',
            image_url: null,
            status: 'active',
            user_id: 1,
            created_at: new Date(),
            updated_at: new Date(),
            organizer_id: 1,
            organizer_name: 'Org 1',
            organizer_email: 'org1@example.com',
            organization_name: 'Org 1 Corp',
            attendee_count: 5
          }
        ]
      });

      const res = await request(app).get('/api/events');

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body[0].title).to.equal('Event 1');
      expect(res.body[0].attendeeCount).to.equal(5);
    });
  });
});
