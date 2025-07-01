"use client";

import React, { useEffect } from "react";

const AchieveTheLook = ({ isArabic = false }) => {
  // English and Arabic content
  const headingText = isArabic 
    ? "حقق المظهر الذي طالما حلمت به"
    : "Achieve the look you've always dreamed of";

  const images = [
    { src: "./HomeImg/hiba-4.jpg", alt: isArabic ? "عائشة عزيز" : "Aisha Aziz" },
    { src: "./HomeImg/hiba-1.png", alt: isArabic ? "علياء عبادي" : "Aaliya Abadi" },
    { src: "./HomeImg/hiba-2.png", alt: isArabic ? "عائشة عزيز" : "Aisha Aziz" },
    { src: "./HomeImg/hiba-3.png", alt: isArabic ? "عائشة عزيز" : "Aisha Aziz" },
    { src: "./HomeImg/hiba-5.jpg", alt: isArabic ? "عائشة عزيز" : "Aisha Aziz" },
    { src: "./HomeImg/hiba-6.jpg", alt: isArabic ? "عائشة عزيز" : "Aisha Aziz" },
    { src: "./HomeImg/hiba-7.jpg", alt: isArabic ? "عائشة عزيز" : "Aisha Aziz" },
    { src: "./HomeImg/hiba-8.jpg", alt: isArabic ? "عائشة عزيز" : "Aisha Aziz" },
    { src: "./HomeImg/hiba-9.jpg", alt: isArabic ? "عائشة عزيز" : "Aisha Aziz" },
    { src: "./HomeImg/hiba-10.jpg", alt: isArabic ? "عائشة عزيز" : "Aisha Aziz" },
    { src: "./HomeImg/hiba-11.jpg", alt: isArabic ? "عائشة عزيز" : "Aisha Aziz" },
   
  ];

  // Set document direction based on language
  useEffect(() => {
    if (isArabic) {
      document.documentElement.dir = "rtl";
      document.documentElement.lang = "ar";
    } else {
      document.documentElement.dir = "ltr";
      document.documentElement.lang = "en";
    }
  }, [isArabic]);

  return (
    <main className="bg-[#EDECE8] relative md:min-h-screen flex flex-col justify-center overflow-hidden">
      <div className="w-full mx-auto px-4 md:px-1 py-10">
        {/* Heading */}
        <h1 className={`text-center text-black uppercase text-2xl md:text-4xl font-semibold mb-10 md:pb-16 ${isArabic ? 'font-arabic' : ''}`}>
          {headingText}
        </h1>

        {/* Horizontal Scroll Section with proper RTL support */}
        <div className="scroll-container-wrapper">
          {/* This div forces the scroll direction to be consistent regardless of page direction */}
          <div 
            className="overflow-x-scroll touch-pan-x scrollbar-hide"
            style={{ 
              WebkitOverflowScrolling: 'touch',
              msOverflowStyle: 'none'
            }}  
          >
            {/* Content row - reverse order for Arabic */}
            <div className={`inline-flex min-w-full gap-4 md:gap-8 px-4 md:px-0 ${isArabic ? 'flex-row-reverse' : ''}`}>
              {images.map((image, index) => (
                <div
                  key={index}
                  className="min-w-[280px] md:min-w-[400px] h-[80vh] flex-shrink-0 overflow-hidden"
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RTL-compatible scrolling styles */}
      <style jsx global>{`
        /* Hide scrollbar across browsers but maintain functionality */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        /* Mobile-specific RTL scroll fixes */
        @media (max-width: 768px) {
          /* Force LTR scrolling mechanics on RTL pages */
          html[dir="rtl"] .scroll-container-wrapper {
            direction: ltr;
          }
          
          /* But keep RTL layout for content */
          html[dir="rtl"] .scroll-container-wrapper .flex-row-reverse {
            direction: rtl;
          }
          
          /* Add touch support */
          .touch-pan-x {
            touch-action: pan-x;
          }
        }
        
        /* Optional: Add Arabic font support */
        .font-arabic {
          font-family: 'Arial', 'Tahoma', sans-serif;
        }
      `}</style>
    </main>
  );
};

export default AchieveTheLook;