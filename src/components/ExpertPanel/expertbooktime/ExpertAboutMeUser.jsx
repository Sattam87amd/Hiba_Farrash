"use client";

import React from "react";
import { FaStar } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";

const ExpertAboutMeUser = () => {
  const profile = {
    name: "Darrell Steward",
    designation: "Tech Entrepreneur + Investor",
    image: "/aaliaabadi.png",
    rating: 5.0,
    about: `Co-Founder of Reddit. First Batch Of Y Combinator (Summer 2005) And Led The Company To A Sale To Condé Nast In 2006, Returned As Exec Chair In 2014 To Help Lead The Turnaround, Then Left In 2018 To Do Venture Capital Fulltime.

I'm An Investor In Startups—Almost Always At The Earliest Possible Stage—First As An Angel Investor, Then Co-Founder Of Initialized, Before Splitting The Firm In Half To Found Seven Seven Six.`,
  };

  const timeSlots = {
    today: ["07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "02:00 AM", "03:00 AM", "04:00 AM"],
    tomorrow: ["07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "01:00 AM", "03:00 AM", "04:00 AM"],
    wednesday: ["07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "01:00 AM", "02:00 AM", "03:00 AM", "04:00 AM"],
  };

  return (
    <div className="min-h-screen w-full bg-white py-10 px-4 md:px-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Side: Profile & About */}
        <div className="bg-[#F8F7F3] rounded-3xl p-6 shadow">
          <img
            src={profile.image}
            alt={profile.name}
            className="w-full h-[450px] object-cover rounded-xl"
          />
          <div className="mt-6">
            <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
            <p className="text-[#9C9C9C] mt-1">{profile.designation}</p>
            <div className="flex items-center mt-2 text-[#FFA629]">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} />
              ))}
              <span className="ml-2 font-semibold text-sm">{profile.rating}</span>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold flex items-center justify-between">
              About Me
              <FaInstagram className="text-gray-600 text-2xl cursor-pointer hover:text-gray-800" />
            </h3>
            <p className="text-sm text-black mt-3 whitespace-pre-line">{profile.about}</p>
            <button className="mt-6 bg-black text-white px-6 py-2 rounded-md hover:bg-gray-900 transition">
              See More
            </button>
          </div>
        </div>

        {/* Right Side: Book Video Call with Border */}
        <div className="w-full border-l border-black pl-8">
          <h2 className="text-2xl font-bold mb-4">Book a video call</h2>
          <p className="text-sm text-gray-700 mb-2">
            Select one of the available time slots below:
          </p>

          {/* Time Options Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {["Quick – 15min", "Regular – 30min", "Extra – 45min", "All Access – 60min"].map((label, index) => (
              <button
                key={index}
                className="border border-gray-300 px-4 py-2 rounded-full text-sm hover:bg-black hover:text-white transition"
              >
                {label}
              </button>
            ))}
          </div>

          {/* Slot Lists */}
          {Object.entries(timeSlots).map(([day, slots], idx) => (
            <div key={idx} className="mb-5">
              <h4 className="text-sm font-semibold text-gray-800 mb-2 capitalize">
                {day === "wednesday" ? "Wednesday 3/26" : day}
              </h4>
              <div className="flex flex-wrap gap-2">
                {slots.map((slot, i) => (
                  <button
                    key={i}
                    className={`px-4 py-2 text-sm border rounded-full ${
                      i % 5 === 0
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "border-gray-300 hover:bg-black hover:text-white transition"
                    }`}
                    disabled={i % 5 === 0}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Price + Request Button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-6 border-t pt-6">
            <div>
              <p className="text-lg font-semibold text-black">$550 • Session</p>
              <div className="flex items-center text-[#FFA629] mt-1">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} size={16} />
                ))}
                <span className="ml-2 font-medium text-sm">5.0</span>
              </div>
            </div>
            <button className="mt-4 sm:mt-0 bg-black text-white px-6 py-3 rounded-md hover:bg-gray-900 transition w-full sm:w-auto">
              Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertAboutMeUser;
