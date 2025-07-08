"use client";

import React, { useState } from "react";
import {
  FaSearch,
  FaGift,
  FaUser,
  FaFilter,
  FaArrowLeft,
} from "react-icons/fa";
import { useRouter } from "next/navigation"; // Import useRouter for navigation
import { RiArrowLeftSLine } from "react-icons/ri";
import { motion, AnimatePresence } from "framer-motion";
import SearchExperts from "../SearchExperts/SearchExperts";
// import { useNavigate } from "react-router-dom";

const MobileNavSearch = () => {
  const [showFilter, setShowFilter] = useState(false);
  const [activeBrand, setActiveBrand] = useState(null);
  const [activeFeature, setActiveFeature] = useState(null);
  const router = useRouter();

  // Filter Data
  const brands = [
    "Name",
    "Name",
    "Name",
    "Name",
    "Name",
    "Name",
    "Name",
    "Name",
  ];
  const features = [
    "Name",
    "Name",
    "Name",
    "Name",
    "Name",
    "Name",
    "Name",
    "Name",
  ];

  // Category Data with Links
  const categories = [
    { title: "Top Experts", image: "/topexperts.png", link: "/topexperts" },
    { title: "Home", image: "/home.png", link: "/home-experts" },
    {
      title: "Career & Business",
      image: "/career-business.png",
      link: "/career&businessexperts",
    },
    {
      title: "Style & Beauty",
      image: "/style-beauty.png",
      link: "/style&beautyexperts",
    },
    { title: "Wellness", image: "/wellness.png", link: "/wellnessexperts" },
  ];

  const [showSearchPage, setShowSearchPage] = useState(false);

  // Open Search Page
  const toggleSearchPage = () => {
    setShowSearchPage(true);
  };

  // Close Search Page
  const closeSearchPage = () => {
    setShowSearchPage(false);
  };

  // Toggle Filter
  const toggleFilter = () => setShowFilter(!showFilter);

  return (
    <div className="bg-[#F8F7F3] p-4 md:hidden">
      {/* Navbar */}
      <nav className="flex items-center justify-between mb-4">
        {/* Left - Brand Name */}
        <div className="text-2xl font-bold text-black flex items-center">
          <RiArrowLeftSLine
            className="mr-2  text-black"
            onClick={() => router.back()}
          />
          Shourk
        </div>

        {/* Right - Icons */}
        <div className="flex items-center space-x-4 relative">
          <button
            onClick={toggleSearchPage}
            className="md:hidden text-black p-2 absolute right-24"
          >
            <FaSearch className="text-xl text-gray-600 cursor-pointer" />
          </button>

          <FaFilter
            className={`text-xl cursor-pointer ${
              showFilter ? "text-black" : "text-gray-600"
            }`}
            onClick={toggleFilter}
          />
          <FaGift
            className="text-xl text-gray-600 cursor-pointer"
            onClick={() => router.push("/giftsession")}
          />
          <FaUser
            className="text-xl text-gray-600 cursor-pointer"
            onClick={() => router.push("/userpanel/userlogin")}
          />

          {/* Filter Dropdown */}
          {showFilter && (
            <div className="absolute right-0 mt-2 w-80 bg-white shadow-xl rounded-xl p-4 z-50 ">
              {/* Header - Back & Save */}
              <div className="flex items-center justify-between mb-4">
                <button
                  className="flex items-center space-x-2"
                  onClick={toggleFilter}
                >
                  <FaArrowLeft />
                  <span>Filter</span>
                </button>
                <button
                  className="bg-black text-white px-4 py-2 rounded-lg"
                  onClick={toggleFilter}
                >
                  Save
                </button>
              </div>

              {/* Brand Section */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Brand</h3>
                <div className="grid grid-cols-4 gap-2">
                  {brands.map((name, index) => (
                    <button
                      key={index}
                      className={`px-3 py-1 rounded-full ${
                        activeBrand === index
                          ? "bg-black text-white"
                          : "bg-gray-300 text-black"
                      }`}
                      onClick={() => setActiveBrand(index)}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Features Section */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Features</h3>
                <div className="grid grid-cols-4 gap-2">
                  {features.map((name, index) => (
                    <button
                      key={index}
                      className={`px-3 py-1 rounded-full ${
                        activeFeature === index
                          ? "bg-black text-white"
                          : "bg-gray-300 text-black"
                      }`}
                      onClick={() => setActiveFeature(index)}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
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
            <SearchExperts closeSearchPage={closeSearchPage} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileNavSearch;
