import "./config.mjs";
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import cors from 'cors';
import { createServer } from 'http';
import initializeSocket from './socket.mjs';

// Import routes 
import projectRoutes from './routes/projects.mjs';
import taskRoutes from './routes/tasks.mjs';
import userRoutes from './routes/user.mjs';
import friendRoutes from './routes/friends.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize express 
const app = express();

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO
const { io, connectedUsers } = initializeSocket(server);

// Make socket.io and connectedUsers available to routes
app.set('io', io);
app.set('connectedUsers', connectedUsers);

// Configure CORS for production with WebSocket support
const corsOptions = {
    origin: process.env.FRONTEND_URL,
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["set-cookie"]
};

// Middleware 
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/friends', friendRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something broke!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Serve React files in the dist directory 
app.use(express.static(path.join(__dirname, 'dist')));

// Send the React app for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});  

// Connect to MongoDB with better error handling
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB Atlas');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

// Start server with async DB connection
const startServer = async () => {
    await connectDB();
    
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, '0.0.0.0', () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
        console.log(`Node environment: ${process.env.NODE_ENV}`);
        console.log('WebSocket server is running');
    });
};

startServer().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});

// Graceful shutdown
const shutdown = async () => {
    console.log('Shutting down gracefully...');
    
    // Close Socket.IO connections
    io.close(() => {
        console.log('Socket.IO server closed');
    });
    
    // Close HTTP server
    server.close(() => {
        console.log('HTTP server closed');
        
        // Close MongoDB connection
        mongoose.connection.close(false, () => {
            console.log('MongoDB connection closed');
            process.exit(0);
        });
    });

    // Force close after 10s
    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default app;