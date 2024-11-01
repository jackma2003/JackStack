// 1ST DRAFT DATA MODEL
const mongoose = require("mongoose");

// User schema
// * users require authentication 
// * users can have 0 or more projects 
// * users can be assigned to multiple projects 
const User = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique: true},
    avatar: {type: String},
    // password hash will be handled by authentication plugin
    projects: [{type: mongoose.Schema.Types.ObjectId, ref: "Project"}],
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now}
});

// Comment Schema (embedded in Task)
const Comment = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    content: {type: String, required: true},
    createdAt: {type: Date, default: Date.now}
}, {
    _id: true 
});

// Task Schema 
// * each task must belong to a project 
// * tasks can be assigned to one user 
// * tasks can have multiple comments 
const Task = new mongoose.Schema({
    project: {type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true},
    title: {type: String, required: true},
    description: {type: String},
    status: {
        type: String,
        enum: ["todo", "in-progress", "review", "done"],
        default: "todo",
        required: true 
    },
    priority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium",
        required: true
    },
    assignee: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    creator: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    dueDate: {type: Date},
    position: {type: Number, required: true}, // for ordering in kanban columns
    labels: [{types: String}],
    comments: [Comment],
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now}
});

// Project Schema 
// * each project must have an owner (user)
// * project can have multiple team members 
// * projects can have multiple tasks 
const Project = new mongoose.Schema({
    name: {type: String, require: true},
    description: {type: String},
    owner: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    members: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
    status: {
        type: String,
        enum: ["active", "archived"],
        default: "active",
        required: true
    },
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now}
});

// Register models 
mongoose.model("User", User);
mongoose.model("Task", Task);
mongoose.model("Project", Project);

// TODO: Add configuration for MongoDB connection...etc