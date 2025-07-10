"use client";

import React, { useState, useEffect } from "react";

const OurPartners = () => {
  const [isArabic, setIsArabic] = useState(false);

  useEffect(() => {
    const getCookie = (name) => {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? match[2] : null;
    };

    const lang = getCookie('googtrans');
    const isCurrentlyArabic = lang?.includes('/ar') || lang?.includes('/en/ar');
    setIsArabic(isCurrentlyArabic);
  }, []);

  // Define translations for Arabic and English
  const translations = {
    heading: isArabic ? "شركاء هيبا" : "HIBA'S PARTNERS",
    partners: [
      { logo: "/HomeImg/BLK-ECLAT-PNG 1.webp", name: isArabic ? "إكلات" : "Eclat", link: "https://eclatarabia.com/" },
      { logo: "/clearhublogo.png", name: isArabic ? "كلير هب" : "ClearHub", link: "https://www.instagram.com/clear_hub?hl=en" },
      { logo: "/thmanyahlogo.png", name: isArabic ? "جمعية الأزياء" : "Fashion Association", link: "https://fashionassociation.org.sa/" },
      { logo: "/imanlogo.png", name: isArabic ? "مجلة رواد الأعمال" : "Entrepreneur Magazine", link: "https://www.rowadalaamal.com/%D9%85%D8%B5%D9%85%D9%85%D8%A9-%D8%A7%D9%84%D8%A3%D8%B2%D9%8A%D8%A7%D8%A1-%D9%87%D8%A8%D8%A9-%D9%81%D8%B1%D8%A7%D8%B4-%D8%AA%D8%B5%D9%85%D9%8A%D9%85%D8%A7%D8%AA%D9%8A-%D8%AA%D8%AF%D9%85%D8%AC-%D9%85/" },
      { logo: "/atheerpod.png", name: isArabic ? "مجلة نيش" : "Niche Magazine", link: "https://nichemagazine.me/?fbclid=PAZXh0bgNhZW0CMTEAAaeHZ7aTgUcRMlFHWmM_DXQZNE7poYyz-9JtCjCZrL7PEBgyI7wRlE6vFi4FRA_aem_atmAwM-6MMpabRu8b26TRQ" },
    ],
  };

  return (
    <div className="bg-[#EDECE8] py-10 px-6">
      {/* Heading */}
      <h1 className="text-center text-2xl md:text-[40px] font-medium uppercase text-black mb-10">
        {translations.heading}
      </h1>

      {/* Responsive Grid for logos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 justify-items-center items-center max-w-6xl mx-auto">
        {translations.partners.map((partner, index) => (
          <div key={index} className="flex flex-col items-center text-center">
            {partner.link ? (
              <a href={partner.link} target="_blank" rel="noopener noreferrer">
                <img
                  src={partner.logo}
                  alt={partner.name || "Partner Logo"}
                  className="w-24 h-24 md:w-32 md:h-32 object-contain mb-2 transition-transform hover:scale-105 duration-300"
                />
              </a>
            ) : (
              <img
                src={partner.logo}
                alt={partner.name || "Partner Logo"}
                className="w-24 h-24 md:w-32 md:h-32 object-contain mb-2"
              />
            )}
            {partner.name && (
              <p className="text-black text-xs sm:text-sm font-semibold">
                {partner.name}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OurPartners;
