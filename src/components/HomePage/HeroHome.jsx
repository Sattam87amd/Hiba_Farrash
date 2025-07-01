"use client";

import Image from "next/image";
import Link from "next/link";

function HeroHome() {
  return (
    <div>
      <section className="bg-[#FAF9F6] w-full h-screen grid md:grid-cols-2 md:mt-0 relative">
        {/* Left Section */}
        <div className="flex flex-col justify-center items-center md:items-start p-6 md:p-12 w-full z-10">
          <h1 className="text-xl md:text-4xl font-extrabold text-black text-center md:text-left leading-snug uppercase mb-4">
            Timeless & Style with <br className="hidden md:block" /> Hiba Farrash
          </h1>

          <p className="text-sm md:text-lg font-semibold text-black uppercase text-center md:text-left mb-6">
            Award-winning Saudi Designer <br />
            Fashion Council Member <br />
            Luxury RTW & Fragrances
          </p>

          <Link href="/experts">
            <button className="bg-black text-white text-sm md:text-base py-3 px-6 md:py-4 md:px-8 rounded-full uppercase font-semibold hover:bg-gray-800 transition">
              Find Your Expert
            </button>
          </Link>
        </div>

        {/* Right Section */}
        <div className="relative w-full h-full flex justify-center items-end bg-[#ECEBE6] overflow-hidden">
          <Image
            src="/heroHome.png"
            alt="Hiba Farrash"
          
            width={500}
            height={500}
            className="object-contain md:w-[500px] w-[300px]"
            priority
          />
        </div>

        {/* Decorative Circles */}
        <div className="hidden md:block absolute top-10 left-10 w-24 h-24 bg-[#E8E7E2] rounded-full"></div>
        <div className="hidden md:block absolute bottom-10 right-10 w-32 h-32 bg-[#E8E7E2] rounded-full"></div>
      </section>

      {/* Supported By Section */}
      <section className="bg-white py-12 md:py-20">
        <div className="text-center">
          <h2 className="text-lg md:text-2xl font-semibold uppercase tracking-wide text-gray-800">
            Supported by
          </h2>
          <p className="mt-2 text-sm md:text-base text-gray-500">
            Leading industry experts and organizations globally
          </p>
        </div>
      </section>
    </div>
  );
}

export default HeroHome;
