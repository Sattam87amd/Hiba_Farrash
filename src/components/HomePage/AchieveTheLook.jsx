"use client";

import React, { useEffect, useState } from "react";

const AchieveTheLook = ({ isArabic = false }) => {
  const [activeLayout, setActiveLayout] = useState('masonry');
  
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

  // Layout 1: Masonry Grid (Pinterest-style)
    // const MasonryLayout = () => (
    //   <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3 sm:gap-4 space-y-3 sm:space-y-4">
    //     {images.map((image, index) => (
    //       <div key={index} className="break-inside-avoid mb-3 sm:mb-4">
    //         <div className="overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
    //           <img
    //             src={image.src}
    //             alt={image.alt}
    //             className="w-full h-auto object-cover transition-transform duration-300 hover:scale-105"
    //             loading="lazy"
    //           />
    //         </div>
    //       </div>
    //     ))}
    //   </div>
    // );

    // // Layout 2: Card Grid with Aspect Ratio
    // const CardLayout = () => (
    //   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
    //     {images.map((image, index) => (
    //       <div key={index} className="group">
    //         <div className="aspect-[3/4] overflow-hidden rounded-lg shadow-lg bg-gray-100">
    //           <img
    //             src={image.src}
    //             alt={image.alt}
    //             className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
    //             loading="lazy"
    //           />
    //         </div>
    //       </div>
    //     ))}
    //   </div>
    // );

  // Layout 3: Horizontal Scroll with Fixed Aspect Ratio
  const HorizontalScrollLayout = () => (
    <div className="relative">
      <div className={`absolute top-0 ${isArabic ? 'right-0' : 'left-0'} w-8 h-full bg-gradient-to-r ${isArabic ? 'from-transparent to-[#EDECE8]' : 'from-[#EDECE8] to-transparent'} z-10 pointer-events-none`}></div>
      <div className={`absolute top-0 ${isArabic ? 'left-0' : 'right-0'} w-8 h-full bg-gradient-to-r ${isArabic ? 'from-[#EDECE8] to-transparent' : 'from-transparent to-[#EDECE8]'} z-10 pointer-events-none`}></div>
      
      <div className="overflow-x-auto scrollbar-hide pb-4">
        <div className={`flex gap-4 px-4 ${isArabic ? 'flex-row-reverse' : ''}`}>
          {images.map((image, index) => (
            <div key={index} className="flex-shrink-0 w-48 sm:w-56 md:w-64">
              <div className="aspect-[3/4] overflow-hidden rounded-lg shadow-lg">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // // Layout 4: Staggered Heights
  // const StaggeredLayout = () => (
  //   <div className="overflow-x-auto scrollbar-hide pb-4">
  //     <div className={`flex gap-3 sm:gap-4 px-4 ${isArabic ? 'flex-row-reverse' : ''}`}>
  //       {images.map((image, index) => {
  //         const heights = ['h-64', 'h-80', 'h-72', 'h-96', 'h-68'];
  //         const randomHeight = heights[index % heights.length];
          
  //         return (
  //           <div key={index} className={`flex-shrink-0 w-48 sm:w-52 ${randomHeight}`}>
  //             <div className="w-full h-full overflow-hidden rounded-lg shadow-lg">
  //               <img
  //                 src={image.src}
  //                 alt={image.alt}
  //                 className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
  //                 loading="lazy"
  //               />
  //             </div>
  //           </div>
  //         );
  //       })}
  //     </div>
  //   </div>
  // );

  // const renderLayout = () => {
  //   switch(activeLayout) {
  //     case 'masonry': return <MasonryLayout />;
  //     case 'card': return <CardLayout />;
  //     case 'horizontal': return <HorizontalScrollLayout />;
  //     case 'staggered': return <StaggeredLayout />;
  //     default: return <MasonryLayout />;
  //   }
  // };

  return (
    <main className="bg-[#EDECE8] relative min-h-screen flex flex-col justify-center overflow-hidden">
      <div className="w-full mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-10">
        {/* Heading */}
        <h1 className={`text-center text-black uppercase text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold mb-6 sm:mb-8 md:mb-10 lg:pb-8 leading-tight ${isArabic ? 'font-arabic' : ''}`}>
          {headingText}
        </h1>

        {/* Layout Selector */}
        {/* <div className="flex justify-center mb-8 gap-2 flex-wrap">
          <button 
            onClick={() => setActiveLayout('masonry')}
            className={`px-4 py-2 rounded-full text-sm transition-all ${activeLayout === 'masonry' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-200'}`}
          >
            Masonry
          </button>
          <button 
            onClick={() => setActiveLayout('card')}
            className={`px-4 py-2 rounded-full text-sm transition-all ${activeLayout === 'card' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-200'}`}
          >
            Grid
          </button>
          <button 
            onClick={() => setActiveLayout('horizontal')}
            className={`px-4 py-2 rounded-full text-sm transition-all ${activeLayout === 'horizontal' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-200'}`}
          >
            Scroll
          </button>
          <button 
            onClick={() => setActiveLayout('staggered')}
            className={`px-4 py-2 rounded-full text-sm transition-all ${activeLayout === 'staggered' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-200'}`}
          >
            Staggered
          </button>
        </div> */}

        {/* Dynamic Layout */}
        <div className="w-full">
          {<HorizontalScrollLayout />}
        </div>
      </div>

      {/* Styles */}
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
        
        /* Masonry layout fixes for webkit */
        .columns-2 {
          column-count: 2;
          column-gap: 0.75rem;
        }
        
        .columns-3 {
          column-count: 3;
          column-gap: 1rem;
        }
        
        @media (min-width: 768px) {
          .columns-4 {
            column-count: 4;
          }
        }
        
        @media (min-width: 1024px) {
          .columns-5 {
            column-count: 5;
          }
        }
        
        .break-inside-avoid {
          break-inside: avoid;
          page-break-inside: avoid;
        }
        
        /* Enhanced hover effects */
        .group:hover img {
          transform: scale(1.05);
        }
        
        /* iOS specific fixes */
        @supports (-webkit-touch-callout: none) {
          img {
            -webkit-transform: translateZ(0);
            will-change: transform;
          }
        }
      `}</style>
    </main>
  );
};

export default AchieveTheLook;