"use client";
import React, { useState, useEffect } from "react";
import { IoPersonOutline } from "react-icons/io5"; // Profile icon
import { Gift } from "lucide-react"; // Gift icon
import { FaSearch } from "react-icons/fa"; // Search icon
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SearchExperts from "@/components/SearchExperts/SearchExperts";
import GoogleTranslateButton from "@/components/GoogleTranslateButton"; // Import translate button

const NavSearch = () => {
  const [showSearchPage, setShowSearchPage] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [expertToken, setExpertToken] = useState(null);
  const [expertStatus, setExpertStatus] = useState(""); // To track expert status
  const pathname = usePathname(); // Get current path
  
  useEffect(() => {
    // Check for both user and expert tokens
    const userToken = localStorage.getItem("userToken");
    const expertTokenFromStorage = localStorage.getItem("expertToken");
    
    setIsLoggedIn(!!userToken);
    setExpertToken(expertTokenFromStorage);
    
    // If expert token exists, try to decode it to get status
    if (expertTokenFromStorage) {
      try {
        const tokenPayload = JSON.parse(atob(expertTokenFromStorage.split('.')[1]));
        setExpertStatus(tokenPayload.status);
      } catch (e) {
        console.error("Error parsing token:", e);
      }
    }
  }, []);

  const toggleSearchPage = () => {
    setShowSearchPage(true);
  };

  const closeSearchPage = () => {
    setShowSearchPage(false);
  };
  
  // Determine profile link based on path and authentication
  const getProfileLink = () => {
    // Check if we're in reviewing expert panel path
    if (pathname.startsWith("/reviewingexpertpanel")) {
      return "/reviewingexpertpanel/expertpanelprofile";
    }
    
    // If expert is logged in and pending
    if (expertToken && expertStatus === "Pending") {
      return "/reviewingexpertpanel/expertpanelprofile";
    }
    
    // If expert is logged in and approved
    if (expertToken) {
      return "/expertpanel/expertpanelprofile";
    }
    
    // If regular user is logged in
    if (isLoggedIn) {
      return "/userpanel/profile";
    }
    
    // Default case - not logged in
    return "/userlogin";
  };

  return (
    <div className="hidden md:block bg-[#F8F7F3] px-4 py-4 relative">
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between w-full mb-6"
      >
        <Link
          href="/"
          className="text-3xl md:text-[40px] font-semibold text-black m-3"
        >
          Shourk
        </Link>

        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center bg-white rounded-2xl px-4 py-2 w-full max-w-2xl mx-4 shadow-lg cursor-pointer"
          onClick={toggleSearchPage}
        >
          <input
            type="text"
            placeholder="Search Expert...."
            className="flex-grow outline-none text-gray-700 placeholder:text-gray-400 text-lg"
            onClick={toggleSearchPage}
            readOnly
          />
          <button className="text-black hover:opacity-80 pb-1">
            <FaSearch className="inline-block h-8 w-5" />
          </button>
        </motion.div>

        <div className="flex items-center space-x-6">
          <motion.div whileHover={{ scale: 1.2 }}>
            <Link href="/giftsession">
              <Gift className="w-10 h-10 text-black cursor-pointer" />
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.2 }}>
            <Link href={getProfileLink()}>
              <IoPersonOutline className="text-4xl text-black font-semibold cursor-pointer" />
            </Link>
          </motion.div>

          {/* Google Translate Button */}
          <motion.div whileHover={{ scale: 1.1 }}>
            <GoogleTranslateButton />
          </motion.div>
        </div>
      </motion.nav>

      {/* Search Page Transition */}
      <AnimatePresence>
        {showSearchPage && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-white z-50 overflow-auto"
          >
            <SearchExperts closeSearchPage={closeSearchPage} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NavSearch;