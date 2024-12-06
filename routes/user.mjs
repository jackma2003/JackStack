import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from "nodemailer";
import crypto from "crypto";
import { User } from '../db.mjs';

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

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });

        if (existingUser) {
            return res.status(400).json({ 
                message: 'User with this email or username already exists' 
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

        // Create token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ message: 'Error creating user' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password, rememberMe } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'No account found with this email' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

        // Create token, expiration is longer is rememberMe is set to true
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: rememberMe ? "30d" : "24h" }
        );

        // If remember me is checked, create a persistent token 
        if (rememberMe) {
            const rememberMeToken = crypto.randomBytes(32).toString("hex");
            user.rememberMeToken = rememberMeToken;
            await user.save();
        }

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Error logging in' });
    }
});

// Request password reset 
router.post("/forgot-password", async(req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "No account found with this email "});
        }

        // Generate reset token 
        const resetToken = crypto.randomBytes(32).toString("hex");
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour 
        await user.save();

        // Create nodemailer transport 
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Email content 
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Password Reset Request",
            html: `
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
                    <p>You requested a password reset. Click the link below to reset your password:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" 
                            style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                            Reset Password
                        </a>
                    </div>
                    <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
                    <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
                </div>
        `
        };
        // send email 
        await transporter.sendMail(mailOptions);
        res.json({ 
            message: 'Password reset email sent',
            info: 'If an account exists with this email, you will receive password reset instructions.'
        });
    }
    catch (err) {
        console.error("Forgot password error:", err);
        res.status(500).json({ message: "Error processing password reset request "});
    }
});

// Reset password with token 
router.post("/reset-password/:token", async (req, res) => {
    try {
        const { password } = req.body;
        const { token } = req.params;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            res.status(400).json({ message: "Password reset token is invalid or has expired "});
        }

        // Hash new password 
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update user password and clear reset token 
        user.hash = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: "Password has been reset" });
    }
    catch (err) {
        console.error("Reset password error:", err);
        res.status(500).json({ message: "Error resetting password" });
    }
});

// update user profile 
router.patch("/profile", authenticateToken, async (req, res) => {
    try {
        const { username, email, currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if email is already taken by another user 
        if (email !== user.email) {
            const emailExists = await User.findOne({ email, _id: { $ne: user._id } });
            if (emailExists) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        // Check if username is already taken by another user
        if (username !== user.username) {
            const usernameExists = await User.findOne({ username, _id: { $ne: user._id } });
            if (usernameExists) {
                return res.status(400).json({ message: 'Username already taken' });
            }
        }

        // If changing password, verify current password
        if (newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.hash);
            if (!isMatch) {
                return res.status(401).json({ message: 'Current password is incorrect' });
            }
            // Hash new password
            const salt = await bcrypt.genSalt(10);
            user.hash = await bcrypt.hash(newPassword, salt);
        }

        user.username = username;
        user.email = email;
        await user.save();

        res.json({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    }
    catch (err) {
        console.error("Profile update error:", err);
        res.status(500).json({ message: "Error updating profile" });
    }
});

router.get("/search", authenticateToken, async (req, res) => {
    try {
        const { query } = req.query;
        const currentUser = req.user.userId;

        // Search for users by username or email, excluding curr user 
        const users = await User.find({
            $and: [
                {
                    $or: [
                        { username: new RegExp(query, "i") },
                        { email: new RegExp(query, "i") }
                    ]
                },
                { _id: { $ne: currentUser } }
            ]
        })
        .select("username email avatar")
        .limit(10);
        res.json(users);
    }
    catch (err) {
        console.error("User search error:", err);
        res.status(500).json({ message: "Error searching users" });
    }
});

export default router;