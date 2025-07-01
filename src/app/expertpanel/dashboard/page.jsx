"use client";

import Sidebar from "@/components/ExpertPanel/SideBar/SideBar";
import Dashboard from "@/components/ExpertPanel/Dashboard/Dashboard";
import CouponUserCount from "@/components/ExpertPanel/Dashboard/CouponUserCount";
import Navtop from "@/components/ExpertPanel/Navtop/navtop";
import { usePathname } from "next/navigation";
import MobileNavSearch from "@/components/Layout/mobilenavsearch";
import BottomNav from "@/components/ExpertPanel/Bottomnav/bottomnav";

const Page = () => {
  const pathname = usePathname();

  // Map sidebar routes to labels (must match Sidebar)
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

  const activeMenu = menuItems.find((item) => item.route === pathname);
  const activeTab = activeMenu ? activeMenu.label : "Dashboard";

  return (
    <div className="flex min-h-screen">
      {/* Sidebar: visible on desktop */}
      <div className="hidden md:block w-[20%]">
        <Sidebar />
      </div>
      {/* Main Content: full width on mobile, 80% on desktop */}
      <div className="w-[100%] md:w-[80%] md:p-4 pb-20">
        <BottomNav/>
        <MobileNavSearch/>
        <Navtop activeTab={activeTab} />
        <Dashboard activeTab={activeTab} />
        <CouponUserCount />
      </div>
    </div>
  );
};

export default Page;
