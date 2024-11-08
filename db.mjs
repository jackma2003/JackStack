import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// User schema
// * users require authentication 
// * users can have 0 or more projects 
// * users can be assigned to multiple projects 
const UserSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique: true},
    hash: {type: String, required: true}, 
    avatar: {type: String},
    projects: [{type: mongoose.Schema.Types.ObjectId, ref: "Project"}],
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now}
});

// Comment Schema (embedded in Task)
const CommentSchema = new mongoose.Schema({
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
const TaskSchema = new mongoose.Schema({
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
    labels: [{type: String}],
    comments: [CommentSchema],
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now}
});

// Project Schema 
// * each project must have an owner (user)
// * project can have multiple team members 
// * projects can have multiple tasks 
const ProjectSchema = new mongoose.Schema({
    name: {type: String, required: true},
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

// Middleware for timestamp updates 
UserSchema.pre("save", function(next) {
    this.UpdatedAt = Date.now();
    next();
})

ProjectSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

TaskSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Create and export models
export const User = mongoose.model('User', UserSchema);
export const Task = mongoose.model('Task', TaskSchema);
export const Project = mongoose.model('Project', ProjectSchema);

// Connect to MongoDB
export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;