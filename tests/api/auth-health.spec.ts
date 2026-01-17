
import { test, expect } from '@playwright/test';

test.describe('Auth API Health', () => {
    const baseURL = 'https://azul-online-06vu.onrender.com';

    test('GET /api/auth/providers returns 200 and JSON', async ({ request }) => {
        const response = await request.get(`${baseURL}/api/auth/providers`);
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body).toHaveProperty('google');
        expect(body).toHaveProperty('github');
    });

    test('GET /api/auth/session returns 200 (empty object or null user)', async ({ request }) => {
        const response = await request.get(`${baseURL}/api/auth/session`);
        // Session endpoint usually returns 200 with empty object if not logged in, 
        // or maybe 401 depending on config, but Auth.js v5 often returns 200 with { user: null } or empty.
        expect(response.status()).toBe(200);
        const body = await response.json();
        // Verify it's JSON. Content depends on state, but shouldn't be HTML error.
        console.log('Session response:', body);
    });
});
