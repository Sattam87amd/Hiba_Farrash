"use client";

import React, { useState, useEffect } from "react";

const ConnectWithExpertCard = () => {
  const [isArabic, setIsArabic] = useState(true);

  useEffect(() => {
    const getCookie = (name) => {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? match[2] : null;
    };

    const lang = getCookie('googtrans');
    const isCurrentlyArabic = lang?.includes('/ar') || lang?.includes('/en/ar');
    setIsArabic(isCurrentlyArabic || true);
  }, []);

  // النصوص العربية فقط
  const translations = {
    heading: "احجزي ببساطة، وابدئي رحلتك",
    description: `اكل إطلالة تبدأ باختيار قطعة أو لون،لكن تكتمل لما تعكس هويتك
ومع خبرة سعودية في عالم الأزياء، يصير ذوقك أو مشروعك له هوية أوضح وأقرب لك`
  };

  return (
    <div className="bg-white py-12 px-6" dir="rtl">
      {/* العنوان */}
      <div className="md:my-3">
        <h1 className="text-center text-3xl md:text-[40px] md:uppercase font-semibold text-black mb-8">
          {translations.heading}
        </h1>
      </div>
      <div className="flex flex-col md:flex-row items-center justify-center md:mx-44 md:mt-20 space-y-6 md:space-y-0">
        {/* قسم النص الأيسر */}
        <div className="md:w-[70%] md:order-2">
          {/* نص الهاتف المحمول */}
          <p className="text-lg text-black text-center leading-relaxed md:hidden">
            {translations.description}
          </p>
          {/* نص سطح المكتب */}
          <p className="hidden md:block text-2xl md:text-3xl text-black font-medium leading-loose tracking-wide px-20">
            {translations.description}
          </p>
        </div>

        {/* قسم الصورة الأيمن */}
        <div className="md:w-[50%] flex justify-center rounded-none md:order-1">
          <img
            className="w-full max-h-[450px] object-contain rounded-none shadow-lg"
            src="/HomeImg/hiba7.webp"
            alt="الاتصال مع الخبراء"
          />
        </div>
      </div>
    </div>
  );
};

export default ConnectWithExpertCard;