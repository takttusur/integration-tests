const { test, expect } = require('@playwright/test');

test.describe('Integration Verification (No Browser)', () => {
  test('verify all services are healthy and working together', async ({ request }) => {
    // Test backend health
    const healthResponse = await request.get('http://localhost:3001/health');
    expect(healthResponse.ok()).toBeTruthy();
    
    const healthData = await healthResponse.json();
    expect(healthData.status).toBe('healthy');
    expect(healthData.service).toBe('backend-api');

    // Test database connection via API
    const usersResponse = await request.get('http://localhost:3001/api/users');
    expect(usersResponse.ok()).toBeTruthy();
    
    const usersData = await usersResponse.json();
    expect(usersData.success).toBe(true);
    expect(usersData.count).toBeGreaterThan(0);
    
    // Verify seed data is present
    const usernames = usersData.data.map(user => user.username);
    expect(usernames).toContain('testuser1');
    expect(usernames).toContain('testuser2');
    expect(usernames).toContain('admin');

    // Test posts endpoint
    const postsResponse = await request.get('http://localhost:3001/api/posts');
    expect(postsResponse.ok()).toBeTruthy();
    
    const postsData = await postsResponse.json();
    expect(postsData.success).toBe(true);
    expect(postsData.count).toBeGreaterThan(0);
    
    // Verify seed posts are present
    const postTitles = postsData.data.map(post => post.title);
    expect(postTitles).toContain('Welcome Post');
    expect(postTitles).toContain('Second Post');

    // Test frontend is serving content
    const frontendResponse = await request.get('http://localhost:3000');
    expect(frontendResponse.ok()).toBeTruthy();
    
    const frontendText = await frontendResponse.text();
    expect(frontendText).toContain('Integration Tests Frontend');
    expect(frontendText).toContain('<div id="root">');

    // Test creating a new post
    const newPost = {
      title: 'API Integration Test Post',
      content: 'This post was created during integration testing.',
      author_id: 1,
      published: true
    };

    const createResponse = await request.post('http://localhost:3001/api/posts', {
      data: newPost
    });
    
    expect(createResponse.ok()).toBeTruthy();
    
    const createdPostData = await createResponse.json();
    expect(createdPostData.success).toBe(true);
    expect(createdPostData.data.title).toBe(newPost.title);
    expect(createdPostData.data.content).toBe(newPost.content);

    // Verify the new post appears in the list
    const updatedPostsResponse = await request.get('http://localhost:3001/api/posts');
    const updatedPostsData = await updatedPostsResponse.json();
    
    const createdPost = updatedPostsData.data.find(post => post.title === newPost.title);
    expect(createdPost).toBeDefined();
    expect(createdPost.content).toBe(newPost.content);

    console.log('✅ All integration tests passed!');
    console.log(`📊 Found ${usersData.count} users and ${updatedPostsData.count} posts in the system`);
  });

  test('verify error handling works correctly', async ({ request }) => {
    // Test 404 for non-existent user
    const userResponse = await request.get('http://localhost:3001/api/users/999999');
    expect(userResponse.status()).toBe(404);
    
    const userData = await userResponse.json();
    expect(userData.success).toBe(false);
    expect(userData.error).toBe('User not found');

    // Test 404 for non-existent post
    const postResponse = await request.get('http://localhost:3001/api/posts/999999');
    expect(postResponse.status()).toBe(404);
    
    const postData = await postResponse.json();
    expect(postData.success).toBe(false);
    expect(postData.error).toBe('Post not found');

    // Test 404 for non-existent endpoint
    const notFoundResponse = await request.get('http://localhost:3001/api/nonexistent');
    expect(notFoundResponse.status()).toBe(404);
    
    const notFoundData = await notFoundResponse.json();
    expect(notFoundData.success).toBe(false);
    expect(notFoundData.error).toBe('Endpoint not found');

    // Test validation for creating post without required fields
    const invalidPostResponse = await request.post('http://localhost:3001/api/posts', {
      data: { title: 'Missing content' }
    });
    
    expect(invalidPostResponse.status()).toBe(400);
    
    const invalidPostData = await invalidPostResponse.json();
    expect(invalidPostData.success).toBe(false);
    expect(invalidPostData.error).toContain('required');
  });

  test('verify performance and response times', async ({ request }) => {
    // Test API response times
    const testEndpoints = [
      'http://localhost:3001/health',
      'http://localhost:3001/api/users',
      'http://localhost:3001/api/posts'
    ];

    for (const endpoint of testEndpoints) {
      const startTime = Date.now();
      const response = await request.get(endpoint);
      const responseTime = Date.now() - startTime;
      
      expect(response.ok()).toBeTruthy();
      expect(responseTime).toBeLessThan(5000); // Should respond within 5 seconds
      
      console.log(`📈 ${endpoint}: ${responseTime}ms`);
    }

    // Test frontend response time
    const frontendStartTime = Date.now();
    const frontendResponse = await request.get('http://localhost:3000');
    const frontendResponseTime = Date.now() - frontendStartTime;
    
    expect(frontendResponse.ok()).toBeTruthy();
    expect(frontendResponseTime).toBeLessThan(5000);
    
    console.log(`📈 Frontend: ${frontendResponseTime}ms`);
  });
});