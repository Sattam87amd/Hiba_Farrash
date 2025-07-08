"use client";

import { useRouter, usePathname } from "next/navigation";
import { FiSearch, FiVideo, FiLogOut, FiBook  } from "react-icons/fi";
import { CgProfile } from "react-icons/cg";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { PiCirclesFour } from "react-icons/pi";
import { GrUserExpert } from "react-icons/gr";
import { LucideDollarSign, LucideBadgeCheck } from "lucide-react";
import Image from "next/image";

const UserSidebar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { label: "Book Session", icon: <GrUserExpert />, route: "/userpanel/booksession" },
    { label: "Video Call", icon: <FiVideo />, route: "/userpanel/videocall" },
    {
      label: "Profile",
      icon: <CgProfile />,
      route: "/userpanel/userpanelprofile",
    },
   
  ];

  const handleClick = (itemRoute) => {
    router.push(itemRoute);
  };

  return (
    <div className="hidden md:block w-full bg-white h-full overflow-hidden shadow-lg ">
      {/* Logo Section */}
      <div className="p-4 mt-5 flex justify-center">
        {/* <Image
          src="/Frame.png.png"
          alt="Nexcore Logo"
          width={100}
          height={30}
        /> */}
        <Image
         src="/HomeImg/Hiba_logo.svg" 
         alt="Nexcore Logo" 
         width={140} 
         height={70} 
         onClick={() => router.push('/')}
         className="constrant-125 mt-2 cursor-pointer" />
      </div>

      {/* Sidebar Menu */}
      <ul className="flex flex-col space-y-6 px-6 text-lg flex-grow">
        {menuItems.map(({ label, icon, route }) => {
          const isActive = pathname === route;
          return (
            <li
              key={label}
              className={`p-3 rounded-lg cursor-pointer flex items-center space-x-3 ${
                isActive ? "bg-black text-white" : "hover:bg-gray-100"
              }`}
              onClick={() => handleClick(route)}
            >
              <span className="text-lg">{icon}</span>
              <span className="text-md">{label}</span>
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
            className="w-52 mt-12 h-auto"
          />
        </div>
        <button
          onClick={() => router.push("/contactus")}
          className="absolute bottom-[30px] px-14 py-3 bg-black text-white text-sm rounded-md hover:bg-gray-800"
        >
          Get Help
        </button>
      </div>
    </div>
  );
};

export default UserSidebar;
