const { test, expect } = require('@playwright/test');

test.describe('End-to-End Integration Tests', () => {
  test('complete user journey: view data and create post', async ({ page, request }) => {
    // Step 1: Verify backend is healthy
    const healthResponse = await request.get('http://localhost:3001/health');
    expect(healthResponse.ok()).toBeTruthy();

    // Step 2: Load frontend
    await page.goto('/');
    await expect(page.getByTestId('app-title')).toBeVisible({ timeout: 10000 });

    // Step 3: Verify data loads from backend
    await expect(page.getByTestId('users-list')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('posts-list')).toBeVisible();

    // Step 4: Verify initial data integrity
    const usersResponse = await request.get('http://localhost:3001/api/users');
    const usersData = await usersResponse.json();
    const frontendUsersCount = await page.getByTestId('users-list').locator('.user-card').count();
    
    expect(frontendUsersCount).toBe(usersData.data.length);

    // Step 5: Create a new post through UI
    const timestamp = Date.now();
    const testTitle = `E2E Integration Test ${timestamp}`;
    const testContent = 'This post tests the complete integration between frontend, backend, and database.';

    await page.getByTestId('post-title-input').fill(testTitle);
    await page.getByTestId('post-content-input').fill(testContent);

    // Step 6: Submit and verify success
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Post created successfully!');
      await dialog.accept();
    });

    await page.getByTestId('create-post-button').click();
    await page.waitForTimeout(2000);

    // Step 7: Verify the post appears in the UI
    await expect(page.getByTestId('posts-list')).toContainText(testTitle);

    // Step 8: Verify the post was actually saved to the database
    const postsResponse = await request.get('http://localhost:3001/api/posts');
    const postsData = await postsResponse.json();
    
    const createdPost = postsData.data.find(post => post.title === testTitle);
    expect(createdPost).toBeDefined();
    expect(createdPost.content).toBe(testContent);
    expect(createdPost.published).toBe(true);
  });

  test('data consistency across multiple requests', async ({ page, request }) => {
    // Load the page
    await page.goto('/');
    await expect(page.getByTestId('posts-list')).toBeVisible({ timeout: 10000 });

    // Get posts count from UI
    const uiPostsCount = await page.getByTestId('posts-list').locator('.post-card').count();

    // Get posts count from API
    const apiResponse = await request.get('http://localhost:3001/api/posts');
    const apiData = await apiResponse.json();
    const apiPostsCount = apiData.data.length;

    // They should match
    expect(uiPostsCount).toBe(apiPostsCount);

    // Verify that each post in the API response appears in the UI
    for (const post of apiData.data) {
      await expect(page.getByTestId('posts-list')).toContainText(post.title);
    }
  });

  test('error handling when services are under load', async ({ page, request }) => {
    // Simulate multiple concurrent requests
    const requests = Array.from({ length: 5 }, () => 
      request.get('http://localhost:3001/api/posts')
    );

    const responses = await Promise.all(requests);
    
    // All requests should succeed
    responses.forEach(response => {
      expect(response.ok()).toBeTruthy();
    });

    // Frontend should still work normally
    await page.goto('/');
    await expect(page.getByTestId('app-title')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('posts-list')).toBeVisible();
  });

  test('cross-browser compatibility check', async ({ page, browserName }) => {
    await page.goto('/');
    
    // Basic functionality should work across all browsers
    await expect(page.getByTestId('app-title')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('create-post-form')).toBeVisible();
    await expect(page.getByTestId('users-list')).toBeVisible();
    await expect(page.getByTestId('posts-list')).toBeVisible();

    // Form interaction should work
    await page.getByTestId('post-title-input').fill(`Browser test for ${browserName}`);
    await expect(page.getByTestId('post-title-input')).toHaveValue(`Browser test for ${browserName}`);

    console.log(`✅ Basic functionality verified on ${browserName}`);
  });

  test('performance and timing checks', async ({ page, request }) => {
    // Measure API response time
    const apiStart = Date.now();
    const apiResponse = await request.get('http://localhost:3001/api/posts');
    const apiTime = Date.now() - apiStart;
    
    expect(apiResponse.ok()).toBeTruthy();
    expect(apiTime).toBeLessThan(5000); // API should respond within 5 seconds

    // Measure page load time
    const pageStart = Date.now();
    await page.goto('/');
    await expect(page.getByTestId('app-title')).toBeVisible({ timeout: 10000 });
    const pageTime = Date.now() - pageStart;
    
    expect(pageTime).toBeLessThan(10000); // Page should load within 10 seconds

    console.log(`API response time: ${apiTime}ms, Page load time: ${pageTime}ms`);
  });
});

test.describe('Database State Management', () => {
  test('verify database seeded data is accessible', async ({ request }) => {
    // Check that seed users exist
    const usersResponse = await request.get('http://localhost:3001/api/users');
    const usersData = await usersResponse.json();
    
    expect(usersData.success).toBe(true);
    expect(usersData.data.length).toBeGreaterThanOrEqual(3); // We seeded 3 users

    // Verify specific seed users
    const usernames = usersData.data.map(user => user.username);
    expect(usernames).toContain('testuser1');
    expect(usernames).toContain('testuser2');
    expect(usernames).toContain('admin');

    // Check that seed posts exist
    const postsResponse = await request.get('http://localhost:3001/api/posts');
    const postsData = await postsResponse.json();
    
    expect(postsData.success).toBe(true);
    expect(postsData.data.length).toBeGreaterThanOrEqual(2); // We seeded 2 published posts

    // Verify specific seed posts
    const postTitles = postsData.data.map(post => post.title);
    expect(postTitles).toContain('Welcome Post');
    expect(postTitles).toContain('Second Post');
  });

  test('data persistence across multiple operations', async ({ request }) => {
    // Create a post
    const newPost = {
      title: 'Persistence Test Post',
      content: 'Testing data persistence',
      author_id: 1,
      published: true
    };

    const createResponse = await request.post('http://localhost:3001/api/posts', {
      data: newPost
    });
    
    expect(createResponse.ok()).toBeTruthy();
    const createdPost = await createResponse.json();

    // Retrieve the post to verify it was saved
    const getResponse = await request.get(`http://localhost:3001/api/posts/${createdPost.data.id}`);
    expect(getResponse.ok()).toBeTruthy();
    
    const retrievedPost = await getResponse.json();
    expect(retrievedPost.data.title).toBe(newPost.title);
    expect(retrievedPost.data.content).toBe(newPost.content);

    // Verify it appears in the posts list
    const listResponse = await request.get('http://localhost:3001/api/posts');
    const listData = await listResponse.json();
    
    const foundPost = listData.data.find(post => post.id === createdPost.data.id);
    expect(foundPost).toBeDefined();
    expect(foundPost.title).toBe(newPost.title);
  });
});