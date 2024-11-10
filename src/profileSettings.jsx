import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Key, Save, ArrowLeft } from "lucide-react";
import "./input.css";

const ProfileSettings = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (!userData) {
            navigate("/login")
            return;
        }

        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setFormData(prev => ({
            ...prev,
            username: parsedUser.username,
            email: parsedUser.email
        }));
        setIsLoading(false);
    }, [navigate])

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");
        setSuccess("");

        // Validate passwords if trying to change password
        if (formData.newPassword) {
            if (formData.newPassword !== formData.confirmPassword) {
                setError("New passwords do not match");
                setIsSubmitting(false);
                return;
            }
            if (!formData.currentPassword) {
                setError("Current password is required to set a new password");
                setIsSubmitting(false);
                return;
            }
        }

        try {
            const response = await fetch("/api/users/profile", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to update profile");
            }

            // update local storage with new user data 
            localStorage.setItem("user", JSON.stringify({
                ...user,
                username: formData.username,
                email: formData.email
            }));

            setSuccess("Profile updated successfully");
            // Clear password fields
            setFormData(prev => ({
                ...prev,
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            }));
        }
        catch (err) {
            setError(err.message);
        } 
        finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Back to Dashboard
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow px-6 py-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h1>

                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-600 rounded-md">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                Username
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className="pl-10 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="pl-10 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Change Password</h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                                        Current Password
                                    </label>
                                    <div className="mt-1 relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Key className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="password"
                                            id="currentPassword"
                                            name="currentPassword"
                                            value={formData.currentPassword}
                                            onChange={handleInputChange}
                                            className="pl-10 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        id="newPassword"
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                <Save className="h-5 w-5 mr-2" />
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;