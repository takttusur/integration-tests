const { test, expect } = require('@playwright/test');

test.describe('API Health Checks', () => {
  test('backend health check should return healthy status', async ({ request }) => {
    const response = await request.get('http://localhost:3001/health');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.status).toBe('healthy');
    expect(data.service).toBe('backend-api');
    expect(data.timestamp).toBeDefined();
  });

  test('backend users endpoint should return user data', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/users');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.count).toBeGreaterThan(0);
    
    // Check user structure
    const firstUser = data.data[0];
    expect(firstUser).toHaveProperty('id');
    expect(firstUser).toHaveProperty('username');
    expect(firstUser).toHaveProperty('email');
    expect(firstUser).toHaveProperty('full_name');
    expect(firstUser).toHaveProperty('created_at');
  });

  test('backend posts endpoint should return post data', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/posts');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.count).toBeGreaterThan(0);
    
    // Check post structure
    const firstPost = data.data[0];
    expect(firstPost).toHaveProperty('id');
    expect(firstPost).toHaveProperty('title');
    expect(firstPost).toHaveProperty('content');
    expect(firstPost).toHaveProperty('author_name');
    expect(firstPost).toHaveProperty('created_at');
    expect(firstPost.published).toBe(true);
  });

  test('backend should handle 404 for unknown endpoints', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/nonexistent');
    expect(response.status()).toBe(404);
    
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe('Endpoint not found');
  });
});

test.describe('Database Integration', () => {
  test('should create a new post via API', async ({ request }) => {
    const newPost = {
      title: 'Test Post from Playwright',
      content: 'This is a test post created during integration testing.',
      author_id: 1,
      published: true
    };

    const response = await request.post('http://localhost:3001/api/posts', {
      data: newPost
    });
    
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.title).toBe(newPost.title);
    expect(data.data.content).toBe(newPost.content);
    expect(data.data.author_id).toBe(newPost.author_id);
    expect(data.data.published).toBe(newPost.published);
    expect(data.data.id).toBeDefined();
  });

  test('should get specific user by ID', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/users/1');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.id).toBe(1);
    expect(data.data.username).toBeDefined();
    expect(data.data.email).toBeDefined();
  });

  test('should return 404 for non-existent user', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/users/999999');
    expect(response.status()).toBe(404);
    
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe('User not found');
  });
});