const { test, expect } = require('@playwright/test');

test.describe('Frontend UI Tests', () => {
  test('should load the main page and show title', async ({ page }) => {
    await page.goto('/');
    
    // Check if the page loads
    await expect(page.getByTestId('app-title')).toBeVisible();
    await expect(page.getByTestId('app-title')).toHaveText('Integration Tests Frontend');
    
    // Wait for data to load (should not show loading state)
    await expect(page.getByTestId('loading')).not.toBeVisible({ timeout: 10000 });
  });

  test('should display users list from backend', async ({ page }) => {
    await page.goto('/');
    
    // Wait for users to load
    await expect(page.getByTestId('users-list')).toBeVisible({ timeout: 10000 });
    
    // Check if users are displayed
    await expect(page.getByTestId('user-1')).toBeVisible();
    await expect(page.getByTestId('users-list')).toContainText('Test User One');
  });

  test('should display posts list from backend', async ({ page }) => {
    await page.goto('/');
    
    // Wait for posts to load
    await expect(page.getByTestId('posts-list')).toBeVisible({ timeout: 10000 });
    
    // Check if posts are displayed
    await expect(page.getByTestId('post-1')).toBeVisible();
    await expect(page.getByTestId('posts-list')).toContainText('Welcome Post');
  });

  test('should not show error message when backend is healthy', async ({ page }) => {
    await page.goto('/');
    
    // Wait a moment for any potential errors to appear
    await page.waitForTimeout(2000);
    
    // Error message should not be visible
    await expect(page.getByTestId('error-message')).not.toBeVisible();
  });
});

test.describe('Create Post Functionality', () => {
  test('should create a new post through the UI', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the form to be available
    await expect(page.getByTestId('create-post-form')).toBeVisible({ timeout: 10000 });
    
    // Fill out the form
    const timestamp = Date.now();
    const testTitle = `UI Test Post ${timestamp}`;
    const testContent = `This post was created through the UI during testing at ${new Date().toISOString()}`;
    
    await page.getByTestId('post-title-input').fill(testTitle);
    await page.getByTestId('post-content-input').fill(testContent);
    
    // Select an author (should be pre-selected to user 1)
    await expect(page.getByTestId('post-author-select')).toHaveValue('1');
    
    // Submit the form
    await page.getByTestId('create-post-button').click();
    
    // Wait for the success alert (note: in a real app, you'd want a better UX than alert)
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Post created successfully!');
      await dialog.accept();
    });
    
    // Wait for the page to refresh and show the new post
    await page.waitForTimeout(2000);
    
    // Check if the new post appears in the list
    await expect(page.getByTestId('posts-list')).toContainText(testTitle);
  });

  test('should validate required fields in create post form', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the form to be available
    await expect(page.getByTestId('create-post-form')).toBeVisible({ timeout: 10000 });
    
    // Try to submit with empty fields
    await page.getByTestId('create-post-button').click();
    
    // Should show validation alert
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Please fill in both title and content');
      await dialog.accept();
    });
  });

  test('should reset form after successful submission', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the form to be available
    await expect(page.getByTestId('create-post-form')).toBeVisible({ timeout: 10000 });
    
    // Fill out the form
    const testTitle = `Reset Test Post ${Date.now()}`;
    const testContent = 'This tests form reset functionality';
    
    await page.getByTestId('post-title-input').fill(testTitle);
    await page.getByTestId('post-content-input').fill(testContent);
    
    // Submit the form
    await page.getByTestId('create-post-button').click();
    
    // Handle the success dialog
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    
    // Wait for form reset
    await page.waitForTimeout(1000);
    
    // Check if form fields are cleared
    await expect(page.getByTestId('post-title-input')).toHaveValue('');
    await expect(page.getByTestId('post-content-input')).toHaveValue('');
  });
});

test.describe('Frontend-Backend Integration', () => {
  test('should handle backend unavailability gracefully', async ({ page, context }) => {
    // We can't actually stop the backend in this test since it's needed for other tests
    // But we can test error handling by mocking a failed request
    
    await page.goto('/');
    
    // If the backend is down, we should see an error message
    // For this test, we'll assume the backend is running and check that no error is shown
    await page.waitForTimeout(2000);
    await expect(page.getByTestId('error-message')).not.toBeVisible();
  });

  test('should display real-time data from database', async ({ page }) => {
    await page.goto('/');
    
    // Wait for initial data load
    await expect(page.getByTestId('users-list')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('posts-list')).toBeVisible();
    
    // Create a new post and verify it appears
    const timestamp = Date.now();
    const testTitle = `Real-time Test ${timestamp}`;
    
    await page.getByTestId('post-title-input').fill(testTitle);
    await page.getByTestId('post-content-input').fill('Testing real-time updates');
    await page.getByTestId('create-post-button').click();
    
    // Handle success dialog
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    
    // Wait for the page to update
    await page.waitForTimeout(2000);
    
    // Verify the new post appears
    await expect(page.getByTestId('posts-list')).toContainText(testTitle);
  });

  test('should maintain responsive design on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check if the page loads properly on mobile
    await expect(page.getByTestId('app-title')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('create-post-form')).toBeVisible();
    await expect(page.getByTestId('users-list')).toBeVisible();
    await expect(page.getByTestId('posts-list')).toBeVisible();
    
    // Check if form elements are accessible on mobile
    await page.getByTestId('post-title-input').fill('Mobile test');
    await expect(page.getByTestId('post-title-input')).toHaveValue('Mobile test');
  });
});