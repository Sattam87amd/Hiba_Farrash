import React from "react";

const ConnectWithExpertCard = () => {
  return (
    <div className="bg-white py-12 px-6">
      {/* Heading */}
      <div className="md:my-3">
      <h1 className="text-center text-3xl md:text-[40px] md:uppercase  font-semibold text-black mb-8">
        Connect with Experts, Anytime, Anywhere
      </h1>
      </div>
      <div className="flex flex-col md:flex-row items-center justify-center md:mx-44 md:mt-20 space-y-6 md:space-y-0">
        {/* Left Text Section */}
        <div className="md:w-[70%]">
          <p className="text-lg text-black text-center leading-relaxed md:hidden">
            Our mission is to connect individuals with top experts across various industries, providing personalized advice and insights to help them achieve their goals.
          </p>
          <p className="hidden md:block text-2xl md:text-3xl text-black font-medium text-justify leading-loose tracking-wide px-20 ">
            Our Mission Is To Connect Individuals With Top 
            Experts Across Various Industries, Providing 
            Personalized Advice And Insights To Help 
            Them Achieve Their Goals.
          </p>
        </div>

        {/* Right Image Section */}
        <div className="md:w-[30%] flex justify-center rounded-lg">
          <img
            className="w-full h-[450px] rounded-lg shadow-lg"
            src="/connectwitheexperts.png"
            alt="Connect with Experts"
          />
        </div>
      </div>
    </div>
  );
};

export default ConnectWithExpertCard;