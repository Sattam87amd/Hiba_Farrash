import React from "react";

const OurPartners = () => {
  const partners = [
    { logo: "/thestagelogo.png", name: "Thestage" },
    { logo: "/clearhublogo.png", name: "ClearHub" },
    { logo: "/thmanyahlogo.png", name: "Thmanyah" },
    { logo: "/imanlogo.png", name: "40-minute podcast" },
    { logo: "/atheerpod.png", name: "AtheerPod" },
  ];

  return (
    <div className="bg-[#EDECE8] py-10 px-6 md:h-[500px]">
      <div className="md:pb-16">
        {/* Heading */}
        <h1 className="text-center text-2xl md:my-5 md:text-[40px] font-medium uppercase text-black mb-6 ">
          HIBA'S PARTNERS
        </h1>
      </div>

      {/* Partner Logos Section */}
      <div className="overflow-x-auto md:overflow-hidden">
        <div className="flex md:grid md:grid-cols-5 gap-6 md:gap-0 items-center">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="flex flex-col items-center min-w-[150px]"
            >
              <img
                src={partner.logo}
                alt={partner.name || "Partner Logo"}
                className="w-24 h-24 md:w-44 md:h-44 object-contain mb-2"
              />
              {partner.name && (
                <p className="text-black text-sm font-semibold">{partner.name}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OurPartners;
