import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../db.mjs";

const router = express.Router();

// Register new user 
router.post("/register", async(req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Check if user already exists 
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({
                message: "User with this email or username already exists"
            });
        }

        // Hash password 
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user 
        const user = new User({
            username, 
            email,
            hash: hashedPassword, 
            projects: []
        });

        await user.save();

        // Create JWT token
        const token = jwt.sign(
            { userId: user._id},
            process.env.JWT_SECRET || "your-secret-key",
            { expiresIn: "24h"}
        );

        res.status(201).json({
            message: "User created successfully",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    }
    catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({message: "Error creating user"});
    }
});

// Login user 
router.post("/login", async(req, res) => {
    try {
        const { email, password } = req.body;

        // Find user 
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Email is invalid" });
        }

        // Check password 
        const isMatch = await bcrypt.compare(password, user.hash);
        if (!isMatch) {
            return res.status(401).json({ message: "Wrong password"})
        }

        // Create token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || "your-secret-key",
            { expiresIn: "24h" }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    }
    catch {
        console.error("Login error:", error);
        res.status(500).json({ message: "Error logging in" });
    }
});

export default router;
