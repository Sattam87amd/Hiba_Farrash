"use client";

import React from "react";
import Link from "next/link";
import { HiBadgeCheck } from "react-icons/hi";
import { HiChevronRight } from "react-icons/hi"; // Importing right arrow icon

const expertData = [
  {
    name: "Aaliya Abadi",
    price: "$ 450",
    image: "/aaliyaabadi.png",
    description:
      "Founder of Drybar (Sold for $255M). Grew Drybar to 150 locations across the US with products sold at Sephora, Nordstrom, Ulta Beauty, Macy’s.",
  },
  {
    name: "Aisha Aziz",
    price: "$ 600",
    image: "/aishaaziz.png",
    description:
      "Founder of Drybar (Sold for $255M). Grew Drybar to 150 locations across the US with products sold at Sephora, Nordstrom, Ulta Beauty, Macy’s.",
  },
  {
    name: "Jenny Wilson",
    price: "$ 250",
    image: "/jennywilson.png",
    description:
      "Founder of Drybar (Sold for $255M). Grew Drybar to 150 locations across the US with products sold at Sephora, Nordstrom, Ulta Beauty, Macy’s.",
  },
  {
    name: "Guy Hawkins",
    price: "$ 1500",
    image: "/guyhawkins.png",
    description:
      "Founder of Drybar (Sold for $255M). Grew Drybar to 150 locations across the US with products sold at Sephora, Nordstrom, Ulta Beauty, Macy’s.",
  },
  {
    name: "Ralph Edwards",
    price: "$ 450",
    image: "/ralphedwards.png",
    description:
      "Founder of Drybar (Sold for $255M). Grew Drybar to 150 locations across the US with products sold at Sephora, Nordstrom, Ulta Beauty, Macy’s.",
  },
];

const ExpertsCards = () => {
  return (
    <div className="bg-white p-6">
      {/* Heading Section */}
      <div className="flex flex-col md:flex-row md:h-40 items-center mb-6 md:mb-0">
        <h1 className="text-3xl md:text-[60px] font-bold text-black">
          Top Experts
        </h1>
        <p className="text-[#9C9C9C] md:pt-5 pl-5 md:text-2xl">
          Access to the best has never been easier
        </p>
      </div>

      {/* "See All" Button */}
      <div className="flex justify-start mb-6">
        <Link href="/topexperts" passHref>
          <button className="flex items-center text-xl font-semibold text-black">
            See All
            <HiChevronRight className="ml-2 w-5 h-5" />
          </button>
        </Link>
      </div>

      {/* Cards Section - Horizontal Scroll on Small Screens, Grid on Medium+ */}
      <div className="overflow-x-auto md:overflow-visible">
        <div className="flex md:grid md:grid-cols-5 gap-4 md:gap-80 px-4 md:px-0 overflow-x-scroll scrollbar-hide">
          {expertData.map((expert, index) => (
            <Link key={index} href={`/expertaboutme`} passHref>
              <div className="relative min-w-[280px] md:w-full h-[400px] flex-shrink-0 overflow-hidden shadow-lg cursor-pointer">
                {/* Background Image */}
                <img
                  src={expert.image}
                  alt={expert.name}
                  className="w-full h-full object-cover"
                />

                {/* Price Tag */}
                <div className="absolute top-4 right-4 bg-[#F8F7F3] text-black px-4 py-2 rounded-2xl shadow-xl font-semibold">
                  {expert.price}
                </div>

                {/* Transparent Blur Card */}
                <div className="absolute bottom-1 left-1 right-1 bg-white/80 p-4 m-2 ">
                  <h2 className="text-lg font-semibold text-black flex items-center gap-1">
                    {expert.name}
                    <HiBadgeCheck className="w-6 h-6 text-yellow-500" />
                  </h2>
                  <p className="text-xs text-black mt-1">{expert.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExpertsCards;
