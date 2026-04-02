import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('renders login form with all required fields', async ({ page }) => {
        // Check heading
        await expect(page.getByText('Welcome Back')).toBeVisible();

        // Check all input fields are present
        await expect(page.locator('#login-phone')).toBeVisible();
        await expect(page.locator('#login-api-id')).toBeVisible();
        await expect(page.locator('#login-api-hash')).toBeVisible();

        // Check submit button
        await expect(page.locator('#login-submit')).toBeVisible();
        await expect(page.locator('#login-submit')).toContainText('Launch Into Space');
    });

    test('shows Space Drive branding', async ({ page }) => {
        await expect(page.getByText('Space Drive')).toBeVisible();
    });

    test('has help link to my.telegram.org', async ({ page }) => {
        const link = page.getByRole('link', { name: /my\.telegram\.org/i });
        await expect(link).toBeVisible();
        await expect(link).toHaveAttribute('target', '_blank');
        await expect(link).toHaveAttribute('rel', /noopener/);
        await expect(link).toHaveAttribute('href', 'https://my.telegram.org');
    });

    test('phone input accepts text input', async ({ page }) => {
        const phoneInput = page.locator('#login-phone');
        await phoneInput.fill('+12345678900');
        await expect(phoneInput).toHaveValue('+12345678900');
    });

    test('API ID input accepts numeric input', async ({ page }) => {
        const apiIdInput = page.locator('#login-api-id');
        await apiIdInput.fill('123456');
        await expect(apiIdInput).toHaveValue('123456');
    });

    test('submit button is enabled when form is valid', async ({ page }) => {
        await page.locator('#login-phone').fill('+12345678900');
        await page.locator('#login-api-id').fill('123456');
        await page.locator('#login-api-hash').fill('abcdef1234567890');

        const submitButton = page.locator('#login-submit');
        await expect(submitButton).toBeEnabled();
    });

    test('displays feature list on desktop viewport', async ({ page }) => {
        // These are visible on lg+ screens
        const viewport = page.viewportSize();
        if (viewport && viewport.width >= 1024) {
            await expect(page.getByText('Military-Grade Encryption')).toBeVisible();
            await expect(page.getByText('Instant Access')).toBeVisible();
            await expect(page.getByText('Limitless Storage')).toBeVisible();
        }
    });

    test('privacy notice is visible', async ({ page }) => {
        await expect(
            page.getByText(/credentials are stored locally/i)
        ).toBeVisible();
    });
});
