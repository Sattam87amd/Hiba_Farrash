"use client";
import React, { useState, useEffect } from "react";
import { startOfToday, addMonths, eachDayOfInterval, format } from "date-fns";
import Image from "next/image";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PreferredAvailability = () => {
  const [selectedRegion, setSelectedRegion] = useState("Asia/Riyadh");
  const today = startOfToday();
  const [monthsRange, setMonthsRange] = useState(1);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);

  // Get expert ID from localStorage or URL
  const getExpertId = () => {
    // First try to get from token
    const expertToken = localStorage.getItem('expertToken');
    if (expertToken) {
      try {
        const tokenPayload = JSON.parse(atob(expertToken.split('.')[1]));
        return tokenPayload._id;
      } catch (e) {
        console.error("Error parsing token:", e);
      }
    }

    // Fallback: try getting from stored expert data
    const storedExpertData = localStorage.getItem('consultingExpertData');
    if (storedExpertData) {
      const expertData = JSON.parse(storedExpertData);
      return expertData._id;
    }

    // Fallback: try getting from URL if it's a valid ObjectId
    const pathParts = window.location.pathname.split('/');
    const urlExpertId = pathParts[pathParts.length - 1];

    // Check if it's a valid MongoDB ObjectId (24 characters, hex)
    if (urlExpertId && /^[0-9a-fA-F]{24}$/.test(urlExpertId)) {
      return urlExpertId;
    }

    return null;
  };

  // Simple time format without timezone
  const format12Hour = (hour24) => {
    if (hour24 === 0) return "12:00 AM";
    if (hour24 === 12) return "12:00 PM";
    if (hour24 < 12) return `${hour24}:00 AM`;
    return `${hour24 - 12}:00 PM`;
  };

  const initializeEmptyAvailability = () => {
    const startDate = startOfToday();
    const endDate = addMonths(startDate, monthsRange);
    const allDays = eachDayOfInterval({ start: startDate, end: endDate });

    const merged = allDays.map((day) => {
      const dayString = format(day, "yyyy-MM-dd");
      const times = {};
      // Create consistent time format
      for (let hour = 6; hour <= 22; hour++) {
        const time12 = format12Hour(hour);
        times[time12] = false; // Store as "9:00 AM", "2:00 PM", etc.
      }
      return { date: dayString, times };
    });
    return merged;
  };

  // Add debug function
  useEffect(() => {
    const expertId = getExpertId();
    console.log("Expert ID being used:", expertId);
  }, []);

  // Load availability from database on mount
  useEffect(() => {
    const loadAvailability = async () => {
      setIsLoadingInitial(true);
      const expertId = getExpertId();

      if (!expertId) {
        console.error("No expert ID found");
        toast.error("Expert ID not found. Please login again.");
        // Still initialize empty availability even without expert ID
        setAvailability(initializeEmptyAvailability());
        setIsLoadingInitial(false);
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/expertauth/availability/${expertId}`
        );

        if (response.data.success && response.data.data) {
          const loadedAvailability = response.data.data.availability || [];
          // setSelectedRegion(response.data.data.timezone || "Asia/Riyadh");
          // setMonthsRange(response.data.data.monthsRange || 1);

          // If loaded availability exists, merge it with generated days
          if (loadedAvailability.length > 0) {
            const mergedAvailability = mergeAvailabilityWithGenerated(loadedAvailability, 1);
            setAvailability(mergedAvailability);
          } else {
            // No saved availability, create empty one
            setAvailability(initializeEmptyAvailability());
          }
        } else {
          // Initialize empty availability
          setAvailability(initializeEmptyAvailability());
        }
      } catch (error) {
        console.error("Error loading availability:", error);
        // Initialize empty availability on error
        setAvailability(initializeEmptyAvailability());
      } finally {
        setIsLoadingInitial(false);
      }
    };

    loadAvailability();
  }, []);

  // Merge loaded availability with generated days
  const mergeAvailabilityWithGenerated = (loadedAvailability, months) => {
    const startDate = startOfToday();
    const endDate = addMonths(startDate, months);
    const allDays = eachDayOfInterval({ start: startDate, end: endDate });

    return allDays.map((day) => {
      const dayString = format(day, "yyyy-MM-dd");
      const existing = loadedAvailability.find((d) => d.date === dayString);

      if (existing) {
        // Convert old format (numeric hours) to new format (time strings)
        const times = {};
        for (let hour = 6; hour <= 22; hour++) {
          const time12 = format12Hour(hour);
          // Check if the existing data uses old format (numeric) or new format (string)
          if (existing.times?.[hour] !== undefined) {
            // Old format - convert
            times[time12] = existing.times[hour];
          } else if (existing.times?.[time12] !== undefined) {
            // New format - use as is
            times[time12] = existing.times[time12];
          } else {
            // Default to false
            times[time12] = false;
          }
        }
        return { date: dayString, times };
      } else {
        // Create default times for new days
        const times = {};
        for (let hour = 6; hour <= 22; hour++) {
          const time12 = format12Hour(hour);
          times[time12] = false;
        }
        return { date: dayString, times };
      }
    });
  };

  // When monthsRange changes, update availability
  useEffect(() => {
    if (availability.length > 0 && !isLoadingInitial) {
      const startDate = startOfToday();
      const endDate = addMonths(startDate, monthsRange);
      const allDays = eachDayOfInterval({ start: startDate, end: endDate });
      const merged = allDays.map((day) => {
        const dayString = format(day, "yyyy-MM-dd");
        const existing = availability.find((d) => d.date === dayString);
        if (existing) {
          return existing;
        } else {
          const times = {};
          for (let hour = 6; hour <= 22; hour++) {
            const time12 = format12Hour(hour);
            times[time12] = false;
          }
          return { date: dayString, times };
        }
      });
      setAvailability(merged);
    }
  }, [monthsRange]);

  // Save availability to database
  const saveAvailability = async (showToast = true) => {
    const expertId = getExpertId();

    if (!expertId) {
      if (showToast) toast.error("Expert ID not found. Please login again.");
      return;
    }

    try {
      setLoading(true);
      const expertToken = localStorage.getItem('expertToken');

      if (!expertToken) {
        if (showToast) toast.error("Please login to save availability");
        return;
      }

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/expertauth/availability/${expertId}`,
        {
          availability,
          timezone: "Asia/Riyadh", // Hardcoded to Saudi Arabia
          monthsRange: 1 // Hardcoded to 1 month
        },
        {
          headers: {
            'Authorization': `Bearer ${expertToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        if (showToast) toast.success("Availability saved successfully!");
      } else {
        if (showToast) toast.error("Failed to save availability");
      }
    } catch (error) {
      console.error("Error saving availability:", error);
      if (error.response?.status === 403) {
        if (showToast) toast.error("Unauthorized. Please login again.");
      } else if (error.response?.status === 400) {
        if (showToast) toast.error("Invalid expert ID format. Please contact support.");
      } else {
        if (showToast) toast.error("Error saving availability. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  // Auto-save when availability changes (debounced)


  const handleTimeToggle = (date, time) => {
    setAvailability((prev) =>
      prev.map((dayObj) =>
        dayObj.date === date
          ? {
            ...dayObj,
            times: { ...dayObj.times, [time]: !dayObj.times[time] },
          }
          : dayObj
      )
    );
  };

  const handleRepeatDay = (date) => {
    // Get the clicked day's times
    const dayObj = availability.find((d) => d.date === date);
    if (!dayObj) return;
    const clickedTimes = dayObj.times;

    // Get the day of the week for the clicked date
    const clickedDate = new Date(date);
    const clickedDayOfWeek = format(clickedDate, "EEEE");

    setAvailability((prev) =>
      prev.map((dayObj) => {
        const dayDate = new Date(dayObj.date);
        return format(dayDate, "EEEE") === clickedDayOfWeek
          ? { ...dayObj, times: { ...clickedTimes } }
          : dayObj;
      })
    );
  };

  // Add reset function
  const resetAllAvailability = () => {
    if (window.confirm("Are you sure you want to unselect all time slots? This action cannot be undone.")) {
      setAvailability((prev) =>
        prev.map((dayObj) => {
          const resetTimes = {};
          for (let hour = 6; hour <= 22; hour++) {
            const time12 = format12Hour(hour);
            resetTimes[time12] = false;
          }
          return { ...dayObj, times: resetTimes };
        })
      );
      toast.info("Click on Save Availability now for saving changes.");
    }
  };

  // Show loading state initially
  if (isLoadingInitial) {
    return (
      <div className="w-[90vw] md:max-w-4xl mx-auto flex justify-center items-center h-screen">
        <div className="text-lg">Loading availability...</div>
      </div>
    );
  }

  return (
    <div className="w-[90vw] md:max-w-4xl mx-auto">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="text-xl font-semibold mb-4">
        Preferred availability. Select the times you prefer to be booked:
      </h1>

      <div className="space-y-4 mb-7">

        {/* Reset Button */}
        <div className="flex justify-end mt-4 gap-x-4">
          <button
            onClick={resetAllAvailability}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
          >
            Reset All Time Slots
          </button>

          <button
          onClick={() => saveAvailability(true)}
          disabled={loading}
          className={`px-6 py-2 rounded-md text-white ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
        >
          {loading ? 'Saving...' : 'Save Availability'}
        </button>
        </div>
      </div>

      {/* Availability Selection */}
      <div className="space-y-6">
        {availability.map((dayObj) => {
          // Simple date formatting without timezone
          const dayLabel = format(new Date(dayObj.date), "EEEE, MMM d");
          return (
            <div key={dayObj.date} className="border-b pb-4">
              {/* Day Label */}
              <div className="text-lg font-medium mb-2">{dayLabel}</div>

              {/* Time Selection */}
              <div className="flex gap-3 md:gap-[17px] mb-3 md:overflow-visible overflow-x-scroll whitespace-nowrap">
                {Object.keys(dayObj.times).sort((a, b) => {
                  // Parse times for proper chronological sorting
                  const parseTime = (timeStr) => {
                    const [time, period] = timeStr.split(' ');
                    let [hours] = time.split(':').map(Number);

                    if (period === 'PM' && hours !== 12) hours += 12;
                    if (period === 'AM' && hours === 12) hours = 0;

                    return hours;
                  };

                  return parseTime(a) - parseTime(b);
                }).map((time) => {
                  const isSelected = dayObj.times[time];
                  return (
                    <div key={time} className="flex flex-col items-center">
                      <button
                        onClick={() => handleTimeToggle(dayObj.date, time)}
                        className={`w-9 h-12 border text-sm font-semibold transition-all ${isSelected ? "bg-green-500 text-white" : "bg-gray-200"
                          } hover:bg-green-400 rounded-none`}
                      />
                      {/* Remove :00 from display only */}
                      <div className="text-xs mt-1">{time.replace(':00', '')}</div>
                    </div>
                  );
                })}
              </div>

              {/* Repeat Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Repeat every {format(new Date(dayObj.date), "EEEE")}
                </span>
                <label className="inline-flex items-center cursor-pointer md:pr-3">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    onChange={() => handleRepeatDay(dayObj.date)}
                  />
                  <div
                    className="relative w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 
                        dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 
                        peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full 
                        peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] 
                        after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full 
                        after:w-5 after:h-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 
                        dark:peer-checked:bg-blue-600"
                  />
                </label>
              </div>
            </div>
          );
        })}
      </div>

      
    </div>
  );
};

export default PreferredAvailability;