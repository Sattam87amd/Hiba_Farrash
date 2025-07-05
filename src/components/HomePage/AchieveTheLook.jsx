"use client";

import React, { useEffect, useState } from "react";

const AchieveTheLook = ({ isArabic = false }) => {
  const [isMobile, setIsMobile] = useState(false);
  
  // English and Arabic content
  const headingText = isArabic 
    ? "حقق المظهر الذي طالما حلمت به"
    : "Achieve the look you've always dreamed of";

  const images = [
    { src: "./HomeImg/hiba-4.jpg", alt: isArabic ? "عائشة عزيز" : "Aisha Aziz" },
    { src: "./HomeImg/hiba-1.png", alt: isArabic ? "علياء عبادي" : "Aaliya Abadi" },
    // { src: "./HomeImg/hiba-2.png", alt: isArabic ? "عائشة عزيز" : "Aisha Aziz" },
    // { src: "./HomeImg/hiba-3.png", alt: isArabic ? "عائشة عزيز" : "Aisha Aziz" },
    { src: "./HomeImg/hiba-5.jpg", alt: isArabic ? "عائشة عزيز" : "Aisha Aziz" },
    { src: "./HomeImg/hiba-6.jpg", alt: isArabic ? "عائشة عزيز" : "Aisha Aziz" },
    // { src: "./HomeImg/hiba-7.jpg", alt: isArabic ? "عائشة عزيز" : "Aisha Aziz" },
    { src: "./HomeImg/hiba-8.jpg", alt: isArabic ? "عائشة عزيز" : "Aisha Aziz" },
    // { src: "./HomeImg/hiba-9.jpg", alt: isArabic ? "عائشة عزيز" : "Aisha Aziz" },
    { src: "./HomeImg/hiba-10.jpg", alt: isArabic ? "عائشة عزيز" : "Aisha Aziz" },
    // { src: "./HomeImg/hiba-11.jpg", alt: isArabic ? "عائشة عزيز" : "Aisha Aziz" },
  ];

  // Detect mobile vs desktop
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // Mobile Layout: Card Grid
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

  // Desktop Layout: Horizontal Scroll
  const DesktopScrollLayout = () => (
    <div className="relative">
      {/* Gradient overlays for visual scroll indicators */}
      <div className={`absolute top-0 ${isArabic ? 'right-0' : 'left-0'} w-8 sm:w-12 md:w-16 h-full bg-gradient-to-r ${isArabic ? 'from-transparent to-[#EDECE8]' : 'from-[#EDECE8] to-transparent'} z-10 pointer-events-none`}></div>
      <div className={`absolute top-0 ${isArabic ? 'left-0' : 'right-0'} w-8 sm:w-12 md:w-16 h-full bg-gradient-to-r ${isArabic ? 'from-[#EDECE8] to-transparent' : 'from-transparent to-[#EDECE8]'} z-10 pointer-events-none`}></div>
      
      {/* Scrollable container */}
      <div className="overflow-x-auto scrollbar-hide pb-2">
        {/* Content row - responsive sizing and spacing */}
        <div className={`inline-flex min-w-full gap-2 sm:gap-3 md:gap-4 lg:gap-6 xl:gap-8 px-2 sm:px-3 md:px-4 ${isArabic ? 'flex-row-reverse' : ''}`}>
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
        {/* Heading */}
        <h1 className={`text-center text-black uppercase text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold mb-6 sm:mb-8 md:mb-10 lg:pb-16 leading-tight ${isArabic ? 'font-arabic' : ''}`}>
          {headingText}
        </h1>

        {/* Responsive Layout */}
        <div className="w-full">
          {isMobile ? <MobileCardLayout /> : <DesktopScrollLayout />}
        </div>
      </div>

      {/* Styles */}
      <style jsx global>{`
        /* Hide scrollbar across browsers but maintain functionality */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        /* RTL-specific scroll behavior */
        html[dir="rtl"] .overflow-x-auto {
          direction: ltr;
        }
        
        html[dir="rtl"] .flex-row-reverse {
          direction: rtl;
        }
        
        /* Enhanced Arabic font support */
        .font-arabic {
          font-family: 'Amiri', 'Tahoma', 'Arial', sans-serif;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        
        /* Enhanced hover effects */
        .group:hover img {
          transform: scale(1.1);
        }
        
        /* iOS specific fixes */
        @supports (-webkit-touch-callout: none) {
          img {
            -webkit-transform: translateZ(0);
            will-change: transform;
          }
        }
        
        /* Additional flexbox support for older browsers */
        @supports (-webkit-appearance: none) {
          .flex-shrink-0 {
            -webkit-flex-shrink: 0;
          }
          
          .inline-flex {
            display: -webkit-inline-flex;
            -webkit-flex-wrap: nowrap;
          }
        }
      `}</style>
    </main>
  );
};

export default AchieveTheLook;