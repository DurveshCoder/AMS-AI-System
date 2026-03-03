import rateLimit from 'express-rate-limit';

export const authRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: { success: false, error: 'Too many requests, please try again later.' }
});

export const apiRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    message: { success: false, error: 'Too many requests, please try again later.' }
});
