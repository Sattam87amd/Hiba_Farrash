"use client";

import Image from "next/image";
import Link from "next/link";

function HeroHome() {
  return (
    <div>
      {/* ✅ Hero Section */}
      <section className="bg-[#FAF9F6] w-full min-h-screen flex flex-col md:flex-row pt-24 md:pt-0 md:mt-24 relative">
        {/* Left Section */}
        <div className="w-full md:w-[60%] flex flex-col justify-center items-center md:items-start p-6 md:p-12 z-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-black text-center md:text-left leading-normal uppercase mb-4">
            Timeless Style<br className="hidden md:block" /> by Hiba Farrash
          </h1>

          <p className="text-sm sm:text-base md:text-xl font-medium text-black uppercase leading-normal text-center md:text-left mb-6 md:mt-10 md:mb-20 max-w-lg">
            Award-winning Saudi Designer & Fashion Council Visionary. Luxury Ready to Wear Fragrances & Private Style Consultations.
          </p>

          <div className="w-full flex justify-center md:justify-start md:pl-14">
            <Link href="/userpanel/userbooking">
              <button className="bg-black text-white text-sm md:text-base py-3 px-6 md:py-4 md:px-8 rounded-2xl uppercase font-semibold hover:bg-gray-800 transition">
                Book Your Private Session with Hiba
              </button>
            </Link>
          </div>
        </div>

        {/* Right Section - Fixed */}
        <div className="w-full md:w-[40%] relative h-[480px] md:h-screen overflow-hidden">
          <Image
            src="/HomeImg/homeHero.webp"
            alt="Hiba Farrash"
            fill
            className="object-cover md:object-center object-top"
            priority
          />
        </div>
      </section>

      {/* ✅ Supported By Section */}
      <section className="bg-white py-12 md:py-20">
        <div className="text-center">
          <h2 className="text-lg md:text-2xl font-semibold uppercase tracking-wide text-gray-800">
            Supported by
          </h2>
          <p className="mt-2 text-sm md:text-base text-gray-500">
            Shourk leading industry experts and organizations
          </p>
        </div>
      </section>
    </div>
  );
}

export default HeroHome;