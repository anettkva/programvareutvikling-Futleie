// checks that the user is redirected to the login page when not authenticated
// and that the login page contains the correct elements
// and that you can accsess the login page by navigating directly to it

import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  // Helper function to go to login page and wait for it to load
  async function goToLoginPage(page) {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
  }
  test('redirects to login when not authenticated', async ({ page }) => {
    // Start from the gallery page
    await page.goto('/gallery');

    // Should be redirected to login
    await page.waitForURL('/login');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Verify login page elements are visible
    await expect(page.locator('.text-2xl').filter({ hasText: 'Logg inn' })).toBeVisible();
    await expect(page.getByLabel('Brukernavn')).toBeVisible();
    await expect(page.getByLabel('Passord')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Logg inn' })).toBeVisible();
  });

  test('login page is accessible directly', async ({ page }) => {
    // Go to login page directly
    await page.goto('/login');

    // Should stay on login page
    await expect(page).toHaveURL('/login');
  });

  test.describe('Login Form Validation', () => {
    test.beforeEach(async ({ page }) => {
      await goToLoginPage(page);
    });

    test('shows validation error for empty username', async ({ page }) => {
      // Fill only password
      await page.getByLabel('Passord').fill('somepassword');
      await page.getByRole('button', { name: 'Logg inn' }).click();
      
      // Verify username is required
      const usernameInput = page.getByLabel('Brukernavn');
      await expect(usernameInput).toHaveAttribute('required', '');
    });

    test('shows validation error for empty password', async ({ page }) => {
      // Fill only username
      await page.getByLabel('Brukernavn').fill('someuser');
      await page.getByRole('button', { name: 'Logg inn' }).click();
      
      // Verify password is required
      const passwordInput = page.getByLabel('Passord');
      await expect(passwordInput).toHaveAttribute('required', '');
    });

    test('shows error message for invalid credentials', async ({ page }) => {
      // Create a promise that will resolve when the dialog appears
      const dialogPromise = new Promise((resolve) => {
        page.on('dialog', async dialog => {
          expect(dialog.message()).toBe('Feil brukernavn eller passord');
          await dialog.accept();
          resolve(true);
        });
      });

      // Fill in invalid credentials
      await page.getByLabel('Brukernavn').fill('invaliduser');
      await page.getByLabel('Passord').fill('invalidpass');
      
      // Submit form
      await page.getByRole('button', { name: 'Logg inn' }).click();

      // Wait for the dialog to appear and verify it did
      const dialogAppeared = await dialogPromise;
      expect(dialogAppeared).toBe(true);
    });
  });

  test.describe('Successful Login', () => {
    test.beforeEach(async ({ page }) => {
      await goToLoginPage(page);
    });

    test('successful login redirects to gallery and sets cookie', async ({ page }) => {
      // Fill in valid credentials
      await page.getByLabel('Brukernavn').fill('testuser'); // Replace with actual test user
      await page.getByLabel('Passord').fill('testpass'); // Replace with actual test password
      
      // Submit form
      await page.getByRole('button', { name: 'Logg inn' }).click();
      
      // Should be redirected to gallery
      await page.waitForURL('/gallery');
      
      // Verify cookie is set
      const cookies = await page.context().cookies();
      const userCookie = cookies.find(cookie => cookie.name === 'user');
      expect(userCookie).toBeTruthy();
      expect(userCookie?.domain).toBe('localhost');
      
      // Verify cookie value exists
      expect(userCookie?.value).toBeTruthy();
      
      try {
        // Decode the URL-encoded cookie value before parsing
        const decodedValue = decodeURIComponent(userCookie?.value || '');
        const userData = JSON.parse(decodedValue);
        expect(userData).toHaveProperty('username');
        expect(userData).toHaveProperty('id');
      } catch (e) {
        throw new Error(`Failed to parse user cookie: ${userCookie?.value}. Error: ${e.message}`);
      }
    });

    test('logged in user can access protected routes', async ({ page }) => {
      // First login
      await page.getByLabel('Brukernavn').fill('testuser'); // Replace with actual test user
      await page.getByLabel('Passord').fill('testpass'); // Replace with actual test password
      await page.getByRole('button', { name: 'Logg inn' }).click();
      await page.waitForURL('/gallery');
      
      // Try accessing other protected routes
      await page.goto('/gallery');
      await expect(page).toHaveURL('/gallery');
      
      await page.goto('/create-ad');
      await expect(page).toHaveURL('/create-ad');
    });
  });

  test.describe('Logout Functionality', () => {
    test.beforeEach(async ({ page }) => {
      // First ensure we're logged in
      await goToLoginPage(page);
      await page.getByLabel('Brukernavn').fill('testuser');
      await page.getByLabel('Passord').fill('testpass');
      await page.getByRole('button', { name: 'Logg inn' }).click();
      await page.waitForURL('/gallery');
    });

    test('logout removes user cookie and redirects to login', async ({ page }) => {
      // Ensure we're on a page with logout button
      await expect(page.getByRole('button', { name: 'Logg ut' })).toBeVisible();
      
      // Click logout button and wait for navigation to start
      await Promise.all([
        page.waitForURL('/login'),
        page.getByRole('button', { name: 'Logg ut' }).click()
      ]);

      // Wait for any pending network requests to complete
      await page.waitForLoadState('networkidle');

      // Verify cookie is removed - retry a few times if needed
      await expect(async () => {
        const cookies = await page.context().cookies();
        const userCookie = cookies.find(cookie => cookie.name === 'user');
        expect(userCookie).toBeUndefined();
      }).toPass({ timeout: 5000 });
    });

    test('cannot access protected routes after logout', async ({ page }) => {
      // Ensure we're on a page with logout button
      await expect(page.getByRole('button', { name: 'Logg ut' })).toBeVisible();
      
      // First logout with proper wait conditions
      await Promise.all([
        page.waitForURL('/login'),
        page.getByRole('button', { name: 'Logg ut' }).click()
      ]);
      
      // Wait for any pending network requests
      await page.waitForLoadState('networkidle');

      // Try accessing protected routes with proper wait conditions
      await Promise.all([
        page.waitForURL('/login'),
        page.goto('/gallery')
      ]);
      
      await Promise.all([
        page.waitForURL('/login'),
        page.goto('/create-ad')
      ]);
    });
  });

  test.describe('Session Persistence', () => {
    test.beforeEach(async ({ page }) => {
      // First ensure we're logged in
      await goToLoginPage(page);
      await page.getByLabel('Brukernavn').fill('testuser');
      await page.getByLabel('Passord').fill('testpass');
      await page.getByRole('button', { name: 'Logg inn' }).click();
      await page.waitForURL('/gallery');
    });

    test('login persists after page refresh', async ({ page }) => {
      // Refresh the gallery page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Should still be on gallery page
      await expect(page).toHaveURL('/gallery');

      // Verify user cookie still exists
      const cookies = await page.context().cookies();
      const userCookie = cookies.find(cookie => cookie.name === 'user');
      expect(userCookie).toBeTruthy();
    });

    test('login persists when navigating between protected routes', async ({ page }) => {
      // Navigate to create-ad page
      await page.goto('/create-ad');
      await expect(page).toHaveURL('/create-ad');

      // Navigate back to gallery
      await page.goto('/gallery');
      await expect(page).toHaveURL('/gallery');

      // Verify user cookie still exists
      const cookies = await page.context().cookies();
      const userCookie = cookies.find(cookie => cookie.name === 'user');
      expect(userCookie).toBeTruthy();
    });

    test('login persists in a new tab', async ({ context }) => {
      // Create a new page (tab)
      const newPage = await context.newPage();

      // Try accessing a protected route in the new tab
      await newPage.goto('/gallery');
      await expect(newPage).toHaveURL('/gallery');

      // Verify user cookie exists in new tab
      const cookies = await newPage.context().cookies();
      const userCookie = cookies.find(cookie => cookie.name === 'user');
      expect(userCookie).toBeTruthy();

      // Clean up
      await newPage.close();
    });
  });
});
