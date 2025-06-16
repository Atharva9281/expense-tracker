import React, { useContext, useState } from 'react'
import AuthLayout from '../../components/layouts/AuthLayout'
import { useNavigate, Link } from 'react-router-dom';
import Input from '../../components/Inputs/Input';
import { validateEmail } from '../../utils/helper';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPath';
import { UserContext } from '../../context/userContext';
import FintasticLogo from '../../components/FintasticLogo';

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const { updateUser } = useContext(UserContext)
    
    const navigate = useNavigate();
    
    // Handle Login Form Submit
    const handleLogin = async (e) => {
        e.preventDefault();
        
        // Form validation
        if (!validateEmail(email)) {
            setError("Please enter a valid email address.");
            return;
        }
        if (!password) {
            setError("Please enter the password");
            return;
        } 
        setError("");
        setLoading(true);
        
        // Login API Call
        try {
            const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
                email, 
                password,
            });
            
            // Get token and user from response
            const { token, user } = response.data;
            
            if (token && user) {
                // Store token and user in localStorage
                localStorage.setItem("token", token);
                localStorage.setItem("user", JSON.stringify(user));
                
                // Update user context
                updateUser(user);
                
                // Navigate to dashboard
                navigate("/dashboard");
            } else {
                setError("Invalid login response. Please try again.");
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                setError(error.response.data.message);
            } else {
                setError("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    }
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 flex items-center justify-center p-4">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            </div>

            {/* Main login card */}
            <div className="relative w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-sm bg-opacity-95">
                    {/* Logo Section - Enhanced */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <div className="bg-gradient-to-br from-purple-500 to-purple-700 p-4 rounded-2xl shadow-lg">
                                <FintasticLogo size={48} />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                            Fintastic
                        </h1>
                        <p className="text-purple-600 font-medium">Smart Finance</p>
                    </div>

                    {/* Welcome section */}
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h2>
                        <p className="text-gray-600">
                            Please enter your details to log in
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <Input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            label="Email Address"
                            placeholder="john@example.com"
                            type="email"
                        />
                        
                        <Input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            label="Password"
                            placeholder="Min 8 Characters"
                            type="password"
                        />
                        
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        )}
                        
                        <button 
                            type="submit" 
                            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Logging in...
                                </div>
                            ) : (
                                "Login"
                            )}
                        </button>

                        <div className="text-center">
                            <p className="text-gray-600">
                                Don't have an account?{" "}
                                <Link 
                                    className="font-semibold text-purple-600 hover:text-purple-700 transition-colors duration-200" 
                                    to="/signUp"
                                >
                                    Sign Up
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>

                {/* Bottom decorative element */}
                <div className="mt-8 text-center">
                    <p className="text-white/80 text-sm">
                        Track Your Income & Expenses
                    </p>
                </div>
            </div>

            <style jsx>{`
                @keyframes blob {
                    0% {
                        transform: translate(0px, 0px) scale(1);
                    }
                    33% {
                        transform: translate(30px, -50px) scale(1.1);
                    }
                    66% {
                        transform: translate(-20px, 20px) scale(0.9);
                    }
                    100% {
                        transform: translate(0px, 0px) scale(1);
                    }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </div>
    )
}

export default Login