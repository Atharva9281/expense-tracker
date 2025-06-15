// CREATE: frontend/expense-tracker/src/pages/Dashboard/AccountSettings.jsx

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuUser, LuMail, LuShield, LuTrash2, LuEye, LuEyeOff } from 'react-icons/lu';
import { HiExclamationTriangle } from 'react-icons/hi2'; // ✅ Using this for alert icon
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPath';
import { UserContext } from '../../context/userContext';
import toast from 'react-hot-toast';
import Navbar from '../../components/layouts/Navbar';
import SideMenu from '../../components/layouts/SideMenu';

const AccountSettings = () => {
  const navigate = useNavigate();
  const { user, clearUser } = useContext(UserContext);
  
  // Fix for double nested user object (same as your SideMenu)
  const userData = user?.user || user;
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      toast.error('Password is required to delete your account');
      return;
    }

    setIsDeleting(true);
    
    try {
      const response = await axiosInstance.delete(API_PATHS.AUTH.DELETE_ACCOUNT, {
        data: { password: deletePassword }
      });

      toast.success('Account deleted successfully');
      
      // Clear local storage and context
      localStorage.clear();
      clearUser();
      
      // Redirect to login with message
      navigate('/login', { 
        state: { 
          message: 'Your account and all data have been permanently deleted' 
        }
      });

    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error deleting account';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Navbar activeMenu="Settings" />
      <div className="flex">
        <SideMenu activeMenu="Settings" />
        
        <div className="flex-1 min-h-screen bg-gray-50 p-8">
          <div className="max-w-4xl mx-auto">
            
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
              <p className="text-gray-600 mt-1">Manage your account preferences and data</p>
            </div>

            {/* Account Information Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <LuUser className="text-blue-500" />
                  Account Information
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <LuUser className="text-gray-400" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-medium text-gray-900">{userData?.fullName || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <LuMail className="text-gray-400" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Email Address</p>
                      <p className="font-medium text-gray-900">{userData?.email}</p>
                    </div>
                  </div>
                  
                  {/* <div className="flex items-center gap-3">
                    <LuShield className="text-gray-400" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Account Status</p>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          userData?.isVerified 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {userData?.isVerified ? 'Verified' : 'Unverified'}
                        </span>
                        {userData?.hasTrialAccess && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Trial Access
                          </span>
                        )}
                      </div>
                    </div>
                  </div> */}
                </div>
              </div>
            </div>

            {/* Danger Zone Card */}
            <div className="bg-white rounded-lg shadow-sm border border-red-200">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
                  <HiExclamationTriangle className="text-red-500" />
                  Danger Zone
                </h2>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <LuTrash2 className="text-red-500 mt-1" size={20} />
                    <div className="flex-1">
                      <h3 className="font-medium text-red-800 mb-1">Delete Account</h3>
                      <p className="text-sm text-red-700 mb-4">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      <ul className="text-xs text-red-600 mb-4 space-y-1">
                        <li>• All income and expense records will be deleted</li>
                        <li>• All budget data will be permanently removed</li>
                        <li>• Your account and profile will be deleted</li>
                        <li>• This action is irreversible</li>
                      </ul>
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        <LuTrash2 size={16} />
                        Delete My Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <HiExclamationTriangle className="text-red-600" size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Delete Account</h3>
                        <p className="text-sm text-gray-500">This action cannot be undone</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <p className="text-sm text-gray-700 mb-4">
                        Are you absolutely sure you want to delete your account? All your data will be permanently removed.
                      </p>
                      
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Enter your password to confirm:
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            placeholder="Enter your password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 pr-10"
                            disabled={isDeleting}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <LuEyeOff size={16} /> : <LuEye size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setShowDeleteModal(false);
                          setDeletePassword('');
                          setShowPassword(false);
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        disabled={isDeleting}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDeleteAccount}
                        disabled={isDeleting || !deletePassword.trim()}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                      >
                        {isDeleting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <LuTrash2 size={16} />
                            Delete Account
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

export default AccountSettings;