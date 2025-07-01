"use client";
import Footer from "@/components/Layout/Footer";
import Navtop from "@/components/UserPanel/NavTop/NavTopuser";
import UserProfile from "@/components/UserPanel/UserProfile/UserProfile";
import UseSidebar from "@/components/UserPanel/UseSideBar/UserSidebar";

import { usePathname } from "next/navigation";

const Page = () => {
  const pathname = usePathname();

  // Map sidebar routes to labels (must match Sidebar)
  const menuItems = [
    { label: "Expert", route: "/expertpanel/expert" },
   
  ];

  const activeMenu = menuItems.find((item) => item.route === pathname);
  const activeTab = activeMenu ? activeMenu.label : "Booking";

  return (
    <>
    <div className="flex min-h-screen">
      {/* Sidebar: visible on desktop */}
      <div className="hidden md:block w-[20%] ">
        <UseSidebar />
      </div>
      {/* Main Content: full width on mobile, 80% on desktop */}
      <div className="w-full md:w-[80%] p-4 pb-20">
        <Navtop activeTab={activeTab} />
        <UserProfile/>
      </div>
      
    </div>
<Footer/>
    </>
  );
};

export default Page;
