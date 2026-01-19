import { test, expect } from '@playwright/test';

test.describe('System Version Display', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5173/');
    });

    test('should display the current system version in the bottom-left corner', async ({ page }) => {
        // Assert that the text matches the version format (vX.X.X)
        const versionElement = page.locator('text=/v\\d+\\.\\d+\\.\\d+/');
        await expect(versionElement).toBeVisible();

        // Assert CSS properties for positioning
        await expect(versionElement).toHaveCSS('position', 'fixed');
        await expect(versionElement).toHaveCSS('bottom', '4px'); // bottom-1 is 4px
        await expect(versionElement).toHaveCSS('left', '8px');   // left-2 is 8px
        await expect(versionElement).toHaveCSS('z-index', '50');

        // Take a screenshot to verify visual placement
        await page.screenshot({ path: 'test-results/version-display.png' });
    });
});
