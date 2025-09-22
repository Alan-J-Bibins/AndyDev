import { createCookieSessionStorage } from 'react-router';

const sessionSecret = process.env.SESSION_SECRET || 'session-secret';

export const serverSessionStorage = createCookieSessionStorage({
    cookie: {
        name: '__session',
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        secrets: [sessionSecret],
        maxAge: 60 * 60 * 24 * 3,
    },
});
