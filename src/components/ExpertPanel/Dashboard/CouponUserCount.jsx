"use client";
import React from "react";
import CountUp from "react-countup";

const CouponUserCount = () => {
  // Dummy data for coupons
  const coupons = [
    { name: "FreeShourk", discount: 15, usedBy: 200 },
    { name: "SaveBIG", discount: 20, usedBy: 350 },
  ];

  return (
    <div className=" md:mx-10 bg-white border  rounded-2xl p-6 mt-8">
      {/* Header */}
      <h2 className="text-lg md:text-2xl font-normal py-2 mb-4">Discount Coupon User Count</h2>

      {/* Coupon Cards */}
      <div className="flex flex-col gap-4 ">
        {coupons.map((coupon, index) => (
          <div
            key={index}
            className="border rounded-2xl flex justify-between items-center px-4 py-7"
          >
            {/* Left: Coupon Name */}
            <span className="text-black font-medium md:text-xl">{coupon.name}</span>

            {/* Right: Discount & Used By */}
            <div className="flex items-center gap-6">
              <span className="text-black md:pr-40 md:text-xl">{coupon.discount}% OFF</span>
              <span className="text-black md:text-xl pr-6">
                Used by:{" "}
                <CountUp
                  start={0}
                  end={coupon.usedBy}
                  duration={2}
                  separator=","
                  className="text-[#4CB269] font-semibold"
                />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CouponUserCount;
