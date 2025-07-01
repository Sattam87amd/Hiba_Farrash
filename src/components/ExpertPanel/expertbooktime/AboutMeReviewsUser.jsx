"use client";
import { useState } from "react";
import Image from "next/image";

// Updated reviews with varied text lengths
const allReviews = [
  {
    id: 1,
    name: "Cameron Williamson",
    role: "Owner of UI/UX Inc",
    review:
      "The experience from start to finish was nothing short of amazing. Communication was smooth, and they exceeded our expectations. Great attention to detail and professionalism. Loved the final outcome! Absolutely amazing from start to finish! The team took the time to understand our requirements and delivered a product that truly resonated with our brand's vision and goals.",
    image:
      "https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-1.2.1&auto=format&crop=faces&fit=crop&w=100&h=100&q=80",
  },
  {
    id: 2,
    name: "Esther Howard",
    role: "Owner of UI/UX Inc",
    review:
      "Great attention to detail and professionalism. Loved the final outcome! Absolutely amazing from start to finish!",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&crop=faces&fit=crop&w=100&h=100&q=80",
  },
  {
    id: 3,
    name: "Cameron Williamson",
    role: "Owner of UI/UX Inc",
    review:
      "One of the best experiences I've had. Quality is fantastic! One of the best experiences I've had. Quality is fantastic! One of the best experiences I've had. Quality is fantastic!",
    image:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?ixlib=rb-1.2.1&auto=format&crop=faces&fit=crop&w=100&h=100&q=80",
  },
  {
    id: 4,
    name: "Jenny Wilson",
    role: "Owner of UI/UX Inc",
    review:
      "Excellent service! Great attention to detail. One of the best experiences I've had. Quality is fantastic! One of the best experiences I've had. Quality is fantastic! One of the best experiences I've had. Quality is fantastic!",
    image:
      "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&auto=format&crop=faces&fit=crop&w=100&h=100&q=80",
  },
  {
    id: 5,
    name: "Sarah Brown",
    role: "Owner of UI/UX Inc",
    review:
      "Professional team, smooth process. Highly recommend! The team was super responsive and delivered great results in record time. I'll definitely come back.",
    image:
      "https://images.unsplash.com/photo-1530268729831-4b0b9e170218?ixlib=rb-1.2.1&auto=format&crop=faces&fit=crop&w=100&h=100&q=80",
  },
  {
    id: 6,
    name: "Michael Smith",
    role: "CEO of TechCorp",
    review:
      "Great service overall. The team was responsive, attentive, and provided valuable insights. Although there were some minor delays, the quality of work exceeded expectations. I'd definitely work with them again for future projects.",
    image:
      "https://images.unsplash.com/photo-1554151228-14d9def656e4?ixlib=rb-1.2.1&auto=format&crop=faces&fit=crop&w=100&h=100&q=80",
  },
  {
    id: 7,
    name: "Daniel Green",
    role: "Creative Director at PixelArt",
    review:
      "Working with this team was a pleasure. They understood our vision and brought it to life creatively. The designs exceeded expectations and the process was seamless. Highly recommend them for any creative project!",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&crop=faces&fit=crop&w=100&h=100&q=80",
  },
  {
    id: 8,
    name: "Laura Johnson",
    role: "Marketing Manager at BrandX",
    review:
      "A fantastic experience! The team was professional, creative, and timely. The results spoke for themselves.",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-1.2.1&auto=format&crop=faces&fit=crop&w=100&h=100&q=80",
  },
  {
    id: 9,
    name: "Samuel Lee",
    role: "Founder of NextGen Tech",
    review: "Great work. Very satisfied!",
    image:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&crop=faces&fit=crop&w=100&h=100&q=80",
  },
  {
    id: 10,
    name: "Emily Carter",
    role: "Lead Designer at UX Studio",
    review:
      "An exceptional team that truly understands user experience. They transformed complex ideas into intuitive designs that engage users effectively. I look forward to working with them again on future projects!",
    image:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-1.2.1&auto=format&crop=faces&fit=crop&w=100&h=100&q=80",
  },
];

export default function AboutMeReviewsUser() {
  const initialReviews = 4;
  const [visibleReviews, setVisibleReviews] = useState(initialReviews);

  const handleLoadMore = () => {
    setVisibleReviews((prev) => Math.min(prev + 3, allReviews.length));
  };

  const handleShowLess = () => {
    setVisibleReviews(initialReviews);
  };

  return (
    <div className="bg-[#EDECE8] pb-20">
      {/* Section Header */}
      <div className="bg-[#F8F7F3] py-10 px-4 md:px-10 my-5">
        <h2 className="text-3xl md:text-[44px] font-semibold text-center mb-6">
          Reviews
        </h2>
      </div>

      {/* Masonry-style layout */}
      <div className="px-4 md:px-10">
        <div className="columns-1 md:columns-2 gap-6 space-y-6">
          {allReviews.slice(0, visibleReviews).map((review) => (
            <div key={review.id} className="break-inside-avoid mb-6">
              <ReviewCard review={review} />
            </div>
          ))}
        </div>

        {/* Buttons for Load More and Show Less */}
        <div className="text-center mt-12">
          {visibleReviews > initialReviews && (
            <button
              onClick={handleShowLess}
              className="px-10 py-4 md:px-20 md:py-6 rounded-2xl md:text-lg bg-[#F8F7F3] text-black font-semibold hover:bg-gray-300 transition mr-4"
            >
              Show Less
            </button>
          )}
          {visibleReviews < allReviews.length && (
            <button
              onClick={handleLoadMore}
              className="px-10 py-4 md:px-20 md:py-6 rounded-2xl md:text-lg bg-[#F8F7F3] text-black font-semibold hover:bg-gray-300 transition"
            >
              More Reviews
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewCard({ review }) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-lg flex flex-col h-auto">
      {/* ⭐ Rating */}
      <div className="flex mb-2">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
            className="w-5 h-5 text-yellow-500"
          >
            <path d="M12 2l2.39 7.26h7.61l-6.15 4.47 2.39 7.27-6.15-4.48-6.15 4.48 2.39-7.27-6.15-4.47h7.61L12 2z" />
          </svg>
        ))}
      </div>

      {/* Full text */}
      <p className="text-lg mb-4">{review.review}</p>

      {/* Reviewer info */}
      <div className="flex items-center space-x-4 mt-auto">
        <Image
          src={review.image}
          alt={review.name}
          width={56}
          height={56}
          className="rounded-full object-cover"
        />
        <div>
          <h4 className="text-lg font-semibold">{review.name}</h4>
          <p className="text-sm text-gray-600">{review.role}</p>
        </div>
      </div>
    </div>
  );
}
