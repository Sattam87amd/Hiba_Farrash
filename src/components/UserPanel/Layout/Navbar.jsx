"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Gift, Menu, X, Search, User } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SeacthExperts from "@/components/SearchExperts/SearchExperts";
import GoogleTranslateButton from "@/components/GoogleTranslateButton";


function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showSearchPage, setShowSearchPage] = useState(false); // State for search page

  // Toggle mobile menu
  const toggleMenu = () => setIsOpen(!isOpen);

  // Close mobile menu
  const closeMenu = () => setIsOpen(false);

  // Open Search Page
  const toggleSearchPage = () => {
    setShowSearchPage(true);
  };

  // Close Search Page
  const closeSearchPage = () => {
    setShowSearchPage(false);
  };

  return (
    <div className="relative">
      {/* Navbar */}
      <nav className="fixed w-full z-20 top-0 h-[96px] md:h-24 bg-white shadow-md">
        <div className="relative flex items-center justify-between h-full px-6">
          {/* Logo */}
          <Link href="/home" className="text-3xl md:text-[40px] font-semibold text-black">
            Shourk
          </Link>

          {/* Center Links */}
          <div className="hidden md:flex justify-center flex-grow items-center space-x-12 text-[19px]">
            <Link href="/expertpanel/expertlogin" className="text-black">
              Expert Login
            </Link>
            <Link href="/ourmission" className="text-black">
              About Us
            </Link>
            <button onClick={toggleSearchPage} className="text-black hover:opacity-80">
              <Search className="inline-block h-5 w-5" />
            </button>
          </div>

          {/* Right Side Elements */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/userpanel/giftsession">
              <button className="flex items-center bg-black text-white font-medium rounded-lg text-[16px] px-4 py-2">
                Gift a Session
                <Gift className="ml-2 h-5 w-5" />
              </button>
              
            </Link>
            <GoogleTranslateButton />
            <Link href="/userpanel/booksession">
              <User className="h-6 w-6 text-black cursor-pointer hover:opacity-80" />
            </Link>

            <Link href="/userpanel/userlogin">
              <button className="bg-white text-black font-medium rounded-lg text-[16px] px-4 py-2">
                Sign Up
              </button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={toggleMenu} className="md:hidden text-black p-2">
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 w-full bg-[#F8F7F3] p-4 space-y-4 shadow-md md:hidden">
            <Link href="/" className="block text-black" onClick={closeMenu}>
              Home
            </Link>
            <Link href="/expertpanel/expertlogin" className="block text-black" onClick={closeMenu}>
              Expert Login
            </Link>
            <Link href="/ourmission" className="block text-black" onClick={closeMenu}>
              About Us
            </Link>
            <button
              onClick={() => {
                toggleSearchPage();
                closeMenu();
              }}
              className="block text-black"
            >
              <Search className="inline-block h-6 w-6" />
            </button>

            <div className="flex flex-col space-y-2 mt-4">
              <button
                onClick={() => router.push("/userpanel/giftsession")}
                className="flex items-center bg-black text-white font-medium rounded-lg text-[16px] px-4 py-2 w-full"
              >
                Gift a Session
                <Gift className="ml-2 h-5 w-5" />
              </button>

              <button
                onClick={() => router.push("/profile")}
                className="flex items-center bg-white text-black border border-black font-medium rounded-lg text-[16px] px-4 py-2 w-full"
              >
                Profile
              </button>

              <button
                onClick={() => router.push("/signup")}
                className="flex items-center bg-white text-black font-medium rounded-lg text-[16px] px-4 py-2 w-full"
              >
                Sign Up
              </button>
            </div>
          </div>
        )}
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
            {/* Pass close function to SearchExperts */}
            <SeacthExperts closeSearchPage={closeSearchPage}/>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Navbar;
