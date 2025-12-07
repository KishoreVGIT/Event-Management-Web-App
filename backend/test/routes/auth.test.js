import { request, expect, sinon } from '../chai-setup.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import app from '../../src/index.js';

import pool from '../../src/db.js';

describe('Auth Routes', () => {
  let queryStub;

  beforeEach(() => {
    queryStub = sinon.stub(pool, 'query');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('POST /api/auth/signup', () => {
    it('should create a new user successfully', async () => {
      // Mock checking for existing user (returns empty)
      queryStub.onFirstCall().resolves({ rows: [] });
      
      // Mock inserting new user
      queryStub.onSecondCall().resolves({
        rows: [{
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          role: 'student',
          organization_name: null
        }]
      });

      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'password123'
        });

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('token');
      expect(res.body.user).to.deep.include({
        email: 'john@example.com',
        name: 'John Doe'
      });
    });

    it('should return error if user already exists', async () => {
      // Mock existing user found
      queryStub.resolves({ rows: [{ id: 1 }] });

      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'password123'
        });

      expect(res.status).to.equal(400);
      expect(res.body.error).to.equal('User already exists with this email');
    });

    it('should return error validation fails', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'john@example.com'
          // Missing other fields
        });

      expect(res.status).to.equal(400);
      expect(res.body.error).to.equal('All fields are required');
    });
  });

  describe('POST /api/auth/signin', () => {
    it('should sign in successfully with correct credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      // Mock finding user
      queryStub.resolves({
        rows: [{
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          passwordHash: hashedPassword,
          role: 'student',
          organization_name: null
        }]
      });

      const res = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'john@example.com',
          password: 'password123'
        });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('token');
      expect(res.body.user.email).to.equal('john@example.com');
    });

    it('should fail with invalid credentials', async () => {
      // Mock finding user but with different password
      const hashedPassword = await bcrypt.hash('otherpassword', 10);
      
      queryStub.resolves({
        rows: [{
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          passwordHash: hashedPassword,
          role: 'student'
        }]
      });

      const res = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'john@example.com',
          password: 'wrongpassword'
        });

      expect(res.status).to.equal(401);
      expect(res.body.error).to.equal('Invalid email or password');
    });

    it('should fail if user not found', async () => {
       queryStub.resolves({ rows: [] });

       const res = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'unknown@example.com',
          password: 'password123'
        });

       expect(res.status).to.equal(401);
    });
  });
});
