"use client";
import React, { useState, useEffect } from "react";

const AvailableSessionLength = () => {
  const sessionOptions = [15, 30, 45, 60, 75, 90, 120, 180]; // Time slots in minutes
  const defaultSelected = [15, 30, 45, 60]; // Default selected times

  const [selectedTimes, setSelectedTimes] = useState([]);

  // Load selected session lengths from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedSessions = localStorage.getItem("selected_sessions");
      if (storedSessions) {
        setSelectedTimes(JSON.parse(storedSessions));
      } else {
        setSelectedTimes(defaultSelected);
      }
    }
  }, []);

  // Toggle selection of session length
  const handleSelect = (time) => {
    setSelectedTimes((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
    );
  };

  // Save selected session lengths to localStorage
  const handleSave = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selected_sessions", JSON.stringify(selectedTimes));
    }
  };

  return (
    <div className="w-full flex flex-col items-center md:p-0">
      {/* Header */}
      <h2 className="text-xl md:text-3xl font-semibold text-left w-full">
        Available session lengths
      </h2>
      <p className="text-[#7E7E7E] text-base md:text-lg font-semibold mt-1 text-left w-full">
        Callers can book you for 15, 30, 35 & 60 min slots
      </p>

      {/* Time Slots */}
      <div className="flex flex-col md:items-start items-center w-full mt-6">
        {/* First Row */}
        <div className="grid grid-cols-2 md:flex gap-2 md:gap-8 mt-4">
          {sessionOptions.slice(0, 4).map((time) => (
            <button
              key={time}
              className={`w-24 md:w-auto px-4 md:px-12 py-2 md:py-3 text-xs md:text-base font-medium text-center ${
                selectedTimes.includes(time)
                  ? "bg-black text-white"
                  : "bg-[#E9E9E9] text-black"
              }`}
              onClick={() => handleSelect(time)}
            >
              {time} min
            </button>
          ))}
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-2 md:flex gap-2 md:gap-8 mt-4 md:mt-8 md:ml-24">
          {sessionOptions.slice(4, 8).map((time) => (
            <button
              key={time}
              className={`w-24 md:w-auto px-4 md:px-12 py-2 md:py-3  text-xs md:text-base font-medium text-center  ${
                selectedTimes.includes(time)
                  ? "bg-black text-white"
                  : "bg-[#E9E9E9] text-black"
              }`}
              onClick={() => handleSelect(time)}
            >
              {time} min
            </button>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="mt-12 md:mt-24 bg-black text-white px-10 py-2.5 rounded-md w-44"
      >
        Save
      </button>
    </div>
  );
};

export default AvailableSessionLength;
