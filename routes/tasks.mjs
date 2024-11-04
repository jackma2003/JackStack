import express from "express";
import { Task } from "../db.mjs";

const router = express.Router();

// Get all tasks 
router.get("/task", async (req, res) => {
    try {
        const tasks = await Task.find()
            .populate("assignee, username")
            .populate("creator", "username");
        res.json(tasks);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create new task
router.post('/create_task', async (req, res) => {
    const task = new Task({
        project: req.body.project,
        title: req.body.title,
        description: req.body.description,
        status: req.body.status,
        priority: req.body.priority,
        assignee: req.body.assignee,
        creator: req.body.creator,
        dueDate: req.body.dueDate,
        position: req.body.position,
        labels: req.body.labels
    });

    try {
        const newTask = await task.save();
        res.status(201).json(newTask);
    } 
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});

export default router;