import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function App() {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    author_id: 1
  });
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [usersResponse, postsResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/users`),
        axios.get(`${API_BASE_URL}/api/posts`)
      ]);

      if (usersResponse.data.success) {
        setUsers(usersResponse.data.data);
      }
      
      if (postsResponse.data.success) {
        setPosts(postsResponse.data.data);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data from the API. Please check if the backend service is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPost(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    
    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert('Please fill in both title and content');
      return;
    }

    try {
      setCreateLoading(true);
      
      const response = await axios.post(`${API_BASE_URL}/api/posts`, {
        ...newPost,
        published: true
      });

      if (response.data.success) {
        setNewPost({ title: '', content: '', author_id: 1 });
        // Refresh posts list
        await fetchData();
        alert('Post created successfully!');
      }
    } catch (err) {
      console.error('Error creating post:', err);
      alert('Failed to create post. Please try again.');
    } finally {
      setCreateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading" data-testid="loading">
          Loading data from backend services...
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1 data-testid="app-title">Integration Tests Frontend</h1>
        <p>Testing frontend and backend integration</p>
      </div>

      {error && (
        <div className="error" data-testid="error-message">
          {error}
        </div>
      )}

      <div className="create-post">
        <h2 className="section-title">Create New Post</h2>
        <form onSubmit={handleCreatePost} data-testid="create-post-form">
          <div className="form-group">
            <label htmlFor="title">Title:</label>
            <input
              type="text"
              id="title"
              name="title"
              value={newPost.title}
              onChange={handleInputChange}
              placeholder="Enter post title"
              data-testid="post-title-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="content">Content:</label>
            <textarea
              id="content"
              name="content"
              value={newPost.content}
              onChange={handleInputChange}
              placeholder="Enter post content"
              data-testid="post-content-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="author_id">Author:</label>
            <select
              id="author_id"
              name="author_id"
              value={newPost.author_id}
              onChange={handleInputChange}
              data-testid="post-author-select"
            >
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.full_name} ({user.username})
                </option>
              ))}
            </select>
          </div>
          
          <button 
            type="submit" 
            className="btn" 
            disabled={createLoading}
            data-testid="create-post-button"
          >
            {createLoading ? 'Creating...' : 'Create Post'}
          </button>
        </form>
      </div>

      <div className="users-list">
        <h2 className="section-title">Users</h2>
        {users.length === 0 ? (
          <p data-testid="no-users">No users found</p>
        ) : (
          <div data-testid="users-list">
            {users.map(user => (
              <div key={user.id} className="user-card" data-testid={`user-${user.id}`}>
                <h3>{user.full_name}</h3>
                <p><strong>Username:</strong> {user.username}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Joined:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="posts-list">
        <h2 className="section-title">Posts</h2>
        {posts.length === 0 ? (
          <p data-testid="no-posts">No posts found</p>
        ) : (
          <div data-testid="posts-list">
            {posts.map(post => (
              <div key={post.id} className="post-card" data-testid={`post-${post.id}`}>
                <div className="post-title">{post.title}</div>
                <div className="post-meta">
                  By {post.author_name} ({post.username}) on {new Date(post.created_at).toLocaleDateString()}
                </div>
                <div className="post-content">{post.content}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;