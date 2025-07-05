"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Gift, ShoppingBag } from "lucide-react";
import { IoIosSearch } from "react-icons/io";
import { LuNotepadText } from "react-icons/lu";

function BuyGiftSession() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    cardNumber: "",
    expiryDate: "",
    cardHolder: "",
    message: "",
    anonymous: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleBuy = () => {
    console.log("Buying Gift Card with Data:", formData);
    router.push("/paymentgiftsession");
  };

  const renderBuyGiftCard = () => (
    <div className="w-full bg-white p-6 mx-1 md:mx-6 relative">
      <div className="md:hidden">
        <button
          className="absolute top-2 left-2 z-10 p-2"
          onClick={() => router.push('/giftsession')}
        >
          <ArrowLeft className="w-5 h-5 text-black" />
        </button>

        <div className="flex justify-center pt-8 mb-4">
          <Image src="/Shourk_logo.png" alt="Shourk Logo" width={250} height={40} />
        </div>
      </div>

      <div className="flex flex-col items-center space-y-2 mt-10 mb-12">
        <Gift strokeWidth={0.9} className="w-10 h-10 md:w-14 md:h-14 text-black" />
        <h2 className="text-lg font-semibold">Send a Gift Card</h2>
      </div>

      <form className="space-y-4">
        <input
          type="email"
          name="email"
          placeholder="Recipient Email"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none"
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="phone"
          placeholder="Recipient Phone Number"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none"
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="cardNumber"
          placeholder="Card Number"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none"
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="expiryDate"
          placeholder="Expiry Date (MM/YY)"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none"
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="cardHolder"
          placeholder="Card Holder Name"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none"
          onChange={handleChange}
          required
        />
        <textarea
          name="message"
          placeholder="Personalized Message (Optional)"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none"
          onChange={handleChange}
        />

        <div className="flex justify-end items-center space-x-2">
          <input
            type="checkbox"
            id="anonymous"
            name="anonymous"
            className="w-4 h-4 accent-black"
            onChange={handleChange}
          />
          <label htmlFor="anonymous" className="text-sm font-medium  text-gray-900">
            Send Anonymously
          </label>
        </div>

        <div className="flex justify-center items-center pb-16">
          <button
            type="button"
            className="w-52 bg-black text-white py-3 rounded-2xl flex justify-center items-center space-x-2"
            onClick={handleBuy}
          >
            <span>Buy</span>
            <ShoppingBag size={18} />
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      <div className="hidden md:flex w-1/2 flex-col relative h-screen">
        <div className="h-[35%] bg-[#EDECE8] flex items-center justify-center relative">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <Image src="/Shourk_logo.png" alt="Shourk Logo" width={190} height={190} />
          </div>

          <div className="absolute top-full left-4 w-[355px] h-[78px] bg-black bg-opacity-50 backdrop-blur-[3px] rounded-xl flex items-center p-4 z-30 shadow-lg">
            <IoIosSearch className="text-white text-[50px] mr-2" />
            <div>
              <h2 className="text-white font-light text-2xl">Professional Experts</h2>
              <p className="text-white text-xs font-extralight">
                Expert Guidance from the Best in the Industry
              </p>
            </div>
          </div>
        </div>

        <div className="h-[65%] bg-[#F8F7F3] flex items-end justify-center relative">
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
            src="/ArabWomanLogin.svg"
            alt="Arab Woman"
            width={490}
            height={600}
            className="object-contain z-20"
          />

          <div className="absolute bottom-14 right-8 w-[355px] h-[78px] bg-black bg-opacity-50 backdrop-blur-[3px] rounded-xl flex items-center p-4 z-30 shadow-lg">
            <LuNotepadText className="text-white text-[50px] mr-2" />
            <div>
              <h2 className="text-white font-medium text-xl">Book an appointment</h2>
              <p className="text-white text-lg font-extralight">Call/text/video/inperson</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full md:ml-auto md:w-1/2 flex items-start md:items-center justify-center">
        {renderBuyGiftCard()}
      </div>
    </div>
  );
}

export default BuyGiftSession;
