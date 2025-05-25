-- Create a table for users (Telegram users)
CREATE TABLE users (
  id BIGINT PRIMARY KEY,
  name TEXT
);

-- Create a table for children
CREATE TABLE children (
  id SERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  name TEXT NOT NULL
);

-- Create a table for records with a reference to children
CREATE TABLE records (
  id SERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  child_id INTEGER REFERENCES children(id),
  timestamp BIGINT NOT NULL,
  temperature REAL NOT NULL,
  medication TEXT NOT NULL,
  dosage REAL NOT NULL
);