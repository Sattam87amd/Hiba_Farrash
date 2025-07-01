"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PiCirclesFourLight } from "react-icons/pi";
import { Video, User, Search, BadgeCheck } from "lucide-react";

const UserBottomNav = () => {
  const pathname = usePathname(); // Get the current route
  const [active, setActive] = useState(pathname || "profile"); // Default active based on current route

  const navItems = [
    { label: "Search", icon: <Search />, id: "search", path: "/userpanel/userpanelprofile" },
    { label: "Video", icon: <Video />, id: "video", path: "/userpanel/videocall" },
    { label: "Profile", icon: <User />, id: "profile", path: "/userpanel/userpanelprofile" },
  ];

  return (
    <div className=" w-full fixed bottom-0 left-0 right-0 bg-white shadow-lg p-2 flex justify-around items-center border-t sm:flex md:hidden">
      {navItems.map((item) => (
        <Link href={item.path} key={item.id} passHref>
          <div
            onClick={() => setActive(item.id)}
            className={`flex flex-col items-center cursor-pointer transition-colors ${
              active === item.id ? "text-red-500" : "text-gray-700"
            }`}
          >
            <div className="text-xl sm:text-2xl">{item.icon}</div>
            <span className="text-[10px] sm:text-xs font-medium leading-none mt-1">{item.label}</span>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default UserBottomNav;
