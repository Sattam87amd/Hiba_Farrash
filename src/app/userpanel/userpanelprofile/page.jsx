'use client';

import React, { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import UserProfileSection from '@/components/UserPanel/UserPanelProfile/UserProfileSection';
import Navtop from '@/components/UserPanel/NavTop/NavTopuser';
import BottomNav from '@/components/UserPanel/BottomNav/BottomNav';
import UserSidebar from '@/components/UserPanel/UseSideBar/UserSidebar';
import Footer from '@/components/UserPanel/Layout/Footer';
import UserBottomNav from '@/components/UserPanel/UserBottomNav/UserBottomNav';
import UserMobileNavSearch from '@/components/UserPanel/Experts/UserMobileexpert/UserMobileNavSearch';
import MobileNavSearch from "@/components/UserPanel/Layout/MobileNavSearch";


const Page = () => {
  const pathname = usePathname();

  // Map the routes to their labels (should match the Sidebar menu items)
  const menuItems = [
    { label: "Book Session", route: "/booksession" },
    { label: "Video Call", route: "/userpanel/videocall" },
    { label: "Profile", route: "/userpanel/expertpanelprofile" },

  ];

  const activeItem = menuItems.find(item => item.route === pathname);
  const activeTab = activeItem ? activeItem.label : "Profile"; // Default value if no match

  return (
    <>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div className="md:w-[20%] ">
          <UserSidebar />
        </div>

        {/* Main Content */}
        <div className="md:w-[80%] md:p-4 w-[100%]  ">
          <MobileNavSearch/>

          <Navtop activeTab={activeTab} />
          <Suspense fallback={<div>Loading profile...</div>}>
            <UserProfileSection />
          </Suspense>
        </div>

        {/* Bottom Navigation for Mobile */}
        <div className="fixed bottom-0 left-0 right-0 md:hidden">
          {/* <BottomNav /> */}
          <UserBottomNav/>
        </div>
      </div>
      <div className="md:mt-3.5 hidden sm:block">
        <Footer />
      </div>
    </>
  );
};

export default Page;
