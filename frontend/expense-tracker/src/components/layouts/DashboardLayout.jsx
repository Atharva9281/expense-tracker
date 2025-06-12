// DashboardLayout.jsx - Updated to pass logo to Navbar
import React, { useContext } from 'react'
import { UserContext } from '../../context/userContext'
import SideMenu from '../layouts/SideMenu'
import Navbar from '../layouts/Navbar'

const DashboardLayout = ({children, activeMenu}) => {
    const { user } = useContext(UserContext)
    return (
    <div className="">
        {/* Pass logo prop to Navbar - Navbar will handle the logo display */}
        <Navbar activeMenu={activeMenu} showLogo={true} />
        {user && (
        <div className="flex">
            <div className="max-[1080px]:hidden">
                <SideMenu activeMenu={activeMenu} />
            </div>
            
            <div className="grow mx-5">{children}</div>
        </div>
        )}
    </div>
    )
}

export default DashboardLayout