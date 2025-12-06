import jwt from 'jsonwebtoken';

const JWT_SECRET =
  process.env.JWT_SECRET || 'your-secret-key-change-this';

export const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res
        .status(401)
        .json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // Normalize the shape here
    req.user = {
      ...decoded,
      id: decoded.id || decoded.userId || decoded.sub,
    };

    if (!req.user.id) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    next();
  } catch (error) {
    console.error(error);
    return res
      .status(401)
      .json({ error: 'Invalid or expired token' });
  }
};

export const requireOrganizer = (req, res, next) => {
  if (req.user.role !== 'organizer' && req.user.role !== 'admin') {
    return res
      .status(403)
      .json({ error: 'Organizer access required' });
  }
  next();
};

export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};
