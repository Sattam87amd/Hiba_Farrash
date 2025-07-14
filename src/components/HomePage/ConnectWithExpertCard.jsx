"use client";

import React, { useState, useEffect } from "react";

const ConnectWithExpertCard = () => {
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
    heading: isArabic ? "اتصل مع هيبا - أينما كنت" : "Connect with Hiba - Wherever You Are",
    description: isArabic
      ? "احصل على وصول مباشر إلى واحدة من أبرز خبراء الأزياء في السعودية. سواء كنت تبني علامتك التجارية أو تعمل على تحسين أسلوبك الشخصي، تقدم لك هيبا نصائح وتوجيهات شخصية لمساعدتك في رفع مستوى رحلتك في عالم الأزياء."
      : "Get direct access to one of Saudi Arabia's leading fashion experts. Whether you're building a brand or refining your personal style, Hiba offers personalized advice and insight to help you elevate your fashion journey."
  };

  return (
    <div className="bg-white py-12 px-6">
      {/* Heading */}
      <div className="md:my-3">
        <h1 className="text-center text-3xl md:text-[40px] md:uppercase font-semibold text-black mb-8">
          {translations.heading}
        </h1>
      </div>
      <div className="flex flex-col md:flex-row items-center justify-center md:mx-44 md:mt-20 space-y-6 md:space-y-0">
        {/* Left Text Section */}
        <div className="md:w-[70%]">
          {/* Mobile text */}
          <p className="text-lg text-black text-center leading-relaxed md:hidden">
            {translations.description}
          </p>
          {/* Desktop text */}
          <p className="hidden md:block text-2xl md:text-3xl text-black font-medium leading-loose tracking-wide px-20 ">
            {translations.description}
          </p>
        </div>

        {/* Right Image Section */}
        <div className="md:w-[50%] flex justify-center rounded-none">
          <img
            className="w-full max-h-[450px] object-contain rounded-none shadow-lg"
            src="/HomeImg/hiba7.webp"
            alt="Connect with Experts"
          />
        </div>
      </div>
    </div>
  );
};

export default ConnectWithExpertCard;
