"use client";

import React from "react";
import { FaStar } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { HiOutlineVideoCamera } from "react-icons/hi";

const AboutMeExpertPanel = () => {
  const profile = {
    name: "Darrell Steward",
    designation: "Tech Entrepreneur + Investor",
    image: "/aaliaabadi.png",
    rating: 5.0,
    about: `Co-Founder of Reddit. First Batch of Y Combinator (Summer 2005) and led the company to a sale to Conde Nast in 2006. Returned as Executive Chair in 2014 to help lead the turnaround, then left in 2018 to do venture capital full-time.\n\nI'm an investor in startups—almost always at the earliest possible stage—first as an angel investor, then co-founder of Initialized, before splitting the firm in half to found Seven Seven Six.`,
    strengths: [
      "Startups",
      "Investing",
      "Company Culture",
      "Early Stage Marketing",
      "Growth Tactics",
      "Operations",
      "Fundraising",
      "Hiring & Managing",
    ],
  };

  return (
    <div className="min-h-screen w-full bg-white py-10 px-4 md:px-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="bg-[#F8F7F3] rounded-3xl p-6 flex flex-col items-center shadow">
          <img
            src={profile.image}
            alt={profile.name}
            className="w-full max-w-[350px] h-[450px] object-cover rounded-2xl shadow-md"
          />
          <div className="mt-6 text-center w-full">
            <h2 className="text-3xl font-semibold text-gray-900">
              {profile.name}
            </h2>
            <p className="text-[#9C9C9C] mt-1">{profile.designation}</p>
            <div className="flex items-center justify-center mt-2">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className="text-[#FFA629]" />
              ))}
              <span className="ml-2 text-[#FFA629] font-semibold text-sm">
                {profile.rating}
              </span>
            </div>
          </div>

          {/* About Me */}
          <div className="w-full mt-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">About Me</h3>
              <FaInstagram className="text-xl text-gray-600 cursor-pointer hover:text-gray-900" />
            </div>
            <p className="text-sm text-black whitespace-pre-line mt-4">
              {profile.about}
            </p>
            <h4 className="text-md font-semibold mt-4 flex items-center">
              <span className="text-yellow-500 text-lg mr-2">💡</span> Strengths:
            </h4>
            <ul className="list-none mt-2 space-y-1">
              {profile.strengths.map((strength, index) => (
                <li
                  key={index}
                  className="text-gray-700 flex items-center text-sm"
                >
                  <span className="text-yellow-500 mr-2">✔</span> {strength}
                </li>
              ))}
            </ul>
            <button className="mt-6 bg-black text-white font-semibold py-2 px-6 rounded-md hover:bg-gray-900 transition">
              See More
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Video Call Cards */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Book A Video Call</h3>

            {/* 1:1 Video */}
            <div className="border rounded-xl p-4 shadow-sm bg-white">
              <p className="font-semibold text-black">1:1 Video Consultation</p>
              <p className="text-sm text-gray-600">
                Book a 1:1 video consultation & get personalized advice
              </p>
              <p className="text-sm mt-2 font-semibold text-black">
                Starting at $350
              </p>
              <div className="flex items-center mt-2 text-[#FFA629]">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} />
                ))}
              </div>
              <button className="mt-4 bg-[#007BFF] text-white px-4 py-2 rounded-md w-full">
                See Times
              </button>
            </div>

            {/* Group Consultation */}
            <div className="border rounded-xl p-4 shadow-sm bg-white">
              <p className="font-semibold text-black">1:4 Group Consultation</p>
              <p className="text-sm text-gray-600">
                Book a 1:4 group video consultation & get advice
              </p>
              <p className="text-sm mt-2 font-semibold text-black">
                Starting at $550
              </p>
              <div className="flex items-center mt-2 text-[#FFA629]">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} />
                ))}
              </div>
              <button className="mt-4 bg-[#007BFF] text-white px-4 py-2 rounded-md w-full">
                See Times
              </button>
            </div>
          </div>

          {/* Select Plan */}
          <div className="bg-white border rounded-xl shadow-md p-6">
            <div className="bg-black text-white px-4 py-2 rounded-md inline-block mb-4 font-semibold text-sm">
              Select Plan #1
            </div>
            <h3 className="text-lg font-bold mb-2">
              Growing A Successful Business - 1:1 Mentoring (VIP Access)
            </h3>
            <p className="text-sm text-gray-600 mb-2">What’s included:</p>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>1:1 Chat (Unlimited)</li>
              <li>1:1 Video Calls (120 Min / Month)</li>
              <li>
                Real World Advice On Physical Retail, Managing Multiple
                Locations, Franchising, And More
              </li>
              <li>
                Lessons on Branding, Narrative, Local Marketing, Delightful
                Customer Service, Hiring, And More
              </li>
              <li>How To Launch And Grow A Successful Product Line</li>
              <li>
                Invite To The Intro CEO Day In LA (Must Subscribe For 12 Months
                or More)
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutMeExpertPanel;



