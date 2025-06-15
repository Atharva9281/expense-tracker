// SignUp.jsx - Compact mobile-friendly with dashboard-style design
import React, { useContext, useState } from 'react'
import AuthLayout from '../../components/layouts/AuthLayout'
import { useNavigate, Link } from 'react-router-dom';
import Input from '../../components/Inputs/Input';
import { validateEmail } from '../../utils/helper';
import ProfilePhotoSelector from '../../components/Inputs/ProfilePhotoSelector';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPath';
import { UserContext } from '../../context/userContext';
import uploadImage from '../../utils/uploadImage';
import FintasticLogo from '../../components/FintasticLogo';

const SignUp = () => {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [profilePic, setProfilePic] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const {updateUser} = useContext(UserContext);
    const navigate = useNavigate();
    
    // Handle SignUp Form Submit
    const handleSignUp = async (e) => {
        e.preventDefault();

        if (!fullName) {
            setError("Please enter your full name.");
            return;
        }
        if (!validateEmail(email)) {
            setError("Please enter a valid email address.");
            return;
        }
        if (!password) {
            setError("Please enter the password");
            return;
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }
        setError("");
        setLoading(true);

        try {
            // Initialize profileImageUrl
            let profileImageUrl = "";

            // Upload Image if Present
            if (profilePic) {
                const imgUploadRes = await uploadImage(profilePic);
                profileImageUrl = imgUploadRes.imageUrl || "";
            }

            const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
                fullName, 
                email, 
                password,
                profileImageUrl
            });

            const { token, user } = response.data;

            if (token) {
                localStorage.setItem("token", token);
                updateUser(user);
                navigate("/dashboard");
            }
        } catch (error) {
            if (error.response && error.response.data.message) {
                setError(error.response.data.message);
            }
            else {
                setError("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 flex items-center justify-center p-2 sm:p-4">
            {/* Background decorative elements - smaller */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute top-20 left-20 w-40 h-40 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            </div>

            {/* Main signup card - compact */}
            <div className="relative w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 backdrop-blur-sm bg-opacity-95">
                    {/* Logo Section - Compact */}
                    <div className="text-center mb-4">
                        <div className="flex justify-center mb-2">
                            <div className="bg-gradient-to-br from-purple-500 to-purple-700 p-2 rounded-xl shadow-lg">
                                <FintasticLogo size={32} />
                            </div>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                            Fintastic
                        </h1>
                        <p className="text-purple-600 font-medium text-xs">Smart Finance</p>
                    </div>

                    {/* Welcome section - Compact */}
                    <div className="text-center mb-4">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">Create an Account</h2>
                        <p className="text-gray-600 text-xs">
                            Join us today by entering your details below.
                        </p>
                    </div>
                    
                    <form onSubmit={handleSignUp} className="space-y-3">
                        {/* Profile Photo Selector - Smaller */}
                        <div className="flex justify-center mb-3">
                            <div className="scale-75">
                                <ProfilePhotoSelector image={profilePic} setImage={setProfilePic}/>
                            </div>
                        </div>

                        {/* Form Fields - Compact spacing */}
                        <div className="space-y-3">
                            <Input
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                label="Full Name"
                                placeholder="John Doe"
                                type="text"
                            />

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
                        </div>
                        
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                                <p className="text-red-600 text-xs">{error}</p>
                            </div>
                        )}
                        
                        <button 
                            type="submit" 
                            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-2.5 px-6 rounded-lg hover:from-purple-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-4"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Creating Account...
                                </div>
                            ) : (
                                "Sign Up"
                            )}
                        </button>
                        
                        <div className="text-center pt-2">
                            <p className="text-gray-600 text-xs">
                                Already have an account?{" "}
                                <Link 
                                    className="font-semibold text-purple-600 hover:text-purple-700 transition-colors duration-200" 
                                    to="/login"
                                >
                                    Login
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>

                {/* Bottom decorative element - Compact */}
                <div className="mt-3 text-center">
                    <p className="text-white/80 text-xs">
                        Smart Finance Management
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

export default SignUp