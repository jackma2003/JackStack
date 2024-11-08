import { config } from 'dotenv';

// Load environment variables from .env file
config();

// Match your exact environment variable names
const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'NODE_ENV',
    'PORT',
    'FRONTEND_URL',
    'EMAIL_USER',
    'EMAIL_APP_PASSWORD'  // Note: changed from EMAIL_PASS to EMAIL_APP_PASSWORD to match your .env
];

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`Missing required environment variable: ${envVar}`);
        process.exit(1);
    }
}

// Export configuration values matching your environment variables
export const CONFIG = {
    mongoUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    nodeEnv: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    frontendUrl: process.env.FRONTEND_URL,
    emailUser: process.env.EMAIL_USER,
    emailPassword: process.env.EMAIL_APP_PASSWORD  // Match your environment variable name
};