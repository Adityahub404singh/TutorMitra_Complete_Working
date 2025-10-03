// src/config/config.ts
import path from 'path';
import { config } from 'dotenv';

// Load .env from root directory
const envPath = path.resolve(process.cwd(), '.env');
config({ path: envPath });

// Validate critical environment variables
const requiredVars = ['MONGO_URI', 'JWT_SECRET'];
requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`❌ Missing required environment variable: ${varName}`);
  }
});

// Export validated config
export default {
  mongoUri: process.env.MONGO_URI!,
  jwtSecret: process.env.JWT_SECRET!,
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development'
};