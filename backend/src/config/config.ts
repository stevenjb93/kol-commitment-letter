import dotenv from 'dotenv';

dotenv.config();

export default {
  port: process.env.PORT || 3001,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/signature-app',
  uploadDir: process.env.UPLOAD_DIR || 'uploads/',
}; 