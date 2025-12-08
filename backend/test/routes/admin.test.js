import 'dotenv/config';
import { request, expect, sinon } from '../chai-setup.js';
import app from '../../src/index.js';
import pool from '../../src/db.js';
import jwt from 'jsonwebtoken';

describe('Admin Routes', () => {
  let queryStub;
  let adminAuthHeader;
  let studentAuthHeader;

  beforeEach(() => {
    queryStub = sinon.stub(pool, 'query');
    
    // Valid Admin Token
    const adminToken = jwt.sign(
      { userId: 99, email: 'admin@example.com', role: 'admin' },
      process.env.JWT_SECRET || 'your-secret-key-change-this',
      { expiresIn: '1h' }
    );
    adminAuthHeader = `Bearer ${adminToken}`;

    // Valid Student Token
    const studentToken = jwt.sign(
      { userId: 1, email: 'student@example.com', role: 'student' },
      process.env.JWT_SECRET || 'your-secret-key-change-this',
      { expiresIn: '1h' }
    );
    studentAuthHeader = `Bearer ${studentToken}`;
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('GET /api/admin/users', () => {
    it('should list users for admin', async () => {
      queryStub.resolves({
        rows: [
          { id: 1, name: 'User 1', email: 'u1@ex.com', role: 'student' },
          { id: 2, name: 'User 2', email: 'u2@ex.com', role: 'organizer' }
        ]
      });

      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', adminAuthHeader);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.length(2);
    });

    it('should deny access to non-admin', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', studentAuthHeader);

      expect(res.status).to.equal(403);
      expect(res.body.error).to.equal('Admin access required');
    });
  });

  describe('DELETE /api/admin/users/:id', () => {
    it('should delete a user', async () => {
       // Mock user existence check
       queryStub.onFirstCall().resolves({ rows: [{ id: 2 }] });
       // Mock delete
       queryStub.onSecondCall().resolves({ rowCount: 1 });

       const res = await request(app)
         .delete('/api/admin/users/2')
         .set('Authorization', adminAuthHeader);

       expect(res.status).to.equal(200);
       expect(res.body.message).to.equal('User deleted successfully');
    });

    it('should prevent deleting self', async () => {
      const res = await request(app)
        .delete('/api/admin/users/99')
        .set('Authorization', adminAuthHeader);

      expect(res.status).to.equal(400);
      expect(res.body.error).to.equal('Cannot delete your own account');
    });
  });
});
