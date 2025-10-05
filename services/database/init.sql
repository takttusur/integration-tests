-- Database initialization script
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data for testing
INSERT INTO users (username, email, password_hash, full_name) VALUES
    ('testuser1', 'test1@example.com', '$2b$10$DUMMY_HASH_1', 'Test User One'),
    ('testuser2', 'test2@example.com', '$2b$10$DUMMY_HASH_2', 'Test User Two'),
    ('admin', 'admin@example.com', '$2b$10$DUMMY_HASH_ADMIN', 'Admin User')
ON CONFLICT DO NOTHING;

INSERT INTO posts (title, content, author_id, published) VALUES
    ('Welcome Post', 'This is a welcome post for testing.', 1, true),
    ('Second Post', 'This is another test post.', 2, true),
    ('Draft Post', 'This is a draft post.', 1, false)
ON CONFLICT DO NOTHING;