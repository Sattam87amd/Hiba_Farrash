"use client";

import React from "react";
import { motion } from "framer-motion";

// 15 Experts (5 experts repeated 3 times)
const experts = [
  {
    name: "Aaliya Abadi",
    role: "Founder Of Drybar (Sold For $255M)",
    description:
      "Grew Drybar to 150 locations across the US with products sold at Sephora, Nordstrom, Ulta Beauty, and Macy’s.",
    price: "$450",
    image: "/aaliaabadi.png",
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

// Repeat experts 3 times to match the original list
const repeatedExperts = [...experts, ...experts, ...experts];

const UserStyleBeautyExperts = () => {
  return (
    <div className="bg-white py-10 px-4">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8"
      >
        <div>
          <h1 className="text-4xl font-bold">Style & Beauty Experts</h1>
          <p className="text-gray-500 sm:ml-52 mb-10 text-sm sm:text-base">
            Access to the best experts has never been easier
          </p>
        </div>
      </motion.div>

      {/* Experts Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
        }}
      >
        {repeatedExperts.map((expert, index) => (
          <motion.div
            key={index}
            className="relative overflow-hidden shadow-lg rounded-xl"
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
            }}
            whileHover={{ scale: 1.05 }}
          >
            {/* Image Section */}
            <div className="relative w-full h-96">
              <img
                src={expert.image}
                alt={expert.name}
                className="w-full h-full object-contain rounded-xl"
              />
              {/* Price Badge */}
              <div className="absolute top-4 right-4 bg-white text-black font-bold py-1 px-3 rounded-full shadow-md">
                {expert.price}
              </div>

              {/* Glass Effect Info Box */}
              <motion.div
                className="absolute bottom-0 left-0 w-60 h-40 ml-6 mb-2 bg-white/30 backdrop-blur-lg p-4 rounded-xl text-black"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: index * 0.1 }}
              >
                <h2 className="text-xl font-bold">
                  {expert.name} <span className="text-yellow-500">⭐</span>
                </h2>
                <p className="text-sm text-black mt-1">{expert.role}</p>
                <p className="text-xs text-gray-800 mt-1">{expert.description}</p>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default UserStyleBeautyExperts;
