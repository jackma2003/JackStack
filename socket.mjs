import { Server } from "socket.io";
import jwt from "jsonwebtoken";

const initializeSocket = (server) => {
    const io = new Server(server, {
            cors: {
                origin: process.env.FRONTEND_URL,
                credentials: true
            }
        });

    // Socket authentication middleware 
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error("Authentication required"));
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded.userId;
            next();
        }
        catch (err) {
            next(new Error("Invalid token"));
        }
    });

    // Store connected users 
    const connectedUsers = new Map();

    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.userId}`);
        connectedUsers.set(socket.userId, socket);

        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.userId}`);
            connectedUsers.delete(socket.userId);
        });
    });

    return { io, connectedUsers };
};

export default initializeSocket;