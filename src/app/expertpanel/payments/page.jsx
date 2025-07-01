"use client";

import React from "react";
import { usePathname } from "next/navigation"; // Import usePathname for dynamic active tab
import Sidebar from "@/components/ExpertPanel/SideBar/SideBar";
import Navtop from "@/components/ExpertPanel/Navtop/navtop";
import PaymentLogin from "@/components/ExpertPanel/ExpertloginPayment/paymentlogin";
import BottomNav from "@/components/ExpertPanel/Bottomnav/bottomnav";
import MobileNavSearch from "@/components/Layout/mobilenavsearch";

// Define Sidebar menu items with route mapping
const menuItems = [
  // { label: "Find Experts", route: "/experts" },
  { label: "Video Call", route: "/expertpanel/videocall" },
  { label: "Profile", route: "/expertpanel/expertpanelprofile" },
  { label: "Expert", route: "/expertpanel/expert" },
  { label: "Dashboard", route: "/expertpanel/dashboard" },
  { label: "Payments/Reviews", route: "/expertpanel/payments" },
  { label: "Chat with Users", route: "/expertpanel/chat" },
];

// Function Component
const Page = () => {
  const pathname = usePathname(); // Get current route dynamically

  // Find active menu item based on current pathname
  const activeMenu = menuItems.find((item) => item.route === pathname);
  const activeTab = activeMenu ? activeMenu.label : "Dashboard"; // Default to Dashboard

  return (
    <div className="flex min-h-screen">
      {/* Sidebar with 1/3 width - Hidden on mobile */}
      <div className="hidden md:block md:w-[20%]">
        <Sidebar />
      </div>

      {/* Right Side Content with 2/3 width */}
      <div className="w-full md:w-[80%] p-4">
        <div className="w-[27rem]">
        <MobileNavSearch/>
        </div>
        <Navtop activeTab={activeTab} /> {/* Pass active tab dynamically */}
        <div className="sm:block w-[25rem] md:w-full">
        <PaymentLogin />
        </div>

        {/* Bottom Navigation - Visible only on mobile */}
        <div className="fixed bottom-0 left-0 right-0 md:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  );
};

export default Page;
