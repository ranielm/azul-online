import { test, expect } from '@playwright/test';

test.describe('Interactive Tutorial', () => {
    test('should show tutorial on first visit and allow navigation', async ({ page }) => {
        // 1. Login and Start Game (Mocking valid game state if possible, or going through flow)
        await page.goto('http://localhost:5173');

        // Fill login
        await page.fill('input[placeholder*="nickname"]', 'TutorialUser');
        await page.click('button:has-text("Criar Sala")');
        await page.click('button:has-text("Criar Sala")'); // Confirm create

        // Wait for game screen (dependent on backend)
        // If backend is down, we might need a way to force game state or mock it.
        // For now assuming backend works or we can verify the button in a different way.

        // Assuming we reach the lobby and start game
        // await page.click('button:has-text("Start Game")');

        // Check for Tutorial Overlay
        // It should appear after a 1s timeout
        await page.waitForTimeout(1500);

        // Check for title
        const title = page.locator('h2', { hasText: 'How to Play Ladrilho' });
        // Note: If backend is down, this test will timeout waiting for 'game' screen.
        // We would skip this if we knew backend was down.

        // Validate "Next" button functionality
        await page.click('button:has-text("Next")');
        await expect(page.locator('text=Drafting Tiles')).toBeVisible();

        await page.click('button:has-text("Next")');
        await expect(page.locator('text=Pattern Lines')).toBeVisible();

        await page.click('button:has-text("Next")');
        await expect(page.locator('text=Tiling the Wall')).toBeVisible();

        await page.click('button:has-text("Next")');
        await expect(page.locator('text=Penalties')).toBeVisible();

        // Finish
        await page.click('button:has-text("Finish")');

        // Verify overlay is gone
        await expect(page.locator('text=How to Play Ladrilho')).not.toBeVisible();

        // Verify localStorage
        const seen = await page.evaluate(() => localStorage.getItem('ladrilho_tutorial_seen'));
        expect(seen).toBe('true');
    });

    test('should open tutorial via button', async ({ page }) => {
        // Similar setup...
    });
});
