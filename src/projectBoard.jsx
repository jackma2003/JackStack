import React, { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useParams, useNavigate } from "react-router-dom";
import { PlusCircle, Clock, User, Tag } from "lucide-react";

// Task card component 
const TaskCard = ({ task, index, moveTask, status }) => {
    const [{ isDragging }, drag ] = useDrag({
        type: "TASK",
        item: { id: task._id, index, status },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    return (
        <div ref={drag} className={`p-4 mb-2 bg-white rounded-lg shadow ${isDragging ? "opacity-50" : ""}`}>
            <h4 className="font-medium text-gray-900">{task.title}</h4>
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
        </div>
    );
};

// Column Component 
const Column = ({ status, tasks, moveTask }) => {
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
    const [newTask, setNewTask] = useState({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        dueDate: new Date().toISOString().split("T")[0],
        labels: [],
    });

    useEffect(() => {
        if (!localStorage.getItem("token")) {
            navigate("/login");
            return;
        }
        fetchProject();
        fetchTasks();
    }, [id, navigate]);

    const fetchProject = async () => {
        try {
            const response = await fetch(`/api/projects/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            if (!response.ok) throw new Error('Failed to fetch project');
            const data = await response.json();
            setProject(data);
        }
        catch (error) {
            console.error("Error fetching project:", error);
        }
    };

    const fetchTasks = async () => {
        try {
            const response = await fetch(`/api/tasks/project/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            if (!response.ok) throw new Error('Failed to fetch tasks');
            const data = await response.json();
            setTasks(data);
        }
        catch (error) {
            console.error("Error fetching tasks:", error);
        }
    };

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
            const response = await fetch(`/api/tasks/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    ...newTask,
                    project: id
                }),
            });
            
            if (response.ok) {
                const createdTask = await response.json();
                setTasks((prevTasks) => [...prevTasks, createdTask]);
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
        }
        catch (error) {
            console.error("Error creating task:", error);
        }
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="min-h-screen bg-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {project?.name} Board
                        </h2>
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
                            />
                        ))}
                    </div>

                    {/* New Task Modal */}
                    {showNewTask && (
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
                            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Create New Task
                                </h3>
                                <form onSubmit={handleCreateTask}>
                                    {/* Form fields remain the same */}
                                    {/* ... */}
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