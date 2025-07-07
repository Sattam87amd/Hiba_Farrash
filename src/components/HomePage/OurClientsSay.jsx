"use client";

import React from "react";
import { User, TrendingUp, Palette, ShoppingBag } from "lucide-react";

const services = [
  {
    title: "Find Your Style Identity",
    description: "Discover a look that reflects your personality and goals, not just trends.",
    icon: User,
    color: "bg-rose-50 text-rose-600",
    borderColor: "border-rose-200",
  },
  {
    title: "Grow Your Fashion Brand",
    description: "Get expert advice on brand positioning, challenges, and how to stand out.",
    icon: TrendingUp,
    color: "bg-blue-50 text-blue-600",
    borderColor: "border-blue-200",
  },
  {
    title: "Color & Style Analysis",
    description: "Learn what colors, cuts, and makeup suit you best, tailored to your body and tone.",
    icon: Palette,
    color: "bg-purple-50 text-purple-600",
    borderColor: "border-purple-200",
  },
  {
    title: "Smart Shopping & Styling",
    description: "Shop with confidence. Learn how to pick and style pieces that elevate your wardrobe.",
    icon: ShoppingBag,
    color: "bg-emerald-50 text-emerald-600",
    borderColor: "border-emerald-200",
  },
];

const OurClientsSay = () => {
  return (
    <div className="bg-[#EDECE8] py-16 px-4 md:px-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto items-start">
        
        {/* Left Side - Image with Heading */}
        <div className="relative w-full order-1 lg:order-1">
          {/* Heading for Desktop */}
          <div className="hidden md:block absolute top-0 left-0 bg-white w-[310px] h-[170px] text-black text-[28px] text-center font-semibold px-2 py-5 rounded-br-3xl shadow z-10">
            <h1>
              Why Consult <br />
              with Hiba?
            </h1>
          </div>
          {/* Heading for Mobile */}
          <div className="absolute top-0 left-0 bg-white text-black px-4 py-2 rounded-br-lg md:hidden shadow z-10">
            <h1 className="text-lg font-semibold">Why Consult with Hiba?</h1>
          </div>
          {/* Image */}
          <img
            src="HomeImg/whyConsult.png"
            alt="Why Consult"
            className="w-full h-auto rounded-lg shadow-md"
          />
        </div>

        {/* Right Side - Compact Service Cards */}
        <div className="grid grid-cols-1 gap-4 order-2 lg:order-2 mt-16">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div
                key={index}
                className={`bg-white p-5 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 border ${service.borderColor} relative overflow-hidden group`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon with colored background */}
                  <div className={`flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-lg ${service.color} group-hover:scale-105 transition-transform duration-300`}>
                    <IconComponent size={20} className="stroke-[1.5]" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-base md:text-lg font-semibold mb-2 text-black group-hover:text-gray-800 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>
                
                {/* Subtle accent line */}
                <div className={`absolute bottom-0 left-0 w-full h-0.5 ${service.color.split(' ')[0]} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OurClientsSay;