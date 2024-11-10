import express from "express";
import jwt from "jsonwebtoken";
import { Task, Project } from "../db.mjs";

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

// Get all tasks for a specific project
router.get("/project/:projectId", authenticateToken, async (req, res) => {
    try {
        // Verify user has access to this project
        const project = await Project.findById(req.params.projectId);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        
        if (project.owner.toString() !== req.user.userId && 
            !project.members.includes(req.user.userId)) {
            return res.status(403).json({ message: "Access denied" });
        }

        const tasks = await Task.find({ project: req.params.projectId })
            .populate("assignee", "username avatar")
            .populate("creator", "username avatar")
            .populate("comments.user", "username avatar")
            .sort({ position: 1 });
        res.json(tasks);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create new task
router.post('/create', authenticateToken, async (req, res) => {
    try {
        // Verify user has access to this project
        const project = await Project.findById(req.body.project);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        
        // Check if user has access to the project 
        const isOwner = project.owner.toString() === req.user.userId;
        const isMember = project.members.map(m => m.toString()).includes(req.user.userId);
        
        if (!isOwner && !isMember) {
            return res.status(403).json({ message: "Access denied" });
        }

        // Get max position for the status
        const maxPositionTask = await Task.findOne({ 
            project: req.body.project,
            status: req.body.status || 'todo' 
        }).sort({ position: -1 });

        const task = new Task({
            project: req.body.project,
            title: req.body.title,
            description: req.body.description,
            status: req.body.status || 'todo',
            priority: req.body.priority || 'medium',
            assignee: req.body.assignee || req.user.userId,
            creator: req.user.userId,
            dueDate: req.body.dueDate,
            position: maxPositionTask ? maxPositionTask.position + 1 : 0,
            labels: req.body.labels || [],
            comments: []
        });

        const newTask = await task.save();
        const populatedTask = await Task.findById(newTask._id)
            .populate("assignee", "username")
            .populate("creator", "username");
        
        console.log("Created new task:", populatedTask);
        res.status(201).json(populatedTask);
    } 
    catch (err) {
        console.error("Error creating task:", err);
        res.status(400).json({ message: err.message });
    }
});

// Update task
router.patch('/:taskId', authenticateToken, async (req, res) => {
    try {
        const task = await Task.findById(req.params.taskId);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Verify user has access to the project 
        const project = await Project.findById(task.project);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        const isOwner = project.owner.toString() === req.user.userId;
        const isMember = project.members.map(m => m.toString()).includes(req.user.userId);

        if (!isOwner && !isMember) {
            return res.status(403).json({ message: "Access denied" });
        }

        // If status is changing, update positions
        if (req.body.status && req.body.status !== task.status) {
            // Get all tasks in the new status column
            const tasksInNewStatus = await Task.find({
                project: task.project,
                status: req.body.status
            }).sort({ position: -1 });

            req.body.position = tasksInNewStatus.length > 0
                ? tasksInNewStatus[0].position + 1 : 0
        }

        const updatedTask = await Task.findByIdAndUpdate(
            req.params.taskId,
            { $set: req.body },
            { new: true }
        )
        .populate("assignee", "username avatar")
        .populate("creator", "username avatar")
        .populate("comments.user", "username avatar");

        res.json(updatedTask);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Add comment to task
router.post('/:taskId/comments', authenticateToken, async (req, res) => {
    try {
        const task = await Task.findById(req.params.taskId);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Verify user has access to the project
        const project = await Project.findById(task.project);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        const isOwner = project.owner.toString() === req.user.userId;
        const isMember = project.members.map(m => m.toString()).includes(req.user.userId);
        
        if (!isOwner && !isMember) {
            return res.status(403).json({ message: "Access denied" });
        }

        task.comments.push({
            user: req.user.userId,
            content: req.body.content,
            createdAt: new Date()
        });

        await task.save();

        const updatedTask = await Task.findById(req.params.taskId)
            .populate("assignee", "username avatar")
            .populate("creator", "username avatar")
            .populate("comments.user", "username avatar");

        res.json(updatedTask);
    }
    catch (err) {
        console.error("Error adding comment:", err);
        res.status(400).json({ message: err.message });
    }
});

// Delete task
router.delete('/:taskId', authenticateToken, async (req, res) => {
    try {
        const task = await Task.findById(req.params.taskId);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Check if user has access to delete
        const project = await Project.findById(task.project);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        const isOwner = project.owner.toString() === req.user.userId;
        const isCreator = task.creator.toString() === req.user.userId;
        
        if (!isOwner && isCreator) {
            return res.status(403).json({ message: "Not authorized to delete this task" });
        }

        await Task.findByIdAndDelete(req.params.taskId);

        // Reorder remaining tasks in the same status
        const remainingTasks = await Task.find({
            project: task.project,
            status: task.status
        }).sort({ position: 1 });

        for (let i = 0; i < remainingTasks.length; i++) {
            await Task.findByIdAndUpdate(remainingTasks[i]._id, {
                position: i
            });
        }

        res.json({ message: "Task deleted" });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Reorder tasks
router.patch('/reorder/:taskId', authenticateToken, async (req, res) => {
    try {
        const { taskId, status, newPosition } = req.body;

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Get tasks in target status
        const tasksInStatus = await Task.find({
            project: req.params.projectId,
            status: status,
            _id: { $ne: taskId }
        }).sort({ position: 1 });

        // Update task's status and position
        task.status = status;
        task.position = newPosition;
        await task.save();

        // Reorder other tasks
        tasksInStatus.forEach(async (t, index) => {
            let newPos = index;
            if (index >= newPosition) {
                newPos = index + 1;
            }
            await Task.findByIdAndUpdate(t._id, { position: newPos });
        });

        const updatedTask = await Task.findById(taskId)
            .populate("assignee", "username avatar")
            .populate("creator", "username avatar")
            .populate("comments.user", "username avatar");

        res.json(updatedTask);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});

export default router;