import React, { useEffect, useState } from "react";
import { EyeIcon, EyeOffIcon, ArrowRightIcon, MailIcon, LockIcon, AlertCircleIcon, CheckCircleIcon } from "lucide-react";
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
                body: JSON.stringify({ ...formData, rememberMe }),
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

    return (
        <div className="h-screen flex flex-col md:flex-row bg-gray-900 overflow-hidden">
            {/* Left Side - Login Form */}
            <div className="md:w-1/2 h-screen flex items-center justify-center p-8 order-2 md:order-1 bg-gray-900 relative">
                <div className="w-full max-w-md relative z-10">
                    <div className="backdrop-blur-lg bg-white/10 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/10">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
                            <p className="text-gray-300">Let's get you back to being productive</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 text-red-200 rounded-xl">
                                <div className="flex items-center">
                                    <AlertCircleIcon className="h-5 w-5 mr-2" />
                                    {error}
                                </div>
                            </div>
                        )}

                        {resetStatus && (
                            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 text-green-200 rounded-xl">
                                <div className="flex items-center">
                                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                                    {resetStatus}
                                </div>
                            </div>
                        )}

                        {showForgotPassword ? (
                            <form onSubmit={handleForgotPassword} className="space-y-6">
                                <div className="space-y-2">
                                    <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-300">
                                        Email address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <MailIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input 
                                            type="email"
                                            id="resetEmail"
                                            value={resetEmail}
                                            onChange={(e) => setResetEmail(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border-0 bg-white/5 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 transition duration-150"
                                            placeholder="Your email address"
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-between">
                                    <button 
                                        type="button"
                                        onClick={() => setShowForgotPassword(false)}
                                        className="text-blue-400 hover:text-blue-300 font-medium transition duration-150">
                                            Back to Login
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-xl font-medium transition duration-150 flex items-center">
                                            {isLoading ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Sending...
                                                </>
                                            ) : "Send Reset Instructions"}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form className="space-y-6" onSubmit={handleSubmit}>
                                {/* Email Address */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="email"
                                        className="block text-sm font-medium text-gray-300"
                                    >
                                        Email address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <MailIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="your.email@example.com"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border-0 bg-white/5 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 transition duration-150"
                                        />
                                    </div>    
                                </div>

                                {/* Password */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-medium text-gray-300"
                                    >
                                        Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <LockIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input 
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text": "password"}
                                            autoComplete="current-password"
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            className="w-full pl-10 pr-12 py-3 rounded-xl border-0 bg-white/5 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 transition duration-150"
                                        />
                                        <button 
                                            type="button"
                                            className="absolute inset-y-0 right-0 flex items-center pr-3"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeOffIcon className="h-5 w-5 text-gray-400 hover:text-gray-300"/>
                                            ) : (
                                                <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-300"/>
                                            )}
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Remember me & Forgot Password */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <input 
                                            id="remember-me"
                                            name="remember-me"
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-700 bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900"
                                        />
                                        <label
                                            htmlFor="remember-me"
                                            className="ml-2 block text-sm text-gray-300"
                                        >
                                            Remember me
                                        </label>
                                    </div>

                                    <div className="text-sm">
                                        <button
                                            type="button"
                                            onClick={() => setShowForgotPassword(true)}
                                            className="font-medium text-blue-400 hover:text-blue-300 transition duration-150"
                                        >
                                            Forgot password?
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="group w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl font-medium transition duration-200 flex justify-center items-center"
                                    >
                                        {isLoading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Signing in...
                                            </>
                                        ) : (
                                            <>
                                                Sign in
                                                <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                                            </>
                                        )}
                                    </button>
                                </div>                        
                            </form>
                        )}
                        
                        {/* Create new account*/}
                        <div className="mt-8">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-700"/>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="bg-gray-900 px-4 text-gray-400">
                                        New to JackStack?
                                    </span>
                                </div>
                            </div>
                        
                            <div className="mt-6">
                                <Link 
                                    to="/register"
                                    className="w-full flex justify-center items-center border border-gray-700 bg-transparent hover:bg-white/5 text-gray-300 py-3 px-4 rounded-xl font-medium transition duration-150"
                                >
                                    Create an account
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Decorative background elements */}
                <div className="fixed inset-0 pointer-events-none">
                    <div className="absolute -left-40 -bottom-40 w-80 h-80 bg-gradient-to-r from-blue-600 to-violet-600 rounded-full blur-3xl opacity-20"></div>
                    <div className="absolute right-10 top-10 w-60 h-60 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full blur-3xl opacity-10"></div>
                </div>
            </div>
            
            {/* Right Side - Branding */}
            <div className="md:w-1/2 h-screen flex flex-col justify-center p-12 order-1 md:order-2 relative bg-gradient-to-br from-blue-600 to-indigo-800">
                {/* Decorative elements */}
                <div className="absolute inset-0">
                    <div className="absolute w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent"></div>
                    <div className="absolute -right-1/4 -top-1/4 w-2/3 h-2/3 bg-gradient-to-br from-indigo-400/30 to-transparent rounded-full blur-3xl"></div>
                    <div className="absolute grid grid-cols-12 gap-4 inset-0 opacity-30">
                        {Array.from({ length: 48 }).map((_, i) => (
                            <div 
                                key={i}
                                className="col-span-1 row-span-1 rounded-full bg-white/5"
                                style={{
                                    width: Math.random() * 2 + 1 + 'px',
                                    height: Math.random() * 2 + 1 + 'px',
                                    left: Math.random() * 100 + '%',
                                    top: Math.random() * 100 + '%'
                                }}
                            ></div>
                        ))}
                    </div>
                </div>
                
                <div className="relative z-10 max-w-lg mx-auto text-center md:text-left">
                    <div className="mb-8">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white mx-auto md:mx-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">JackStack</h1>
                    <div className="w-20 h-1 bg-blue-400 mb-6 mx-auto md:mx-0 rounded-full"></div>
                    <h2 className="text-2xl font-semibold mb-4 text-white">Your Project Management Solution</h2>
                    <p className="text-lg mb-8 text-blue-100 opacity-90">Plan, track, and manage your projects with ease. JackStack brings your teams and tasks together in one collaborative workspace.</p>
                    
                    <div className="space-y-6 hidden md:block">
                        <div className="flex items-center space-x-4 mb-6 backdrop-blur-sm bg-white/5 p-4 rounded-xl border border-white/10 transform transition-transform duration-300 hover:scale-105">
                            <div className="p-3 bg-blue-500/30 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-medium text-white">Task Management</h3>
                                <p className="text-sm text-blue-100 opacity-80">Create, assign, and track tasks effortlessly</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 mb-6 backdrop-blur-sm bg-white/5 p-4 rounded-xl border border-white/10 transform transition-transform duration-300 hover:scale-105">
                            <div className="p-3 bg-blue-500/30 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-medium text-white">Team Collaboration</h3>
                                <p className="text-sm text-blue-100 opacity-80">Connect with your team in real time</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 backdrop-blur-sm bg-white/5 p-4 rounded-xl border border-white/10 transform transition-transform duration-300 hover:scale-105">
                            <div className="p-3 bg-blue-500/30 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-medium text-white">Analytics & Reporting</h3>
                                <p className="text-sm text-blue-100 opacity-80">Track progress with interactive dashboards</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;