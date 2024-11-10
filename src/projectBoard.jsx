import React, { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useParams, useNavigate } from "react-router-dom";
import { PlusCircle, Clock, User, Tag, ArrowLeft, Edit, Trash2, MessageSquare } from "lucide-react";

// Task card component 
const TaskCard = ({ task, index, moveTask, status, onEdit, onDelete, onAddComment }) => {
    const [{ isDragging }, drag ] = useDrag({
        type: "TASK",
        item: { id: task._id, index, status },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    // Comment section 
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState("");

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        await onAddComment(task._id, newComment);
        setNewComment("")
    }

    return (
        <div ref={drag} className={`p-4 mb-2 bg-white rounded-lg shadow ${isDragging ? "opacity-50" : ""}`}>
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-900">{task.title}</h4>
                <div className="flex items-center space-x-2">
                    <button 
                        onClick={() => onEdit(task)}
                        className="text-gray-400 hover:text-blue-500"
                    >
                        <Edit className="h-4 w-4" />
                    </button>
                    <button 
                        onClick={() => onDelete(task._id)}
                        className="text-gray-400 hover:text-red-500"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>
            
            <p className="mt-1 text-sm text-gray-500">{task.description}</p>
            
            <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400"/>
                    <span className="text-sm text-gray-500">
                        {task.assignee?.username || "Unassigned"}
                    </span>
                </div>
                {task.dueDate && (
                    <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400"/>
                        <span className="text-sm text-gray-500">
                            {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                    </div>
                )}
            </div>

            {task.labels && task.labels.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                    {task.labels.map((label) => (
                        <span key={label} className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            {label}
                        </span>
                    ))}
                </div>
            )}

            <div className="mt-3 pt-3 border-t">
                <button
                    onClick={() => setShowComments(!showComments)}
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
                >
                    <MessageSquare className="h-4 w-4" />
                    <span>{task.comments?.length || 0} comments</span>
                </button>

                {showComments && (
                    <div className="mt-2">
                        {task.comments && task.comments.map((comment, i) => (
                            <div key={i} className="text-sm text-gray-600 bg-gray-50 p-2 rounded mb-2">
                                <div className="flex items-center space-x-2 text-xs text-gray-500 mb-1">
                                    <span className="font-medium">{comment.user?.username}</span>
                                    <span>•</span>
                                    <span>{new Date(comment.createdAt).toLocaleString()}</span>
                                </div>
                                <p>{comment.content}</p>
                            </div>
                        ))}
                        
                        <form onSubmit={handleAddComment} className="mt-2 flex items-center space-x-2">
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a comment..."
                                className="flex-1 text-sm border rounded px-2 py-1"
                            />
                            <button
                                type="submit"
                                className="text-sm bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                            >
                                Send
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

// Column Component 
const Column = ({ status, tasks, moveTask, onEdit, onDelete, onAddComment }) => {
    const [{ isOver }, drop] = useDrop({
        accept: "TASK",
        drop: (item) => moveTask(item.id, status),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    });

    return (
        <div ref={drop} className={`bg-gray-100 p-4 rounded-lg w-80 ${isOver ? "bg-gray-200" : ""}`}>
            <h3 className="font-medium text-gray-900 mb-4">
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </h3>
            {tasks
                .filter((task) => task.status === status)
                .sort((a, b) => a.position - b.position)
                .map((task, index) => (
                    <TaskCard 
                        key={task._id} 
                        task={task} 
                        index={index} 
                        moveTask={moveTask} 
                        status={status}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onAddComment={onAddComment}
                    />
                ))}
        </div>
    );
};

// Main Project Board Component 
const ProjectBoard = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [showNewTask, setShowNewTask] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [showEditTask, setShowEditTask] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [newTask, setNewTask] = useState({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        dueDate: new Date().toISOString().split("T")[0],
        labels: [],
    });

    const handleEditTask = (task) => {
        setEditingTask(task);
        setShowEditTask(true);
    }

    const handleUpdateTask = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/tasks/${editingTask._id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(editingTask),
            });

            if (response.ok) {
                const updatedTask = await response.json();
                setTasks(prevTasks =>
                    prevTasks.map(task => 
                        task._id === updatedTask._id ? updatedTask : task
                ));
                setShowEditTask(false);
                setEditingTask(null); 
            }
        }
        catch (error) {
            console.error("Error updating task:", error);
            alert("Failed to update task:" + error.message);
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm("Are you sure you want to delete this task?")) return;

        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (response.ok) {
                setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
            }
        }
        catch (error) {
            console.error("Error deleting task:", error);
            alert("Failed to delete task: " + error.message);
        }
    };

    const handleAddComment = async (taskId, content) => {
        try {
            const response = await fetch (`/api/tasks/${taskId}/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ content }),
            });

            if (response.ok) {
                const updatedTask = await response.json();
                setTasks(prevTasks =>
                    prevTasks.map(task =>
                        task._id === updatedTask._id ? updatedTask : task
                ));
            }
        }
        catch (error) {
            console.error("Error adding comment:", error);
            alert("Failed to add comment: " + error.message);
        }
    };

    const fetchData = async () => {
        setIsLoading(true);
        setError("");
        try {
            console.log("Fetching project data for id:", id);
            const projectResponse = await fetch(`/api/projects/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
    
            const projectData = await projectResponse.json();
    
            if (!projectResponse.ok) {
                throw new Error(projectData.message || 'Failed to fetch project');
            }
    
            console.log("Project data:", projectData);
            setProject(projectData);
    
            console.log("Fetching tasks for project:", id);
            const tasksResponse = await fetch(`/api/tasks/project/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
    
            const tasksData = await tasksResponse.json();
    
            if (!tasksResponse.ok) {
                throw new Error(tasksData.message || 'Failed to fetch tasks');
            }
    
            console.log("Tasks data:", tasksData);
            setTasks(tasksData);
        } catch (error) {
            console.error("Error fetching data:", error);
            setError(error.message || "Failed to load project");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        console.log("ProjectBoard mounted");
        console.log("Project ID from params:", id);
        console.log("Current token:", localStorage.getItem("token"));
        
        const token = localStorage.getItem("token");
        if (!token) {
            console.log("No token found, redirecting to login");
            navigate("/login");
            return;
        }
        
        fetchData();
    }, [id, navigate]);

    const moveTask = async (taskId, newStatus) => {
        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                const updatedTask = await response.json();
                setTasks((prevTasks) => 
                    prevTasks.map((task) =>
                        task._id === taskId ? updatedTask : task
                    )
                );
            }
        }
        catch (error) {
            console.error("Error moving task:", error);
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            console.log("Creating task for project:", id);
            console.log("Task data:", { ...newTask, project: id });

            const response = await fetch(`/api/tasks/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    ...newTask,
                    project: id,
                    creator: JSON.parse(localStorage.getItem("user"))?.userId,
                    position: tasks.filter(t => t.status === "todo").length // Add as last item in todo
                }),
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || "Failed to create task");
            }

            console.log("Created Task:", data);
            setTasks((prevTasks) => [...prevTasks, data]);
            setShowNewTask(false);
            setNewTask({
                title: "",
                description: "",
                status: "todo",
                priority: "medium",
                dueDate: new Date().toISOString().split("T")[0],
                labels: [],
            });     
        }
        catch (error) {
            console.error("Error creating task:", error);
            alert("Failed to create task: " + error.message);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-xl text-gray-600">Loading project board...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 p-4">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md">
                        <h3 className="text-lg font-medium">Error</h3>
                        <p>{error}</p>
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="mt-4 flex items-center text-red-700 hover:text-red-800"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="min-h-screen bg-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center space-x-4">
                            <button 
                                onClick={() => navigate('/dashboard')}
                                className="text-gray-600 hover:text-gray-900"
                            >
                                <ArrowLeft className="h-6 w-6" />
                            </button>
                            <h2 className="text-2xl font-bold text-gray-900">
                                {project?.name} Board
                            </h2>
                        </div>
                        <button 
                            onClick={() => setShowNewTask(true)} 
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            <PlusCircle className="h-5 w-5"/>
                            <span>Add Task</span>
                        </button>
                    </div>

                    <div className="flex space-x-4 overflow-x-auto pb-4">
                        {["todo", "in-progress", "review", "done"].map((status) => (
                            <Column 
                                key={status} 
                                status={status} 
                                tasks={tasks} 
                                moveTask={moveTask}
                                onEdit={handleEditTask}
                                onDelete={handleDeleteTask}
                                onAddComment={handleAddComment}
                            />
                        ))}
                    </div>

                    {/* Edit Task Modal */}
                    {showEditTask && editingTask && (
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
                            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Edit Task
                                </h3>
                                <form onSubmit={handleUpdateTask}>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Title
                                            </label>
                                            <input
                                                type="text"
                                                value={editingTask.title}
                                                onChange={(e) => setEditingTask({ 
                                                    ...editingTask, 
                                                    title: e.target.value 
                                                })}
                                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Description
                                            </label>
                                            <textarea
                                                value={editingTask.description}
                                                onChange={(e) => setEditingTask({ 
                                                    ...editingTask, 
                                                    description: e.target.value 
                                                })}
                                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                                rows={3}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Priority
                                            </label>
                                            <select
                                                value={editingTask.priority}
                                                onChange={(e) => setEditingTask({ 
                                                    ...editingTask, 
                                                    priority: e.target.value 
                                                })}
                                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                            >
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Due Date
                                            </label>
                                            <input
                                                type="date"
                                                value={editingTask.dueDate?.split('T')[0]}
                                                onChange={(e) => setEditingTask({ 
                                                    ...editingTask, 
                                                    dueDate: e.target.value 
                                                })}
                                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-6 flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowEditTask(false);
                                                setEditingTask(null);
                                            }}
                                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                        >
                                            Update Task
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* New Task Modal */}
                    {showNewTask && (
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
                            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Create New Task for {project?.name}
                                </h3>
                                <form onSubmit={handleCreateTask}>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Title
                                            </label>
                                            <input
                                                type="text"
                                                value={newTask.title}
                                                onChange={(e) => {
                                                    console.log("Updating title:", e.target.value);
                                                    setNewTask({ ...newTask, title: e.target.value });
                                                }}
                                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                                placeholder="Enter task title"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Description
                                            </label>
                                            <textarea
                                                value={newTask.description}
                                                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                                rows={3}
                                                placeholder="Describe the task"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Priority
                                            </label>
                                            <select
                                                value={newTask.priority}
                                                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                            >
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Due Date
                                            </label>
                                            <input
                                                type="date"
                                                value={newTask.dueDate}
                                                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-6 flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                console.log("Cancelling task creation");
                                                setShowNewTask(false);
                                            }}
                                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                        >
                                            Create Task
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DndProvider>
    );
};

export default ProjectBoard;