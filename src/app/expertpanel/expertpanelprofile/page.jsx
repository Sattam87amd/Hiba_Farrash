'use client';

import React, { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import ProfileSection from '@/components/ExpertPanel/ExpertPanelProfile/ProfileSection';
import Sidebar from '@/components/ExpertPanel/SideBar/SideBar';
import Footer from '@/components/Layout/Footer';
import Navtop from '@/components/ExpertPanel/Navtop/navtop';
import BottomNav from '@/components/ExpertPanel/Bottomnav/bottomnav';
import MobileNavSearch from '@/components/Layout/mobilenavsearch';

const Page = () => {
  const pathname = usePathname();

  // Map the routes to their labels (should match the Sidebar menu items)
  const menuItems = [
    // { label: "Find Experts", route: "/experts" },
    { label: "Video Call", route: "/expertpanel/videocall" },
    { label: "Profile", route: "/expertpanel/expertpanelprofile" },
    { label: "Expert", route: "/expertpanel/expert" },
    { label: "Dashboard", route: "/expertpanel/dashboard" },
    { label: "Payments/Reviews", route: "/expertpanel/payments" },
    { label: "Logout", route: "/" },
    { label: "Chat with Users", route: "/expertpanel/chat" },
  ];

  const activeItem = menuItems.find(item => item.route === pathname);
  const activeTab = activeItem ? activeItem.label : "Profile"; // Default value if no match

  return (
    <>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div className="md:w-[20%]">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="w-[100%] md:w-[80%] md:p-4">
          {/* <MobileNavSearch/> */}
          <Navtop activeTab={activeTab} />
          <Suspense fallback={<div>Loading expert profile...</div>}>
            <ProfileSection />
          </Suspense>
        </div>

        {/* Bottom Navigation for Mobile */}
        <div className="fixed bottom-0 left-0 right-0 md:hidden">
          <BottomNav />
        </div>
      </div>
      <div className="md:mt-3.5 hidden sm:block">
        <Footer />
      </div>
    </>
  );
};

export default Page;
