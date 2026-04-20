const Database = require('better-sqlite3');

const db = new Database('storage.db');

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS buckets (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    owner_id TEXT NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS files (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    bucket_id TEXT NOT NULL,
    size INTEGER,
    mime_type TEXT,
    path TEXT NOT NULL,
    FOREIGN KEY (bucket_id) REFERENCES buckets(id)
  );
`);

console.log('Database connected');

module.exports = db;