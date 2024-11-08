import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from "./db.mjs";

// Load .env variables
dotenv.config();

// Import routes 
import projectRoutes from './routes/projects.mjs';
import taskRoutes from './routes/tasks.mjs';
import userRoutes from './routes/user.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize express 
const app = express();

// Middleware 
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve React files in the src directory 
app.use(express.static(path.join(__dirname, 'src')));

// API routes 
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

// Send the React app for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'index.html'));
});  

// Connect to MongoDB
try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/jackstack', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    console.log('Connected to MongoDB Atlas');
} catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
};

connectDB();

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something broke!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;