"use client"
import UserMobileNavSearch from '@/components/UserPanel/Experts/UserMobileexpert/UserMobileNavSearch';
import Footer from '@/components/Layout/Footer';
import Navtop from '@/components/UserPanel/NavTop/NavTopuser';
import UserBottomNav from '@/components/UserPanel/UserBottomNav/UserBottomNav';
import UserSidebar from '@/components/UserPanel/UseSideBar/UserSidebar';
import UserVideoCall from '@/components/UserPanel/VideoCall/UserVideoCall';
import { usePathname } from "next/navigation";
import MobileNavSearch from "@/components/UserPanel/Layout/MobileNavSearch";

import React from 'react'

const page = () => {

    // Define Sidebar menu items with route mapping
  const menuItems = [
    { label: "Video Call", route: "/expertpanel/videocall" },
  ];
  
  const pathname = usePathname()
  
  const activeMenu = menuItems.find((item) => item.route === pathname)
  const activeTab = activeMenu ? activeMenu.label : "Video Call";
  
    return (
      <>
      <div className="flex min-h-screen">
        {/* Sidebar with 1/3 width - Hidden on mobile */}
        <div className="hidden md:block md:w-[20%] h-[20%]">
          <UserSidebar/>
        </div>
  
        {/* Right Side Content with 2/3 width */}
        <div className="w-[100%] md:w-[80%] md:p-4">
          {/* <div className='md:hidden '> */}
          {/* <MobileNavSearch/> */}
          {/* </div> */}
          <Navtop activeTab={activeTab}/>
          <UserVideoCall activeTab={activeTab}/>
         
  
          {/* Bottom Navigation - Visible only on mobile */}
          <div className="fixed bottom-0 left-0 right-0 md:hidden">
            <UserBottomNav/>
            
          </div>
        </div>
        
      </div>
      <div className='hidden sm:block'> 
        <Footer />
        </div>
      </>
    );
  };

export default page;
