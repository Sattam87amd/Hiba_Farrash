"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Gift, Menu, X, Search, User } from "lucide-react";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CiGlobe } from "react-icons/ci";

function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showSearchPage, setShowSearchPage] = useState(false);

  // Toggle mobile menu
  const toggleMenu = () => setIsOpen(!isOpen);

  // Close mobile menu
  const closeMenu = () => setIsOpen(false);

  // Open Search Page
  const toggleSearchPage = () => {
    setShowSearchPage(true);
    // Close mobile menu when search is opened
    setIsOpen(false);
  };

  // Close Search Page
  const closeSearchPage = () => {
    setShowSearchPage(false);
  };

  // Handle Gift a Session click - Updated to redirect to dedicated gift card page
  const handleGiftSession = () => {
    try {
      const userToken = localStorage.getItem("userToken");
      if (userToken) {
        router.push("/userpanel/userpanelprofile?tab=giftcard");
      } else {
        router.push("/giftcard");
      }
    } catch (error) {
      console.error("Error navigating to gift card page:", error);
      router.push("/giftcard");
    }
  };

  // Handle user sign up/login click with better error handling
  const handleUserSignUp = () => {
    try {
      const userToken = localStorage.getItem("userToken");
      if (userToken) {
        // If token exists, redirect to user panel
        router.push("/userpanel/booksession");
      } else {
        // If no token, redirect to login page
        router.push("/userpanel/userlogin");
      }
    } catch (error) {
      console.error("Error checking user token:", error);
      // Handle local storage access issues
      router.push("/userpanel/userlogin");
    }
  };

  // Handle expert login with better token validation
  const handleExpertRedirect = () => {
    try {
      const expertToken = localStorage.getItem("expertToken");

      if (!expertToken) {
        router.push("/expertpanel/expertlogin");
        return;
      }

      try {
        // Split the token and decode with more robust error handling
        const parts = expertToken.split(".");
        if (parts.length !== 3) {
          // Not a valid JWT format
          throw new Error("Invalid token format");
        }

        // Decode payload
        const payload = parts[1];
        // Convert Base64Url to Base64 and decode
        const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
        let decodedPayload;

        try {
          decodedPayload = atob(base64);
        } catch (e) {
          throw new Error("Invalid base64 encoding");
        }

        let payloadObj;
        try {
          payloadObj = JSON.parse(decodedPayload);
        } catch (e) {
          throw new Error("Invalid JSON in token payload");
        }

        const status = payloadObj.status;

        // Redirect based on expert's approval status
        if (status === "Pending") {
          router.push("/reviewingexpertpanel/expertpanelprofile");
        } else {
          router.push("/expertpanel/expertpanelprofile");
        }
      } catch (error) {
        console.error("Error processing expert token:", error.message);
        // Clear invalid token
        localStorage.removeItem("expertToken");
        router.push("/joinasexpert");
      }
    } catch (error) {
      console.error("Error accessing local storage:", error);
      router.push("/joinasexpert");
    }
  };

const handleArabicRedirect = () => {
  // Store 'rtl' in localStorage to persist the direction across pages
  localStorage.setItem('direction', 'rtl');

  // Set the direction to 'rtl' for Arabic pages
  document.documentElement.setAttribute('dir', 'rtl');

  // Redirect to the Arabic page
  window.location.href = "/ar";
};



  return (
    <div className="relative">
      <nav
        className={`fixed w-full z-50 top-0 h-20 md:h-24 bg-white border-b border-gray-200 `}
      >
        <div className="w-full mx-auto flex items-center justify-between h-full px-4 md:px-8">
          {/* Left Group (3 items) */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={handleExpertRedirect}
              className="text-black hover:text-gray-700 transition text-lg font-medium"
              type="button"
            >
              Expert Login
            </button>
            <Link
              href="https://hiba-farrash.com/"
              className="text-black hover:text-gray-700 transition text-lg font-medium flex items-center gap-2"
            >
              <CiGlobe size={20} />
              <span>Hiba's Website</span>
            </Link>
            <button
              onClick={toggleSearchPage}
              className="text-black hover:text-gray-700 p-2"
              type="button"
              aria-label="Search"
            >
              {/* <Search className="h-6 w-6" /> */}
            </button>
          </div>

          <div className="hidden md:block absolute top-[-40px] left-1/2 transform -translate-x-1/2 mt-7 cursor cursor-pointer">
            <a href="https://hibafarrash.shourk.com/">
              <img
                src="/HomeImg/Hiba logo.webp"
                alt="Top Decorative Element"
                width={120}
                height={110}
                priority
              />
            </a>
          </div> 

          {/* Right Group (3 items) */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={handleGiftSession}
              className="flex items-center bg-black text-white rounded-full text-sm px-5 py-2 hover:bg-gray-900 transition"
              type="button"
            >
              <span>Gift a Session</span>
              <Gift className="ml-2 h-5 w-5" />
            </button>
            <button
              onClick={handleArabicRedirect}
              className="flex items-center border bg-black border-black text-white rounded-full text-sm px-5 py-2 hover:bg-gray-900 transition"
              type="button"
            > <CiGlobe className="mr-2 h-5 w-5" />
              <span>العربية</span>
            </button>
            <button
              onClick={handleUserSignUp}
              className="border border-black text-black rounded-full text-sm px-5 py-2 hover:bg-gray-100 transition"
              type="button"
            >
              Sign Up
            </button>
          </div>

          {/* Mobile Navbar: Left Hamburger + Right Logo */}
          <div className="md:hidden flex items-center justify-between w-full">
            {/* Hamburger */}
            <button 
              onClick={toggleMenu} 
              className="text-black p-2"
              type="button"
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>

            {/* Logo on the right */}
            <img
              src="/HomeImg/Hiba logo.webp"
              alt="Hiba Logo"
              className="h-20 w-auto md:h-10"
            />
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className={`absolute top-full left-0 w-full bg-[#F8F7F3] p-4 space-y-4 shadow-md md:hidden text-left`}
            >
              <Link href="/" className="block text-black" onClick={closeMenu}>
                Home
              </Link>
              <button
                onClick={handleExpertRedirect}
                className="block text-black w-full text-left"
                type="button"
              >
                Expert Login
              </button>
              <Link
                href="https://hiba-farrash.com/"
                className="block text-black"
                onClick={closeMenu}
              >
                Hiba's Website
              </Link>

              <div className="flex flex-col space-y-2 mt-4">
                <button
                  onClick={() => {
                    handleGiftSession();
                    closeMenu();
                  }}
                  className="flex items-center justify-center bg-black text-white font-medium rounded-lg text-[16px] px-4 py-2 w-full"
                  type="button"
                >
                  <span>Gift a Session</span>
                  <Gift className="ml-2 h-5 w-5" />
                </button>
                
                {/* Arabic Page Button for mobile menu */}
                <button
                  onClick={() => {
                    handleArabicRedirect();
                    closeMenu();
                  }}
                  className="flex items-center justify-center border border-black text-black font-medium rounded-lg text-[16px] px-4 py-2 w-full"
                  type="button"
                >
                  العربية
                </button>
                
                <button
                  onClick={() => {
                    handleUserSignUp();
                    closeMenu();
                  }}
                  className="flex items-center justify-center bg-white text-black font-medium rounded-lg text-[16px] px-4 py-2 w-full"
                  type="button"
                >
                  Sign Up
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

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
            {/* Pass closeSearchPage function to SearchExperts */}
            <SeacthExperts closeSearchPage={closeSearchPage} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Navbar;