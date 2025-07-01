"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import { FaBell, FaChevronDown } from "react-icons/fa";
import { toast } from "react-toastify";
import GoogleTranslateButton from '../../GoogleTranslateButton';

const Navtop = ({ activeTab }) => {
  const [userData, setUserData] = useState({
    firstName: "",
    photoFile: "",
  });
  const [isRTL, setIsRTL] = useState(false);
  const [expertId, setExpertId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Helper function to fix image URLs
  const fixImageUrl = (url) => {
    if (!url) return "";
    
    try {
      // Step 1: Decode any existing encoding
      let fixedUrl = decodeURIComponent(url);
      
      // Step 2: Replace spaces with %20
      fixedUrl = fixedUrl.replace(/\s/g, '%20');
      
      // Step 3: Remove double slashes except after protocol
      fixedUrl = fixedUrl.replace(/([^:]\/)\/+/g, '$1');
      
      // Step 4: Ensure proper URL encoding
      return encodeURI(fixedUrl);
    } catch (error) {
      console.error('Error fixing image URL:', error);
      return url;
    }
  };

  useEffect(() => {
    const fetchExpertId = () => {
      try {
        const expertToken = localStorage.getItem("expertToken");
        if (!expertToken) {
          toast.error("Authentication token not found");
          return;
        }
        
        try {
          const decodedToken = JSON.parse(atob(expertToken.split(".")[1]));
          setExpertId(decodedToken._id || decodedToken.id || expertToken);
        } catch {
          setExpertId(expertToken);
        }
      } catch (error) {
        console.error("Error parsing expertToken:", error);
        toast.error("Error loading user data");
      }
    };

    fetchExpertId();
  }, []);

  useEffect(() => {
    const checkDirection = () => {
      const direction = document.documentElement.dir || 
                      getComputedStyle(document.documentElement).direction;
      setIsRTL(direction === 'rtl');
    };

    const checkCookieForRTL = () => {
      const googtrans = document.cookie
        .split('; ')
        .find(row => row.startsWith('googtrans='));
      
      if (googtrans && googtrans.includes('/en/ar')) {
        setIsRTL(true);
      }
    };

    checkDirection();
    checkCookieForRTL();

    const observer = new MutationObserver(checkDirection);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['dir', 'style', 'class']
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!expertId) return;

    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:5070/api/expertauth/${expertId}`,
          {
            timeout: 5000,
            headers: {
              'Cache-Control': 'no-cache',
            }
          }
        );

        if (response.data?.data) {
          const { firstName, photoFile } = response.data.data;
          // Optionally fix the image URL
          const fixedPhotoFile = photoFile ? fixImageUrl(photoFile) : "";
          setUserData({ firstName, photoFile: fixedPhotoFile });
          setImageError(false);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load user profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [expertId]);

  // Handle image loading errors
  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className={`w-full flex justify-between items-center bg-white py-4 px-6 shadow-sm ${isRTL ? 'rtl-nav' : ''}`}>
      {/* Left Section */}
      <div className={isRTL ? 'order-last' : ''}>
        <p className="text-gray-500 text-sm">
          {isLoading ? "Loading..." : `Hi, ${userData.firstName || "User"}`}
        </p>
        <h1 className="text-2xl font-bold">{activeTab}</h1>
      </div>
      
      {/* Right Section */}
      <div className={`flex items-center space-x-6 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
        <GoogleTranslateButton />
        
        {/* Profile Section */}
        <div className={`flex items-center space-x-2 cursor-pointer ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
          {userData.photoFile && !imageError ? (
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-200">
              <Image
                src={userData.photoFile}
                alt="Profile"
                width={40}
                height={40}
                className="w-full h-full object-cover"
                onError={handleImageError}
                unoptimized={true}
                priority={true}
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-lg">
                {userData.firstName?.[0]?.toUpperCase() || "U"}
              </span>
            </div>
          )}
          <p className="text-sm font-semibold">
            {isLoading ? "Loading..." : userData.firstName || "User"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Navtop;
