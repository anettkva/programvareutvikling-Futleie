import { test, expect } from '@playwright/test';

// Helper function to generate unique ad names
function generateUniqueName(prefix: string): string {
  const randomString = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${randomString}`;
}

test.describe('Ad Creation - Image Upload', () => {
  // Helper function to login before each test
  async function loginUser(page) {
    await page.goto('/login');
    await page.getByLabel('Brukernavn').fill('testuser');
    await page.getByLabel('Passord').fill('testpass');
    await page.getByRole('button', { name: 'Logg inn' }).click();
    await page.waitForURL('/gallery');
  }

  test.beforeEach(async ({ page }) => {
    // Login and navigate to create ad page
    await loginUser(page);
    await page.goto('/create-ad');
    await expect(page).toHaveURL('/create-ad');
  });

  test('creates ad with single image upload', async ({ page }) => {
    // Fill in the required fields
    const uniqueName = generateUniqueName('Test Item');
    await page.getByLabel('Title').fill(uniqueName);
    await page.getByLabel('Description').fill('This is a test item description');

    // Upload a single image
    await page.setInputFiles('input[type="file"]', {
      name: 'test-image.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image-content')
    });

    // Submit the form
    await page.getByRole('button', { name: 'Upload Ad' }).click();

    // Should be redirected to home page after successful submission
    await page.waitForURL('/');

    // Find and click the created ad
    await page.getByText(uniqueName).click();

    // Click the delete button
    await page.getByRole('button', { name: 'Slett annonse' }).click();

    // Verify we're back at the home page
    await page.waitForURL('/');
  });

  test('creates ad with multiple image upload', async ({ page }) => {
    // Fill in the required fields
    const uniqueMultiName = generateUniqueName('Multi-Image Item');
    await page.getByLabel('Title').fill(uniqueMultiName);
    await page.getByLabel('Description').fill('Item with multiple images');

    // Create multiple test files
    const testFiles = [
      {
        name: 'image1.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake-image-1')
      },
      {
        name: 'image2.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake-image-2')
      }
    ];

    // Upload multiple images
    await page.setInputFiles('input[type="file"]', testFiles);

    // Submit the form
    await page.getByRole('button', { name: 'Upload Ad' }).click();

    // Should be redirected to home page after successful submission
    await page.waitForURL('/');

    // Find and click the created ad
    await page.getByText('Multi-Image Item').click();

    // Click the delete button
    await page.getByRole('button', { name: 'Slett annonse' }).click();

    // Verify we're back at the home page
    await page.waitForURL('/');
  });

  test('validates required fields', async ({ page }) => {
    // Try to submit without filling required fields
    await page.getByRole('button', { name: 'Upload Ad' }).click();

    // Check for validation messages
    const titleError = page.getByText('Title is required');
    const descriptionError = page.getByText('Description is required');
    
    await expect(titleError).toBeVisible();
    await expect(descriptionError).toBeVisible();
  });

  test('validates image file type', async ({ page }) => {
    // Fill in the required fields
    await page.getByLabel('Title').fill('Test Item');
    await page.getByLabel('Description').fill('This is a test item');

    // Try to upload an invalid file type
    await page.setInputFiles('input[type="file"]', {
      name: 'invalid.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('not-an-image')
    });

    // Submit the form
    await page.getByRole('button', { name: 'Upload Ad' }).click();

    // Should not be redirected due to invalid file
    await expect(page).toHaveURL('/create-ad');
  });
});

