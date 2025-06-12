import React, { useState } from 'react' 
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi"; 
import SideMenu from "./SideMenu";
import FintasticLogo from '../FintasticLogo'; // NEW: Import logo

const Navbar = ({activeMenu}) => {
    const [openSideMenu, setOpenSideMenu] = useState(false);
    return (
    <div className="flex gap-5 bg-white border border-b border-gray-200/50 backdrop-blur-[2px] py-4 px-7 sticky top-0 z-30">
        <button
        className="block lg:hidden text-black"
        onClick={() => {
            setOpenSideMenu(!openSideMenu);
        }}
        >
        
        {openSideMenu ? (
        <HiOutlineX className="text-2xl" />
        ) : (
        <HiOutlineMenu className="text-2xl" />
        )}
        </button>
        
        {/* UPDATED: Replace "Expense Tracker" with Fintastic logo */}
        <div className="flex items-center gap-3">
            <FintasticLogo size={32} />
            <div>
                <h2 className="text-lg font-bold text-gray-800">Fintastic</h2>
                <p className="text-xs text-purple-600 -mt-1">Smart Finance</p>
            </div>
        </div>
        
        {openSideMenu && (
        <div className="fixed top-[61px] -ml-4 bg-white">
        <SideMenu activeMenu={activeMenu} />
        </div>
        )}
    </div>
    )
}
export default Navbar