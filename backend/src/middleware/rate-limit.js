const noOpLimiter = (req, res, next) => next();

export const authLimiter = noOpLimiter;
export const apiLimiter = noOpLimiter;
export const rsvpLimiter = noOpLimiter;
