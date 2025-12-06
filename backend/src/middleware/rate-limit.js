/**
 * Rate Limiters - DISABLED for semester project
 * All limiters are now pass-through middleware that do nothing.
 */

const noOpLimiter = (req, res, next) => next();

export const authLimiter = noOpLimiter;
export const apiLimiter = noOpLimiter;
export const rsvpLimiter = noOpLimiter;
