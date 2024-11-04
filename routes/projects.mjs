import express from 'express';
import mongoose from 'mongoose';
import { Project } from "../db.mjs"

const router = express.Router();

// Get all projects
router.get("/dashboard", async (req, res) => {
    try {
        const projects = await Project.find().populate("owner", "username");
        res.json(projects);
    }
    catch {
        res.status(500).json({ message: err.message });
    }
});

// Create new project 
router.post("/dashboard", async (req, res) => {
    const project = new Project({
        name: req.body.name, 
        description: req.body.description,
        owner: req.body.owner,
        members: req.body.members,
        status: req.body.status || "active"
    });

    try {
        const newProject = await project.save();
        res.status(201).json(newProject);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});

export default router;