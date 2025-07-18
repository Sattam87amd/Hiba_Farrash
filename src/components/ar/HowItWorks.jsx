"use client";

import Image from "next/image";
import { BsStars } from "react-icons/bs";

const HowItWorks = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 p-6 bg-[#EDECE8] justify-center" dir="rtl">
      {/* Right Side Cards (Card 1, 2, 3) */}
      <div className="flex flex-col gap-8">
        {/* Card 1 */}
        <div className="bg-[#F8F7F3] p-4 md:p-8 shadow-md w-full md:min-h-[360px] overflow-hidden">
          <h2 className="text-2xl md:text-4xl font-semibold mb-6 text-right">طريقة الحجز</h2>
          <div className="space-y-6">
            {[
              { number: "1", title: "حددي رؤيتك", description: "شاركي أهدافك قبل الجلسة." },
              { number: "2", title: "احجزي وقتك مع هبة", description: "اختاري الموعد المناسب لك" },
              { number: "3", title: "جلسة آون لاين مباشرة مع هبة", description: "تعكس ذوقك وتغير نظرتك لإطلالتك." }
            ].map((step) => (
              <div key={step.number} className="flex items-start gap-4 flex-row-reverse">
                <div className="flex-1 text-right">
                  <h3 className="text-lg md:text-2xl font-bold">{step.title}</h3>
                  <p className="text-sm md:text-sm font-semibold text-black">{step.description}</p>
                </div>
                <div className="bg-black text-white rounded-full min-w-[40px] min-h-[40px] w-10 h-10 flex items-center justify-center text-lg font-bold flex-shrink-0">
                  {step.number}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Card 2 */}
        <div className="bg-black text-white p-4 md:p-8 shadow-md w-full md:min-h-[360px] overflow-hidden">
          <div className="flex justify-start mb-6">
            <Image src="/instantaccess.png" alt="Instant Access" width={100} height={80} />
          </div>
          <h3 className="text-xl md:text-3xl font-dark text-right">لمسة خبيرة تفرق
</h3>
          <p className="text-sm md:text-base font-dark mt-4 leading-relaxed text-right">
           سواء تطمحين تطورين إطلالتك أو تبنين علامة في الأزياء أو العطور، هبة تقدم لك استشارة بخبرة وذوق يخلّي هويتك تبرز بثقة

          </p>
        </div>
        {/* Card 3 */}
        <div className="bg-[#F8F7F3] p-4 md:p-8 shadow-md w-full md:min-h-[360px] overflow-hidden">
          <div className="flex justify-start mb-6">
            <Image src="/secure.png" alt="100% Secure Payments" width={100} height={80} />
          </div>
          <h3 className="text-xl md:text-3xl font-dark text-right">دفع آمن 100%</h3>
          <p className="text-sm md:text-base font-dark mt-4 leading-relaxed text-right">
            مسدادك مضمون، وبياناتك في أمان.
          </p>
        </div>
      </div>
      {/* Left Side Cards (Card 4, 5) */}
      <div className="flex flex-col md:pt-32 gap-8">
        {/* Card 4 */}
        <div className="bg-[#F8F7F3] p-4 md:p-8 shadow-md w-full md:min-h-[360px] overflow-hidden">
          <div className="flex justify-start mb-6">
            <Image src="/top.png" alt="Top Industry Experts" width={100} height={80} />
          </div>
          <h3 className="text-xl md:text-3xl font-dark text-right  flex items-center justify-start gap-2">رؤية سعودية في عالم الموضة
              <BsStars className="text-black" />
          </h3>
          <p className="text-sm md:text-base font-dark mt-4 leading-relaxed text-right">
            مهبة فراش تساعدك تبني علامتك بلمسة تجمع بين الفخامة<br/> والأصالة.<br/>. استشارات من مصممة سعودية حائزة على جوائز
          </p>
        </div>
        {/* Card 5 */}
        <div className="bg-[#F8F7F3] p-4 md:p-8 shadow-md w-full md:min-h-[360px] overflow-hidden">
          <div className="flex justify-start mb-6">
            <Image src="/schedule.png" alt="Flexible Scheduling" width={100} height={80} />
          </div>
          <h3 className="text-xl md:text-3xl font-dark text-right">اختاري الوقت اللي يناسبك</h3>
          <p className="text-sm md:text-sm font-dark mt-4 leading-relaxed text-right">
            من الأوقات المتاحة، وهبة تكون جاهزة لك وقت الجلسة
          </p>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
