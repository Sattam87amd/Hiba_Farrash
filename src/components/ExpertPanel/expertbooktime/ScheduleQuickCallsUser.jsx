"use client";

import React, { useState } from "react";
import { FaChevronLeft, FaChevronRight, FaStar } from "react-icons/fa";
import { SlNote } from "react-icons/sl";
import { format, addDays } from "date-fns";

const ScheduleQuickCallsUser = () => {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) =>
    format(addDays(today, i), "EEE")
  );
  const datesData = Array.from({ length: 16 }, (_, i) => {
    const dateObj = addDays(today, i);
    return {
      date: format(dateObj, "d"),
      month: format(dateObj, "MMM"),
    };
  });

  const timeSlots = [
    { time: "07:00 AM", available: false },
    { time: "08:00 AM", available: true },
    { time: "09:00 AM", available: true },
    { time: "10:00 AM", available: true },
    { time: "11:00 AM", available: true },
    { time: "01:00 PM", available: true },
    { time: "02:00 AM", available: false },
    { time: "03:00 AM", available: false },
    { time: "04:00 AM", available: true },
  ];

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [startIndex, setStartIndex] = useState(0);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const visibleRange = 7;

  const scrollLeft = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - 1);
    }
  };

  const scrollRight = () => {
    if (startIndex + visibleRange < datesData.length) {
      setStartIndex(startIndex + 1);
    }
  };

  const handleSelectTime = (time) => {
    if (selectedSlots.includes(time)) {
      setSelectedSlots(selectedSlots.filter((slot) => slot !== time));
    } else {
      if (selectedSlots.length < 5) {
        setSelectedSlots([...selectedSlots, time]);
      }
    }
  };

  return (
    <div className="bg-[#F8F7F3] rounded-2xl p-4 md:p-6 w-full md:w-[80%] mx-auto flex flex-col items-center">
      {/* Heading */}
      <h2 className="text-base md:text-3xl font-normal py-4 md:py-6 text-black mb-6 md:mb-8 text-center">
        What time works best for a quick call?
      </h2>

      {/* Schedule Selector */}
      <div className="flex items-center gap-2 md:gap-6 w-full max-w-4xl">
        <button
          onClick={scrollLeft}
          className="p-2 md:p-5 rounded-xl bg-white text-black hover:bg-gray-200 transition"
          disabled={startIndex === 0}
        >
          <FaChevronLeft />
        </button>

        <div className="w-full rounded-2xl bg-white">
          {/* Days Row */}
          <div className="grid grid-cols-7 bg-[#EDECE8] px-2 md:px-4 py-2 md:py-3 rounded-t-2xl text-center">
            {days.map((day, idx) => (
              <div key={idx} className="text-xs md:text-lg">
                {day}
              </div>
            ))}
          </div>

          {/* Dates Row */}
          <div className="grid grid-cols-7 px-2 md:px-4 py-2 md:py-4 rounded-b-2xl text-center">
            {datesData
              .slice(startIndex, startIndex + visibleRange)
              .map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedIndex(idx)}
                    className={`flex flex-col items-center cursor-pointer transition-all duration-300 rounded-md p-2
                    ${
                      isSelected ? "bg-black text-white" : "bg-white text-black"
                    }
                  `}
                  >
                    <span className="text-lg md:text-3xl font-light">
                      {item.date}
                    </span>
                    <span className="text-xs md:text-sm font-light">
                      {item.month}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>

        <button
          onClick={scrollRight}
          className="p-2 md:p-5 rounded-xl bg-white text-black hover:bg-gray-200 transition"
          disabled={startIndex + visibleRange >= datesData.length}
        >
          <FaChevronRight />
        </button>
      </div>

      {/* Time Slot Selection */}
      <h3 className="text-base md:text-2xl font-bold mt-6 md:mt-8 text-black text-center">
        Select Time Slot
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-x-10 md:gap-y-8 mt-4">
        {timeSlots.map((slot, idx) => (
          <button
            key={idx}
            onClick={() => slot.available && handleSelectTime(slot.time)}
            className={`px-4 md:px-14 py-2 md:py-3 w-full text-xs md:text-lg rounded-lg border-2 
              ${
                slot.available
                  ? selectedSlots.includes(slot.time)
                    ? "bg-black text-white border-black"
                    : "bg-white text-black border-gray-300 hover:bg-gray-100"
                  : "bg-white text-gray-400 border-gray-300 cursor-not-allowed"
              }`}
            disabled={!slot.available}
          >
            {slot.time}
          </button>
        ))}
      </div>

      {/* Bottom Note */}
      <div className="bg-white rounded-2xl p-4 md:p-5 mt-6 md:mt-8 shadow-md w-full md:w-[50%] mx-auto">
        <div className="flex flex-row justify-between items-center">
          <div>
            <h2 className="text-base md:text-2xl text-black mt-1">
              $2000{" "}
              <span className="text-sm md:text-2xl font-normal">. session</span>
            </h2>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className="text-[#FFA629]" />
              ))}
              <span className="text-[#FFA629] font-medium text-xs md:text-sm">
                5.0
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="bg-black text-white py-2 px-6 md:py-3 md:px-16 rounded-2xl text-xs md:text-lg font-medium">
              Next
            </button>
            <SlNote className="w-6 h-6 md:w-10 md:h-10 text-black cursor-pointer hover:opacity-80" />
          </div>
        </div>

        <p className="text-[#FE3232] text-xs md:text-base text-start mt-2 w-full">
          Note - Can add up to 5 sessions at different time slots. Any 1 time
          slot might get selected.
        </p>
      </div>
    </div>
  );
};

export default ScheduleQuickCallsUser;
