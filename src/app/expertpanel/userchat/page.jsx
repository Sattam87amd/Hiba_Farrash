'use client';

import React from 'react';
import Sidebar from '@/components/ExpertPanel/SideBar/SideBar';
import Navtop from '@/components/ExpertPanel/Navtop/navtop';
import UserChatComponent from '@/components/ExpertPanel/UserChatComponent/UserChatComponent';
import BottomNav from '@/components/ExpertPanel/Bottomnav/bottomnav';
import { usePathname } from 'next/navigation';
import MobileNavSearch from '@/components/Layout/mobilenavsearch';

const Page = () => {

 // Define Sidebar menu items with route mapping
const menuItems = [
  { label: "Video Call", route: "/expertpanel/videocall" },
];

const pathname = usePathname()

const activeMenu = menuItems.find((item) => item.route === pathname)
const activeTab = activeMenu ? activeMenu.label : "Chats with Users";

  return (
    <div className="flex min-h-screen">
      {/* Sidebar with 1/3 width - Hidden on mobile */}
      <div className="hidden md:block md:w-[20%]">
        <Sidebar />
      </div>

      {/* Right Side Content with 2/3 width */}
      <div className="w-full md:w-[80%] p-4">
        <MobileNavSearch/>
        <Navtop activeTab = {activeTab}/>
        <UserChatComponent activeTab = {activeTab}/>

        {/* Bottom Navigation - Visible only on mobile */}
        <div className="fixed bottom-0 left-0 right-0 md:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  );
};

export default Page;
