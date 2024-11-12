import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import "./input.css";

const EditProject = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const [project, setProject] = useState({
        name: "",
        description: "",
        status: ""
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchProject();
    }, [id]);

    const fetchProject = async () => {
        try {
            const response = await fetch(`/api/projects/${id}`, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });

            if (!response.ok) {
                throw new Error("Failed to fetch project");
            }

            const data = await response.json();
            setProject(data);
        }
        catch (err) {
            setError(err.message);
        }
        finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const {name, value } = e.target;
        setProject(prev => ({
            ...prev, 
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError("");

        try {
            const response = await fetch(`/api/projects/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    name: project.name,
                    description: project.description,
                    status: project.status
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Failed to update project");
            }

            navigate("/dashboard");
        }
        catch (err) {
            setError(err.message);
        }
        finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-gray-600">Loading project...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center mb-6">
                        <button onClick={() => navigate("/dashboard")} className="text-gray-600 hover:text-gray-900 mr-4">
                            <ArrowLeft className="h-5 w-5"/>
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900">Edit Project</h1>
                    </div>

                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Project Name
                            </label>
                            <input 
                                type="text"
                                id="name"
                                name="name"
                                value={project.name}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows={4}
                                value={project.description}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                                Status
                            </label>
                            <select 
                                id="status"
                                name="status"
                                value={project.status}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                            >
                                <option value="active">Active</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button 
                                type="button"
                                onClick={() => navigate("/dashboard")}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                disabled={isSaving}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                disabled={isSaving}
                            >
                                <Save className="h-4 w-4 mr-2"/>
                                {isSaving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditProject;