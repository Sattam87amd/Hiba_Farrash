"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Gift, Menu, X, Search, User } from "lucide-react";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CiGlobe } from "react-icons/ci";

// Utility function to detect RTL synchronously
function detectRTL() {
  if (typeof window === 'undefined') return false;
  
  // Check document direction immediately
  const direction = document.documentElement.dir || getComputedStyle(document.documentElement).direction;
  
  // Check Google Translate cookie synchronously
  const getCookie = (name) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  const googtrans = getCookie('googtrans');
  const hasArabicCookie = googtrans && (googtrans.includes("/ar") || googtrans.includes("/en/ar"));
  
  return direction === "rtl" || hasArabicCookie;
}

function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showSearchPage, setShowSearchPage] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Initialize RTL state immediately with synchronous detection
  const [isRTL, setIsRTL] = useState(false);

  // Initialize RTL state on client-side mount
  useEffect(() => {
    // Set the initial RTL state immediately on mount
    const initialRTL = detectRTL();
    setIsRTL(initialRTL);
    setIsLoaded(true);
    
    // Set up observers for RTL changes
    const checkIfRTL = () => {
      const newRTL = detectRTL();
      setIsRTL(prevIsRTL => {
        if (prevIsRTL !== newRTL) {
          return newRTL;
        }
        return prevIsRTL;
      });
    };

    // Set up observer for direction changes
    const observer = new MutationObserver(() => {
      clearTimeout(window.rtlCheckTimeout);
      window.rtlCheckTimeout = setTimeout(checkIfRTL, 200);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["dir", "style", "class"],
    });

    // Check for Google Translate changes less frequently
    const translateCheckInterval = setInterval(checkIfRTL, 2000);

    // Clear interval after 10 seconds
    const translateCheckTimeout = setTimeout(() => {
      clearInterval(translateCheckInterval);
    }, 10000);

    return () => {
      observer.disconnect();
      clearInterval(translateCheckInterval);
      clearTimeout(translateCheckTimeout);
      if (window.rtlCheckTimeout) {
        clearTimeout(window.rtlCheckTimeout);
      }
    };
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
        <div className="w-full mx-auto flex items-center h-full px-4 md:px-8" style={{ justifyContent: 'space-between' }}>
          {/* Skeleton loading state */}
          <div className="hidden md:flex items-center gap-6">
            <div className="w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-20 h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
          
          <div className="absolute left-1/2 transform -translate-x-1/2" style={{ top: '-40px', marginTop: '28px' }}>
            <Image
              src="/HomeImg/Hiba logo.webp"
              alt="Top Decorative Element"
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
          
          <div className="md:hidden flex items-center w-full" style={{ justifyContent: 'space-between' }}>
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
            <Image
              src="/HomeImg/Hiba logo.webp"
              alt="Hiba Logo"
              width={80}
              height={80}
              className="md:h-10"
            />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <div className="relative">
      <nav
        className={`fixed w-full z-50 top-0 h-20 md:h-24 bg-white border-b border-gray-200 rtl-navbar ${isRTL ? 'rtl-mode' : ''} ${isLoaded ? 'loaded' : ''}`}
      >
        <div className={`w-full mx-auto flex items-center h-full px-4 md:px-8 desktop-navbar ${isRTL ? 'rtl-layout' : ''}`} style={{ justifyContent: 'space-between' }}>
          {/* Left Group (3 items) - becomes right group in RTL */}
          <div className={`hidden md:flex items-center gap-6 desktop-left-group ${isRTL ? 'navbar-content order-3' : 'order-1'}`}>
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

          {/* Center Logo */}
          <div className={`hidden md:block absolute left-1/2 transform -translate-x-1/2 cursor-pointer navbar-image center-logo order-2`} style={{ top: '-40px', marginTop: '28px' }}>
            <a href="https://hibafarrash.shourk.com/">
              <Image
                src="/HomeImg/Hiba logo.webp"
                alt="Top Decorative Element"
                width={120}
                height={110}
                priority
              />
            </a>
          </div> 

          {/* Right Group (3 items) - becomes left group in RTL */}
          <div className={`hidden md:flex items-center gap-3 desktop-right-group ${isRTL ? 'navbar-buttons order-1' : 'order-3'}`}>
            <button
              onClick={handleGiftSession}
              className="flex items-center bg-black text-white rounded-full text-sm px-5 py-2 hover:bg-gray-900 transition whitespace-nowrap"
              type="button"
            >
              <span>أهدي جلسة</span>
              <Gift className="ml-2 h-5 w-5" />
            </button>
            <Link
              href="/"
              className="flex items-center bg-black text-white rounded-full text-sm px-5 py-2 hover:bg-gray-800 transition whitespace-nowrap"
            >
              <CiGlobe className="mr-2 h-4 w-4" />
              <span>الإنجليزية</span>
            </Link>
            <button
              onClick={handleUserSignUp}
              className="border border-black text-black rounded-full text-sm px-5 py-2 hover:bg-gray-100 transition whitespace-nowrap"
              type="button"
            >
              تسجيل
            </button>
          </div>

          {/* Mobile Navbar: Hamburger + Logo */}
          <div className={`md:hidden flex items-center w-full ${isRTL ? 'flex-row-reverse' : ''}`} style={{ justifyContent: 'space-between' }}>
            <button 
              onClick={toggleMenu} 
              className={`text-black p-2 mobile-hamburger`}
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
              className="md:h-10 mobile-logo"
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
              className={`absolute top-full w-full bg-[#F8F7F3] p-4 space-y-4 shadow-md md:hidden mobile-menu dropdown-menu motion-div ${isRTL ? 'right-0 text-right' : 'left-0 text-left'}`}
            >
              <Link href="/" className="block text-black" onClick={closeMenu}>
                الرئيسية
              </Link>
              <Link href="/userpanel/booksession"
                className={`block text-black w-full ${isRTL ? 'text-right' : 'text-left'}`}
                type="button"
              >
                تسجيل دخول الخبير
              </Link>
              <Link
                href="https://hiba-farrash.com/"
                className="block text-black"
                onClick={closeMenu}
              >
                موقع هبة
              </Link>

              <div className={`flex flex-col space-y-2 mt-4 mobile-menu-buttons ${isRTL ? 'rtl-buttons' : ''}`}>
                <button
                  onClick={() => {
                    handleGiftSession();
                    closeMenu();
                  }}
                  className={`flex items-center justify-center bg-black text-white font-medium rounded-lg text-[16px] px-4 py-2 w-full ${isRTL ? 'flex-row-reverse' : ''}`}
                  type="button"
                >
                  {isRTL ? (
                    <>
                      <Gift className="ml-2 h-5 w-5" />
                      <span>أهدي جلسة</span>
                    </>
                  ) : (
                    <>
                      <span>أهدي جلسة</span>
                      <Gift className="ml-2 h-5 w-5" />
                    </>
                  )}
                </button>
                
                <Link
                  href="/"
                  className="flex items-center justify-center bg-black text-white font-medium rounded-lg text-[16px] px-4 py-2 w-full"
                  onClick={closeMenu}
                >
                  <CiGlobe className="mr-2 h-5 w-5" />
                  <span>English</span>
                </Link>
                
                <button
                  onClick={() => {
                    handleUserSignUp();
                    closeMenu();
                  }}
                  className="flex items-center justify-center bg-white text-black font-medium rounded-lg text-[16px] px-4 py-2 w-full"
                  type="button"
                >
                  تسجيل
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
            className={`fixed inset-0 bg-white z-50 overflow-auto search-page ${isRTL ? 'rtl-search' : ''}`}
          >
            <SeacthExperts closeSearchPage={closeSearchPage} isRTL={isRTL} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Navbar;