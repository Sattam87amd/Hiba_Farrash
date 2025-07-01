"use client";

import React, { useState } from "react";

const WhatToExpect = () => {
  const [expectations, setExpectations] = useState({
    "15 minute session": "",
    "30 minute session": "",
    "45 minute session": "",
  });

  // Handle input changes
  const handleInputChange = (session, value) => {
    setExpectations({ ...expectations, [session]: value });
  };

  return (
    <div className="bg-white rounded-2xl p-1 space-y-6">
      {/* Title */}
      <h2 className="text-lg md:text-2xl font-semibold text-black">
        What to expect
      </h2>
      <p className="text-gray-600 text-sm">
        Share examples of what can be accomplished during a session
      </p>

      {/* Session Types */}
      {Object.keys(expectations).map((session, index) => (
        <div key={index} className="space-y-4">
          {/* Session Button (on top) */}
          <button className="md:w-auto bg-black text-white text-sm font-semibold py-3 md:py-4 px-7 md:px-10 rounded-md ">
            {session}
          </button>

          {/* Example Input (below session button) */}
          <div>
            <label className="block text-black text-sm font-semibold mb-6">
              Example #{index + 1}
            </label>
            <input
              type="text"
              value={expectations[session]}
              onChange={(e) => handleInputChange(session, e.target.value)}
              placeholder="- Tap to add an example"
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-black focus:border-black block w-full pl-5 py-3.5"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default WhatToExpect;
