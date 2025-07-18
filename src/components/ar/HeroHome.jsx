"use client";
import Image from "next/image";
import Link from "next/link";

function HeroHome() {
  return (
    <div>
      {/* ✅ Hero Section */}
      <section
        className="bg-[#FAF9F6] w-full min-h-screen  flex flex-col-reverse md:flex-row pt-10 md:pt-0 md:mt-24 relative"
        dir="ltr"
      >
        {/* Image on Left - Mobile Optimized */}
        <div className="w-full md:w-[50%] relative h-[60vh] md:h-screen overflow-hidden flex items-center justify-center mr-0 md:mr-10 mb-0 md:mb-0 mt-4 md:mt-0 px-4 md:px-0">
          <div className="relative w-full h-full max-h-[60vh] md:max-h-none mx-2 md:mx-0">
            <Image
              src="/HomeImg/homeHero.webp"
              alt="هيبة فراش"
              fill
              className="object-contain"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ objectFit: "contain" }}
            />
          </div>
        </div>

        {/* Arabic Text on Right - Mobile Optimized */}
        <div
          className="w-full md:w-[50%] flex flex-col justify-center items-center mt-8 md:mt-0 md:items-end p-4 md:p-12 z-10 md:ml-60"
          dir="rtl"
        >
          <h3 className="text-xl sm:text-2xl md:text-5xl font-extrabold text-black text-center md:text-right leading-normal uppercase md:ml-[9rem]">
            أسلوب خالد بقلم
          </h3>

          <h1
            className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-black text-center md:text-right leading-normal uppercase mb-4 md:ml-[14.5rem]"
            style={{
              fontFamily: "rpt-Bold, sans-serif",
              letterSpacing: "0.em",
            }}
          >
            هيبة فراش
          </h1>

          <p className="text-base sm:text-lg md:text-2xl font-medium text-black uppercase leading-normal text-center md:text-right mb-6 md:mt-10 md:mb-20 max-w-lg md:-ml-[4.1rem] px-2 md:px-0">
            مصممة أزياء سعودية حاصلة على عدة شهادات وجوائز في مجال
            الأزياء، ومدربة معتمدة قدّمت مشاركات بارزة في محافل محلية ودولية،
            وحائزة على جائزة NICHE AWARD.
          </p>

          <h6 className="text-sm sm:text-base md:text-lg font-medium text-black uppercase leading-normal text-center md:text-right mb-6 md:mb-20 max-w-lg md:-ml-[4rem] md:-mt-10 px-2 md:px-0">
            تقدّم جلسات استشارية في الذوق، والأناقة، وبناء الهوية الشخصية
          </h6>

          <div className="w-full flex justify-center md:justify-end md:pr-14 md:ml-7 mt-4 md:mt-0">
            <Link href="/userpanel/booksession">
              <button className="bg-black text-white text-sm md:text-base py-3 px-6 md:py-4 md:px-20 rounded-2xl uppercase font-semibold hover:bg-gray-800 transition">
                احجز جلستك الخاصة مع هيبة
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ✅ Supported By Section */}
      <section className="bg-white py-12 md:py-20">
        <div className="text-center" dir="rtl">
          <h2 className="text-lg md:text-2xl font-semibold uppercase tracking-wide text-gray-800">
            بدعم من
          </h2>
          <p className="mt-2 text-lg md:text-base text-gray-500">
            منصة شورك - نخبة من المختصين والجهات الرائدة
          </p>
        </div>
      </section>
    </div>
  );
}

export default HeroHome;