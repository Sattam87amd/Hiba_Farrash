"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import CountUp from "react-countup";
import CouponUserCount from "./CouponUserCount";

const Dashboard = () => {
  const router = useRouter();

  // Date filters
  const [activeFilter, setActiveFilter] = useState("All");
  const filterItems = ["All", "Today", "This Week", "1M", "1Y"];

  // Sales/Completed tabs
  const [activeTab, setActiveTab] = useState("Sales");
  const tabItems = ["Sales", "Completed"];

  // Dummy data for Sales and Completed with different filters
  const dummyData = {
    Sales: {
      All: { totalRevenue: 5000, bookingRevenue: 2000, totalBookings: 120 },
      Today: { totalRevenue: 3000, bookingRevenue: 1500, totalBookings: 80 },
      "This Week": { totalRevenue: 6000, bookingRevenue: 2500, totalBookings: 150 },
      "1M": { totalRevenue: 25000, bookingRevenue: 9000, totalBookings: 500 },
      "1Y": { totalRevenue: 300000, bookingRevenue: 120000, totalBookings: 4000 },
    },
    Completed: {
      All: { totalRevenue: 4000, bookingRevenue: 1800, totalBookings: 110 },
      Today: { totalRevenue: 2000, bookingRevenue: 900, totalBookings: 60 },
      "This Week": { totalRevenue: 5500, bookingRevenue: 2300, totalBookings: 140 },
      "1M": { totalRevenue: 22000, bookingRevenue: 8500, totalBookings: 480 },
      "1Y": { totalRevenue: 280000, bookingRevenue: 110000, totalBookings: 3800 },
    },
  };

  // Current data based on active tab and filter
  const currentData = dummyData[activeTab][activeFilter];

  return (
    <div className="w-full py-6 flex flex-col items-start">
      {/* Mobile Back Icon */}
      {/* <div className="block md:hidden mb-4">
        <button
          onClick={() => router.back()}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="ml-2"></span>
        </button>
      </div> */}

      
      <p className="text-black text-lg md:text-2xl mt-1 pl-2 py-10">
      Dashboard. Take a deeper look at your revenue & more
      </p>

      {/* Main Content Card */}
      <div className="w-full md:px-10">
        <div className="w-full bg-white border rounded-xl p-6 mt-6">
          {/* Filter navigation */}
          <div className="mt-4 flex justify-center flex-wrap gap-1 md:gap-8">
            {filterItems.map((item) => (
              <button
                key={item}
                onClick={() => setActiveFilter(item)}
                className={`px-6 py-1 rounded-full transition-colors ${
                  activeFilter === item ? "bg-[#EDECE8] text-black" : "bg-transparent text-gray-500"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Sales/Completed tabs */}
          <div className="mt-6 flex items-center text-lg gap-6 md:gap-14">
            {tabItems.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative pb-2 font-medium transition-colors ${
                  activeTab === tab ? "text-[#0D70E5]" : "text-gray-500"
                }`}
              >
                {tab}
                {/* Underline for active tab */}
                {activeTab === tab && (
                  <span className="absolute left-0 bottom-0 w-full h-[2px] bg-[#0D70E5]" />
                )}
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div className="mt-8 flex flex-col items-center">
            {/* Top Card (Total Revenue) */}
            <div className="bg-[#E8F4FF] text-black rounded-3xl p-6 w-full md:h-44 max-w-[600px] flex flex-col items-center justify-center">
              <h2 className="text-2xl font-semibold">
                <CountUp
                  start={0}
                  end={currentData.totalRevenue}
                  prefix="$"
                  separator=","
                  duration={2}
                />
              </h2>
              <p className="text-sm mt-2">Total Revenue</p>
            </div>

            {/* Bottom Cards (Booking Revenue, Total Bookings) */}
            <div className="flex flex-col md:flex-row justify-center md:gap-14 gap-5 mt-4 md:mt-8 w-full md:w-[860px]">
              <div className="md:h-44 bg-[#E8F4FF] text-black rounded-3xl p-6 flex-1 flex flex-col items-center justify-center">
                <h2 className="text-2xl font-semibold">
                  <CountUp
                    start={0}
                    end={currentData.bookingRevenue}
                    prefix="$"
                    separator=","
                    duration={2}
                  />
                </h2>
                <p className="text-sm mt-2">Booking Revenue</p>
              </div>
              <div className="md:h-44 bg-[#E8F4FF] text-black rounded-3xl p-6 flex-1 flex flex-col items-center justify-center">
                <h2 className="text-2xl font-semibold">
                  <CountUp
                    start={0}
                    end={currentData.totalBookings}
                    separator=","
                    duration={2}
                  />
                </h2>
                <p className="text-sm mt-2">Total Bookings</p>
              </div>
            </div>
          </div>
        </div>  
      </div>
    </div>
  );
};

export default Dashboard;
