const express = require('express');
const router = express.Router({ mergeParams: true });
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const auth = require('../middleware/auth');

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads', { recursive: true });
}

// Setup multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = uuidv4() + ext;
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// All routes require authentication
router.use(auth);

// Helper function
const getBucket = (bucketName, userId) => {
  const stmt = db.prepare('SELECT * FROM buckets WHERE name = ? AND owner_id = ?');
  return stmt.get(bucketName, userId);
};

// POST / (upload file)
router.post('/', upload.single('file'), (req, res) => {
  try {
    const bucket = getBucket(req.params.bucketName, req.user.id);
    if (!bucket) {
      return res.status(404).json({ error: "Bucket not found" });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const id = uuidv4();
    const stmt = db.prepare('INSERT INTO files (id, filename, original_name, bucket_id, size, mime_type, path) VALUES (?, ?, ?, ?, ?, ?, ?)');
    stmt.run(id, file.filename, file.originalname, bucket.id, file.size, file.mimetype, file.path);

    res.status(201).json({
      message: "File uploaded",
      file: {
        filename: file.filename,
        original_name: file.originalname,
        size: file.size,
        mime_type: file.mimetype
      }
    });
  } catch (err) {
    throw err;
  }
});

// GET / (list files)
router.get('/', (req, res) => {
  try {
    const bucket = getBucket(req.params.bucketName, req.user.id);
    if (!bucket) {
      return res.status(404).json({ error: "Bucket not found" });
    }

    const stmt = db.prepare('SELECT id, filename, original_name, size, mime_type FROM files WHERE bucket_id = ?');
    const files = stmt.all(bucket.id);
    res.json({ files });
  } catch (err) {
    throw err;
  }
});

// GET /:filename (download file)
router.get('/:filename', (req, res) => {
  try {
    const bucket = getBucket(req.params.bucketName, req.user.id);
    if (!bucket) {
      return res.status(404).json({ error: "Bucket not found" });
    }

    const stmt = db.prepare('SELECT * FROM files WHERE filename = ? AND bucket_id = ?');
    const file = stmt.get(req.params.filename, bucket.id);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    res.download(file.path, file.original_name);
  } catch (err) {
    throw err;
  }
});

// DELETE /:filename (delete file)
router.delete('/:filename', (req, res) => {
  try {
    const bucket = getBucket(req.params.bucketName, req.user.id);
    if (!bucket) {
      return res.status(404).json({ error: "Bucket not found" });
    }

    const stmt = db.prepare('SELECT * FROM files WHERE filename = ? AND bucket_id = ?');
    const file = stmt.get(req.params.filename, bucket.id);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    fs.unlinkSync(file.path);
    const deleteStmt = db.prepare('DELETE FROM files WHERE id = ?');
    deleteStmt.run(file.id);

    res.json({ message: "File deleted" });
  } catch (err) {
    throw err;
  }
});

module.exports = router;