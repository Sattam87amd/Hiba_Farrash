"use client";

import Image from "next/image";

const HowItWorks = () => {
  return (
    <div className="flex flex-col md:flex-row flex-wrap gap-8 md:gap-16 p-6 bg-[#EDECE8] justify-center">
      {/* Left Side Cards */}
      <div className="space-y-8 md:space-y-12">
        {/* How It Works Card */}
        <div className="bg-[#F8F7F3] p-4 md:p-8 shadow-md w-full md:w-[600px] md:min-h-[360px] overflow-hidden">
          <h2 className="text-2xl md:text-4xl font-semibold mb-6">How It Works</h2>
          <div className="space-y-6">
            {[
              { number: "1", title: "Browse & Choose", description: "Find an expert based on your needs." },
              { number: "2", title: "Book A Video Call", description: "Pick a time and confirm your session." },
              { number: "3", title: "One on One and Group Session", description: "Join a live video call and gain valuable insights." },
            ].map((step) => (
              <div key={step.number} className="flex items-start gap-4">
                <div className="bg-black text-white rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold">
                  {step.number}
                </div>
                <div>
                  <h3 className="text-lg md:text-2xl font-bold">{step.title}</h3>
                  <p className="text-sm md:text-sm font-semibold text-black">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instant Access to Insights Card */}
        <div className="bg-black text-white p-4 md:p-8 shadow-md w-full md:w-[600px] md:min-h-[360px] overflow-hidden">
          <Image src="/instantaccess.png" alt="Instant Access" width={100} height={80} className="mb-6" />
          <h3 className="text-xl md:text-3xl font-light">Instant Style Clarity</h3>
          <p className="hidden md:block text-sm md:text-base font-thin mt-4 leading-relaxed">
            Resolve fashion dilemmas in real-time video sessions <br />

             Instant Access to Insights ensures users get valuable knowledge 
            in real-time, enabling quick decision-making. This boosts 
            efficiency, enhances learning, and keeps them ahead of the 
            competition.
          </p>
          <p className="text-xs md:text-base font-thin mt-4 leading-relaxed md:hidden">
           
          </p>
        </div>

        {/* 100% Secure Payments Card */}
        <div className="bg-[#F8F7F3] p-4 md:p-8 shadow-md w-full md:w-[600px] md:min-h-[360px] overflow-hidden">
          <Image src="/secure.png" alt="100% Secure Payments" width={100} height={80} className="mb-6" />
          <h3 className="text-xl md:text-3xl font-light">100% Secure Payments</h3>
          <p className="text-sm md:text-base font-thin mt-4 leading-relaxed">
            100% Secure Payments ensure safe transactions, protecting customer data and preventing fraud. This builds trust, enhances credibility, and provides a worry-free payment experience.
          </p>
        </div>
      </div>

      {/* Right Side Cards */}
      <div className="space-y-8 md:space-y-12 md:mt-32">
        {/* Top Industry Experts Card */}
        <div className="bg-[#F8F7F3] p-4 md:p-8 shadow-md w-full md:w-[600px] md:min-h-[360px] overflow-hidden">
          <Image src="/top.png" alt="Top Industry Experts" width={100} height={80} className="mb-6" />
          <h3 className="text-xl md:text-3xl font-light">Saudi Fashion Visionary</h3>
          <p className="text-sm md:text-base font-thin mt-4 leading-relaxed">
            Award-winning Saudi Designer @fashionasc Council "TIMELESS & STYLE" Philosophy
✨ Elevate your brand with luxury aesthetics 🌟 Fuse tradition + modern innovation 💫 Craft distinctive style identities

Personalized Niche Award-winning guidance
          </p>
        </div>

        {/* Flexible Scheduling Card */}
        <div className="bg-[#F8F7F3] p-4 md:p-8 shadow-md w-full md:w-[600px] md:min-h-[360px] overflow-hidden">
          <Image src="/schedule.png" alt="Flexible Scheduling" width={100} height={80} className="mb-6" />
          <h3 className="text-xl md:text-3xl font-light">Flexible Scheduling</h3>
          <p className="text-sm md:text-sm font-thin mt-4 leading-relaxed">
            Flexible Scheduling offers convenience and accessibility, allowing users to book services at their preferred time. This enhances customer satisfaction, boosts engagement, and accommodates diverse needs effortlessly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
