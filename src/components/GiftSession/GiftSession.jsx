"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Gift, ArrowLeft } from "lucide-react";

function GiftSession() {
  const router = useRouter();
  const amounts = [200, 500, 750, 1000];
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState("");

  const handleAmountClick = (amount) => {
    setSelectedAmount((prev) => (prev === amount ? null : amount));
    setCustomAmount("");
  };

  const handleContinue = () => {
    router.push("/buygiftsession");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image Section (Desktop Only) */}
      <div className="hidden md:flex w-1/2 flex-col relative">
        <div className="h-full bg-[#F8F7F3] flex items-end justify-center relative">
          <div className="absolute top-0 left-0 w-full">
            <svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
              <path
                fill="#EDECE8"
                fillOpacity="1"
                d="M0,192L120,165.3C240,139,480,85,720,85C960,85,1200,139,1320,165.3L1440,192V0H0Z"
              ></path>
            </svg>
          </div>
          <Image
            src="/AwabWomen.png"
            alt="Arab Woman"
            width={800}
            height={800}
            className="object-cover"
            style={{ height: "800px" }}
          />
        </div>
      </div>

      {/* Right Side - Gift Card Section */}
      <div className="w-full md:w-1/2 flex items-start md:items-center justify-center bg-white">
        <div className="w-full bg-white p-6 rounded-xl md:border mx-1 md:mx-10 relative">
          {/* Back Button - Visible on All Screen Sizes */}
          <button
            className="absolute top-6 left-6 z-10 p-2 flex items-center text-black hover:text-gray-600 transition-colors"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            <span className="text-sm font-medium">Back</span>
          </button>

          {/* Mobile Only Logo */}
          <div className="md:hidden">
            <div className="flex justify-center pt-8 mb-4">
              <Image src="/Shourk_logo.png" alt="Shourk Logo" width={250} height={40} />
            </div>
          </div>

          {/* Gift Header */}
          <div className="flex flex-col items-center space-y-2 mt-10 mb-12">
            <Gift strokeWidth={0.9} className="w-10 h-10 md:w-14 md:h-14 text-black" />
            <h2 className="text-lg font-semibold">Send a gift card</h2>
            <p className="text-[#3B9AB8] text-center text-sm md:text-xl">
              Gift a session to a friend, family, <br />
              or coworker
            </p>
          </div>

          {/* Amount Selection */}
          <div className="mt-5">
            <h3 className="text-lg md:text-2xl font-semibold">Buy a gift card</h3>
            <p className="text-black text-sm md:text-xl mb-6">Please select an amount</p>
            <div className="grid grid-cols-3 gap-3 md:grid-cols-5 mt-4 mb-9">
              {amounts.map((amount) => (
                <button
                  key={amount}
                  className={`p-3 text-center font-semibold transition-all rounded ${
                    selectedAmount === amount
                      ? "bg-black text-white"
                      : "bg-[#D9D9D9] text-black"
                  }`}
                  onClick={() => handleAmountClick(amount)}
                >
                  ${amount}
                </button>
              ))}
              <input
                type="number"
                min={1}
                className="p-3 border border-gray-400 text-center w-full rounded focus:outline-none"
                placeholder="Custom"
                value={customAmount}
                onChange={(e) => {
                  const value = e.target.value;
                  setCustomAmount(value);
                  setSelectedAmount(null);
                }}
              />
            </div>
          </div>

          {/* Continue Button */}
          <div className="mt-6 flex justify-center pb-8">
            <button
              className="w-56 bg-black text-white py-3 rounded-2xl font-normal disabled:opacity-50"
              disabled={!selectedAmount && !customAmount}
              onClick={handleContinue}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GiftSession;