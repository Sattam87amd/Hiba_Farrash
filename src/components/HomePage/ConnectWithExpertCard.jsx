import React from "react";

const ConnectWithExpertCard = () => {
  return (
    <div className="bg-white py-12 px-6">
      {/* Heading */}
      <div className="md:my-3">
      <h1 className="text-center text-3xl md:text-[40px] md:uppercase  font-semibold text-black mb-8">
        Connect with Hiba - Wherever You Are
      </h1>
      </div>
      <div className="flex flex-col md:flex-row items-center justify-center md:mx-44 md:mt-20 space-y-6 md:space-y-0">
        {/* Left Text Section */}
        <div className="md:w-[70%]">
          <p className="text-lg text-black text-center leading-relaxed md:hidden">
            Get direct access to one of Saudi Arabia's leading fashion experts. Whether you're building a brand or refining your personal style, Hiba offers personalized advice and insight to help you elevate your fashion journey.
          </p>
          <p className="hidden md:block text-2xl md:text-3xl text-black font-medium leading-loose tracking-wide px-20 ">
           Get direct access to one of Saudi Arabia's leading fashion experts.
           Whether you're building a brand or refining your personal style,
           Hiba offers personalized advice and insight to help you elevate your fashion journey.
          </p>
        </div>

        {/* Right Image Section */}
        <div className="md:w-[60%] flex justify-center rounded-none">
          <img
            className="w-full h-[450px] rounded-none shadow-lg"
            src="./HomeImg/hiba6.png"
            alt="Connect with Experts"
          />
        </div>
      </div>
    </div>
  );
};

export default ConnectWithExpertCard;