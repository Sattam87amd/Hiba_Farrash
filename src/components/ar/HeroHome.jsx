"use client";
import Image from "next/image";
import Link from "next/link";

function HeroHome() {
  return (
    <div>
      {/* ✅ Hero Section */}
      <section className="bg-[#FAF9F6] w-full min-h-screen flex flex-col md:flex-row pt-24 md:pt-0 md:mt-24 relative">
        {/* Image on Left */}
        <div className="w-full md:w-[40%] relative h-[480px] md:h-screen overflow-hidden">
          <Image
            src="/HomeImg/homeHero.webp"
            alt="هيبة فراش"
            fill
            className="object-contain"
            priority
            sizes="(max-width: 768px) 100vw, 40vw"
          />
        </div>
        
        {/* Arabic Text on Right */}
        <div className="w-full md:w-[60%] flex ml-40  flex-col justify-center items-center md:items-end p-6 md:p-12 z-10" dir="rtl">
             <h3 className=" text-xl sm:text-4xl ml-80  md:text-3xl font-extrabold text-black text-center md:text-right leading-normal uppercase mb-4">
               أسلوب خالد بقلم
          </h3>
          <h1 className="text-3xl sm:text-4xl ml-80  md:text-5xl font-extrabold text-black text-center md:text-right leading-normal uppercase mb-4">
             هيبة فراش
          </h1>

          <p className="text-sm sm:text-base md:text-xl font-medium text-black uppercase leading-normal text-center md:text-right mb-6 md:mt-10 md:mb-20 max-w-lg">
           مصممة أزياء سعودية حاصلة على عدة شهادات وجوائز في مجال الأزياء، ومدربة معتمدة قدّمت مشاركات بارزة في محافل محلية ودولية، وحائزة على جائزة NICHE AWARD.
          </p>
          <h6 className="text-sm ml-9  -mt-10 sm:text-base  md:text-lg font-medium text-black uppercase leading-normal text-center md:text-right mb-6  md:mb-20 max-w-lg">
            تقدّم جلسات استشارية في الذوق، والأناقة، وبناء الهوية الشخصية
          </h6>
          <div className="w-full flex ml-28 justify-center md:justify-end md:pr-14">
            <Link href="/userpanel/booksession">
              <button className="bg-black text-white text-sm md:text-base py-3 px-6 md:py-4 md:px-8 rounded-2xl uppercase font-semibold hover:bg-gray-800 transition">
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
          <p className="mt-2 text-sm md:text-base text-gray-500">
            
منصة شورك - نخبة من المختصين والجهات الرائدة

          </p>
        </div>
      </section>
    </div>
  );
}

export default HeroHome;