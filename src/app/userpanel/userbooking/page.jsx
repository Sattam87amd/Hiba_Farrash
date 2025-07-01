"use client";
import UserSidebar from "@/components/UserPanel/UseSideBar/UserSidebar";
import { usePathname } from "next/navigation";
import Footer from "@/components/UserPanel/Layout/Footer";
import Navtop from "@/components/UserPanel/NavTop/NavTopuser";
import UserBottomNav from "@/components/UserPanel/UserBottomNav/UserBottomNav";
import UserBooking from "@/components/UserPanel/UserBooking/UserBooking";

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
      
      <div className="hidden md:block w-[20%] -mt-5">
        <UserSidebar/>
      </div>
      {/* Main Content: full width on mobile, 80% on desktop */}
      <div className="w-full md:w-[80%] p-4 pb-20">
        <Navtop activeTab={activeTab} />
        <UserBooking/>
        <UserBottomNav/>
      </div>
      
    </div>
    <Footer/>
    </>
  );
};

export default Page;
