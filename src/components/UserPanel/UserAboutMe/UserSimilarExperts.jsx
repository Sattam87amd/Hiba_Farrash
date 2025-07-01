"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { HiBadgeCheck } from "react-icons/hi";
import { HiChevronRight } from "react-icons/hi";
import axios from "axios";
import {motion} from "framer-motion";
import { HeartHandshake } from "lucide-react";

const UserSimilarExperts = () => {
  const [expertData, setExpertData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSimilarExperts = async () => {
      try {
        const storedExpertData = localStorage.getItem("expertData");
        const comingFromTopExpert = localStorage.getItem("comingFromTopExpert") === "true";
  
        if (!storedExpertData) {
          setError("Expert data not found");
          setLoading(false);
          return;
        }
  
        const currentExpert = JSON.parse(storedExpertData); // ⭐ Get current expert info
        let response;
  
        if (comingFromTopExpert) {
          // Fetch all Top Experts
          response = await axios.get(`${process.env.NEXT_PUBLIC_PROD_API_URL}/api/expertauth/`);
          let filteredExperts = response.data.data.filter((exp) => exp.averageRating >= 4);
  
          // ⭐ Remove current expert
          filteredExperts = filteredExperts.filter((exp) => exp._id !== currentExpert._id);
  
          setExpertData(filteredExperts);
        } else {
          // Fetch experts based on area
          const area = currentExpert.areaOfExpertise;
          response = await axios.get(`${process.env.NEXT_PUBLIC_PROD_API_URL}/api/expertauth/area/${area}`);
          
          let filteredExperts = response.data.data.filter((exp) => exp._id !== currentExpert._id); // ⭐ Remove current expert
          
          setExpertData(filteredExperts);
        }
  
        setLoading(false);
      } catch (err) {
        setError("Error fetching similar experts");
        setLoading(false);
      }
    };
  
    fetchSimilarExperts();
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

  if (loading) return <div>Loading similar experts...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="bg-white p-6">
      <div className="flex flex-col md:flex-row md:h-40 items-center mb-6 md:mb-0">
        <h1 className="text-3xl md:text-[60px] font-bold text-black">
          Similar Experts.
        </h1>
      </div>

      <div className="flex justify-start mb-6">
        <Link href="/userpanel/logintopexpert" passHref>
          <button className="flex items-center text-xl font-semibold text-black">
            See All
            <HiChevronRight className="ml-2 w-5 h-5" />
          </button>
        </Link>
      </div>

      <div className="overflow-x-auto md:overflow-visible">
  <motion.div
    className="flex md:grid md:grid-cols-5 md:gap-x-64 gap-4 px-4 md:px-0 overflow-x-scroll custom-scrollbar-hide"
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    variants={{
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
    }}
  >
    {expertData.map((expert, index) => (
      <Link key={index} href={`/userpanel/userexpertaboutme/${expert._id}`} passHref>
        <motion.div
          className="relative min-w-[280px] md:w-full h-[400px] flex-shrink-0 overflow-hidden shadow-lg cursor-pointer"
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
          }}
        >
          {/* Expert Image */}
          <img
            src={expert.photoFile || "/defaultprofile.png"} // Fallback image
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

              {/* Small charity indicator text (optional) */}
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

export default UserSimilarExperts;
