const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

require('dotenv').config();

// POST /register
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password || !username.trim() || !password.trim()) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const trimmedUsername = username.trim();
  const trimmedPassword = password.trim();

  try {
    const hashedPassword = await bcrypt.hash(trimmedPassword, 10);
    const id = uuidv4();
    const stmt = db.prepare('INSERT INTO users (id, username, password) VALUES (?, ?, ?)');
    stmt.run(id, trimmedUsername, hashedPassword);
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: "Username already taken" });
    }
    throw err;
  }
});

// POST /login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password || !username.trim() || !password.trim()) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const trimmedUsername = username.trim();
  const trimmedPassword = password.trim();

  try {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    const user = stmt.get(trimmedUsername);

    if (!user || !(await bcrypt.compare(trimmedPassword, user.password))) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, username: user.username });
  } catch (err) {
    throw err;
  }
});

module.exports = router;