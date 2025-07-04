"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PiCirclesFourLight } from "react-icons/pi";
import { GrUserExpert } from "react-icons/gr";
import { useRouter } from "next/navigation";
import {
  Video,
  User,
  Search,
  BadgeCheck,
  CreditCard,
  LogOut,
  MessageCircle,
} from "lucide-react";


const BottomNav = () => {
  const pathname = usePathname(); // Get the current route
  const router = useRouter();
  const [active, setActive] = useState(pathname || "profile");

  const handleLogout = () => {
    // Example logout logic:
    // Clear tokens or any auth data (localStorage/session/cookies)
    localStorage.removeItem("expertToken");
    sessionStorage.clear();
    // Redirect to home or login page
    router.push("/");
  };

  const navItems = [
    { label: "Book Session", icon: <GrUserExpert />, id: "book", path: "/userpanel/booksession" },
    { label: "Video", icon: <Video />, id: "video", path: "/expertpanel/videocall" },
    { label: "Profile", icon: <User />, id: "profile", path: "/expertpanel/expertpanelprofile" },
    { label: "Expert", icon: <BadgeCheck />, id: "expert", path: "/expertpanel/expert" },
    { label: "Dashboard", icon: <PiCirclesFourLight />, id: "dashboard", path: "/expertpanel/dashboard" },
    
    { label: "Logout", icon: <LogOut />, id: "logout", path: "/" },
  ];

   return (
    <div className="fixed w-full flex justify-between items-center bottom-0 left-0 right-0 bg-white shadow-lg p-2 md:hidden">
      {navItems.map((item) => (
        item.id === "logout" ? (
          <div
            key={item.id}
            onClick={handleLogout}
            className={`flex flex-col items-center cursor-pointer transition-colors ${active === item.id ? "text-red-500" : "text-gray-700"
              }`}
          >
            <div className="text-xl sm:text-2xl">{item.icon}</div>
            <span className="text-[10px] sm:text-xs font-medium leading-none mt-1">{item.label}</span>
          </div>
        ) : (
          <Link href={item.path} key={item.id} passHref>
            <div
              onClick={() => setActive(item.id)}
              className={`flex flex-col items-center cursor-pointer transition-colors ${active === item.id ? "text-red-500" : "text-gray-700"
                }`}
            >
              <div className="text-xl sm:text-2xl">{item.icon}</div>
              <span className="text-[10px] sm:text-xs font-medium leading-none mt-1">{item.label}</span>
            </div>
          </Link>
        )
      ))}
    </div>
  );
};

export default BottomNav;