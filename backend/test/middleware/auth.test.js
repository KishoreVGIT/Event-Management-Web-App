import { expect } from 'chai';
import sinon from 'sinon';
import jwt from 'jsonwebtoken';
import { authenticate, requireOrganizer, requireAdmin } from '../../src/middleware/auth.js';

describe('Auth Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { headers: {}, user: {} };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
    next = sinon.spy();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('authenticate', () => {
    it('should call next() if token is valid', () => {
      req.headers.authorization = 'Bearer valid-token';
      const decodedToken = { userId: 1, role: 'student' };
      sinon.stub(jwt, 'verify').returns(decodedToken);

      authenticate(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(req.user).to.include(decodedToken);
      expect(req.user.id).to.equal(1);
    });

    it('should return 401 if no token provided', () => {
      authenticate(req, res, next);

      expect(res.status.calledWith(401)).to.be.true;
      expect(res.json.calledWith({ error: 'Authentication required' })).to.be.true;
      expect(next.called).to.be.false;
    });

    it('should return 401 if token is invalid', () => {
      req.headers.authorization = 'Bearer invalid-token';
      sinon.stub(jwt, 'verify').throws(new Error('Invalid token'));

      authenticate(req, res, next);

      expect(res.status.calledWith(401)).to.be.true;
      expect(res.json.calledWith({ error: 'Invalid or expired token' })).to.be.true;
      expect(next.called).to.be.false;
    });
  });

  describe('requireOrganizer', () => {
    it('should call next() if user is organizer', () => {
      req.user = { role: 'organizer' };
      requireOrganizer(req, res, next);
      expect(next.calledOnce).to.be.true;
    });

    it('should call next() if user is admin', () => {
      req.user = { role: 'admin' };
      requireOrganizer(req, res, next);
      expect(next.calledOnce).to.be.true;
    });

    it('should return 403 if user is student', () => {
      req.user = { role: 'student' };
      requireOrganizer(req, res, next);
      expect(res.status.calledWith(403)).to.be.true;
      expect(res.json.calledWith({ error: 'Organizer access required' })).to.be.true;
      expect(next.called).to.be.false;
    });
  });

  describe('requireAdmin', () => {
    it('should call next() if user is admin', () => {
      req.user = { role: 'admin' };
      requireAdmin(req, res, next);
      expect(next.calledOnce).to.be.true;
    });

    it('should return 403 if user is not admin', () => {
      req.user = { role: 'organizer' };
      requireAdmin(req, res, next);
      expect(res.status.calledWith(403)).to.be.true;
      expect(res.json.calledWith({ error: 'Admin access required' })).to.be.true;
      expect(next.called).to.be.false;
    });
  });
});
