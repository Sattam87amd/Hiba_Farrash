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
import SearchExperts from "@/components/SearchExperts/SearchExperts";
import GoogleTranslateButton from "../../GoogleTranslateButton"; // Import GoogleTranslateButton component

const MobileNavSearch = () => {
  const [showFilter, setShowFilter] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const router = useRouter();

  const filterOptions = [
    { label: "Recommended", value: "recommended" },
    { label: "Price High - Low", value: "price_high_low" },
    { label: "Price Low - High", value: "price_low_high" },
    { label: "Highest Rating", value: "highest_rating" },
    { label: "Most Reviewed", value: "most_reviewed" },
    { label: "Expert Language - Arabic", value: "language_arabic" },
    { label: "Expert Language - English", value: "language_english" },
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

  // Update selected filter
  const handleFilterChange = (event) => {
    setSelectedFilter(event.target.value);
    // You can add additional logic here to filter your data based on the selected value
  };

  return (
    <div className="bg-[#F8F7F3] p-4 md:hidden">
      {/* Navbar */}
      <nav className="flex items-center justify-between mb-4">
        {/* Left - Brand Name */}
        <div className="text-2xl font-bold text-black flex items-center">
          <RiArrowLeftSLine
            className="mr-2 text-black"
            onClick={() => router.back()}
          />
          Shourk
        </div>

        {/* Right - Icons */}
        <div className="flex items-center space-x-4 relative">
          {/* Google Translate Button */}
          <div className="mr-2">
            <GoogleTranslateButton />
          </div>
          
          {/* <button
            onClick={toggleSearchPage}
            className="md:hidden text-black p-2"
          >
            <FaSearch className="text-xl text-gray-600 cursor-pointer" />
          </button> */}

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
            onClick={() => router.push("/userlogin")}
          />

          {/* Filter Dropdown */}
          {showFilter && (
            <div className="absolute right-0 mt-2 w-80 bg-white shadow-xl pt-[20rem] rounded-xl p-4 z-50 ">
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

              {/* Filter Options Section */}
              <form>
                <h3 className="text-lg font-semibold mb-2">Filter By</h3>
                <div className="grid grid-cols-1 gap-2">
                  {filterOptions.map((option) => (
                    <div key={option.value} className="flex items-center mb-2">
                      <input
                        type="radio"
                        id={option.value}
                        name="filter"
                        value={option.value}
                        checked={selectedFilter === option.value}
                        onChange={handleFilterChange}
                        className="mr-2"
                      />
                      <label htmlFor={option.value} className="text-gray-700">
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </form>
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