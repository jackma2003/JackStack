import express from 'express';
import jwt from "jsonwebtoken";
import { Project } from "../db.mjs"

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

// Get all projects
router.get("/dashboard", authenticateToken, async (req, res) => {
    try {
        const projects = await Project.find({
            $or: [
                {owner: req.user.userId },
                { members: req.user.userId }
            ]
        }).populate("owner", "username");
        res.json(projects);
    }
    catch (err) {
        console.error("Error fetching projects:", err);
        res.status(500).json({ message: err.message });
    }
});

// Create new project 
router.post("/dashboard", authenticateToken, async(req, res) => {
    try {
        const project = new Project({
            name: req.body.name,
            description: req.body.description,
            owner: req.user.userId, // authenticate user id 
            members: [req.user.userId], // Owner will be first members
            status: "active"
        });
        const newProject = await project.save();
        // Populate owner projects before sending a response 
        const populatedProject = await Project.findById(newProject._id).populate("owner", "username");
        res.status(201).json(populatedProject);
    }
    catch (err) {
        console.error("Error creating project:", err);
        res.status(400).json({ message: err.message });
    }
});

// Get single project 
router.get("/:id", authenticateToken, async(req, res) => {
    try {
        const project = await Project.findById(req.params.id).populate("owner", "username").populate("members", "username");
        
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Check if user has access to the project 
        const isOwner = project.owner._id.toString() === req.user.userId;
        const isMember = project.members.some(member => member._id.toString() === req.user.userId);

        if (!isOwner && !isMember) {
            return res.status(403).json({ message: "Access denied" });
        }

        res.json(project);
    }
    catch (err) {
        console.error("Error in get project by id:", err);
        res.status(500).json({ message: err.message });
    }
});

// Update project 
router.patch("/:id", authenticateToken, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        
        if (!project) {
            return res.status(404).json({ message: "Project not found "});
        }

        // Check if user is the owner 
        if (project.owner.toString() !== req.user.userId) {
            return res.status(403).json({ message: "Only project owner can update "});
        }

        const updatedProject = await Project.findByIdAndUpdate(
            req.params.id, 
            { $set: req.body },
            { new: true }
        ).populate("owner", "username");
        res.json(updatedProject);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete project 
router.delete("/:id", authenticateToken, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: "Project not found"});
        }

        // Check if user is the owner 
        if (project.owner.toString() !== req.user.userId) {
            return res.status(401).json({ message: "Only project owner can delete "});
        }
        await Project.findByIdAndDelete(req.params.id);
        res.json({ message: "Project deleted "});
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;