"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Add this to your server file (expert.routes.js)
/*
// New route for updating expert price
router.put("/update-price", updateExpertPrice);

// And in your controller (expert.controller.js)
export const updateExpertPrice = async (req, res) => {
  try {
    const { price } = req.body;
    const expertId = req.headers.expertid;

    if (!expertId) {
      return res.status(400).json({
        success: false,
        message: "Expert ID is required",
      });
    }

    const expert = await Expert.findByIdAndUpdate(
      expertId,
      { price },
      { new: true }
    );

    if (!expert) {
      return res.status(404).json({
        success: false,
        message: "Expert not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Price updated successfully",
      data: { price: expert.price },
    });
  } catch (error) {
    console.error("Error updating expert price:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
*/

const VideoSessionPrices = () => {
  // State for expert's base price
  const [expertBasePrice, setExpertBasePrice] = useState("");
  
  // State for expert ID
  const [expertId, setExpertId] = useState(null);
  
  // State for selected session lengths
  const [selectedTimes, setSelectedTimes] = useState([]);

  // State for each session's price and discount
  const [prices, setPrices] = useState({});
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

  // Get expert ID from token on component mount
  useEffect(() => {
    const expertToken = localStorage.getItem("expertToken");

    if (expertToken) {
      try {
        const decodedToken = JSON.parse(atob(expertToken.split(".")[1]));
        const id = decodedToken._id;
        setExpertId(id);
        fetchExpertPrice(id);
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
      const storedSessions = localStorage.getItem("selected_sessions");
      if (storedSessions) setSelectedTimes(JSON.parse(storedSessions));

      const storedPrices = localStorage.getItem("session_prices");
      if (storedPrices) setPrices(JSON.parse(storedPrices));

      const storedDiscounts = localStorage.getItem("session_discounts");
      if (storedDiscounts) setDiscounts(JSON.parse(storedDiscounts));

      const storedCoupons = localStorage.getItem("session_coupons");
      if (storedCoupons) setCoupons(JSON.parse(storedCoupons));
    }
  }, []);

  // Fetch expert price from backend
  const fetchExpertPrice = async (id) => {
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
        const { price } = response.data.data;
        
        // Set the price (convert to string for input field)
        const priceValue = price ? price.toString() : "50";
        setExpertBasePrice(priceValue);
        
        // Initialize the 15-minute session price with the expert's base price
        setPrices(prev => ({
          ...prev,
          15: priceValue
        }));
        
        console.log("Your base price has been loaded!");
      } else {
        console.error("Failed to fetch your base price.");
      }
    } catch (error) {
      console.error("Error fetching expert price:", error);
      toast.error("Error loading your base price. Using default value.");
      
      // Set default price if fetch fails
      setExpertBasePrice("50");
      setPrices(prev => ({
        ...prev,
        15: "50"
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle base price change
  const handleBasePriceChange = (value) => {
    setExpertBasePrice(value);
    // Update the 15-minute session price when base price changes
    setPrices(prev => ({
      ...prev,
      15: value
    }));
    setHasUnsavedChanges(true);
  };

  // Handle price input change
  const handlePriceChange = (time, value) => {
    setPrices((prev) => ({
      ...prev,
      [time]: value,
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

  // Function to update expert's price in the backend
  const updateExpertPrice = async () => {
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
      
      // Convert price to number before sending to backend
      const priceValue = parseInt(expertBasePrice, 10) || 0;
      
      // Using the same endpoint pattern as in EnableCharity component
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/expertauth/update-price`,
        {
          price: priceValue
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            expertid: expertId,
            "Content-Type": "application/json",
          },
        }
      );
      
      if (response.data && response.data.success) {
        console.log("Price update response:", response.data);
        return true;
      } else {
        console.error("Price update failed:", response.data);
        toast.error("Failed to update your price in the database.");
        return false;
      }
    } catch (error) {
      console.error("Error updating expert price:", error);
      toast.error("Error saving your price. Please try again.");
      return false;
    }
  };

  // Handle saving all data to localStorage and backend
  const handleSave = async () => {
    // Update expert's price in the backend
    const priceUpdated = await updateExpertPrice();
    
    if (priceUpdated) {
      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("session_prices", JSON.stringify(prices));
        localStorage.setItem("session_discounts", JSON.stringify(discounts));
        localStorage.setItem("session_coupons", JSON.stringify(coupons));
        localStorage.setItem("selected_sessions", JSON.stringify(selectedTimes));
      }
      
      toast.success("Rates saved successfully!");
      setHasUnsavedChanges(false);
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
        Set your price for a 15 minute video call or a group call & <br />
        we'll calculate the rest
      </p>
      <p className="text-[#7E7E7E] text-sm font-semibold mb-6 md:hidden">
        Set your price for a 15 minute video call or a group call & we'll calculate the rest
      </p>

      {/* Loading indicator */}
      {isLoading && (
        <div className="w-full flex justify-center my-4">
          <div className="animate-pulse text-center">
            <p className="text-gray-500">Loading your price...</p>
          </div>
        </div>
      )}

      {/* Expert Base Price Section */}
      <div className="w-full mb-8">
        <h3 className="text-base md:text-xl font-semibold text-left w-full mb-3">
          Your Base Price
        </h3>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg font-medium">SAR</span>
          <input
            type="number"
            value={expertBasePrice}
            onChange={(e) => handleBasePriceChange(e.target.value)}
            placeholder="Enter your base price"
            disabled={isLoading}
            className="w-full md:w-48 rounded-xl px-4 py-4 text-lg 
                     outline-none bg-[#C3F7D2] text-[#4CB269] placeholder-[#4CB269]
                     font-medium"
          />
          <span className="text-sm text-[#7E7E7E]">/15 minutes</span>
        </div>
        
        {/* Save Base Price Button */}
        <div className="flex justify-start">
          <button
            onClick={async () => {
              const success = await updateExpertPrice();
              if (success) {
                toast.success("Base price updated successfully!");
                setHasUnsavedChanges(false);
              }
            }}
            disabled={isLoading || !hasUnsavedChanges}
            className={`px-8 py-2 rounded-lg text-sm font-medium
              ${hasUnsavedChanges && !isLoading
                ? "bg-black text-white" 
                : "bg-gray-300 text-gray-700 cursor-not-allowed"}`}
          >
            {isLoading ? "Saving..." : "Save Base Price"}
          </button>
        </div>
      </div>

      {/* Video Calls heading */}
      {/* <h3 className="text-base md:text-3xl font-semibold text-left w-full mb-2">
        Video calls
      </h3> */}

      {/* Available Discount Coupons heading */}
      {/* <h3 className="text-base md:text-3xl font-semibold text-left py-4 w-full mb-2">
        Available Discount Coupons
      </h3> */}

      {/* Coupon Cards */}
      {/* <div className="flex flex-col w-full flex-wrap gap-3 mb-8">
        {coupons.map((coupon, index) => (
          <div
            key={index}
            onClick={() => handleCouponClick(index)}
            className="cursor-pointer flex items-start justify-between 
                       border border-[#EAEAEA] px-4 py-5 
                       rounded-2xl text-sm md:text-lg 
                       hover:shadow-sm transition-shadow"
          >
            <span className="mr-2 font-bold">{coupon.name}</span>
            <span className="text-black font-semibold">
              {coupon.discountPercent}% OFF
            </span>
          </div>
        ))}
      </div> */}

      {/* Show column headings only if times are selected */}
      {selectedTimes.length > 0 && (
        <div className="w-full grid grid-cols-3 items-center gap-2 md:gap-1 mb-2 md:mb-4">
          <div className="text-sm md:text-base font-semibold"></div>
          <div className="text-sm md:text-base font-semibold md:mr-36 text-black text-center">
            Price
          </div>
          <div className="text-sm md:text-base font-semibold md:mr-32 text-black text-center">
            Discount
          </div>
        </div>
      )}

      {/* Rows of session times, Price, and Discount */}
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
                placeholder="$0"
                value={prices[time] || ""}
                onChange={(e) => handlePriceChange(time, e.target.value)}
                className={`w-full md:w-48 text-center rounded-xl px-4 md:px-12 py-5 md:py-8 text-sm md:text-base 
                  outline-none 
                  ${
                    isFifteen
                      ? "bg-[#C3F7D2] text-[#4CB269] placeholder-[#4CB269]"
                      : "bg-[#F6F6F6] text-[#7E7E7E] placeholder-[#7E7E7E]"
                  }`}
              />

              {/* Discount Input */}
              <input
                type="number"
                placeholder="$0"
                value={discounts[time] || ""}
                onChange={(e) => handleDiscountChange(time, e.target.value)}
                className="w-full md:w-48 text-center rounded-xl px-4 md:px-12 py-5 md:py-8 text-sm md:text-base 
                  outline-none bg-[#CFE5F8] text-[#1C4FD1] placeholder-[#1C4FD1]"
              />
            </div>
          );
        })}
      </div>

      {/* Save Button (centered) */}
      <div className="w-full flex justify-center mt-8">
        {/* <button
          onClick={handleSave}
          disabled={isLoading || !hasUnsavedChanges}
          className={`px-16 py-2.5 rounded-lg text-sm md:text-base font-medium
            ${hasUnsavedChanges && !isLoading
              ? "bg-black text-white" 
              : "bg-gray-300 text-gray-700 cursor-not-allowed"}`}
        >
          {isLoading ? "Loading..." : "Save"}
        </button> */}
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