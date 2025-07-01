"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ExpertCategories = ({ isArabic = false }) => {
  const [selectedCategory, setSelectedCategory] = useState("Top Experts");
  const pathname = usePathname();

  // Categories for English and Arabic
  const categoriesEN = [
    { title: "Top Experts", image: "/topexperts.png", link: "/topexperts" },
    { title: "Home", image: "/home.png", link: "/home-experts" },
    {
      title: "Career & Business",
      image: "/career&business.png",
      link: "/career&businessexperts",
    },
    {
      title: "Fashion & Beauty",
      image: "/style&beauty.png",
      link: "/style&beautyexperts",
    },
    { title: "Wellness", image: "/wellness.png", link: "/wellnessexperts" },
  ];

  const categoriesAR = [
    { title: "أفضل الخبراء", image: "/topexperts.png", link: "/topexperts" },
    { title: "المنزل", image: "/home.png", link: "/home-experts" },
    {
      title: "المهنة والأعمال",
      image: "/career&business.png",
      link: "/career&businessexperts",
    },
    {
      title: "الموضة والجمال",
      image: "/style&beauty.png",
      link: "/style&beautyexperts",
    },
    { title: "العافية", image: "/wellness.png", link: "/wellnessexperts" },
  ];

  const categories = isArabic ? categoriesAR : categoriesEN;

  // Set the document direction when component mounts or language changes
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
    <div className={`bg-[#F8F7F3] px-4 py-6 ${isArabic ? 'text-right' : 'text-left'}`}>
      {/* Headline */}
      <h1 className="text-2xl md:text-3xl font-semibold text-black mb-6 px-1 md:px-4">
        {isArabic ? "اعثر على الخبير المناسب في ثوانٍ!" : "Find The Right Expert In Seconds!"}
      </h1>

      {/* Categories Section with improved mobile scrolling */}
      <div className="relative w-full mx-auto max-w-7xl">
        {/* This wrapper ensures proper scrolling direction in both RTL/LTR modes */}
        <div className="mobile-scroll-wrapper">
          <div 
            className="overflow-x-scroll touch-pan-x pb-2 scrollbar-container"
            style={{ 
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            <div className={`inline-flex min-w-full gap-4 md:gap-6 lg:gap-8 px-1 py-1 ${isArabic ? 'flex-row-reverse' : ''}`}>
              {categories.map((category, index) => (
                <Link href={category.link} key={index} passHref>
                  <div
                    className={`relative flex-shrink-0 w-36 md:w-48 lg:w-56 h-24 md:h-36 rounded-3xl overflow-hidden shadow-md cursor-pointer p-1 ${
                      pathname === category.link
                        ? "-4 -black"
                        : "-transparent"
                    }`}
                  >
                    <div className="relative w-full h-full rounded-3xl overflow-hidden">
                      <img
                        src={category.image}
                        alt={category.title}
                        className="absolute inset-0 w-full h-full object-cover opacity-100 mix-blend-multiply"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 p-2">
                        <p className="text-white font-semibold md:text-lg text-center break-words">
                          {category.title}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced scrolling styles for both RTL and LTR */}
      <style jsx global>{`
        /* Hide default scrollbar but maintain functionality */
        .scrollbar-container::-webkit-scrollbar {
          height: 4px;
          display: none;
        }
        
        .scrollbar-container::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .scrollbar-container::-webkit-scrollbar-thumb {
          background: #d1d1d1;
          -radius: 4px;
        }
        
        /* Force LTR direction for scroll container in RTL mode */
        html[dir="rtl"] .mobile-scroll-wrapper {
          direction: ltr;
        }
        
        /* But keep RTL content direction inside */
        html[dir="rtl"] .mobile-scroll-wrapper .flex-row-reverse {
          direction: rtl;
        }
        
        /* Ensure overflow behaves consistently across browsers */
        .overflow-x-scroll {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          -ms-overflow-style: -ms-autohiding-scrollbar;
        }
        
        /* Additional mobile-specific fixes */
        @media (max-width: 768px) {
          .touch-pan-x {
            touch-action: pan-x;
          }
          
          /* Fix for iOS momentum scrolling */
          .scrollbar-container {
            -webkit-overflow-scrolling: touch;
          }
        }
      `}</style>
    </div>
  );
};

export default ExpertCategories;