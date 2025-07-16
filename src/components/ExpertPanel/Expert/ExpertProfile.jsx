"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { FiShare2, FiCopy, FiCheck } from "react-icons/fi";
import { toast } from "react-toastify";

const ExpertProfile = ({ activeTab }) => {
  const [expertData, setExpertData] = useState(null);
  const [expertId, setExpertId] = useState("");
  const [bookingLink, setBookingLink] = useState("");
  const [copied, setCopied] = useState(false);

  // Generate booking link with full MongoDB ID
  const generateBookingLink = () => {
    return `https://www.hibafarrash.shourk.com/userpanel/booksession`;
  };

  // Fetch expertId from localStorage
  useEffect(() => {
    const expertToken = localStorage.getItem('expertToken');
    
    if (expertToken) {
      try {
        const decodedToken = JSON.parse(atob(expertToken.split(".")[1]));
        const expertId = decodedToken._id;
        setExpertId(expertId);
      } catch (error) {
        console.error("Error parsing expertToken:", error);
      }
    } else {
      toast.error("Expert token not found in localStorage");
    }
  }, []);

  // Fetch user data using expertId
  useEffect(() => {
    if (expertId) {
      const fetchExpertData = async () => {
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_PROD_API_URL}/api/expertauth/${expertId}`);
          setExpertData(response.data.data);
          
          // Generate booking link with full MongoDB ID
          const link = generateBookingLink(expertId);
          setBookingLink(link);
          
        } catch (error) {
          console.error("Error fetching expert data:", error);
          toast.error("Failed to load expert data");
        }
      };

      fetchExpertData();
    }
  }, [expertId]);

  // Copy link to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(bookingLink);
      setCopied(true);
      toast.success("Booking link copied to clipboard!");
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy link");
    }
  };

  // Share link (opens native share dialog if available)
  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Book a consultation with ${expertData?.firstName} ${expertData?.lastName}`,
          text: `Book a consultation with ${expertData?.firstName} ${expertData?.lastName} - ${expertData?.areaOfExpertise}`,
          url: bookingLink,
        });
      } catch (error) {
        console.error("Error sharing:", error);
        copyToClipboard(); // Fallback to copy
      }
    } else {
      copyToClipboard(); // Fallback to copy
    }
  };

  if (!expertData) {
    return (
      <div className="flex-1 p-4 md:p-8 bg-white">
        <div className="animate-pulse">
          <div className="flex items-center space-x-4 md:space-x-6 mt-6">
            <div className="w-16 h-16 md:w-40 md:h-36 bg-gray-200 rounded-3xl"></div>
            <div>
              <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
          <div className="mt-8">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="h-12 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-8 bg-white">
      {/* Header */}
      <div className="mt-6 flex flex-row md:flex-row items-center justify-between space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4 md:space-x-6">
          <img
            src={expertData.photoFile || "/default-profile.png"}
            alt="Expert Profile"
            className="w-16 h-16 md:w-40 md:h-36 rounded-3xl object-contain"
          />
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold text-[#434966]">
              {expertData?.firstName || ""} {expertData?.lastName || ""}
            </h3>
            <p className="text-gray-500">{expertData?.areaOfExpertise || ""}</p>
            <p className="text-gray-500">{expertData?.country || ""}</p>
          </div>
        </div>
      </div>

      {/* Marketing Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-black">Marketing</h2>
        <p className="text-[#7E7E7E] mt-1 py-2">Share your booking link:</p>

        <div className="relative mt-3">
          <input
            type="text"
            value={bookingLink}
            readOnly
            className="block w-full p-4 pr-20 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-base focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
            placeholder="Generating your booking link..."
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              onClick={copyToClipboard}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Copy link"
            >
              {copied ? (
                <FiCheck className="text-xl text-green-600" />
              ) : (
                <FiCopy className="text-xl" />
              )}
            </button>
            {/* <button
              onClick={shareLink}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Share link"
            >
              <FiShare2 className="text-xl" />
            </button> */}
          </div>
        </div>

        {bookingLink && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Your booking link is ready!</strong> Share this link with clients so they can book consultations with you.
            </p>
          </div>
        )}
      </div>

      {/* Verification Checkmark Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-black">Verification Checkmark</h2>
        <p className="text-[#0D70E5] mt-2 py-5">
          To be considered for verification, you need to do the following:
        </p>
        <ul className="text-[#0D70E5] list-disc ml-6 mt-2 space-y-2">
          <li>
            Add your booking link to two or more of the following bios:
            Instagram, LinkedIn, Twitter, or TikTok
          </li>
          <li>Complete 10 or more paid bookings through your link</li>
          <li>Generate at least $1,000 on the platform</li>
          <li>Maintain a rating above 4.8</li>
        </ul>
      </div>
    </div>
  );
};

export default ExpertProfile;