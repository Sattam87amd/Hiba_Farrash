"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { IoIosSearch } from "react-icons/io";
import { LuNotepadText } from "react-icons/lu";

const PaymentGiftSession = () => {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState("wallet");

  const handleSelection = (method) => {
    setSelectedMethod(method);
  };

  const handleBuy = () => {
    console.log("Payment method selected:", selectedMethod);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side: Image Section */}
      <div className="hidden md:flex w-1/2 flex-col relative">
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

      {/* Right Side: Payment Methods */}
      <div className="w-full md:w-1/2 flex items-start md:items-center justify-center relative">
        <div className="w-full p-4 md:p-6 md:pl-24">
          <div className="flex justify-center mb-6 md:hidden">
            <Image src="/Shourk_logo.png" alt="Shourk Logo" width={250} height={40} />
          </div>

          {/* Back Button */}
          <button
            className="absolute top-2 left-2 z-10 p-2 md:hidden"
            onClick={() => router.push('/buygiftsession')}
          >
            <ArrowLeft className="w-5 h-5 text-black" />
          </button>

          <h2 className="text-2xl font-bold text-black mb-6">Payment method</h2>

          {/* Wallet Section */}
          <div className="w-full md:w-[460px] border border-[#7E7E7E] rounded-xl p-6 mt-4 flex flex-col md:flex-row items-center justify-between bg-white shadow-md ">
            <Image
              src="/paymentimg.png"
              alt="Wallet"
              width={80}
              height={60}
              className="mx-auto md:mx-0"
            />
            <div className="mt-4 md:mt-0 md:mr-16 text-center">
              <p className="text-lg font-normal">Your Wallet Balance is-</p>
              <p className="text-3xl font-bold text-black mt-2">
                {selectedMethod === "wallet" ? `$1500` : ""}
              </p>
            </div>
          </div>

          {/* Payment Options */}
          <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                className="checkbox checkbox-neutral"
                checked={selectedMethod === "wallet"}
                onChange={() => handleSelection("wallet")}
              />
              <span className="text-sm md:text-lg font-medium">
                Pay through your Wallet. {" "}
                <a href="#" className="text-blue-500">
                  Add Money to your Wallet
                </a>
              </span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                className="checkbox checkbox-neutral"
                checked={selectedMethod === "paypal"}
                onChange={() => handleSelection("paypal")}
              />
              <span className="text-sm md:text-lg font-medium">Paypal</span>
              <Image src="/paypal.png" alt="Paypal" width={30} height={30} />
            </label>

            <label className="flex flex-col space-y-3 cursor-pointer">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  className="checkbox checkbox-neutral"
                  checked={selectedMethod === "card"}
                  onChange={() => handleSelection("card")}
                />
                <span className="text-sm md:text-lg font-medium">
                  Credit or Debit Card
                </span>
              </div>
              <Image src="/bankcards.png" alt="Bank Cards" width={550} height={5} />
            </label>

            <label className="flex flex-col space-y-3 cursor-pointer">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  className="checkbox checkbox-neutral"
                  checked={selectedMethod === "netbanking"}
                  onChange={() => handleSelection("netbanking")}
                />
                <span className="text-sm md:text-lg font-medium">Net Banking</span>
              </div>
              <select className="w-full md:w-48 p-2 border rounded-md bg-gray-100 text-gray-600">
                <option>Select Bank</option>
                <option>HDFC</option>
                <option>ICICI</option>
                <option>SBI</option>
                <option>Axis Bank</option>
              </select>
            </label>
          </div>

          {/* Buy Button */}
          <div className="flex justify-center items-center pt-14">
            <button
              type="button"
              className="w-40 bg-black text-white py-3 rounded-3xl flex justify-center items-center space-x-2"
              onClick={handleBuy}
            >
              <span className="text-center text-lg">Pay</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentGiftSession;
