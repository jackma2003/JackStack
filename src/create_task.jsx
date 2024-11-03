import React, { useState } from "react";
import { Calendar, Clock, Tag, AlertCircle } from "lucide-react";
import "./input.css"

const TaskForm = ({ initialTask, onSubmit, onDelete }) => {
    const [task, setTask] = useState(initialTask || {
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        dueDate: "",
        labels: [],
    });
    const [error, setError] = useState("");
    const [newLabel, setNewLabel] = useState("");

    const handleSubmit = (e) => {
        // prevents a browser reload/refresh 
        e.preventDefault();
        if (!task.title.trim()) {
            setError("Title is required");
            return;
        }
        onSubmit(task);
        if (!initialTask) {
            // Clears form when its a new task 
            setTask({
                title: "",
                description: "",
                status: "todo",
                priority: "medium",
                dueDate: "",
                labels: [],
            });
        }
        setError("");
    };

    const handleAddLabel = (e) => {
        // prevents a browser reload/refresh 
        e.preventDefault();
        // Creates new labels for tasks 
        if (newLabel.trim() && !task.labels.includes(newLabel.trim())) {
            setTask({
                ...task,
                labels: [...task.labels, newLabel.trim()]
            });
            setNewLabel("");
        }
    };

    const removeLabel = (labelToRemove) => {
        // returns all labels that are not removed 
        setTask({
            ...task,
            labels: task.labels.filter(label => label !== labelToRemove)
        });
    };

    // Frontend 
    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">
                {initialTask ? "Edit Task" : "Create New Task"}
            </h2>

            {/* Whenever an error occurs */}
            {error && (
                <div className="p-4 mb-4 text-red-500 bg-red-50 rounded-md flex items-center">
                    <AlertCircle className="h-4 w-4"/>
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Title *
                    </label>
                    <input
                        type="text"
                        value={task.title}
                        onChange={(e) => setTask({...task, title: e.target.value})}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Description
                    </label>
                    <textarea
                        value={task.description}
                        onChange={(e) => setTask({...task, description: e.target.value})}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter task description"
                    />
                </div>

                {/* Places status and priority into two columns with a gap */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            <Clock className="inline-block w-4 h-4 mr-1"/>
                            Status
                        </label>
                        <select
                            value={task.status}
                            onChange={(e) => setTask({...task, status: e.target.value})}
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="todo">To Do</option>
                            <option value="in-progress">In Progress</option>
                            <option value="review">Review</option>
                            <option value="done">Done</option>
                        </select>
                    </div>

                    {/* Priority */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            <AlertCircle className="inline-block w-4 h-4 mr-1"/>
                            Priority
                        </label>
                        <select 
                            value={task.priority}
                            onChange={(e) => setTask({...task, priority: e.target.value})}
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                </div>

                {/* Due Date*/}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        <Calendar className="inline-block w-4 h-4 mr-1" />
                        Due Date
                    </label>
                    <input
                        type="date"
                        value={task.dueDate}
                        onChange={(e) => setTask({...task, dueDate: e.target.value})}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Labels */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        <Tag className="inline-block w-4 h-4 mr-1"/>
                        Labels
                    </label>
                    <div className="flex gap-2 mb-2">
                        {task.labels.map((label) => (
                            <span
                                key={label}
                                className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center"
                            >
                                {label}
                                <button
                                    type="button"
                                    onClick={() => removeLabel(label)}
                                    className="ml-1 text-blue-600 hover:text-blue-800"
                                >
                                    *
                                </button>
                            </span>
                        ))}
                    </div>
                    
                    {/* Add Label Button*/}
                    <div className="flex gap-2">
                        <input 
                            type="text"
                            value={newLabel}
                            onChange={(e) => setNewLabel(e.target.value)}
                            className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                            placeholder="Add a label"
                        />
                        <button
                            type="button"
                            onClick={handleAddLabel}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                            Add
                        </button>
                    </div>
                </div>

                {/* Delete/Update Button when theres a task, Create button when theres no task */}
                <div className="flex justify-end gap-4">
                    {initialTask && (
                        <button
                            type="button"
                            onClick={() => onDelete(task)}
                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                        >
                            Delete
                        </button>
                    )}
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                        {initialTask ? "Update Task" : "Create Task"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TaskForm;