"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion"; // Import framer-motion for animation
import { HiBadgeCheck } from "react-icons/hi";

// Expert Data (5 experts repeated 3 times)
const experts = [
  {
    name: "Aaliya Abadi",
    role: "Founder Of Drybar (Sold For $255M)",
    description:
      "Grew Drybar to 150 locations across the US with products sold at Sephora, Nordstrom, Ulta Beauty, and Macy’s.",
    price: "$450",
    image: "/aaliyaabadi.png",
  },
  {
    name: "Aisha Aziz",
    role: "Founder Of Drybar (Sold For $255M)",
    description:
      "Grew Drybar to 150 locations across the US with products sold at Sephora, Nordstrom, Ulta Beauty, and Macy’s.",
    price: "$600",
    image: "/aishaaziz.png",
  },
  {
    name: "Jenny Wilson",
    role: "Founder Of Drybar (Sold For $255M)",
    description:
      "Grew Drybar to 150 locations across the US with products sold at Sephora, Nordstrom, Ulta Beauty, and Macy’s.",
    price: "$250",
    image: "/jennywilson.png",
  },
  {
    name: "Guy Hawkins",
    role: "Founder Of Drybar (Sold For $255M)",
    description:
      "Grew Drybar to 150 locations across the US with products sold at Sephora, Nordstrom, Ulta Beauty, and Macy’s.",
    price: "$1500",
    image: "/guyhawkins.png",
  },
  {
    name: "Ralph Edwards",
    role: "Founder Of Drybar (Sold For $255M)",
    description:
      "Grew Drybar to 150 locations across the US with products sold at Sephora, Nordstrom, Ulta Beauty, and Macy’s.",
    price: "$450",
    image: "/ralphedwards.png",
  },
];

const repeatedExperts = [...experts, ...experts, ...experts];

const LoginTopExpert = () => {
  return (
    <div className="bg-white py-10 px-4">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="flex flex-col md:flex-row md:h-40 items-center mb-6"
      >
        <h1 className="text-3xl md:text-[60px] font-bold text-black">
          Top Experts
        </h1>
        <p className="text-[#9C9C9C] md:pt-5 pl-5 md:text-2xl">
          Access to the best has never been easier
        </p>
      </motion.div>

      {/* Cards Section */}
      <div className="overflow-x-auto md:overflow-visible">
        <motion.div
          className="flex md:grid md:grid-cols-5 gap-4 md:gap-x-64 px-4 md:px-0 overflow-x-scroll scrollbar-hide"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
          }}
        >
          {repeatedExperts.map((expert, index) => (
            <Link key={index} href={`/expertaboutme`} passHref>
              <motion.div
                className="relative min-w-[280px] md:w-full h-[400px] flex-shrink-0 overflow-hidden shadow-lg rounded-lg cursor-pointer"
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
                }}
                whileHover={{ scale: 1.05 }}
              >
                {/* Expert Image */}
                <img
                  src={expert.image}
                  alt={expert.name}
                  className="w-full h-full object-cover"
                />

                {/* Price Badge */}
                <div className="absolute top-4 right-4 bg-[#F8F7F3] text-black px-4 py-2 rounded-2xl shadow-xl font-semibold">
                  {expert.price}
                </div>

                {/* Info Box */}
                <div className="absolute bottom-1 left-1 right-1 bg-white/80 backdrop-blur-md p-4 m-2 rounded-lg shadow-lg">
                  <h2 className="text-lg font-semibold text-black flex items-center gap-1">
                    {expert.name}
                    <HiBadgeCheck className="w-5 h-5 text-yellow-500" />
                  </h2>
                  <p className="text-xs text-gray-800 mt-1">{expert.description}</p>
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default LoginTopExpert;
