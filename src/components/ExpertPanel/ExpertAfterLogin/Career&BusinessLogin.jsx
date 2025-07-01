"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HiBadgeCheck } from "react-icons/hi";
import { HiChevronRight } from "react-icons/hi"; // Importing right arrow icon
import { HeartHandshake, Gift } from "lucide-react";
import axios from "axios";

const CareerBusinessHomeCardsLogin = () => {
  const [expertData, setExpertData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch experts by area of expertise (e.g., "Home")
  useEffect(() => {
    const fetchExperts = async () => {
      try {
        const area = "Career and Business"; // Or dynamically fetch based on user's selection
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

    // Find the first sentence (up to first period) within first 25 words
    const words = text.split(/\s+/).filter((word) => word.length > 0);
    const first25Words = words.slice(0, 25);

    // Find the first period in these words
    let firstSentence = [];
    for (const word of first25Words) {
      firstSentence.push(word);
      if (word.includes(".")) {
        break;
      }
    }

    // If no period found, use first 25 words with ellipsis if needed
    if (firstSentence.length === 25 && words.length > 25) {
      return firstSentence.join(" ") + "...";
    }

    return firstSentence.join(" ");
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="bg-white p-6 md:p-1 ">
      {/* Heading Section */}
      <div className="flex flex-col md:flex-row md:h-40 items-center mb-6 md:mb-0">
        <h1 className="text-5xl md:text-[60px] font-bold text-black">
          CAREER AND BUSINESS
        </h1>
        <p className="text-[#9C9C9C] md:pt-5 pl-5 md:text-2xl">
          Connect with CEOs, executives, coaches, and more
        </p>
      </div>

      {/* "See All" Button */}
      <div className="flex justify-start mb-6">
        <Link href="/expertpanel/career&business" passHref>
          <button className="flex items-center text-xl font-semibold text-black">
            See All
            <HiChevronRight className="ml-2 w-5 h-5" />
          </button>
        </Link>
      </div>

      {/* Cards Section - Horizontal Scroll on Small Screens, Grid on Medium+ */}
      <div className="overflow-x-auto md:overflow-visible">
        <div className="flex gap-4 px-4 md:px-0 overflow-x-scroll custom-scrollbar-hide">
          {expertData.map((expert, index) => (
            <Link
              key={index}
              href={`/expertpanel/expertaboutme/${expert._id}`} // Dynamic URL with expert ID
              passHref
              onClick={() => localStorage.setItem("comingFromTopExpert", false)}
            >
              <div className="relative w-[280px] h-[400px] flex-shrink-0 overflow-hidden shadow-lg cursor-pointer">
                {/* Background Image */}
                <img
                  src={expert.photoFile || "/aaliyaabadi.png"} // Ensure there's a fallback image
                  alt={expert.photoFile}
                  className="w-full h-full object-cover"
                />

                {/* Free Session Indicator - TOP-LEFT */}
                {expert.freeSessionEnabled && (
                  <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1.5 rounded-full shadow-xl text-xs font-semibold flex items-center">
                    <Gift className="w-3 h-3 mr-1.5" />
                    <span>First Session Free</span>
                  </div>
                )}

                {/* Price Tag */}
                <div className="absolute top-4 right-4 bg-[#F8F7F3] text-black px-4 py-2 rounded-2xl shadow-xl font-semibold">
                  SAR {expert.price || "0"}{" "}
                  {/* Default value in case price is missing */}
                </div>

                {/* Transparent Blur Card */}
                <div className="absolute bottom-1 left-1 right-1 bg-white/80 p-4 m-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-black flex items-center gap-1">
                      {expert.firstName}
                      <HiBadgeCheck className="w-6 h-6 text-yellow-500" />
                    </h2>

                    {/* Small charity indicator text (optional) */}
                    {expert.charityEnabled && (
                      <div className="flex items-center text-xs text-red-600 font-bold px-3 py-1.5 rounded-full">
                        <span>
                          {expert.charityPercentage || 0}% to Charity{" "}
                        </span>
                        <HeartHandshake className="w-3 h-3 ml-1" />
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-black mt-1 line-clamp-3">
                    {truncateExperience(expert.experience)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CareerBusinessHomeCardsLogin;
