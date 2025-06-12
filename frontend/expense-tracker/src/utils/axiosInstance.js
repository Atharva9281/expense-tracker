// Fixed axios configuration
import axios from "axios";
import { BASE_URL } from "./apiPath";

const axiosInstance = axios.create({  // Fixed: removed space
    baseURL: BASE_URL, 
    timeout: 10000, 
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
    },
});

// Request Interceptor
axiosInstance.interceptors.request.use(  // Fixed: removed space
    (config) => {
        const accessToken = localStorage.getItem("token");  // Fixed: removed space
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);  // Fixed: removed space
    }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {  // Fixed: added missing >
        // Handle common errors globally
        if (error.response) {
            if (error.response.status === 401) {
                // Redirect to login page
                window.location.href = "/login";  // Fixed: removed space
            } else if (error.response.status === 500) {
                console.error("Server error. Please try again later.");
            }
        } else if (error.code === "ECONNABORTED") {
            console.error("Request timeout. Please try again.");
        }
        return Promise.reject(error);  // Fixed: removed space
    }
);

export default axiosInstance;