import { test, expect } from '@playwright/test';

const DEFAULT_USERNAME = 'testuser';
const DEFAULT_EMAIL = 'testuser@example.com';
const DEFAULT_PASSWORD = 'testpass';

test.describe('Profile Settings', () => {
  // Helper function to login before each test
  async function loginUser(page) {
    await page.goto('/login');
    await page.getByLabel('Brukernavn').fill(DEFAULT_USERNAME);
    await page.getByLabel('Passord').fill(DEFAULT_PASSWORD);
    await page.getByRole('button', { name: 'Logg inn' }).click();
    await page.waitForURL('/gallery');
  }

  test.beforeEach(async ({ page }) => {
    // Login and navigate to profile page
    await loginUser(page);
    await page.goto('/profile');
    await expect(page).toHaveURL('/profile');

    // Wait for initial data load
    await page.waitForLoadState('networkidle');

    // Verify the page structure
    await expect(page.getByRole('heading', { name: 'Mine annonser' })).toBeVisible();
    await expect(page.locator('div.text-2xl').getByText('Profil', { exact: true })).toBeVisible();
    await expect(page.getByText('Her kan du se og endre profildetaljer', { exact: true })).toBeVisible();

    // Verify email field is present
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });

  test('updates password', async ({ page }) => {
    const newPassword = 'newpass';

    // Fill in new password and confirmation
    const newPasswordInput = page.locator('input[type="password"]').first();
    const confirmPasswordInput = page.locator('input[type="password"]').nth(1);
    await newPasswordInput.fill(newPassword);
    await confirmPasswordInput.fill(newPassword);

    // Update password
    await page.getByRole('button', { name: 'Oppdater' }).click();

    // Wait for update and page reload
    await page.waitForLoadState('networkidle');

    // Verify password fields are cleared after update
    await expect(newPasswordInput).toHaveValue('');
    await expect(confirmPasswordInput).toHaveValue('');

    // Log out using sidebar button
    await page.getByText('Logg ut').click();
    await page.waitForURL('/login');

    // Try logging in with new password
    await page.getByLabel('Brukernavn').fill(DEFAULT_USERNAME);
    await page.getByLabel('Passord').fill(newPassword);
    await page.getByRole('button', { name: 'Logg inn' }).click();
    await page.waitForURL('/gallery');

    // Navigate to profile to reset password
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    // Reset password back to default
    await newPasswordInput.fill(DEFAULT_PASSWORD);
    await confirmPasswordInput.fill(DEFAULT_PASSWORD);
    await page.getByRole('button', { name: 'Oppdater' }).click();

    // Wait for update and page reload
    await page.waitForLoadState('networkidle');

    // Verify password fields are cleared after update
    await expect(newPasswordInput).toHaveValue('');
    await expect(confirmPasswordInput).toHaveValue('');

    // Log out using sidebar button
    await page.getByText('Logg ut').click();
    await page.waitForURL('/login');

    // Verify we can log in with the default password again
    await page.getByLabel('Brukernavn').fill(DEFAULT_USERNAME);
    await page.getByLabel('Passord').fill(DEFAULT_PASSWORD);
    await page.getByRole('button', { name: 'Logg inn' }).click();
    await page.waitForURL('/gallery');
  });

  test('updates email', async ({ page }) => {
    const newEmail = `newemail_${Date.now()}@test.com`;

    // Get initial email
    const emailInput = page.locator('input[name="email"]');
    await expect(emailInput).toHaveValue(DEFAULT_EMAIL);

    // Update email
    await emailInput.fill(newEmail);
    await page.getByRole('button', { name: 'Oppdater' }).click();

    // Wait for update and page reload
    await page.waitForLoadState('networkidle');
    await expect(emailInput).toHaveValue(newEmail);

    // Reset email back to default
    await emailInput.fill(DEFAULT_EMAIL);
    await page.getByRole('button', { name: 'Oppdater' }).click();
    await page.waitForLoadState('networkidle');
    await expect(emailInput).toHaveValue(DEFAULT_EMAIL);
  });
});

