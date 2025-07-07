"use client";

import React from "react";

// Review Data
const reviews = [
  {
    name: "Sarah Steiner",
    text: "A seamless experience from start to finish. Impressed by professionalism and attention to detail. Highly recommend!",
    role: "VP Sales at Google",
    image:
      "https://images.unsplash.com/photo-1511485977113-f34c92461ad9?crop=faces&cs=tinysrgb&fit=crop&fm=jpg&ixid=MnwxfDB8MXxhbGx8fHx8fHx8fHwxNjIwMTQ5ODEx&ixlib=rb-1.2.1&q=80&w=100&h=100",
  },
  {
    name: "Dylan Ambrose",
    text: "Make sure you only pick the right sentence to keep it short and simple.",
    role: "Lead Marketer at Netflix",
    image:
      "https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&crop=faces&fit=crop&w=100&h=100&q=80",
  },
  {
    name: "Gabrielle Winn",
    text: "This is an awesome landing page template I've seen. I would use this for anything.",
    role: "Co-founder of Acme Inc",
    image:
      "https://images.unsplash.com/photo-1624224971170-2f84fed5eb5e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100&crop=faces&q=80",
  },
];

const OurClientsSay = () => {
  return (
    <div className="bg-[#EDECE8] py-10 px-4 md:px-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left Side - Image Section with Heading */}
        <div className="relative">
          {/* Heading on Top Left for desktop */}
          <div className="hidden md:block absolute top-0 left-0 bg-white w-[310px] h-[170px] text-black text-[40px] text-center font-semibold px-0 py-5 rounded-br-3xl ">
            <h1>
              {" "}
              Why Consult <br />
              with Hiba?
            </h1>
          </div>

          {/* Heading on Top Left for mobile */}
          <div className="absolute top-0 left-0 bg-white text-black px-4 py-2 rounded-br-lg md:hidden">
            <h1> Why Consult with Hiba?</h1>
          </div>

          {/* Image */}
          <img
            src="HomeImg/whyConsult.png"
            alt="Why Consult"
            className="w-[50rem] h-[50rem] rounded-lg shadow-md"
          />
        </div>

        {/* Right Side - Review Cards */}
        <div>
          <div className="space-y-6">
            {reviews.map((review, index) => (
              <div
                key={index}
                className="bg-[#F8F7F3] text-black p-6 rounded-3xl shadow-sm md:h-56"
              >
                {/* Rating Stars */}
                <div className="flex mb-4">
                  {Array.from({ length: index === 1 ? 4 : 5 }).map(
                    (_, starIndex) => (
                      <svg
                        key={starIndex}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        className="w-5 h-5 text-yellow-500"
                      >
                        <path d="M12 2l2.39 7.26h7.61l-6.15 4.47 2.39 7.27-6.15-4.48-6.15 4.48 2.39-7.27-6.15-4.47h7.61L12 2z" />
                      </svg>
                    )
                  )}
                </div>

                {/* Review Text */}
                <p className="text-lg mb-4">{review.text}</p>

                {/* User Info */}
                <div className="flex items-center space-x-4">
                  <img
                    src={review.image}
                    alt={review.name}
                    className="w-14 h-14 rounded-full"
                  />
                  <div>
                    <h4 className="text-lg font-semibold">{review.name}</h4>
                    <p className="text-sm text-gray-600">{review.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurClientsSay;
