require('dotenv').config();

const express = require('express');
const fs = require('fs');

const app = express();

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads', { recursive: true });
}

app.use(express.json());

const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

const bucketRoutes = require('./routes/buckets');
app.use('/buckets', bucketRoutes);

const fileRoutes = require('./routes/files');
app.use('/buckets/:bucketName/files', fileRoutes);

app.get('/health', (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});