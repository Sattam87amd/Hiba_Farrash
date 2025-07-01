"use client";

import React from "react";
import { FaInstagram, FaTwitter } from "react-icons/fa";
import { MdAlternateEmail } from "react-icons/md";

const GetInTouch = () => {
  return (
    <div className="relative min-h-screen md:pt-24 mt-24">
      {/* Background Layout - Custom Split */}
      <div className="absolute inset-0 grid grid-cols-[52%_48%] min-h-screen">
        <div className="bg-[#F8F7F3] h-full"></div>
        <div className="bg-[#EDECE8] h-full"></div>
      </div>

      {/* Centered Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 md:px-0">
        <div className="text-center">
          <h1 className="text-[36px] md:text-[52px] font-bold text-black pt-16">
            Get in touch
          </h1>
          <p className="mt-4 text-black text-base md:text-[22px] pb-9">
            Have questions or need more details? Contact us today—we're here to
            help!
          </p>
        </div>

        {/* Cards Section */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 pb-8">
          {/* Card 1: Social Media */}
          <div className="bg-white p-6 rounded-xl border border-[#A6A6A6] text-start w-full max-w-sm">
            <div className="flex justify-start mb-4">
              <img
                src="/socialmediaicon.png"
                alt="Social Media Icon"
                className="w-10 h-10"
              />
            </div>

            <h2 className="text-xl md:text-2xl  text-black">
              Our Social Media
            </h2>
            <p className="text-gray-700 mt-2">We'd love to hear from you.</p>

            <div className="flex justify-start gap-4 items-center mt-4">
              <FaInstagram className="text-black text-3xl mx-2" />
              <FaTwitter className="text-black text-3xl mx-2" />
            </div>
          </div>

          {/* Card 2: Chat Support */}
          <div className="bg-white p-6 rounded-xl border border-[#A6A6A6] text-left w-full max-w-sm">
            <div className="flex justify-start mb-4">
              <img
                src="/chaticon.png"
                alt="Chat Icon"
                className="w-8 h-8 md:w-10 md:h-10"
              />
            </div>

            <h2 className="text-xl md:text-2xl  text-black">Chat to Support</h2>
            <p className="text-gray-700 mt-2">We're here to help</p>

            <button className="mt-3 px-4 py-2 bg-white text-black border border-black rounded-xl">
              Chat to Support
            </button>
          </div>

          {/* Card 3: Email */}
          <div className="bg-white p-6 rounded-xl border border-[#A6A6A6] text-left w-full max-w-sm">
            <div className="flex justify-start mb-4">
              <MdAlternateEmail className="text-black text-4xl" />
            </div>

            <h2 className="text-xl md:text-2xl  text-black">Leave us a Mail</h2>
            <p className="text-gray-700 text-sm mt-2">
              If not available, you can send us an email at
            </p>
            <p className="mt-8 text-black">shourk@gmail.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetInTouch;
