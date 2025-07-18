"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import axios from "axios";

function HeroHome() {
  const [isArabic, setIsArabic] = useState(false);

  useEffect(() => {
    // 🟢 Check for refresh token and renew access token
    const tryRefreshToken = async () => {
      const existingAccessToken = localStorage.getItem("userToken");

      if (existingAccessToken) return; // Access token exists, no need to refresh

      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_PROD_API_URL}/api/userauth/user/refreshToken`, {
          withCredentials: true, // include HTTP-only cookie
        });

        const { token } = response.data;
        localStorage.setItem("userToken", token);
        console.log("✅ Access token refreshed");
      } catch (error) {
        console.log("❌ Refresh token invalid or expired");
        localStorage.removeItem("userToken");
        // Optional: redirect to login
        // window.location.href = "/userpanel/userlogin";
      }
    };

    // Language detection from cookie
    const getCookie = (name) => {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? match[2] : null;
    };

    const lang = getCookie('googtrans');
    const isCurrentlyArabic = lang?.includes('/ar') || lang?.includes('/en/ar');
    setIsArabic(isCurrentlyArabic);

    // Trigger token refresh
    tryRefreshToken();
  }, []);

  const translations = {
    heading: isArabic
      ? "أناقة خالدة من تصميم هيبا فراش"
      : "Timeless Style by Hiba Farrash",

    paragraph: isArabic
      ? "مرحباً بالعالممرحباً بالعالممرحباً بالعالممرحباً بالعالممرحباً بالعالممرحباً بالعالممرحباً بالعالممرحباً بالعالممرحباً بالعالممرحباً بالعالم."
      : "Award-winning Saudi Designer & Fashion Council Visionary. Luxury Ready to Wear Fragrances & Private Style Consultations.",

    button: isArabic
      ? "احجز جلستك الخاصة مع هيبا فراش"
      : "Book Your Private Session with Hiba",

    supported: isArabic ? "بدعم من" : "Supported by",
    subtext: isArabic
      ? "بقيادة خبراء ومنظمات رائدة في مجال الصناعة"
      : "Shourk leading industry experts and organizations"
  };

  return (
    <div>
      <section className="bg-[#FAF9F6] w-full min-h-screen flex flex-col md:flex-row pt-24 md:pt-0 md:mt-24 relative">
        <div className="w-full md:w-[60%] flex flex-col justify-center items-center md:items-start p-6 md:p-12 z-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-black text-center md:text-left leading-normal uppercase mb-4">
            {translations.heading.split('<br>').map((line, i) => (
              <span key={i}>
                {line}
                {i < translations.heading.split('<br>').length - 1 && <br className="hidden md:block" />}
              </span>
            ))}
          </h1>

          <p className="text-sm sm:text-base md:text-xl font-medium text-black uppercase leading-normal text-center md:text-left mb-6 md:mt-10 md:mb-20 max-w-lg">
            {translations.paragraph}
          </p>

          <div className="w-full flex justify-center md:justify-start md:pl-14">
            <Link href="/userpanel/booksession">
              <button className="bg-black text-white text-sm md:text-base py-3 px-6 md:py-4 md:px-8 rounded-2xl uppercase font-semibold hover:bg-gray-800 transition">
                {translations.button}
              </button>
            </Link>
          </div>
        </div>

        <div className="w-full md:w-[40%] relative h-[480px] md:h-screen overflow-hidden">
          <Image
            src="/HomeImg/homeHero.webp"
            alt="Hiba Farrash"
            fill
            className="object-contain"
            priority
            sizes="(max-width: 768px) 100vw, 40vw"
          />
        </div>
      </section>

      <section className="bg-white py-12 md:py-20">
        <div className="text-center">
          <h2 className="text-lg md:text-2xl font-semibold uppercase tracking-wide text-gray-800">
            {translations.supported}
          </h2>
          <p className="mt-2 text-sm md:text-base text-gray-500">
            {translations.subtext}
          </p>
        </div>
      </section>
    </div>
  );
}

export default HeroHome;
