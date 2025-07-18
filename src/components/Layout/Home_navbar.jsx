"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Gift, Menu, X, Search, User } from "lucide-react";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CiGlobe } from "react-icons/ci";

// Utility function to detect RTL - simplified for pure Arabic
function detectRTL() {
  if (typeof window === 'undefined') return true; // Default to RTL for Arabic
  
  // Always return true for pure Arabic layout
  return true;
}

function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showSearchPage, setShowSearchPage] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Initialize RTL state immediately with synchronous detection
  const [isRTL, setIsRTL] = useState(true); // Always RTL for pure Arabic

  // Initialize RTL state on client-side mount
  useEffect(() => {
    // Set the initial RTL state immediately on mount - always true for Arabic
    setIsRTL(true);
    setIsLoaded(true);
  }, []);

  // Toggle mobile menu
  const toggleMenu = () => setIsOpen(!isOpen);

  // Close mobile menu
  const closeMenu = () => setIsOpen(false);

  // Open Search Page
  const toggleSearchPage = () => {
    setShowSearchPage(true);
    setIsOpen(false);
  };

  // Close Search Page
  const closeSearchPage = () => {
    setShowSearchPage(false);
  };

  // Handle Gift a Session click
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

  // Handle user sign up/login click
  const handleUserSignUp = () => {
    try {
      const userToken = localStorage.getItem("userToken");
      if (userToken) {
        router.push("/userpanel/booksession");
      } else {
        router.push("/userpanel/userlogin");
      }
    } catch (error) {
      console.error("Error checking user token:", error);
      router.push("/userpanel/userlogin");
    }
  };

  // Handle expert login
  const handleExpertRedirect = () => {
    try {
      const expertToken = localStorage.getItem("expertToken");

      if (!expertToken) {
        router.push("/expertpanel/expertlogin");
        return;
      }

      try {
        const parts = expertToken.split(".");
        if (parts.length !== 3) {
          throw new Error("Invalid token format");
        }

        const payload = parts[1];
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

        if (status === "Pending") {
          router.push("/reviewingexpertpanel/expertpanelprofile");
        } else {
          router.push("/expertpanel/expertpanelprofile");
        }
      } catch (error) {
        console.error("Error processing expert token:", error.message);
        localStorage.removeItem("expertToken");
        router.push("/joinasexpert");
      }
    } catch (error) {
      console.error("Error accessing local storage:", error);
      router.push("/joinasexpert");
    }
  };

  // Don't render until we've determined the RTL state to prevent layout shift
  if (!isLoaded) {
    return (
      <nav className="fixed w-full z-50 top-0 h-20 md:h-24 bg-white border-b border-gray-200">
        <div className="w-full mx-auto flex items-center justify-between h-full px-4 md:px-8">
          {/* Skeleton loading state */}
          <div className="hidden md:flex items-center gap-6">
            <div className="w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-20 h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
          
          <div className="hidden md:block absolute top-[-40px] left-1/2 transform -translate-x-1/2 mt-7">
            <Image
              src="/HomeImg/Hiba logo.webp"
              alt="Hiba Logo"
              width={120}
              height={110}
              priority
            />
          </div>
          
          <div className="hidden md:flex items-center gap-3">
            <div className="w-20 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="w-24 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="w-16 h-8 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <div className="relative" dir="rtl">
      <nav className="fixed w-full z-50 top-0 h-20 md:h-24 bg-white border-b border-gray-200">
        <div className="w-full mx-auto flex items-center justify-between h-full px-4 md:px-8">
          
          {/* Right side - Navigation Links (shows on left in RTL) */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={handleExpertRedirect}
              className="text-black hover:text-gray-700 transition text-lg font-medium whitespace-nowrap"
              type="button"
            >
              تسجيل دخول الخبير
            </button>
            <Link
              href="https://hiba-farrash.com/"
              className="text-black hover:text-gray-700 transition text-lg font-medium flex items-center gap-2 whitespace-nowrap"
            >
              <CiGlobe size={20} />
              <span>موقع هبة</span>
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

          {/* Center Logo with absolute positioning like English version */}
          <div className="hidden md:block absolute top-[-40px] left-1/2 transform -translate-x-1/2 mt-7 cursor-pointer">
            <a href="https://hibafarrash.shourk.com/">
              <Image
                src="/HomeImg/Hiba logo.webp"
                alt="Hiba Logo"
                width={120}
                height={110}
                priority
              />
            </a>
          </div> 

          {/* Left side - Action Buttons (shows on right in RTL) */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={handleGiftSession}
              className="flex items-center bg-black text-white rounded-full text-sm px-5 py-2 hover:bg-gray-900 transition whitespace-nowrap"
              type="button"
            >
              <Gift className="ml-2 h-5 w-5" />
              <span>أهدي جلسة</span>
            </button>
           
            <Link
              href="/"
              className="flex items-center bg-black text-white rounded-full text-sm px-5 py-2 hover:bg-gray-800 transition whitespace-nowrap"
            >
              <CiGlobe className="ml-2 h-4 w-4" />
              <span>إنجليزي</span>
            </Link>
            
            <button
              onClick={handleUserSignUp}
              className="border border-black text-black rounded-full text-sm px-5 py-2 hover:bg-gray-100 transition whitespace-nowrap"
              type="button"
            >
              اشتراك
            </button>
          </div>

          {/* Mobile Navbar: Hamburger + Logo */}
          <div className="md:hidden flex items-center justify-between w-full">
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

            <Image
              src="/HomeImg/Hiba logo.webp"
              alt="Hiba Logo"
              width={80}
              height={80}
              className="cursor-pointer h-20 w-auto md:h-10"
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
              className="absolute top-full w-full bg-[#F8F7F3] p-4 space-y-4 shadow-md md:hidden"
            >
              <Link href="/" className="block text-black text-right" onClick={closeMenu}>
                الرئيسية
              </Link>
              <button
                onClick={() => {
                  handleExpertRedirect();
                  closeMenu();
                }}
                className="block text-black text-right w-full"
                type="button"
              >
                تسجيل دخول الخبير
              </button>
              <Link
                href="https://hiba-farrash.com/"
                className="block text-black text-right"
                onClick={closeMenu}
              >
                موقع هبة
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
                  <Gift className="ml-2 h-5 w-5" />
                  <span>أهدي جلسة</span>
                </button>
                
                <Link
                  href="/"
                  className="flex items-center justify-center bg-black text-white font-medium rounded-lg text-[16px] px-4 py-2 w-full"
                  onClick={closeMenu}
                >
                  <CiGlobe className="ml-2 h-5 w-5" />
                  <span>إنجليزي</span>
                </Link>
                
                <button
                  onClick={() => {
                    handleUserSignUp();
                    closeMenu();
                  }}
                  className="flex items-center justify-center bg-white text-black font-medium rounded-lg text-[16px] px-4 py-2 w-full"
                  type="button"
                >
                  اشتراك
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
            <SeacthExperts closeSearchPage={closeSearchPage} isRTL={isRTL} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Navbar;