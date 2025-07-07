"use client";

import Image from "next/image";
import Link from "next/link";

function HeroHome() {
  return (
    <div>
      <section className="bg-[#FAF9F6] w-full md:h-screen flex flex-col md:flex-row md:mt-24 relative">

        {/* Top-Center SVG for md+ */}
        {/* <div className="hidden md:block absolute top-[-40px] left-1/2 transform -translate-x-1/2 z-0">
          <Image
            src="/HomeImg/HomeElement.svg"
            alt="Top Decorative Element"
            width={150}
            height={150}
            priority
          />
        </div> */}

        {/* Left Section - 60% on md+ */}
        <div className="w-full md:w-[60%] flex flex-col justify-center items-center md:items-start p-6 md:p-12 z-10">
          <h1 className="text-xl md:text-5xl font-extrabold text-black text-center md:text-left leading-snug uppercase mb-4">
            Timeless & Style with <br className="hidden md:block" /> Hiba Farrash
          </h1>

          <p className="text-sm md:text-3xl font-bold text-black uppercase leading-snug text-center md:text-left mb-6 md:mt-10 md:mb-20">
            Award-winning Saudi Designer <br />
            Fashion Council Member <br />
            Luxury RTW & Fragrances
          </p>

          <div className="w-full flex justify-center md:justify-start md:pl-32">
            <Link href="/userpanel/userbooking">
              <button className="bg-black text-white text-sm md:text-base py-3 px-6 md:py-4 md:px-8 rounded-2xl uppercase font-semibold hover:bg-gray-800 transition">
                Book a Slot!
              </button>
            </Link>
          </div>
        </div>

        {/* Right Section - 40% on md+ */}
        <div className="w-full md:w-[40%] relative h-[480px] md:h-full overflow-hidden ">
          <Image
            src="/HomeImg/heroHome.png"
            alt="Hiba Farrash"
            fill
            className="object-top"
            priority
          />
        </div>
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
