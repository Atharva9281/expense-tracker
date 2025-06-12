// userContext.jsx - Minimal change to load from localStorage
import React, { createContext, useState, useEffect } from "react"; // Added useEffect

export const UserContext = createContext();

const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // Function to update user data
    const updateUser = (userData) => {
        setUser(userData);
    };

    // Function to clear user data (e.g., on logout)
    const clearUser = () => {
        localStorage.removeItem("user"); // Also clear localStorage
        setUser(null);
    };
    
    // Load user data from localStorage on startup - ADDED THIS BLOCK
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Error parsing stored user:", error);
            }
        }
    }, []);
    
    return (
        <UserContext.Provider
        value={{
            user, 
            updateUser, 
            clearUser,
        }}
        >
        {children}
        </UserContext.Provider>
    );
}

export default UserProvider;