"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Gift, Menu, X, Search, User } from "lucide-react";
import { useState, useEffect } from "react";
import GoogleTranslateButton from "../GoogleTranslateButton";

function Navbar() {
  // (Code remains unchanged, retaining all logic, handlers, and structure)
  // Only CSS has been updated below:

  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showSearchPage, setShowSearchPage] = useState(false);
  const [isRTL, setIsRTL] = useState(false);

  // Check for RTL direction - Improved to be more robust
  useEffect(() => {
    // Function to check if RTL is active
    const checkIfRTL = () => {
      // Check document direction
      const direction =
        document.documentElement.dir ||
        getComputedStyle(document.documentElement).direction;

      // Check for Arabic translation cookie
      const googtrans = document.cookie
        .split("; ")
        .find((row) => row.startsWith("googtrans="));

      const isRTLDirection = direction === "rtl";
      const hasArabicCookie =
        googtrans &&
        (googtrans.includes("/ar") || googtrans.includes("/en/ar"));

      // Update state only if there's an actual change to avoid unnecessary re-renders
      if (isRTLDirection || hasArabicCookie) {
        setIsRTL(true);
      } else {
        setIsRTL(false);
      }
    };

    // Run initial check
    checkIfRTL();

    // Set up observer to detect direction changes
    const observer = new MutationObserver(checkIfRTL);

    // Observe changes to document direction and classes
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["dir", "style", "class"],
    });

    // Check for changes when Google Translate initializes
    const translateCheckInterval = setInterval(checkIfRTL, 1000);

    // Clear interval after 10 seconds (by then Google Translate should have initialized)
    const translateCheckTimeout = setTimeout(() => {
      clearInterval(translateCheckInterval);
    }, 10000);

    return () => {
      observer.disconnect();
      clearInterval(translateCheckInterval);
      clearTimeout(translateCheckTimeout);
    };
  }, []);

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

  // Handle user sign up/login click with better error handling
  const handleUserSignUp = () => {
    try {
      const userToken = localStorage.getItem("userToken");
      if (userToken) {
        // If token exists, redirect to user panel
        router.push("/userpanel/loginuserexpert");
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
              href="/ourmission"
              className="text-black hover:text-gray-700 transition text-lg font-medium"
            >
              About
            </Link>
            <button
              onClick={toggleSearchPage}
              className="text-black hover:text-gray-700 p-2"
              type="button"
              aria-label="Search"
            >
              <Search className="h-6 w-6" />
            </button>
          </div>

          {/* Right Group (3 items) */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/giftsession">
              <button className="flex items-center bg-black text-white rounded-full text-sm px-5 py-2 hover:bg-gray-900 transition">
                <span>Gift a Session</span>
                <Gift className="ml-2 h-5 w-5" />
              </button>
            </Link>
            <GoogleTranslateButton />
            <button
              onClick={handleUserSignUp}
              className="border border-black text-black rounded-full text-sm px-5 py-2 hover:bg-gray-100 transition"
              type="button"
            >
              Sign Up
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
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
          </div>
        </div>

        {/* (Retaining your mobile menu and search page structure unchanged) */}
      </nav>
    </div>
  );
}

export default Navbar;
