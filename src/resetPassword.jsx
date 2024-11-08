import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import "./input.css";

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: ""
    });
    const [showPassword, setShowPassword] = useState({
        password: false,
        confirmPassword: false
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation 
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const response = await fetch(`/api/users/reset-password/${token}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ password: formData.password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to reset password");
            }

            setSuccess(true);
            // Redirect user to login page after 3 seconds 
            setTimeout(() => {
                navigate("/login");
            }, 3000);
        }
        catch (err) {
            setError(err.message);
        }
        finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev, 
            [name]: value
        }));
    };

    const togglePasswordVisibility = (field) => {
        setShowPassword(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    // Frontend 
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
                    Reset Password 
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Enter your new password below 
                </p>
            </div>

            <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
                            {error}
                        </div>
                    )}

                    {success ? (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-600 rounded-md">
                            Password successfully rest! Redirecting to login page...
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* New Password Field */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    New Password
                                </label>
                                <div className="mt-1 relative">
                                    <input 
                                        id="password"
                                        name="password"
                                        type={showPassword.password ? "text" : "password"}
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        disabled={isLoading}
                                    />
                                    <button 
                                        type="button"
                                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                                        onClick={() => togglePasswordVisibility("password")}>
                                            {showPassword.password ? (
                                                <EyeOffIcon className="h-5 w-5 text-gray-400"/>
                                            ) : (
                                                <EyeIcon className="h-5 w-5 text-gray-400"/>
                                            )}
                                        </button>
                                </div>
                            </div>

                            {/* Confirm Password Field */}
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                    Confirm Password
                                </label>
                                <div className="mt-1 relative">
                                    <input 
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showPassword.confirmPassword ? "text" : "password"}
                                        required
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow=sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        disabled={isLoading}/>
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                                        onClick={() => togglePasswordVisibility("confirmedPassword")}>
                                            {showPassword.confirmPassword ? (
                                                <EyeOffIcon className="h-5 w-5 text-gray-400"/>
                                            ) : (
                                                <EyeIcon className="h-5 w-5 text-gray-400"/>
                                            )}
                                        </button>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2-offset-2 focus:ring-blue-500 disabled:opacity-50">
                                        {isLoading ? "Resetting Password..." : "Reset Password"}
                                    </button>
                            </div>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => navigate("/login")}
                                    className="text-sm text-blue-600 hover:text-blue-500">
                                        Back to login
                                    </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
};

export default ResetPassword;