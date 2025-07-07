'use client';

import React, { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { Gift, HeartHandshake } from 'lucide-react';
import Footer from "@/components/UserPanel/Layout/Footer";
import UserWhatToExpect from "@/components/UserPanel/UserAboutMe/UserWhatToExpect";
import UserAboutMeReviews from "@/components/UserPanel/UserAboutMe/UserAboutMeReviews";
import UserExpertFeatureHighights from "@/components/UserPanel/UserAboutMe/UserExpertFeatureHighights";
import BottomNav from "@/components/UserPanel/BottomNav/BottomNav";
import UserSidebar from "@/components/UserPanel/UseSideBar/UserSidebar";
import UserNavSearch from "@/components/UserPanel/Layout/NavSearch";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { startOfToday, addMonths, eachDayOfInterval, format } from "date-fns";

const page = () => {
  // Dynamic expert data state
  const [expert, setExpert] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedConsultation, setSelectedConsultation] = useState("1:1");
  const [price, setPrice] = useState();
  const [showTimeSelection, setShowTimeSelection] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [selectedDurationMinutes, setSelectedDurationMinutes] = useState(15);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [expertAvailability, setExpertAvailability] = useState([]);
  const [monthsRange, setMonthsRange] = useState(1);

  const router = useRouter();

  // Expert ID from database
  const EXPERT_ID = "6866785160f3ef65dc67ede5";

  // Simple date handling without timezone
  const generateMonthDates = () => {
    const startDate = startOfToday();
    const endDate = addMonths(startDate, monthsRange);
    const allDays = eachDayOfInterval({ start: startDate, end: endDate });
    return allDays;
  };

  const [monthDates, setMonthDates] = useState([]);

  useEffect(() => {
    const dates = generateMonthDates();
    setMonthDates(dates);
  }, [monthsRange]);

  // Fetch expert data from API
  const fetchExpertData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/expertauth/${EXPERT_ID}`
      );
      
      console.log("Expert data response:", response.data);
      
      if (response.data.success && response.data.data) {
        const expertData = response.data.data;
        setExpert(expertData);
        setPrice(expertData.price);
        
        // Store expert data in localStorage
        localStorage.setItem("expertId", expertData._id);
        localStorage.setItem("expertData", JSON.stringify(expertData));
        
        console.log("Expert data set:", expertData);
      } else {
        setError("Failed to fetch expert data");
      }
    } catch (error) {
      console.error("Error fetching expert data:", error);
      setError("Could not load expert information");
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
      }
    } finally {
      setLoading(false);
    }
  };

  // Simple formatting without timezone
  const getFormattedDate = (date) => {
    return format(date, "EEEE, MMM d");
  };

  const formatDateForAPI = (date) => {
    return format(date, "yyyy-MM-dd");
  };

  const handleSeeMore = () => {
    setIsExpanded(!isExpanded);
  };

  // Simple time format
  const format12Hour = (hour24) => {
    if (hour24 === 0) return "12:00 AM";
    if (hour24 === 12) return "12:00 PM";
    if (hour24 < 12) return `${hour24}:00 AM`;
    return `${hour24 - 12}:00 PM`;
  };

  const fetchExpertAvailability = async (expertId) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/expertauth/availability/${expertId}`
      );
      
      console.log("Availability response:", response.data);
      
      if (response.data.success && response.data.data) {
        setExpertAvailability(response.data.data.availability || []);
        setMonthsRange(response.data.data.monthsRange || 1);
        console.log("Expert availability set:", response.data.data.availability);
      }
    } catch (error) {
      console.error("Error fetching expert availability:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
      }
    }
  };

  const getAvailableTimesForDate = (dateString) => {
    console.log("Getting times for date:", dateString);
    console.log("Expert availability:", expertAvailability);
    
    const dayAvailability = expertAvailability.find(day => day.date === dateString);
    if (!dayAvailability) {
      console.log("No availability found for date:", dateString);
      return [];
    }

    const availableTimes = [];
    const times = dayAvailability.times;
    
    console.log("Times object:", times);

    // Handle different formats of times
    if (typeof times === 'object' && times !== null) {
      Object.entries(times).forEach(([timeKey, isAvailable]) => {
        if (isAvailable) {
          // Check if timeKey is already in correct format
          if (typeof timeKey === 'string' && (timeKey.includes('AM') || timeKey.includes('PM'))) {
            availableTimes.push(timeKey);
          } else {
            // Old format - convert hour number to time string
            const time12 = format12Hour(parseInt(timeKey));
            availableTimes.push(time12);
          }
        }
      });
    }
    
    console.log("Available times found:", availableTimes);
    return availableTimes.sort((a, b) => {
      // Sort times chronologically
      const timeA = new Date('1970/01/01 ' + a).getTime();
      const timeB = new Date('1970/01/01 ' + b).getTime();
      return timeA - timeB;
    });
  };

  // Fetch booked slots
  const fetchBookedSlots = async (expertId) => {
    setLoadingSlots(true);
    try {
      const userToken = localStorage.getItem('userToken');

      // if (!userToken) {
      //   toast.error('Please login to view availability');
      //   return;
      // }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/session/user-booked-slots/${expertId}`,
        {
          headers: {
            'Authorization': `Bearer ${userToken}`
          }
        }
      );
      const flattenedSlots = response.data.data.flat();
      setBookedSlots(flattenedSlots || []);
    } catch (err) {
      console.error("Error fetching booked slots:", err);
      if (err.response?.status === 401) {
        console.log('Session expired. Please login again');
      } else {
        // toast.error("Could not load availability data");
      }
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    // Fetch expert data on component mount
    fetchExpertData();
  }, []);

  useEffect(() => {
    // Fetch availability and booked slots when expert data is loaded
    if (expert && expert._id) {
      fetchExpertAvailability(expert._id);
      fetchBookedSlots(expert._id);
    }
  }, [expert]);

  const handleConsultationChange = (type) => {
    setSelectedConsultation(type);
    setPrice(type === "1:4" ? 150 : expert?.price || 997);
  };

  const handleSeeTimeClick = () => {
    setShowTimeSelection(true);
    setSelectedDuration("Quick - 15min");
    setSelectedDurationMinutes(15);
  };

  const handleBookingRequest = async () => {
    try {
      const sessionData = {
        expertId: expert._id,
        slots: selectedTimes,
        duration: selectedDuration,
        areaOfExpertise: expert.areaOfExpertise || "Home",
        price: expert.price * (selectedDurationMinutes / 15),
      };

      localStorage.setItem("sessionData", JSON.stringify(sessionData));
      toast.success("Redirecting to booking page");
      router.push("/userpanel/userbooking");
      setShowTimeSelection(false);
    } catch (error) {
      console.error("Booking error:", error);
      toast.error(`Booking failed: ${error.message}`);
    }
  };

  const handleTimeSelection = (dateString, time) => {
    const normalizedTime = time.includes('AM') || time.includes('PM') ? time : format12Hour(parseInt(time));
    
    const slot = {
      selectedDate: dateString,
      selectedTime: normalizedTime,
    };

    setSelectedTimes((prevTimes) => {
      const slotExists = prevTimes.some(
        (existingSlot) =>
          existingSlot.selectedDate === slot.selectedDate &&
          existingSlot.selectedTime === slot.selectedTime
      );

      if (slotExists) {
        return prevTimes.filter(
          (existingSlot) =>
            existingSlot.selectedDate !== slot.selectedDate ||
            existingSlot.selectedTime !== slot.selectedTime
        );
      }

      if (prevTimes.length >= 5) {
        toast.error("You can only book a maximum of 5 time slots.");
        return prevTimes;
      }

      return [...prevTimes, slot];
    });
  };

  const isSlotBooked = (dateString, time) => {
    const normalizedTime = time.includes('AM') || time.includes('PM') ? time : format12Hour(parseInt(time));
    
    return bookedSlots.some(
      slot =>
        slot.selectedDate === dateString &&
        slot.selectedTime === normalizedTime
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Loading expert information...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg">{error}</p>
          <button 
            onClick={fetchExpertData}
            className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No expert data
  if (!expert) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">No expert information available</p>
        </div>
      </div>
    );
  }

  const experienceText = expert?.experience || "";
  const truncatedExperience =
    experienceText.slice(0, 200) + (experienceText.length > 200 ? "..." : "");

  return (
    <>
      <div className="flex min-h-screen">
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
        <aside className="w-[20%] hidden md:block">
          <UserSidebar />
        </aside>

        <div className="w-full md:w-[80%] flex flex-col">
          {/* <div className="hid vbvfhjykk */}
          <div className="min-h-screen bg-white py-10 px-4 md:px-10">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Expert Info */}
              <div className="bg-[#F8F7F3] rounded-3xl p-12 shadow">
                <div className="relative w-full pb-[125%] max-w-[520px] mx-auto">
                  <img
                    src={expert?.photoFile || "/hiba_image.jpg"}
                    alt={expert?.firstName}
                    className="absolute inset-0 w-full h-full object-cover object-[center_top] rounded-xl"
                  />
                </div>
                <div className="mt-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {expert?.firstName} {expert?.lastName}
                  </h2>
                  <p className="text-[#9C9C9C] mt-1">
                    {expert?.areaOfExpertise || "Expert"}
                  </p>
                  <div>
                    <p className="text-xl font-semibold">
                      SAR {(expert.price * (selectedDurationMinutes / 15)).toFixed(2)} • Session
                    </p>
                    <div className="flex items-center mt-2 gap-2 text-[#FFA629]">
                      {[...Array(5)].map((_, i) => {
                        const rating = expert.averageRating || 0;
                        const isFilled = i < Math.floor(rating);
                        const isHalf = i === Math.floor(rating) && rating % 1 !== 0;
                        return (
                          <FaStar
                            key={i}
                            className={
                              isFilled || isHalf
                                ? "text-[#FFA629]"
                                : "text-gray-300"
                            }
                            size={16}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg md:text-3xl font-semibold">
                      About Me
                    </h3>
                    <div className="flex items-center gap-3">
                      {expert?.charityEnabled && (
                        <div className="flex items-center gap-1 bg-red-50 px-3 py-1.5 rounded-full">
                          <span className="flex text-xs text-red-600 font-medium">
                            {expert.charityPercentage}% to Charity
                          </span>
                          <HeartHandshake className="h-4 w-4 text-red-600" />
                        </div>
                      )}
                      {expert?.socialLink && (
                        <a 
                          href={expert.socialLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xl text-gray-600 cursor-pointer hover:text-gray-900"
                        >
                          <FaInstagram />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm md:text-xl text-black">
                      {isExpanded ? experienceText : truncatedExperience}
                    </p>
                  </div>
                  {experienceText.length > 200 && (
                    <button
                      className="mt-6 bg-black text-white px-6 py-2 rounded-md hover:bg-gray-900 transition"
                      onClick={handleSeeMore}
                    >
                      {isExpanded ? "Show Less" : "See More"}
                    </button>
                  )}

                  {expert?.advice && expert.advice.length > 0 && (
                    <>
                      <h4 className="text-md font-semibold mt-6 flex items-center">
                        <span className="text-yellow-500 text-lg mr-2">💡</span>{" "}
                        Strengths:
                      </h4>
                      <ul className="list-none mt-2 space-y-1">
                        {expert.advice.map((advice, index) => (
                          <li
                            key={index}
                            className="text-gray-700 flex items-center text-sm"
                          >
                            <span className="text-yellow-500 mr-2">✔</span>{" "}
                            {advice}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </div>

              {/* Right Column: Video Consultation */}
              <div className="space-y-6">
                {showTimeSelection ? (
                  <>
                    <button
                      onClick={() => setShowTimeSelection(false)}
                      className="py-2 px-4 bg-black text-white rounded-md shadow mb-6"
                    >
                      Back
                    </button>
                    <div className="bg-white p-6 rounded-xl">
                      <h3 className="text-4xl font-semibold mb-4">
                        Book a video call
                      </h3>
                      <p className="mb-4 font-semibold text-xl">
                        Select duration and time slot:
                      </p>

                      {/* Duration Selection Section */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {[
                          { label: "Quick - 15min", duration: 15 },
                          { label: "Regular - 30min", duration: 30 },
                          { label: "Extra - 45min", duration: 45 },
                          { label: "All Access - 60min", duration: 60 },
                        ].map(({ label, duration }) => (
                          <button
                            key={label}
                            className={`py-2 px-4 ${selectedDuration === label
                                ? "bg-black text-white"
                                : "bg-[#F8F7F3] text-black"
                              } rounded-md shadow`}
                            onClick={() => {
                              setSelectedDuration(label);
                              setSelectedDurationMinutes(duration);
                            }}
                          >
                            {label}
                          </button>
                        ))}
                      </div>

                      {/* Scrollable time slots */}
                      <div className="h-[450px] overflow-y-auto pb-8">
                        {monthDates.map((date) => {
                          // Simple date formatting without timezone
                          const dateString = format(date, "yyyy-MM-dd");
                          const dayLabel = format(date, "EEEE, MMM d");
                          const availableTimes = getAvailableTimesForDate(dateString);
                          
                          console.log(`Date: ${dateString}, Day: ${format(date, "EEEE")}, Label: ${dayLabel}, Times: ${availableTimes.length}`);
                          
                          return (
                            <div key={dateString} className="mb-8 bg-white/90 backdrop-blur-sm">
                              <h4 className="font-semibold py-4 text-xl sticky top-0 bg-white z-10">
                                {dayLabel}
                                <span className="text-sm text-gray-500 ml-2">
                                  ({availableTimes.length} times available)
                                </span>
                              </h4>
                              
                              {availableTimes.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4">
                                  No available times for this date
                                </p>
                              ) : (
                                <div className="grid grid-cols-3 gap-3 px-1">
                                  {availableTimes.map((time) => {
                                    const isBooked = isSlotBooked(dateString, time);
                                    const isSelected = selectedTimes.some(
                                      s => s.selectedDate === dateString && s.selectedTime === time
                                    );

                                    return (
                                      <button
                                        key={time}
                                        className={`py-2 px-3 text-sm ${isSelected ? "bg-black text-white" :
                                          isBooked ? "bg-gray-200 text-gray-500 cursor-not-allowed" :
                                            "bg-white text-black hover:bg-gray-100"
                                        } rounded-xl border transition-colors shadow-sm`}
                                        onClick={() => !isBooked && handleTimeSelection(dateString, time)}
                                        disabled={isBooked}
                                      >
                                        {time}
                                        {isBooked && <span className="text-xs block">Booked</span>}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      {/* Show how many slots are selected */}
                      <p className="text-sm text-gray-600 mt-4">
                        Selected slots: {selectedTimes.length} / 5
                      </p>

                      <div className="flex gap-10 py-10 items-center">
                        <div>
                          <p className="text-xl font-semibold">
                            SAR {(expert.price * (selectedDurationMinutes / 15)).toFixed(2)} • Session
                          </p>
                          <div className="flex items-center mt-2 gap-2 text-[#FFA629]">
                            {[...Array(5)].map((_, i) => {
                              const rating = expert.averageRating || 0;
                              const isFilled = i < Math.floor(rating);
                              const isHalf = i === Math.floor(rating) && rating % 1 !== 0;
                              return (
                                <FaStar
                                  key={i}
                                  className={
                                    isFilled || isHalf
                                      ? "text-[#FFA629]"
                                      : "text-gray-300"
                                  }
                                />
                              );
                            })}
                          </div>
                        </div>

                        <button
                          className="py-3 px-12 bg-black text-white rounded-md hover:bg-gray-900 transition"
                          onClick={handleBookingRequest}
                          disabled={!selectedDuration || selectedTimes.length === 0}
                        >
                          Request
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    {/* 1:1 Consultation Card */}
                    <div
                      className={`bg-[#F8F7F3] p-6 rounded-xl cursor-pointer ${selectedConsultation === "1:1"
                        ? "border-2 border-black"
                        : ""
                        }`}
                      onClick={() => handleConsultationChange("1:1")}
                    >
                      <div className="bg-black text-white p-2 rounded-t-xl w-max">
                        <h3 className="text-2xl font-semibold">
                          1:1 Video Call
                        </h3>
                      </div>
                      <div className="text-2xl py-4">
                        <h2 className="font-semibold">
                          Personalized 1:1 Session
                        </h2>
                      </div>
                      <p className="text-2xl font-semibold">
                        Get dedicated one-on-one expert guidance
                      </p>
                      <div className="mt-4">
                        <p className="text-xl font-semibold">
                          Starting at SAR {expert.price}
                        </p>
                        <div className="flex items-center justify-start mt-2">
                          <div className="flex items-center mt-2 gap-2 text-[#FFA629]">
                            {[...Array(5)].map((_, i) => {
                              const rating = expert.averageRating || 0;
                              const isFilled = i < Math.floor(rating);
                              return (
                                <FaStar
                                  key={i}
                                  className={isFilled ? "text-[#FFA629]" : "text-gray-300"}
                                  size={16}
                                />
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-center mt-4 gap-8">
                        {/* <Gift className="h-8 w-8" /> */}
                        <button
                          className="bg-[#0D70E5] text-white py-3 px-24 rounded-md hover:bg-[#0A58C2]"
                          onClick={handleSeeTimeClick}
                        >
                          See Time
                        </button>
                      </div>
                    </div>

                    <div className="bg-[#F8F7F3] p-6 rounded-xl mt-12">
                      <div className="bg-black text-white p-2 rounded-t-xl w-max">
                        <h3 className="text-2xl font-semibold">Send a Gift Card</h3>
                      </div>
                      <div className="text-2xl py-4">
                        <h2 className="font-semibold">Share an experience</h2>
                      </div>
                      <p className="text-2xl font-semibold">
                        Gift a session or membership to friends, family, or coworkers
                      </p>

                      <div className="flex items-center justify-center mt-4 gap-8">
                        <div className="flex items-center">
                          <Gift className="h-8 w-8" />
                        </div>
                        <button
                          onClick={() => toast.info("Gift Card Feature coming soon !")}
                          className="bg-[#0D70E5] text-white py-3 px-24 rounded-md hover:bg-[#0A58C2]"
                        >
                          Select
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <UserWhatToExpect />
          <UserAboutMeReviews expertId={expert?._id} /> 
          <UserExpertFeatureHighights />
        </div>
      </div>
      <Footer />
      <BottomNav />
    </>
  );
};

export default page;