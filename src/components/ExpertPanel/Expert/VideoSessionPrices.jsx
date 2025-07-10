"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const VideoSessionPrices = () => {
  // State for session prices - using the same structure as backend
  const [sessionPrices, setSessionPrices] = useState({
    fifteenMin: "",
    thirtyMin: "",
    fortyFiveMin: "",
    sixtyMin: ""
  });
  
  // State for expert ID
  const [expertId, setExpertId] = useState(null);
  
  // State for selected session lengths
  const [selectedTimes, setSelectedTimes] = useState([15, 30, 45, 60]);

  // State for discounts (keeping this for UI purposes)
  const [discounts, setDiscounts] = useState({});

  // State for the coupon cards
  const [coupons, setCoupons] = useState([
    { name: "FreeShourk", discountPercent: 15 },
    { name: "FreeShourk", discountPercent: 15 },
  ]);

  // State for managing the discount modal
  const [showModal, setShowModal] = useState(false);
  const [selectedCouponIndex, setSelectedCouponIndex] = useState(null);
  const [newDiscount, setNewDiscount] = useState("");
  
  // State for tracking if there are unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // State for loading
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to map duration to field name
  const getDurationFieldName = (duration) => {
    const mapping = {
      15: 'fifteenMin',
      30: 'thirtyMin',
      45: 'fortyFiveMin',
      60: 'sixtyMin'
    };
    return mapping[duration];
  };

  // Helper function to get display price for a duration
  const getDisplayPrice = (duration) => {
    const fieldName = getDurationFieldName(duration);
    return sessionPrices[fieldName] || "";
  };

  // Get expert ID from token on component mount
  useEffect(() => {
    const expertToken = localStorage.getItem("expertToken");

    if (expertToken) {
      try {
        const decodedToken = JSON.parse(atob(expertToken.split(".")[1]));
        const id = decodedToken._id;
        setExpertId(id);
        fetchExpertPrices(id);
      } catch (error) {
        console.error("Error parsing expertToken:", error);
        toast.error("Invalid expert token. Please login again!");
        setIsLoading(false);
      }
    } else {
      toast.error("Expert token not found. Please login again!");
      setIsLoading(false);
    }
    
    // Load stored values on mount
    if (typeof window !== "undefined") {
      const storedDiscounts = localStorage.getItem("session_discounts");
      if (storedDiscounts) setDiscounts(JSON.parse(storedDiscounts));

      const storedCoupons = localStorage.getItem("session_coupons");
      if (storedCoupons) setCoupons(JSON.parse(storedCoupons));
    }
  }, []);

  // Fetch expert prices from backend
  const fetchExpertPrices = async (id) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("expertToken");

      if (!token) {
        toast.error("Token missing. Please login again!");
        setIsLoading(false);
        return;
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/expertauth/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const expert = response.data.data;
        
        // Extract prices from the expert data
        if (expert.prices) {
          setSessionPrices({
            fifteenMin: expert.prices.fifteenMin?.toString() || "50",
            thirtyMin: expert.prices.thirtyMin?.toString() || "90",
            fortyFiveMin: expert.prices.fortyFiveMin?.toString() || "130",
            sixtyMin: expert.prices.sixtyMin?.toString() || "170"
          });
        } else {
          // Set default prices if no prices exist
          setSessionPrices({
            fifteenMin: "50",
            thirtyMin: "90",
            fortyFiveMin: "130",
            sixtyMin: "170"
          });
        }
        
        console.log("Your session prices have been loaded!");
      } else {
        console.error("Failed to fetch your session prices.");
        // Set default prices
        setSessionPrices({
          fifteenMin: "50",
          thirtyMin: "90",
          fortyFiveMin: "130",
          sixtyMin: "170"
        });
      }
    } catch (error) {
      console.error("Error fetching expert prices:", error);
      toast.error("Error loading your session prices. Using default values.");
      
      // Set default prices if fetch fails
      setSessionPrices({
        fifteenMin: "50",
        thirtyMin: "90",
        fortyFiveMin: "130",
        sixtyMin: "170"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle price input change
  const handlePriceChange = (duration, value) => {
    const fieldName = getDurationFieldName(duration);
    setSessionPrices(prev => ({
      ...prev,
      [fieldName]: value
    }));
    setHasUnsavedChanges(true);
  };

  // Handle discount input change
  const handleDiscountChange = (time, value) => {
    setDiscounts((prev) => ({
      ...prev,
      [time]: value,
    }));
    setHasUnsavedChanges(true);
  };

  // Function to update expert's prices in the backend
  const updateExpertPrices = async () => {
    if (!expertId) {
      toast.error("Expert ID not found. Please login again.");
      return false;
    }

    try {
      const token = localStorage.getItem("expertToken");
      
      if (!token) {
        toast.error("Token missing. Please login again!");
        return false;
      }
      
      // Convert prices to numbers and prepare the payload
      const priceData = {
        fifteenMin: parseInt(sessionPrices.fifteenMin, 10) || 0,
        thirtyMin: parseInt(sessionPrices.thirtyMin, 10) || 0,
        fortyFiveMin: parseInt(sessionPrices.fortyFiveMin, 10) || 0,
        sixtyMin: parseInt(sessionPrices.sixtyMin, 10) || 0
      };
      
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/expertauth/update-price`,
        priceData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            expertid: expertId,
            "Content-Type": "application/json",
          },
        }
      );
      
      if (response.data && response.data.success) {
        console.log("Prices update response:", response.data);
        toast.success("Session prices updated successfully!");
        return true;
      } else {
        console.error("Prices update failed:", response.data);
        toast.error("Failed to update your prices in the database.");
        return false;
      }
    } catch (error) {
      console.error("Error updating expert prices:", error);
      toast.error("Error saving your prices. Please try again.");
      return false;
    }
  };

  // Handle saving all data to localStorage and backend
  const handleSave = async () => {
    // Update expert's prices in the backend
    const pricesUpdated = await updateExpertPrices();
    
    if (pricesUpdated) {
      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("session_prices", JSON.stringify(sessionPrices));
        localStorage.setItem("session_discounts", JSON.stringify(discounts));
        localStorage.setItem("session_coupons", JSON.stringify(coupons));
      }
      
      setHasUnsavedChanges(false);
    }
  };

  // Update individual session price
  const updateSingleSessionPrice = async (duration) => {
    if (!expertId) {
      toast.error("Expert ID not found. Please login again.");
      return false;
    }

    try {
      const token = localStorage.getItem("expertToken");
      
      if (!token) {
        toast.error("Token missing. Please login again!");
        return false;
      }
      
      const fieldName = getDurationFieldName(duration);
      const priceValue = parseInt(sessionPrices[fieldName], 10) || 0;
      
      // Create payload with only the specific duration
      const priceData = {
        [fieldName]: priceValue
      };
      
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/expertauth/update-price`,
        priceData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            expertid: expertId,
            "Content-Type": "application/json",
          },
        }
      );
      
      if (response.data && response.data.success) {
        toast.success(`${duration} minute session price updated successfully!`);
        return true;
      } else {
        toast.error("Failed to update session price.");
        return false;
      }
    } catch (error) {
      console.error("Error updating session price:", error);
      toast.error("Error saving session price. Please try again.");
      return false;
    }
  };

  // Open modal when a coupon is clicked
  const handleCouponClick = (index) => {
    setSelectedCouponIndex(index);
    setNewDiscount(coupons[index].discountPercent);
    setShowModal(true);
  };

  // Update discount on save
  const handleSaveDiscount = () => {
    const updatedCoupons = [...coupons];
    updatedCoupons[selectedCouponIndex].discountPercent = Number(newDiscount);
    setCoupons(updatedCoupons);
    setShowModal(false);
    setHasUnsavedChanges(true);

    if (typeof window !== "undefined") {
      localStorage.setItem("session_coupons", JSON.stringify(updatedCoupons));
    }

    toast.success("Discount updated successfully!");
  };

  return (
    <div className="w-full flex flex-col items-start px-4 md:px-0 py-1 md:py-1">
      {/* Heading */}
      <h2 className="text-lg md:text-3xl font-semibold mb-1 w-full md:w-auto">
        Set your rates
      </h2>
      <p className="hidden md:block text-[#7E7E7E] text-sm md:text-base font-semibold mb-6 md:mb-8 w-full md:w-auto">
        Set your price for each video call duration & <br />
        customize your rates
      </p>
      <p className="text-[#7E7E7E] text-sm font-semibold mb-6 md:hidden">
        Set your price for each video call duration & customize your rates
      </p>

      {/* Loading indicator */}
      {isLoading && (
        <div className="w-full flex justify-center my-4">
          <div className="animate-pulse text-center">
            <p className="text-gray-500">Loading your prices...</p>
          </div>
        </div>
      )}

      {/* Session Prices Section */}
      <div className="w-full mb-8">
        <h3 className="text-base md:text-xl font-semibold text-left w-full mb-3">
          Session Prices
        </h3>
        
        {/* Show column headings */}
        <div className="w-full grid grid-cols-3 items-center gap-2 md:gap-1 mb-2 md:mb-4">
          <div className="text-sm md:text-base font-semibold">Duration</div>
          <div className="text-sm md:text-base font-semibold text-center">Price (SAR)</div>
          {/* <div className="text-sm md:text-base font-semibold text-center">Discount</div> */}
          <div className="text-sm md:text-base font-semibold text-center">Action</div>
        </div>

        {/* Session Duration Rows */}
        <div className="w-full flex flex-col gap-4">
          {selectedTimes.map((time) => {
            const isFifteen = time === 15;
            return (
              <div
                key={time}
                className="w-full grid grid-cols-3 items-center gap-2 md:gap-1"
              >
                {/* Session Time Label */}
                <div className="text-sm md:text-base font-semibold">
                  {time} min
                </div>

                {/* Price Input */}
                <input
                  type="number"
                  placeholder="0"
                  value={getDisplayPrice(time)}
                  onChange={(e) => handlePriceChange(time, e.target.value)}
                  disabled={isLoading}
                  className={`w-full text-center rounded-xl px-4 py-3 md:py-4 text-sm md:text-base 
                    outline-none 
                    ${
                      time === 15
                        ? "bg-[#C3F7D2] text-[#4CB269] placeholder-[#4CB269]"
                        : time === 30
                        ? "bg-[#CFE5F8] text-[#1C4FD1] placeholder-[#1C4FD1]"
                        : time === 45
                        ? "bg-[#FFE5CC] text-[#D17A1C] placeholder-[#D17A1C]"
                        : time === 60
                        ? "bg-[#F5CCFF] text-[#9C1CD1] placeholder-[#9C1CD1]"
                        : "bg-[#F6F6F6] text-[#7E7E7E] placeholder-[#7E7E7E]"
                    }`}
                />

                {/* Discount Input */}
                {/* <input
                  type="number"
                  placeholder="0"
                  value={discounts[time] || ""}
                  onChange={(e) => handleDiscountChange(time, e.target.value)}
                  className="w-full text-center rounded-xl px-4 py-3 md:py-4 text-sm md:text-base 
                    outline-none bg-[#CFE5F8] text-[#1C4FD1] placeholder-[#1C4FD1]"
                /> */}

                {/* Individual Save Button */}
                <button
                  onClick={() => updateSingleSessionPrice(time)}
                  disabled={isLoading}
                  className="px-3 py-2 rounded-lg text-xs md:text-sm font-medium
                    bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 
                    disabled:text-gray-700 disabled:cursor-not-allowed"
                >
                  {isLoading ? "..." : "Save"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Save All Button (centered) */}
      <div className="w-full flex justify-center mt-8">
        <button
          onClick={handleSave}
          disabled={isLoading || !hasUnsavedChanges}
          className={`px-16 py-2.5 rounded-lg text-sm md:text-base font-medium
            ${hasUnsavedChanges && !isLoading
              ? "bg-black text-white" 
              : "bg-gray-300 text-gray-700 cursor-not-allowed"}`}
        >
          {isLoading ? "Loading..." : "Save All Changes"}
        </button>
      </div>

      {/* Discount Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-80 md:w-96 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-center">
              Enter Discount Percentage
            </h3>
            <input
              type="number"
              placeholder="Enter discount"
              value={newDiscount}
              onChange={(e) => setNewDiscount(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
            />
            <div className="flex justify-between mt-4">
              <button
                onClick={() => {
                  setNewDiscount("");
                  setShowModal(false);
                }}
                className="bg-gray-300 text-black px-4 py-2 rounded-md w-1/3"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDiscount}
                className="bg-black text-white px-4 py-2 rounded-md w-1/3"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </div>
  );
};

export default VideoSessionPrices;