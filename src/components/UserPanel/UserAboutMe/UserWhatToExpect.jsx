"use client";
import React, { useState } from "react";

const UserWhatToExpect = () => {
  const [selectedSession, setSelectedSession] = useState("Quick - 15min");

  const sessions = [
    {
      time: "Quick - 15min",
      title: "15 Minute Session",
      details: [
        " - Ask Three Or More Questions",
        " - Tips On How To Start A Successful Company",
        " - Advice On Getting Your First 10,000 Customers",
        " - Growth Hacks & Jumpstarting Growth",
      ],
    },
    {
      time: "Regular - 30min",
      title: "30 Minute Session",
      details: [
        " - Deeper insights into scaling strategies",
        " - Personalized feedback on your business ideas",
        " - In-depth customer acquisition discussion",
        " - Q&A session for growth challenges",
      ],
    },
    {
      time: "Extra - 45min",
      title: "45 Minute Session",
      details: [
        " - Extensive one-on-one coaching",
        " - Step-by-step guidance on business scaling",
        " - Best practices for branding & outreach",
        " - Advanced monetization strategies",
      ],
    },
    {
      time: "All Access - 60min",
      title: "60 Minute Session",
      details: [
        " - Comprehensive mentorship & roadmap planning",
        " - Customized strategies for business growth",
        " - Breakdown of investment & funding options",
        " - Hands-on business consulting session",
      ],
    },
  ];

  const activeSession = sessions.find((s) => s.time === selectedSession);

  return (
    <div className="bg-white md:px-28 px-8 md:py-10">
      {/* Session Selection Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6 md:mx-20">
        {sessions.map((session) => (
          <button
            key={session.time}
            onClick={() => setSelectedSession(session.time)}
            className={`py-2 px-2 md:py-3 md:px-4 w-full md:w-52 text-xs md:text-base transition ${
              selectedSession === session.time
                ? "bg-black text-white"
                : "bg-[#F8F7F3] text-black"
            }`}
          >
            {session.time}
          </button>
        ))}
      </div>

      <h2 className="text-2xl md:text-[44px] font-bold text-black mt-16 md:py-10 md:mb-6">
  What To Expect
</h2>


      {/* Session Information Card */}
     <div className="bg-white rounded-2xl p-6 md:px-16 flex flex-col md:flex-row items-start md:items-center md:justify-center gap-2 md:gap-6">

        <div className="flex-1">
          <h3 className="text-lg md:text-3xl font-bold text-black">
            {activeSession.title}
          </h3>
          <ul className="mt-3 space-y-2 text-black md:text-lg">
            {activeSession.details.map((point, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-black">•</span> {point}
              </li>
            ))}
          </ul>
        </div>

        {/* Right Side Image (Hidden on Small Screens) */}
        <img
          src="/sessionicon.png"
          alt="Session Icon"
          className="hidden md:block w-56 h-52"
        />
      </div>
    </div>
  );
};

export default UserWhatToExpect;
