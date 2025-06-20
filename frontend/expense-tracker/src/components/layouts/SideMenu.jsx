// // SideMenu.jsx - Fixed nesting issue
// import React, { useContext } from "react";
// import { SIDE_MENU_DATA } from "../../utils/data";
// import { UserContext } from "../../context/userContext";
// import { useNavigate } from "react-router-dom";

// // Simple avatar component to replace the missing CharAvatar
// const SimpleAvatar = ({ fullName, width, height, style }) => {
//     const initial = fullName ? fullName.charAt(0).toUpperCase() : "";
//     return (
//         <div className={`${width} ${height} bg-slate-400 rounded-full flex items-center justify-center text-white ${style}`}>
//             {initial}
//         </div>
//     );
// };

// const SideMenu = ({activeMenu}) => {
//     const { user, clearUser } = useContext(UserContext);
    
//     // Fix for double nested user object
//     const userData = user?.user || user;
    
//     const navigate = useNavigate();
    
//     const handleClick = (route) => {
//         if (route === "logout") {
//             handelLogout();
//             return;
//         }
        
//         navigate(route);
//     };
    
//     const handelLogout = () => {
//         localStorage.clear(); 
//         clearUser();
//         navigate("/login");
//     };
    
//     return <div className="w-64 h-[calc(100vh-61px)] bg-white border-r border-gray-200/50 p-5 sticky top-[61px] z-20">
//         <div className="flex flex-col items-center justify-center gap-3 mt-3 mb-7">
//             {userData?.profileImageUrl? (
//             <img
//                 src={userData.profileImageUrl || ""}
//                 alt="Profile Image"
//                 className="w-20 h-20 bg-slate-400 rounded-full"
//                 />) : (
//                 <SimpleAvatar
//                     fullName={userData?.fullName}
//                     width="w-20"
//                     height="h-20"
//                     style="text-xl"
//                 />
//                 )}
                
//             <h5 className="text-gray-950 font-medium leading-6">
//                 {userData?.fullName || ""}
//             </h5>
//         </div>
        
//         {SIDE_MENU_DATA.map((item, index) => (
//         <button
//             key={`menu_${index}`}
//             className={`w-full flex items-center gap-4 text-[15px] ${ 
//                 activeMenu == item.label ? "text-white bg-primary": "" 
//             } py-3 px-6 rounded-lg mb-3`}
//             onClick={() => handleClick(item.path)}
//         >
//             <item.icon className="" />
//             {item.label}
//             </button>
//             )
//         )}
//     </div>;
// };

// export default SideMenu;

// SideMenu.jsx - Simple cursor pointer on hover
import React, { useContext } from "react";
import { SIDE_MENU_DATA } from "../../utils/data";
import { UserContext } from "../../context/userContext";
import { useNavigate } from "react-router-dom";

// Simple avatar component to replace the missing CharAvatar
const SimpleAvatar = ({ fullName, width, height, style }) => {
    const initial = fullName ? fullName.charAt(0).toUpperCase() : "";
    return (
        <div className={`${width} ${height} bg-slate-400 rounded-full flex items-center justify-center text-white ${style}`}>
            {initial}
        </div>
    );
};

const SideMenu = ({activeMenu}) => {
    const { user, clearUser } = useContext(UserContext);
    
    // Fix for double nested user object
    const userData = user?.user || user;
    
    const navigate = useNavigate();
    
    const handleClick = (route) => {
        if (route === "logout") {
            handelLogout();
            return;
        }
        
        navigate(route);
    };
    
    const handelLogout = () => {
        localStorage.clear(); 
        clearUser();
        navigate("/login");
    };
    
    return <div className="w-64 h-[calc(100vh-61px)] bg-white border-r border-gray-200/50 p-5 sticky top-[61px] z-20">
        <div className="flex flex-col items-center justify-center gap-3 mt-3 mb-7">
            {userData?.profileImageUrl? (
            <img
                src={userData.profileImageUrl || ""}
                alt="Profile Image"
                className="w-20 h-20 bg-slate-400 rounded-full cursor-pointer"
                />) : (
                <SimpleAvatar
                    fullName={userData?.fullName}
                    width="w-20"
                    height="h-20"
                    style="text-xl"
                />
                )}
                
            <h5 className="text-gray-950 font-medium leading-6">
                {userData?.fullName || ""}
            </h5>
        </div>
        
        {SIDE_MENU_DATA.map((item, index) => (
        <button
            key={`menu_${index}`}
            className={`w-full flex items-center gap-4 text-[15px] ${ 
                activeMenu == item.label ? "text-white bg-primary": "" 
            } py-3 px-6 rounded-lg mb-3 cursor-pointer`}
            onClick={() => handleClick(item.path)}
        >
            <item.icon className="" />
            {item.label}
            </button>
            )
        )}
    </div>;
};

export default SideMenu;