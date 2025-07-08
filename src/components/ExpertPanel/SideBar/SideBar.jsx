"use client";

import { useRouter, usePathname } from "next/navigation";
import { FiSearch, FiVideo, FiLogOut } from "react-icons/fi";
import { CgProfile } from "react-icons/cg";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { PiCirclesFour } from "react-icons/pi";
import { LucideDollarSign, LucideBadgeCheck } from "lucide-react";
import Image from "next/image";

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname(); // Can be undefined briefly

  const menuItems = [
    // { label: "Find Experts", icon: <FiSearch />, route: "/expertpanel/experts" },
    { label: "Video Call", icon: <FiVideo />, route: "/expertpanel/videocall" },
    { label: "Profile", icon: <CgProfile />, route: "/expertpanel/expertpanelprofile" },
    { label: "Expert", icon: <LucideBadgeCheck />, route: "/expertpanel/expert" },
    { label: "Dashboard", icon: <PiCirclesFour />, route: "/expertpanel/dashboard" },
    { label: "Payments/Reviews", icon: <LucideDollarSign />, route: "/expertpanel/payments" },
    { label: "Chat with Users", icon: <IoChatbubbleEllipsesOutline />, route: "/expertpanel/userchat" },
    // { label: "Chat with Expert", icon: <IoChatbubbleEllipsesOutline />, route: "/expertpanel/expertchat" },
    { label: "Logout", icon: <FiLogOut />, route: "/" }, // logout action
  ];

  const handleClick = (item) => {
    if (item.label === "Logout") {
      localStorage.clear();
      router.push(item.route);
    } else {
      router.push(item.route);
    }
  };

  return (
    <div className="hidden md:block w-full bg-white shadow-md h-[99.5%]">
      {/* Logo Section */}
      <div className="p-4 mt-5 flex justify-center">
        {/* <Image src="/Frame.png.png" alt="Nexcore Logo" width={100} height={30} /> */}
        <Image
        onClick={()=>router.push('/')}
        src="/HomeImg/Hiba_logo.svg" alt="Hiba Logo" width={120} height={60} className="constrant-125 " />
      </div>

      {/* Sidebar Menu */}
      <ul className="flex flex-col space-y-6 px-6 text-lg flex-grow">
        {menuItems.map((item) => {
          const isActive = pathname && pathname === item.route; // ✅ Protect against undefined pathname

          return (
            <li
              key={item.label}
              className={`p-3 rounded-lg cursor-pointer flex items-center space-x-3 ${
                isActive ? "bg-black text-white" : "hover:bg-gray-100"
              }`}
              onClick={() => handleClick(item)}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-md">{item.label}</span>
            </li>
          );
        })}
      </ul>

      {/* Profile Image Section */}
      <div className="p-4 flex flex-col items-center relative">
        <div className="relative flex justify-center">
          <Image
            src="/group1.png"
            alt="Profile"
            width={120}
            height={120}
            className="w-52 h-auto"
          />
        </div>
        <button
          onClick={() => router.push("/conatctus")}
          className="absolute bottom-[30px] px-14 py-3 bg-black text-white text-sm rounded-md hover:bg-gray-800"
        >
          Get Help
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
