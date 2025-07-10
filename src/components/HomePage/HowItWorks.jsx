"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

const HowItWorks = () => {
  // Add language state management
  const [isArabic, setIsArabic] = useState(false);

  useEffect(() => {
    // Function to check language from cookie
    const getCookie = (name) => {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? match[2] : null;
    };

    const lang = getCookie('googtrans');
    const isCurrentlyArabic = lang?.includes('/ar') || lang?.includes('/en/ar');
    setIsArabic(isCurrentlyArabic);
  }, []);

  // Define translations
  const translations = {
    section1Heading: isArabic ? "كيف تعمل الخدمة" : "How It Works",
    step1Title: isArabic ? "حدد رؤيتك" : "Define Your Vision",
    step1Description: isArabic ? "شارك أهدافك أسلوبك قبل الجلسة." : "Share your style goals before your session.",
    step2Title: isArabic ? "حدد وقتك مع هيبا" : "Secure Your Time with Hiba",
    step2Description: isArabic ? "اختر الوقت المفضل لك لجلسة فردية أو جماعية." : "Choose your preferred slot for a 1:1 session",
    step3Title: isArabic ? "تحول في الوقت الحقيقي" : "Transform in Real Time",
    step3Description: isArabic ? "احصل على رؤى حصرية من هيبا عبر الفيديو المباشر." : "Gain exclusive insights directly from Hiba via live video.",
    instantAccessTitle: isArabic ? "وصول فوري للأناقة" : "Instant Style Clarity",
    instantAccessDescription: isArabic
      ? "حل مشكلات الموضة في الوقت الفعلي عبر الجلسات الحية"
      : "Resolve fashion dilemmas in real-time video sessions.",
    securePaymentsTitle: isArabic ? "دفع آمن 100%" : "100% Secure Payments",
    securePaymentsDescription: isArabic
      ? "مدفوعات آمنة 100٪ تضمن معاملات آمنة وحماية بيانات العملاء."
      : "100% Secure Payments ensure safe transactions, protecting customer data and preventing fraud.",
    industryExpertTitle: isArabic ? "رؤية الموضة السعودية" : "Saudi Fashion Visionary",
    industryExpertDescription: isArabic
      ? "مصممة سعودية حائزة على جوائز في فلسفة \"الأناقة الخالدة\""
      : "Award-winning Saudi Designer @fashionasc Council 'TIMELESS STYLE' Philosophy",
    flexibleSchedulingTitle: isArabic ? "جدولة مرنة" : "Flexible Scheduling",
    flexibleSchedulingDescription: isArabic
      ? "جدولة مرنة توفر الراحة والمرونة للعملاء."
      : "Flexible Scheduling offers convenience and accessibility, allowing users to book services at their preferred time.",
  };

  return (
    <div className="flex flex-col md:flex-row flex-wrap gap-8 md:gap-16 p-6 bg-[#EDECE8] justify-center">
      {/* Left Side Cards */}
      <div className="space-y-8 md:space-y-12">
        {/* How It Works Card */}
<div className="bg-[#F8F7F3] p-4 md:p-8 shadow-md w-full md:w-[600px] md:min-h-[360px] overflow-hidden">
  <h2 className="text-2xl md:text-4xl font-semibold mb-6">{translations.section1Heading}</h2>
  <div className="space-y-6">
    {[ 
      { number: "1", title: translations.step1Title, description: translations.step1Description },
      { number: "2", title: translations.step2Title, description: translations.step2Description },
      { number: "3", title: translations.step3Title, description: translations.step3Description }
    ].map((step) => (
      <div key={step.number} className="flex items-start gap-4">
        <div className="bg-black text-white rounded-full min-w-[40px] min-h-[40px] w-10 h-10 flex items-center justify-center text-lg font-bold flex-shrink-0">
          {step.number}
        </div>
        <div className="flex-1">
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
          <h3 className="text-xl md:text-3xl font-light">{translations.instantAccessTitle}</h3>
          <p className="hidden md:block text-sm md:text-base font-thin mt-4 leading-relaxed">
            {translations.instantAccessDescription}
          </p>
          <p className="text-xs md:text-base font-thin mt-4 leading-relaxed md:hidden">
            {translations.instantAccessDescription}
          </p>
        </div>

        {/* 100% Secure Payments Card */}
        <div className="bg-[#F8F7F3] p-4 md:p-8 shadow-md w-full md:w-[600px] md:min-h-[360px] overflow-hidden">
          <Image src="/secure.png" alt="100% Secure Payments" width={100} height={80} className="mb-6 ml-3" />
          <h3 className="text-xl md:text-3xl font-light">{translations.securePaymentsTitle}</h3>
          <p className="text-sm md:text-base font-thin mt-4 leading-relaxed">
            {translations.securePaymentsDescription}
          </p>
        </div>
      </div>

      {/* Right Side Cards */}
      <div className="space-y-8 md:space-y-12 md:mt-32">
        {/* Top Industry Experts Card */}
        <div className="bg-[#F8F7F3] p-4 md:p-8 shadow-md w-full md:w-[600px] md:min-h-[360px] overflow-hidden">
          <Image src="/top.png" alt="Top Industry Experts" width={100} height={80} className="mb-6" />
          <h3 className="text-xl md:text-3xl font-light">{translations.industryExpertTitle}</h3>
          <p className="text-sm md:text-base font-thin mt-4 leading-relaxed">
            {translations.industryExpertDescription}
          </p>
        </div>

        {/* Flexible Scheduling Card */}
        <div className="bg-[#F8F7F3] p-4 md:p-8 shadow-md w-full md:w-[600px] md:min-h-[360px] overflow-hidden">
          <Image src="/schedule.png" alt="Flexible Scheduling" width={100} height={80} className="mb-6" />
          <h3 className="text-xl md:text-3xl font-light">{translations.flexibleSchedulingTitle}</h3>
          <p className="text-sm md:text-sm font-thin mt-4 leading-relaxed">
            {translations.flexibleSchedulingDescription}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
