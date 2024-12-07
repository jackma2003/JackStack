import express from "express";
import jwt from "jsonwebtoken";
import { User, FriendRequest } from "../db.mjs";

const router = express.Router();

// Middleware to verify JWT token 
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Authentication required "});
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
        req.user = user;
        next();
    }
    catch (err) {
        return res.status(403).json({ message: "Invalid token "});
    }
};

// Send friend request 
router.post("/request", authenticateToken, async (req, res) => {
    try {
        const {receiverId} = req.body;
        const senderId = req.user.userId;

        // Create new friend request 
        const friendRequest = new FriendRequest({
            sender: senderId, 
            receiver: receiverId,
            status: "pending"
        });
        await friendRequest.save();

        // Add to receiver's friend requests
        const updatedUser = await User.findByIdAndUpdate(
            receiverId,
            { $push: { FriendRequests: friendRequest._id } },
            { new: true }  // Return the updated document
        );

        console.log('Updated user:', updatedUser); // Add this log
        console.log('Friend request added:', friendRequest); // Add this log

        res.status(201).json({ message: "Friend request sent successfully" });
    }
    catch (err) {
        console.error('Error in friend request:', err);
        res.status(500).json({ message: "Error sending friend request" });
    }
});

// Accept/Reject friend request 
router.patch("/request/:requestId", authenticateToken, async (req, res) => {
    try {
        const { requestId } = req.params;
        const { status } = req.body;
        const userId = req.user.userId; 

        const friendRequest = await FriendRequest.findById(requestId);
        if (!friendRequest) {
            return res.status(404).json({ message: "Request not found" });
        }

        friendRequest.status = status;
        await friendRequest.save();

        if (status === "accepted") {
            // Add each user to the other's friends list and remove request
            await User.findByIdAndUpdate(friendRequest.sender, {
                $push: { friends: friendRequest.receiver },
                $pull: { FriendRequests: requestId }
            });
            
            await User.findByIdAndUpdate(friendRequest.receiver, {
                $push: { friends: friendRequest.sender },
                $pull: { FriendRequests: requestId }
            });
        }

        res.json({ message: `Friend request ${status}` });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error processing friend request" });
    }
});

// Remove friend requests 
router.post("/request/:requestId/remove", authenticateToken, async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId = req.user.userId;

        await User.findByIdAndUpdate(userId, {
            $pull: { FriendRequests: requestId }
        });

        res.json({ message: "Request removed" });
    } 
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error removing request" });
    }
});

// Get friend request 
router.get("/requests", authenticateToken, async (req, res) => {
    try {
        console.log('Fetching requests for user:', req.user.userId);
        const user = await User.findById(req.user.userId)
            .populate({
                path: "FriendRequests",  // Make sure this matches your schema exactly
                populate: {
                    path: "sender",
                    select: "username avatar"
                }
            });
        
        console.log('Found user:', user);
        console.log('Friend requests:', user.FriendRequests);

        // Only return pending requests
        const pendingRequests = user.FriendRequests.filter(req => req.status === 'pending');
        res.json(pendingRequests);
    }
    catch (err) {
        console.error('Error in requests route:', err);
        res.status(500).json({ message: "Error fetching friend requests" });
    }
});

// Get friends list 
router.get("/friends", authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .populate("friends", "username avatar");
        res.json(user.friends);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching friends list "});
    }
})

// Remove friend
router.delete("/:friendId", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { friendId } = req.params;

        // Remove friend from both users' friend array 
        await User.findByIdAndUpdate(userId, {
            $pull: { friends: friendId }
        });
        await User.findByIdAndUpdate(friendId, {
            $pull: { friends: userId }
        });

        res.json({ message: "Friend removed successfully" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to remove friend" });
    }
});

export default router;