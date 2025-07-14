"use client";

import React, { useEffect, useRef, useState } from "react";

const AchieveTheLook = ({ isArabic = false }) => {
  const [isMobile, setIsMobile] = useState(false);

  const headingText = isArabic
    ? "حقق المظهر الذي طالما حلمت به"
    : "Achieve the look you've always dreamed of";

  const images = [
    { src: "/HomeImg/hiba1.webp", alt: isArabic ? "عائشة عزيز" : "Aisha Aziz" },
    { src: "/HomeImg/hiba3.webp", alt: isArabic ? "علياء عبادي" : "Aaliya Abadi" },
    { src: "/HomeImg/hiba4.webp", alt: isArabic ? "عائشة عزيز" : "Aisha Aziz" },
    { src: "/HomeImg/hiba2.webp", alt: isArabic ? "عائشة عزيز" : "Aisha Aziz" },
    { src: "/HomeImg/hiba5.webp", alt: isArabic ? "عائشة عزيز" : "Aisha Aziz" },
    { src: "/HomeImg/hiba6.webp", alt: isArabic ? "عائشة عزيز" : "Aisha Aziz" },
  ];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isArabic) {
      document.documentElement.dir = "rtl";
      document.documentElement.lang = "ar";
    } else {
      document.documentElement.dir = "ltr";
      document.documentElement.lang = "en";
    }
  }, [isArabic]);

  const scrollContainerRef = useRef(null);

  const scrollByAmount = 300; // Adjust how much to scroll per click

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: isArabic ? scrollByAmount : -scrollByAmount,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: isArabic ? -scrollByAmount : scrollByAmount,
        behavior: "smooth",
      });
    }
  };

  const MobileCardLayout = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
      {images.map((image, index) => (
        <div key={index} className="group">
          <div className="aspect-[3/4] overflow-hidden rounded-lg shadow-lg bg-gray-100">
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
          </div>
        </div>
      ))}
    </div>
  );

  const DesktopScrollLayout = () => (
    <div className="relative">
      {/* Gradient overlays */}
      <div
        className={`absolute top-0 ${isArabic ? "right-0" : "left-0"} w-8 sm:w-12 md:w-16 h-full bg-gradient-to-r ${
          isArabic ? "from-transparent to-[#EDECE8]" : "from-[#EDECE8] to-transparent"
        } z-10 pointer-events-none`}
      ></div>
      <div
        className={`absolute top-0 ${isArabic ? "left-0" : "right-0"} w-8 sm:w-12 md:w-16 h-full bg-gradient-to-r ${
          isArabic ? "from-[#EDECE8] to-transparent" : "from-transparent to-[#EDECE8]"
        } z-10 pointer-events-none`}
      ></div>

      {/* Scroll arrows */}
     <button
  onClick={scrollLeft}
  aria-label="Scroll Left"
  className="absolute top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 hover:bg-opacity-60 text-white rounded-full p-2 z-20 transition-colors duration-300"
  style={{ [isArabic ? "right" : "left"]: "10px" }}
>
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
</button>

<button
  onClick={scrollRight}
  aria-label="Scroll Right"
  className="absolute top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 hover:bg-opacity-60 text-white rounded-full p-2 z-20 transition-colors duration-300"
  style={{ [isArabic ? "left" : "right"]: "10px" }}
>
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
</button>


      {/* Scrollable container */}
      <div ref={scrollContainerRef} className="overflow-x-auto scrollbar-hide pb-2">
        <div
          className={`inline-flex min-w-full gap-2 sm:gap-3 md:gap-4 lg:gap-6 xl:gap-8 px-2 sm:px-3 md:px-4 ${
            isArabic ? "flex-row-reverse" : ""
          }`}
        >
          {images.map((image, index) => (
            <div
              key={index}
              className="min-w-[200px] sm:min-w-[240px] md:min-w-[280px] lg:min-w-[320px] xl:min-w-[400px] h-[60vh] sm:h-[65vh] md:h-[70vh] lg:h-[75vh] xl:h-[80vh] flex-shrink-0 overflow-hidden rounded-lg shadow-sm"
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <main className="bg-[#EDECE8] relative min-h-screen flex flex-col justify-center overflow-hidden">
      <div className="w-full mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-10">
        <h1
          className={`text-center text-black uppercase text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold mb-6 sm:mb-8 md:mb-10 lg:pb-16 leading-tight ${
            isArabic ? "font-arabic" : ""
          }`}
        >
          {headingText}
        </h1>
        <div className="w-full">{isMobile ? <MobileCardLayout /> : <DesktopScrollLayout />}</div>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        html[dir="rtl"] .overflow-x-auto {
          direction: ltr;
        }
        html[dir="rtl"] .flex-row-reverse {
          direction: rtl;
        }
        .font-arabic {
          font-family: 'Amiri', 'Tahoma', 'Arial', sans-serif;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
      `}</style>
    </main>
  );
};

export default AchieveTheLook;
