"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";


const CalendarAvailability = () => {
  const [selectedRegion, setSelectedRegion] = useState("Asia/Riyadh");
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showTimeSelector, setShowTimeSelector] = useState(false);

  // Toast notification function
  const showToast = (message, type = 'success') => {
    // Simple toast implementation
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 p-4 rounded-lg text-white z-50 ${
      type === 'success' ? 'bg-green-500' : 
      type === 'error' ? 'bg-red-500' : 
      'bg-blue-500'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 3000);
  };

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

  // Helper functions
  const formatDate = (date) => {
    // Use local date components to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const getDayName = (date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  };

  const getMonthName = (month) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month];
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  // Simple time format without timezone
  const format12Hour = (hour24) => {
    if (hour24 === 0) return "12:00 AM";
    if (hour24 === 12) return "12:00 PM";
    if (hour24 < 12) return `${hour24}:00 AM`;
    return `${hour24 - 12}:00 PM`;
  };

  const initializeEmptyAvailability = () => {
    const availability = [];
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0); // Reset time to start of day
    
    // Generate 90 days from today
    for (let i = 0; i < 90; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dayString = formatDate(date);
      const times = {};
      
      for (let hour = 6; hour <= 22; hour++) {
        const time12 = format12Hour(hour);
        times[time12] = false;
      }
      
      availability.push({ date: dayString, times });
    }
    
    return availability;
  };

  // Merge loaded availability with generated days
  const mergeAvailabilityWithGenerated = (loadedAvailability) => {
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    
    const merged = [];
    
    // Generate 90 days from today
    for (let i = 0; i < 90; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dayString = formatDate(date);
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
        merged.push({ date: dayString, times });
      } else {
        // Create default times for new days
        const times = {};
        for (let hour = 6; hour <= 22; hour++) {
          const time12 = format12Hour(hour);
          times[time12] = false;
        }
        merged.push({ date: dayString, times });
      }
    }
    
    return merged;
  };


 // Load availability from database on mount
useEffect(() => {
  const loadAvailability = async () => {
    setIsLoadingInitial(true);
    const expertId = getExpertId();

    console.log("Expert ID being used:", expertId);

    if (!expertId) {
      console.error("No expert ID found");
      showToast("Expert ID not found. Please login again.", 'error');
      // Still initialize empty availability even without expert ID
      setAvailability(initializeEmptyAvailability());
      setIsLoadingInitial(false);
      return;
    }

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/expertauth/availability/${expertId}`
      );

      // With axios, check response.status instead of response.ok
      if (response.status === 200 && response.data) {
        const data = response.data; // axios automatically parses JSON
        if (data.success && data.data) {
          const loadedAvailability = data.data.availability || [];

          // If loaded availability exists, merge it with generated days
          if (loadedAvailability.length > 0) {
            const mergedAvailability = mergeAvailabilityWithGenerated(loadedAvailability);
            setAvailability(mergedAvailability);
          } else {
            // No saved availability, create empty one
            setAvailability(initializeEmptyAvailability());
          }
        } else {
          // Initialize empty availability
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

  const handleDateClick = (date) => {
    const dateString = formatDate(date);
    console.log('Clicked date:', date, 'Formatted:', dateString); // Debug log
    setSelectedDate(dateString);
    setShowTimeSelector(true);
  };

  const getAvailabilityForDate = (date) => {
    const dateString = formatDate(date);
    return availability.find(day => day.date === dateString);
  };

  const getSelectedTimesCount = (date) => {
    const dayAvailability = getAvailabilityForDate(date);
    if (!dayAvailability) return 0;
    return Object.values(dayAvailability.times).filter(Boolean).length;
  };

  const handleRepeatDay = (date) => {
    const dayObj = availability.find((d) => d.date === date);
    if (!dayObj) return;
    const clickedTimes = dayObj.times;
    const clickedDate = new Date(date);
    const clickedDayOfWeek = getDayName(clickedDate);

    setAvailability((prev) =>
      prev.map((dayObj) => {
        const dayDate = new Date(dayObj.date);
        return getDayName(dayDate) === clickedDayOfWeek
          ? { ...dayObj, times: { ...clickedTimes } }
          : dayObj;
      })
    );
  };

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
      showToast("Click on Save Availability now for saving changes.", 'info');
    }
  };

  // Save availability to database
 const saveAvailability = async (showToastNotification = true) => {
  const expertId = getExpertId();

  if (!expertId) {
    if (showToastNotification) showToast("Expert ID not found. Please login again.", 'error');
    return;
  }

  try {
    setLoading(true);
    const expertToken = localStorage.getItem('expertToken');

    if (!expertToken) {
      if (showToastNotification) showToast("Please login to save availability", 'error');
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

    if (response.status === 200) {
      const data = response.data;
      if (data.success) {
        if (showToastNotification) showToast("Availability saved successfully!", 'success');
      } else {
        if (showToastNotification) showToast("Failed to save availability", 'error');
      }
    } else {
      if (response.status === 403) {
        if (showToastNotification) showToast("Unauthorized. Please login again.", 'error');
      } else if (response.status === 400) {
        if (showToastNotification) showToast("Invalid expert ID format. Please contact support.", 'error');
      } else {
        if (showToastNotification) showToast("Error saving availability. Please try again.", 'error');
      }
    }
  } catch (error) {
    console.error("Error saving availability:", error);
    
    // Handle axios error responses
    if (error.response) {
      if (error.response.status === 403) {
        if (showToastNotification) showToast("Unauthorized. Please login again.", 'error');
      } else if (error.response.status === 400) {
        if (showToastNotification) showToast("Invalid expert ID format. Please contact support.", 'error');
      } else {
        if (showToastNotification) showToast("Error saving availability. Please try again.", 'error');
      }
    } else {
      if (showToastNotification) showToast("Error saving availability. Please try again.", 'error');
    }
  } finally {
    setLoading(false);
  }
};

  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  // Calendar rendering logic
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-20 border-r border-b bg-gray-50"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateString = formatDate(date);
      const selectedCount = getSelectedTimesCount(date);
      const isCurrentDay = isToday(date);
      const isPast = isPastDate(date);
      
      days.push(
        <div
          key={day}
          className={`
            relative p-2 h-20 border-r border-b cursor-pointer transition-colors
            ${isPast ? 'bg-gray-100 cursor-not-allowed' : 'hover:bg-blue-50'}
            ${selectedDate === dateString ? 'bg-blue-100' : ''}
          `}
          onClick={() => !isPast && handleDateClick(date)}
        >
          <div className="flex flex-col h-full">
            <span className={`
              text-sm font-medium
              ${isCurrentDay ? 'bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}
              ${isPast ? 'text-gray-400' : ''}
            `}>
              {day}
            </span>
            
            {!isPast && (
              <div className="flex-1 flex flex-col justify-center items-center">
                {selectedCount > 0 && (
                  <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    {selectedCount} slots
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-sm border">
        {/* Calendar Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded text-lg"
          >
            &#8249;
          </button>
          <h2 className="text-lg font-semibold">
            {getMonthName(currentMonth)} {currentYear}
          </h2>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded text-lg"
          >
            &#8250;
          </button>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {days}
        </div>
      </div>
    );
  };

  const renderTimeSelector = () => {
    if (!showTimeSelector || !selectedDate) return null;

    const dayObj = availability.find(d => d.date === selectedDate);
    console.log('Selected date:', selectedDate, 'Found day obj:', dayObj); // Debug log
    if (!dayObj) return null;

    const selectedDateObj = new Date(selectedDate + 'T00:00:00'); // Add time to avoid timezone issues
    const dayLabel = `${getDayName(selectedDateObj)}, ${getMonthName(selectedDateObj.getMonth())} ${selectedDateObj.getDate()}`;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">{dayLabel}</h3>
            <button
              onClick={() => setShowTimeSelector(false)}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ×
            </button>
          </div>

          {/* Time Selection Grid */}
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-4">
            {Object.keys(dayObj.times).sort((a, b) => {
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
                <button
                  key={time}
                  onClick={() => handleTimeToggle(selectedDate, time)}
                  className={`
                    p-2 text-sm font-medium rounded transition-all
                    ${isSelected ? "bg-green-500 text-white" : "bg-gray-200 hover:bg-gray-300"}
                  `}
                >
                  {time.replace(':00', '')}
                </button>
              );
            })}
          </div>

          {/* Repeat Toggle */}
          <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded">
            <span className="text-sm font-medium">
              Repeat every {getDayName(selectedDateObj)}
            </span>
            <button
              onClick={() => handleRepeatDay(selectedDate)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              Apply to all {getDayName(selectedDateObj)}s
            </button>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setShowTimeSelector(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoadingInitial) {
    return (
      <div className="w-full max-w-6xl mx-auto flex justify-center items-center h-screen">
        <div className="text-lg">Loading availability...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-6">
        Preferred availability. Select the times you prefer to be booked:
      </h1>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-gray-600">
          Click on a date to select time slots
        </div>
        <div className="flex gap-4">
          <button
            onClick={resetAllAvailability}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
          >
            Reset All Time Slots
          </button>
          <button
            onClick={() => saveAvailability(true)}
            disabled={loading}
            className={`px-6 py-2 rounded-md text-white ${
              loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Saving...' : 'Save Availability'}
          </button>
        </div>
      </div>

      {/* Calendar */}
      {renderCalendar()}

      {/* Time Selector Modal */}
      {renderTimeSelector()}

      {/* Legend */}
      <div className="mt-6 flex items-center gap-6 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Has available slots</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
          <span>Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 rounded"></div>
          <span>Past dates</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarAvailability;