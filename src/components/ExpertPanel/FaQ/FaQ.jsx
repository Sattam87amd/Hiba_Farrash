"use client";

import React from "react";
import Image from "next/image";
function FaQ() {
  return (
    <div className="relative min-h-screen">
      {/* Background Layout - Custom Split */}
      <div className="absolute inset-0 grid grid-cols-[52%_48%] min-h-screen">
        <div className="bg-[#F8F7F3] h-full">
        <div className="lg:block hidden absolute top-[30%] left-[25%]">
              <Image src="/public/logo1.png"
              alt="/"
              height={40}
              width={40}
              />
            </div>
            <div className="lg:block hidden absolute top-[50%] left-[3%]">
              <Image src="/public/logo6.png"
              alt="/"
              height={40}
              width={40}
              />
            </div>
            <div className="lg:block hidden absolute top-[70%] left-[15%]">
              <Image src="/public/logo5.png"
              alt="/"
              height={50}
              width={40}
              />
            </div>
        </div>
        <div className="bg-[#EDECE8] h-full">
        <div className="lg:block hidden absolute top-[30%] right-[25%]">
              <Image src="/public/logo2.png"
              alt="/"
              height={40}
              width={40}
              />
            </div>
            <div className="lg:block hidden absolute top-[50%] right-[5%]">
              <Image src="/public/logo3.png"
              alt="/"
              height={40}
              width={40}
              />
            </div>
            <div className="lg:block hidden absolute top-[80%] right-[40%]">
              <Image src="/public/logo4.png"
              alt="/"
              height={40}
              width={40}
              />
            </div>
        </div>
      </div>

      {/* Centered Content */}
      <div className="relative z-10 flex flex-col top-80 items-center justify-center h-full px-4 md:px-0">
        <h1 className="text-3xl md:text-[65px] font-extrabold md:font-bold text-black text-center mb-6 md:mb-24">
          FaQ
        </h1>
        <p className="hidden md:block text-xl text-center max-w-6xl">
          Lorem ipsum dolor sit amet consectetur. Non commodo mi elit ut
          convallis. Tempor facilisi pellentesque sem <br /> praesent tortor venenatis.
          Diam volutpat interdum quis senectus. Quam eros nunc habitant
          placerat arcu accumsan.
        </p>
        {/* for mobile */}
        <p className="text-sm text-center max-w-5xl md:hidden">
          Lorem ipsum dolor sit amet consectetur. Non commodo mi elit ut
          convallis. Tempor facilisi pellentesque sem praesent tortor venenatis.
          Diam volutpat interdum quis senectus. Quam eros nunc habitant
          placerat arcu accumsan.
        </p>
      </div>
    </div>
  );
}

export default FaQ;
