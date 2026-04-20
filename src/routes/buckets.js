const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const auth = require('../middleware/auth');
const fs = require('fs');

// All routes require authentication
router.use(auth);

// POST / (create bucket)
router.post('/', (req, res) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Bucket name is required" });
  }

  const trimmedName = name.trim();

  if (!/^[a-zA-Z0-9-]+$/.test(trimmedName)) {
    return res.status(400).json({ error: "Bucket name must be alphanumeric with hyphens only" });
  }

  try {
    const id = uuidv4();
    const stmt = db.prepare('INSERT INTO buckets (id, name, owner_id) VALUES (?, ?, ?)');
    stmt.run(id, trimmedName, req.user.id);
    res.status(201).json({ message: "Bucket created", bucket: { id, name: trimmedName } });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: "Bucket name already exists" });
    }
    throw err;
  }
});

// GET / (list buckets)
router.get('/', (req, res) => {
  try {
    const stmt = db.prepare('SELECT id, name FROM buckets WHERE owner_id = ?');
    const buckets = stmt.all(req.user.id);
    res.json({ buckets });
  } catch (err) {
    throw err;
  }
});

// DELETE /:name (delete bucket)
router.delete('/:name', (req, res) => {
  const { name } = req.params;

  try {
    // Find bucket by name and owner_id
    const findStmt = db.prepare('SELECT id FROM buckets WHERE name = ? AND owner_id = ?');
    const bucket = findStmt.get(name, req.user.id);

    if (!bucket) {
      return res.status(404).json({ error: "Bucket not found" });
    }

    // Get all files in the bucket to delete physical files
    const filesStmt = db.prepare('SELECT path FROM files WHERE bucket_id = ?');
    const files = filesStmt.all(bucket.id);

    // Delete physical files
    files.forEach(file => {
      try {
        fs.unlinkSync(file.path);
      } catch (err) {
        console.error('Error deleting file:', file.path, err);
      }
    });

    // Delete all files records in the bucket
    const deleteFilesStmt = db.prepare('DELETE FROM files WHERE bucket_id = ?');
    deleteFilesStmt.run(bucket.id);

    // Delete the bucket
    const deleteBucketStmt = db.prepare('DELETE FROM buckets WHERE id = ?');
    deleteBucketStmt.run(bucket.id);

    res.json({ message: "Bucket deleted" });
  } catch (err) {
    throw err;
  }
});

module.exports = router;