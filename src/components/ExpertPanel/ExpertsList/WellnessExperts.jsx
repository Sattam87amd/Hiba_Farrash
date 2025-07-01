"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { HiBadgeCheck } from "react-icons/hi";
import { HeartHandshake } from "lucide-react";
import { CiFilter } from "react-icons/ci";
import axios from "axios";
import { motion } from "framer-motion";
import ScrollableTags from "@/components/SpecialCharacter/section";

const WellnessLogin = () => {
  const [expertData, setExpertData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFilterBox, setShowFilterBox] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("recommended");

  // ✅ Full filter options
  const filterOptions = [
    { label: "Recommended", value: "recommended" },
    { label: "Price High - Low", value: "price_high_low" },
    { label: "Price Low - High", value: "price_low_high" },
    { label: "Highest Rating", value: "highest_rating" },
    { label: "Most Reviewed", value: "most_reviewed" },
    { label: "Expert Language - Arabic", value: "language_arabic" },
    { label: "Expert Language - English", value: "language_english" },
  ];

  useEffect(() => {
    const fetchExperts = async () => {
      try {
        const area = "Wellness";
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/expertauth/area/${area}`
        );
        // Filter approved experts on client side
        const approvedExperts = response.data.data.filter(
          (expert) => expert.status === "Approved"
        );
        setExpertData(approvedExperts);
        setLoading(false);
      } catch (err) {
        setError("Error fetching expert data");
        setLoading(false);
      }
    };

    fetchExperts();
  }, []);

  const truncateExperience = (text) => {
    if (!text) return "";

    const words = text.split(/\s+/).filter((word) => word.length > 0);
    const first25Words = words.slice(0, 25);

    let firstSentence = [];
    for (const word of first25Words) {
      firstSentence.push(word);
      if (word.includes(".")) {
        break;
      }
    }

    if (firstSentence.length === 25 && words.length > 25) {
      return firstSentence.join(" ") + "...";
    }

    return firstSentence.join(" ");
  };

  const toggleFilterBox = () => setShowFilterBox(!showFilterBox);

  const handleFilterChange = (e) => {
    setSelectedFilter(e.target.value);
    setShowFilterBox(false);
  };

  // 👉 Sorting experts based on selected filter
  const sortedExperts = useMemo(() => {
    let sorted = [...expertData];

    if (selectedFilter === "price_high_low") {
      sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (selectedFilter === "price_low_high") {
      sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
    }
    // Later you can add more sorting for rating, reviews, etc.
    return sorted;
  }, [expertData, selectedFilter]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="bg-white py-10 px-4">
      {/* Header Section with Filter Button */}
      <div className="py-3">
        <ScrollableTags />
      </div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="flex justify-between items-center mb-6"
      >
        <div className="flex flex-col md:flex-row md:items-center">
          <h1 className="text-3xl md:text-[60px] font-bold text-black">
            WELLNESS
          </h1>
          <p className="text-[#9C9C9C] md:pt-5 pl-5 md:text-2xl">
            Connect with nutritionists, trainers, & more about living a
            healthier life
          </p>
        </div>

        {/* Filter Button */}
        <div className="relative">
          <motion.button
            onClick={toggleFilterBox}
            className="bg-black text-white px-4 py-2 rounded-2xl flex items-center gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CiFilter size={25} />
            <span>Filter</span>
          </motion.button>

          {/* Filter Box */}
          {showFilterBox && (
            <motion.div
              className="bg-white p-4 rounded-md shadow-lg w-64 absolute top-full right-0 mt-2 z-50"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-lg font-semibold mb-4">Filter Options</h3>
              <form>
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
              </form>

              <div className="flex justify-end mt-4">
                <button
                  className="bg-black text-white px-4 py-2 rounded-lg"
                  onClick={toggleFilterBox}
                >
                  Close
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Cards Section */}
      <div className="overflow-x-auto md:overflow-visible">
        <motion.div
          className="flex md:grid md:grid-cols-5 gap-4 md:gap-x-64 px-4 md:px-0 overflow-x-scroll custom-scrollbar-hide"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
          }}
        >
          {sortedExperts.map((expert, index) => (
            <Link
              key={index}
              href={`/expertpanel/expertaboutme/${expert._id}`}
              passHref
            >
              <motion.div
                className="relative min-w-[280px] md:w-full h-[400px] flex-shrink-0 overflow-hidden shadow-lg cursor-pointer"
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
                }}
              >
                {/* Expert Image */}
                <img
                  src={expert.photoFile || "/aaliyaabadi.png"}
                  alt={expert.firstName}
                  className="w-full h-full object-cover"
                />

                {/* Price Badge */}
                <div className="absolute top-4 right-4 bg-[#F8F7F3] text-black px-4 py-2 rounded-2xl shadow-xl font-semibold">
                  SAR {expert.price || "0"}
                </div>

                {/* Transparent Blur Card */}
                <div className="absolute bottom-1 left-1 right-1 bg-white/80 p-4 m-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-black flex items-center gap-1">
                      {expert.firstName}
                      <HiBadgeCheck className="w-6 h-6 text-yellow-500" />
                    </h2>

                    {expert.charityEnabled && (
                      <div className="flex items-center text-xs text-red-600 font-bold px-3 py-1.5 rounded-full">
                        <span>{expert.charityPercentage || 0}% to Charity</span>
                        <HeartHandshake className="w-3 h-3 ml-1" />
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-black mt-1 line-clamp-3">
                    {truncateExperience(expert.experience)}
                  </p>
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default WellnessLogin;
