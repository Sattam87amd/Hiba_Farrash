"use client";
import React, { useState } from "react";
import { FaChevronLeft, FaChevronRight, FaStar, FaPen } from "react-icons/fa";

const ScheduleQuickCallsExpertPanel = () => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const datesData = [
    { date: 12, month: "Feb" },
    { date: 13, month: "Feb" },
    { date: 14, month: "Feb" },
    { date: 15, month: "Feb" },
    { date: 16, month: "Feb" },
    { date: 17, month: "Feb" },
    { date: 18, month: "Feb" },
    { date: 19, month: "Feb" },
    { date: 20, month: "Feb" },
    { date: 21, month: "Feb" },
    { date: 22, month: "Feb" },
    { date: 23, month: "Feb" },
    { date: 24, month: "Feb" },
    { date: 25, month: "Feb" },
    { date: 26, month: "Feb" },
    { date: 27, month: "Feb" },
  ];

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
    <div className="bg-[#F8F7F3] rounded-2xl p-6 w-full md:w-[80%] mx-auto flex flex-col items-center">
      {/* Heading */}
      <h2 className="text-lg md:text-3xl font-bold py-4 md:py-6 text-black mb-4 text-center">
        What time works best for a quick call?
      </h2>

      {/* Schedule Selector */}
      <div className="flex items-center gap-2 md:gap-3 w-full max-w-4xl">
        <button
          onClick={scrollLeft}
          className="p-3 md:p-5 rounded-xl bg-white text-black hover:bg-gray-200 transition"
          disabled={startIndex === 0}
        >
          <FaChevronLeft />
        </button>

        <div className="w-full rounded-2xl bg-white">
          {/* Days Row */}
          <div className="grid grid-cols-7 bg-[#EDECE8] px-2 md:px-4 py-2 md:py-3 rounded-t-2xl text-center font-semibold">
            {days.map((day, idx) => (
              <div key={idx} className="text-sm md:text-lg">
                {day}
              </div>
            ))}
          </div>

          {/* Dates Row */}
          <div className="grid grid-cols-7 px-2 md:px-4 py-2 md:py-4 rounded-b-2xl text-center">
            {datesData.slice(startIndex, startIndex + visibleRange).map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedIndex(idx)}
                  className={`flex flex-col items-center cursor-pointer transition-all duration-300 rounded-md p-2
                    ${isSelected ? "bg-black text-white" : "bg-white text-black"}
                  `}
                >
                  <span className="text-2xl md:text-[40px] font-thin">{item.date}</span>
                  <span className="text-xs md:text-base font-normal">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={scrollRight}
          className="p-3 md:p-5 rounded-xl bg-white text-black hover:bg-gray-200 transition"
          disabled={startIndex + visibleRange >= datesData.length}
        >
          <FaChevronRight />
        </button>
      </div>

      {/* Time Slot Selection */}
      <h3 className="text-lg md:text-2xl font-bold mt-6 md:mt-8 text-black text-center">
        Select Time Slot
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-6 md:gap-x-10 md:gap-y-8 mt-4">
        {timeSlots.map((slot, idx) => (
          <button
            key={idx}
            onClick={() => slot.available && handleSelectTime(slot.time)}
            className={`px-6 md:px-14 py-2 md:py-3 w-full text-sm md:text-lg rounded-lg border-2 font-semibold 
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-black mt-1">
              $2000 <span className="text-sm md:text-lg font-normal">. session</span>
            </h2>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className="text-[#FFA629]" />
              ))}
              <span className="text-[#FFA629] font-medium text-sm">5.0</span>
            </div>
          </div>

          <div className="flex items-center gap-6 md:gap-8 mt-2 md:mt-0">
            <button className="bg-black text-white py-2 px-10 md:py-3 md:px-16 rounded-2xl text-sm md:text-lg font-medium">
              Next
            </button>
            <FaPen className="text-black text-sm md:text-lg cursor-pointer hover:opacity-80" />
          </div>
        </div>

        <p className="text-[#FE3232] text-xs md:text-sm text-start mt-2 w-full">
          Note - Can add up to 5 sessions at different time slots. Any 1 time slot might get selected.
        </p>
      </div>
    </div>
  );
};

export default ScheduleQuickCallsExpertPanel;
