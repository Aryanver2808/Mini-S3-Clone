const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: "File too large. Max size is 50MB" });
  }

  res.status(500).json({ error: "Internal server error" });
};

module.exports = errorHandler;