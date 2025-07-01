"use client";

import { useState } from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UserDiscountCode = () => {
  const [code, setCode] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!code) {
      toast.error("Please enter a discount code.");
      return; // Prevent submission if code is empty
    }

    toast.success(`Code submitted: ${code}`);
    setCode(""); // Clear input after submission
  };

  return (
    <div className="w-full p-4 md:p-6 flex flex-col items-center md:items-start text-center md:text-left">
      <h2 className="text-2xl font-bold text-black">Do you have a code?</h2>
      <p className="text-gray-600 py-6">Gift card or discount coupon</p>

      {/* Form Section */}
      <form
        onSubmit={handleSubmit}
        className="mt-4 flex flex-col space-y-6 w-full max-w-md"
      >
        <input
          type="text"
          placeholder="Enter your code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="border border-gray-400 p-3 rounded-md w-80 focus:outline-none focus:ring-2 focus:ring-black"
        />

        {/* Ensuring Button is Always Centered */}
        <div className="flex justify-center w-full md:ml-36 md:pt-10">
          <button
            type="submit"
            className="bg-black text-white text-center px-12 md:px-20 py-3 rounded-2xl font-normal hover:bg-gray-900 transition-all"
          >
            Submit
          </button>
        </div>
      </form>

      {/* Toast Notifications Container */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </div>
  );
};

export default UserDiscountCode;
