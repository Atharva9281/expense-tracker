import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../../components/layouts/AuthLayout';
import FintasticLogo from '../../components/FintasticLogo';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPath';

const VerifyEmail = () => {
    const { token } = useParams(); // Get token from URL
    const navigate = useNavigate();
    
    const [verificationStatus, setVerificationStatus] = useState('verifying'); // 'verifying', 'success', 'error'
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // Verify email on component mount
    useEffect(() => {
        if (token) {
            verifyEmailToken();
        } else {
            setVerificationStatus('error');
            setMessage('Invalid verification link. Token is missing.');
        }
    }, [token]);

    const verifyEmailToken = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`${API_PATHS.AUTH.VERIFY_EMAIL}/${token}`);
            
            if (response.data.success) {
                setVerificationStatus('success');
                setMessage(response.data.message || 'Email verified successfully!');
                
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    navigate('/login', { 
                        state: { message: 'Email verified! You can now log in with full access.' }
                    });
                }, 3000);
            } else {
                setVerificationStatus('error');
                setMessage(response.data.message || 'Verification failed.');
            }
        } catch (error) {
            setVerificationStatus('error');
            if (error.response && error.response.data && error.response.data.message) {
                setMessage(error.response.data.message);
            } else {
                setMessage('Verification failed. The link may be expired or invalid.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        // You can implement this if you want a resend button
        // For now, redirect to login
        navigate('/login');
    };

    return (
        <AuthLayout>
            <div className="lg:w-[70%] h-3/4 md:h-full flex flex-col justify-center">
                {/* Logo Section */}
                <div className="text-center mb-6">
                    <div className="flex justify-center mb-3">
                        <FintasticLogo size={60} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Fintastic</h1>
                    <p className="text-sm text-purple-600">Smart Finance</p>
                </div>

                {/* Verification Status */}
                <div className="text-center">
                    {verificationStatus === 'verifying' && (
                        <div>
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                            <h3 className="text-xl font-semibold text-black mb-2">Verifying Your Email</h3>
                            <p className="text-sm text-slate-700">Please wait while we verify your email address...</p>
                        </div>
                    )}

                    {verificationStatus === 'success' && (
                        <div>
                            <div className="flex justify-center mb-4">
                                <div className="rounded-full bg-green-100 p-3">
                                    <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-green-600 mb-2">Email Verified!</h3>
                            <p className="text-sm text-slate-700 mb-4">{message}</p>
                            <p className="text-xs text-slate-500">Redirecting you to login in 3 seconds...</p>
                            
                            <div className="mt-6">
                                <Link 
                                    to="/login" 
                                    className="btn-primary inline-block"
                                >
                                    Continue to Login
                                </Link>
                            </div>
                        </div>
                    )}

                    {verificationStatus === 'error' && (
                        <div>
                            <div className="flex justify-center mb-4">
                                <div className="rounded-full bg-red-100 p-3">
                                    <svg className="h-12 w-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-red-600 mb-2">Verification Failed</h3>
                            <p className="text-sm text-slate-700 mb-6">{message}</p>
                            
                            <div className="space-y-3">
                                <button 
                                    onClick={handleResendVerification}
                                    className="btn-primary w-full"
                                >
                                    Go to Login
                                </button>
                                
                                <p className="text-xs text-slate-500">
                                    Need help? The verification link may have expired. You can request a new one from the login page.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthLayout>
    );
};

export default VerifyEmail;