import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Settings, LogOut, ChevronDown, Clock, AlertCircle, Edit, Trash2, User, UserPlus } from "lucide-react";
import FriendRequestNotifications from "./friendRequestNotification";
import "./input.css"

const Dashboard = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [user, setUser] = useState(null);
    const [showCreateProject, setShowCreateProject] = useState(false);
    const [isCreatingProject, setIsCreatingProject] = useState(false);
    const [createProjectError, setCreateProjectError] = useState("");
    const [activeSettingsMenu, setActiveSettingsMenu] = useState(null);
    const [newProject, setNewProject] = useState({
        name: "",
        description: ""
    });

    // Close settings menu when user clicks outside 
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (activeSettingsMenu && !event.target.closest(".settings-menu")) {
                setActiveSettingsMenu(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [activeSettingsMenu]);

    // Fetch user data and projects on component mount 
    useEffect(() => {
        const userData = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (!userData || !token) {
            navigate("/login");
            return;
        }

        setUser(JSON.parse(userData));
        fetchProjects();
    }, [navigate]);

    const fetchProjects = async () => {
        try {
            const response = await fetch("/api/projects/dashboard", {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });

            if (!response.ok) {
                throw new Error("Failed to fetch projects");
            }

            const data = await response.json();
            setProjects(data);
        }
        catch (err) {
            setError(err.message);
        }
        finally {
            setIsLoading(false);
        }
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        setIsCreatingProject(true);
        setCreateProjectError("");

        try {
            const response = await fetch("/api/projects/dashboard", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    name: newProject.name,
                    description: newProject.description
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to create project");
            }

            // Add new project to state 
            setProjects(prev => [...prev, data]);
            setShowCreateProject(false);
            setNewProject({ name: "", description: "" });

            // Refetch all projects to ensure data is fresh 
            fetchProjects();
        }
        catch (err) {
            setCreateProjectError(err.message);
        }
        finally {
            setIsCreatingProject(false);
        }
    };

    const handleDeleteProject = async (projectId) => {
        if (window.confirm("Are you sure you want to delete this project?")) {
            try {
                const response = await fetch(`/api/projects/${projectId}`, {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    }
                });

                if (!response.ok) {
                    throw new Error("Failed to delete project");
                }

                setProjects(projects.filter(project => project._id !== projectId));
                setActiveSettingsMenu(null);
            }
            catch (err) {
                setError(err.message);
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    // Frontend 
    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                        <div className="flex items-center space-x-4">
                            <button onClick={() => navigate("/find-friends")} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                <UserPlus className="h-5 w-5"/>
                                <span>Find Friends</span>
                            </button>
                            <FriendRequestNotifications/>
                            <button Onclick={() => navigate("/friends")} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                <User className="h-5 w-5"/>
                                <span>My Friends</span>
                            </button>
                            <div className="relative">
                                <button onClick={() => navigate("/profile")} className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
                                    <User className="h-5 w-5"/>
                                    <span>{user?.username}</span>
                                    <ChevronDown className="h-4 w-4"/>
                                </button>
                            </div>
                            <button onClick={handleLogout} className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
                                <LogOut className="h-5 w-5"/>
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Projects Header */}
                <div className="flex-justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Your Projects</h2>
                    <button onClick={() => setShowCreateProject(true)} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        <PlusCircle className="h-5 w-5"/>
                        <span>New Project</span>
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
                        {error}
                    </div>
                )}

                {/* Project Grid */}
                {isLoading ? (
                <div className="text-center py-12">Loading projects...</div>
                ) : projects.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No projects</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new project.</p>
                    <button onClick={() => setShowCreateProject(true)} className="mt-6 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                    <PlusCircle className="h-5 w-5 mr-2"/>
                    New Project
                    </button>
                </div>
                ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                    <div key={project._id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200">
                        <div className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">
                                    {project.name}
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {project.description}
                                </p>
                            </div>
                            <div className="relative settings-menu">
                                <button 
                                    onClick={() => setActiveSettingsMenu(activeSettingsMenu === project._id ? null : project._id)}
                                    className="text-gray-400 hover:text-gray-500">
                                    <Settings className="h-5 w-5"/>
                                </button>
                                {activeSettingsMenu === project._id && (
                                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                        <div className="py-1">
                                            <button
                                                onClick={() => navigate(`/project/${project._id}/edit`)}
                                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full">
                                                <Edit className="h-4 w-4 mr-2"/>
                                                Edit Project
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProject(project._id)}
                                                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full">
                                                <Trash2 className="h-4 w-4 mr-2"/>
                                                Delete Project
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-1"/>
                            <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                            <AlertCircle className="h-4 w-4 mr-1"/>
                            <span>{project.status}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                console.log("Project ID:", project._id);
                                if (!project._id) {
                                    console.error("Missing project ID");
                                    return;
                                }
                                console.log("Navigating to:", `/project/${project._id}`);
                                navigate(`/project/${project._id}`);
                            }}
                            className="mt-4 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200"
                        >
                            View Project
                        </button>
                        </div>
                    </div>
                    ))}
                </div>
                )}

                {/* Create Project Modal */}
                {showCreateProject && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Project</h3>
                            {createProjectError && (
                                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                                    {createProjectError}
                                </div>
                            )}
                            <form onSubmit={handleCreateProject}>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="projectName" className="block text-sm font-medium text-gray-700">
                                            Project Name
                                        </label>
                                        <input
                                            type="text"
                                            id="projectName"
                                            value={newProject.name}
                                            onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                                            required
                                            disabled={isCreatingProject}/>
                                    </div>
                                    <div>
                                        <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700">
                                            Description
                                        </label>
                                        <textarea
                                            id="projectDescription"
                                            value={newProject.description}
                                            onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                                            rows={3}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                                            disabled={isCreatingProject}/>
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateProject(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                        disabled={isCreatingProject}>
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                        disabled={isCreatingProject}>
                                        {isCreatingProject ? 'Creating...' : 'Create Project'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                )}
            </main>
        </div>
        );
};

export default Dashboard;