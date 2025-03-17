import React, { useEffect, useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import "./input.css";

const LoginPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const [resetStatus, setResetStatus] = useState("");

    // Check for rememberMe on mount 
    useEffect(() => {
        const rememberedEmail = localStorage.getItem("rememberedEmail");
        if (rememberedEmail) {
            setFormData(prev => ({ ...prev, email: rememberedEmail }));
            setRememberMe(true);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {

            // Update the fetch URl to use API base URL
            const API_URL = process.env.NODE_ENV === "production" 
                ? window.location.origin
                : "";

            const response = await fetch(`${API_URL}/api/users/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData, rememberMe),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Something went wrong");
            }

            // Handle remember me 
            if (rememberMe) {
                localStorage.setItem("rememberedEmail", formData.email);
            }
            else {
                localStorage.removeItem("rememberedEmail");
            }

            // Store token in local Storage 
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            // Redirect to dashboard
            navigate("/dashboard");
        }
        catch (err) {
            setError(err.message);
        }
        finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setResetStatus("");

        try {
            const API_URL = process.env.NODE_ENV === 'production' 
                ? window.location.origin 
                : '';

            const response = await fetch(`${API_URL}/api/users/forgot-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: resetEmail }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            setResetStatus("Password reset instructions have been sent to your email.");
            setResetEmail("");
            setTimeout(() => {
                setShowForgotPassword(false);
                setResetStatus("");
            }, 3000);
        }
        catch (err) {
            setResetStatus(err.message);
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

    // Frontend 
    return (
        // Header
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
                    Welcome to JackStack
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Sign in to your account to continue
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                {/* Reset Password */}
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
                            {error}    
                        </div>
                    )}

                    {resetStatus && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-600 rounded-md">
                            {resetStatus}
                        </div>
                    )}

                    {showForgotPassword ? (
                        <form onSubmit={handleForgotPassword} className="space-y-6">
                            <div>
                                <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700">
                                    Email address
                                </label>
                                <input 
                                    type="email"
                                    id="resetEmail"
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="flex justify-between">
                                <button 
                                    type="button"
                                    onClick={() => setShowForgotPassword(false)}
                                    className="text-blue-600 hover:text-blue-500">
                                        Back to Login
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                                        {isLoading ? "Sending..." : "Send Reset Instructions"}
                                    </button>
                            </div>
                        </form>
                    ) : (
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Email Address */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                                />    
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Password
                            </label>
                            <div className="mt-1 relative">
                                <input 
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text": "password"}
                                    autoComplete="current-password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                                />
                                <button 
                                    type="button"
                                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOffIcon className="h-5 w-5 text-gray-400"/>
                                    ) : (<EyeIcon className="h-5 w-5 text-gray-400"/>
                                    )}
                                </button>
                            </div>
                        </div>
                            
                            {/* Remember me & Forgot Password */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input 
                                        id="remember-me"
                                        name="remember=me"
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label
                                        htmlFor="remember-me"
                                        className="ml-2 block text-sm text-gray-900"
                                    >
                                        Remember me
                                    </label>
                                </div>

                                <div className="text-sm">
                                    <button
                                    type="button"
                                    onClick={() => setShowForgotPassword(true)}
                                    className="font-medium text-blue-600 hover:text-blue-500"
                                    >
                                        Forgot your password?
                                    </button>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? "Signing in..." : "Sign-in"}
                                </button>
                            </div>                        
                    </form>
                    )}
                    {/* Create new account*/}
                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"/>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white px-2 text-gray-500">
                                    New to JackStack?
                                </span>
                            </div>
                    </div>
                    
                    <div className="mt-6">
                        <Link 
                        to="/register"
                        className="flex w-full justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Create an account
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
};

export default LoginPage;