# Mini S3 Clone

A lightweight S3-compatible file storage service built with Node.js and Express.

## Tech Stack

- Node.js
- Express.js
- SQLite (better-sqlite3)
- JWT (jsonwebtoken)
- Multer (file uploads)

## Features

- User authentication with JWT
- Bucket management (create, list, delete)
- File operations (upload, download, list, delete)
- File size limits (50MB)
- Secure file storage with UUID naming

## Folder Structure

```
src/
├── app.js         
├── db.js           
├── middleware/
│   ├── auth.js    
│   └── errorHandler.js 
└── routes/
    ├── auth.js     
    ├── buckets.js 
    └── files.js   
uploads/            
```

## Setup

1. Ensure Node.js is installed
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure your settings
4. Run the server: `npm start`

## API Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | /auth/register | No | Register a new user |
| POST | /auth/login | No | Login and get JWT token |
| POST | /buckets | Yes | Create a new bucket |
| GET | /buckets | Yes | List user's buckets |
| DELETE | /buckets/:name | Yes | Delete a bucket |
| POST | /buckets/:bucketName/files | Yes | Upload a file to bucket |
| GET | /buckets/:bucketName/files | Yes | List files in bucket |
| GET | /buckets/:bucketName/files/:filename | Yes | Download a file |
| DELETE | /buckets/:bucketName/files/:filename | Yes | Delete a file |
| GET | /health | No | Health check |

## Example Requests

### Register User
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}'
```

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}'
```

### Create Bucket
```bash
curl -X POST http://localhost:3000/buckets \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "my-bucket"}'
```

### Upload File
```bash
curl -X POST http://localhost:3000/buckets/my-bucket/files \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/your/file.txt"
```

### List Files
```bash
curl -X GET http://localhost:3000/buckets/my-bucket/files \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Download File
```bash
curl -X GET http://localhost:3000/buckets/my-bucket/files/uuid-filename.ext \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -o downloaded-file.txt
```

### Delete File
```bash
curl -X DELETE http://localhost:3000/buckets/my-bucket/files/uuid-filename.ext \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Design Decisions

### UUID for Filenames
Files are renamed to UUIDs to prevent naming conflicts, ensure uniqueness, and avoid security issues with user-provided filenames.

### SQLite Metadata + Disk Storage
SQLite stores file metadata for fast queries and relationships, while actual files are stored on disk for efficient large file handling.

### JWT Stateless Authentication
JWT provides stateless authentication, allowing horizontal scaling and eliminating server-side session storage needs.

## Future Improvements

- Pre-signed URLs for temporary access
- AWS S3 backend integration
- File versioning
- Storage quota management
- CDN integration
- File compression
- Batch operations

