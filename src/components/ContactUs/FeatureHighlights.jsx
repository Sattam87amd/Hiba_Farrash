"use client";

import React from "react";

const FeatureHighights = () => {
  const features = [
    {
      title: (
        <>
          Save time and money,
          <br />
          guaranteed
        </>
      ),
      description: (
        <>
          Our guarantee - find value in your first session 
        </>
      ),
    },
    {
      icon: (
        <img
          src="/badgeicon.png"
          alt="Badge Icon"
          className="w-10 h-12 md:w-12 md:h-16"
        />
      ),
      title: (
        <>
          Get access to the <br />
          world’s best
        </>
      ),
      description: (
        <>
          Meet our top expert Hiba Farrash, specializing in Fashion and Beauty
        </>
      ),
    },
    {
      title: (
        <>
          Personalized advice <br />
          just for you
        </>
      ),
      description: (
        <>
          Book a 1-on-1 private session & get <br />
          advice that is tailored to you
        </>
      ),
    },
  ];

  return (
    <div className="bg-white py-10 px-4 md:min-h-[400px] flex items-center justify-center h-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
        {features.map((feature, index) => (
          <div key={index} className="flex flex-col items-center text-center">
            {index === 1 ? (
              // Special layout for the second feature (with badge image on the left)
              <div className="flex items-center mb-6">
                <div className="mr-4">{feature.icon}</div>
                <h3 className="text-2xl md:text-3xl font-semibold text-center">
                  {feature.title}
                </h3>
              </div>
            ) : (
              // Default layout for other features
              <h3 className="text-2xl md:text-3xl font-semibold mb-4">
                {feature.title}
              </h3>
            )}

            <p className="text-gray-600 mt-2 text-base md:text-xl">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeatureHighights;
