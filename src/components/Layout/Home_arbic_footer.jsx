"use client";

import React from "react";
import Link from "next/link";
import { FaInstagram, FaWhatsapp, FaEnvelope, FaPhone } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="p-6 md:p-10 bg-[#EDECE8] w-full text-right" dir="rtl">
      <div className="max-w-6xl mx-auto flex flex-col items-center md:items-end md:flex-row md:justify-between gap-10">

        {/* الشعار والدعوة الرئيسية لاتخاذ الإجراء */}
        <div className="flex flex-col items-center md:items-end text-center md:text-right">
          <img
            src="/HomeImg/Hiba_logo.svg"
            alt="شعار هبة فراش"
            className="w-24 md:w-32 mb-4"
            loading="lazy"
          />
          <h1 className="text-xl md:text-2xl font-bold text-black">هبة فراش</h1>
          <p className="mt-2 text-black text-sm md:text-base max-w-xs leading-relaxed">
            احجز جلسة خاصة مع هبة فراش<br />
            واحدة من أفضل مصممي الرفاهية في السعودية
          </p>
          <button
            onClick={() => window.location.href = '/userpanel/booksession'}
            className="mt-4 px-6 py-3 bg-black text-white rounded-lg text-sm md:text-base hover:bg-gray-900 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2"
            aria-label="احجز جلسة مع هبة فراش"
          >
            احجز جلسة
          </button>
        </div>

        {/* قسم الروابط */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full md:w-auto text-center md:text-right">

          <div>
            <h2 className="mb-4 text-sm md:text-lg font-semibold text-black">الشركة</h2>
            <ul className="text-gray-700 text-sm md:text-base space-y-3">
              <li>
                <Link href="/giftcard" className="hover:underline hover:text-black transition-colors duration-200">
                  قدم جلسة كهدية
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:underline hover:text-black transition-colors duration-200">
                  من نحن
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="hover:underline hover:text-black transition-colors duration-200">
                  أعمالنا
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-4 text-sm md:text-lg font-semibold text-black">الدعم</h2>
            <ul className="text-gray-700 text-sm md:text-base space-y-3">
              <li>
                <Link href="/contactus" className="hover:underline hover:text-black transition-colors duration-200">
                  اتصل بنا 24/7
                </Link>
              </li>
              <li>
                <Link href="/forms/feedback" className="hover:underline hover:text-black transition-colors duration-200">
                  أعطنا رأيك
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:underline hover:text-black transition-colors duration-200">
                  الأسئلة الشائعة
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-4 text-sm md:text-lg font-semibold text-black">السياسات</h2>
            <ul className="text-gray-700 text-sm md:text-base space-y-3">
              <li>
                <Link href="/policies/privacy" className="hover:underline hover:text-black transition-colors duration-200">
                  سياسة الخصوصية
                </Link>
              </li>
              <li>
                <Link href="/policies/cancellation-policy" className="hover:underline hover:text-black transition-colors duration-200">
                  سياسة الإلغاء
                </Link>
              </li>
              <li>
                <Link href="/policies/refund-policy" className="hover:underline hover:text-black transition-colors duration-200">
                  سياسة الاسترداد
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* التواصل الاجتماعي ووسائل الاتصال */}
        <div className="flex flex-col items-center md:items-end">
          <h2 className="mb-4 text-sm md:text-lg font-semibold text-black">تواصل معنا</h2>
          
          {/* معلومات الاتصال */}
          <div className="mb-4 text-gray-700 text-sm space-y-2">
            <div className="flex items-center justify-center md:justify-end gap-2">
              <span>+966 50 123 4567</span>
              <FaPhone size={14} />
            </div>
            <div className="flex items-center justify-center md:justify-end gap-2">
              <span>info@hibafarrash.com</span>
              <FaEnvelope size={14} />
            </div>
          </div>

          {/* وسائل التواصل الاجتماعي */}
          <div className="flex gap-4">
            <Link 
              href="https://www.instagram.com/hibafarrash?igsh=eTJ0cHJ6anY3ZnJv" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-black hover:text-gray-600 transition-colors duration-200"
              aria-label="تابعنا على انستقرام"
            >
              <FaInstagram size={24} />
            </Link>
            <Link 
              href="https://wa.me/966501234567" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-black hover:text-gray-600 transition-colors duration-200"
              aria-label="تواصل معنا عبر واتساب"
            >
              <FaWhatsapp size={24} />
            </Link>
          </div>
        </div>
      </div>

      <hr className="my-6 border-gray-300 w-full" />

      {/* حقوق الطبع والنشر */}
      <div className="text-center text-sm text-gray-500">
        © شورك 2025. جميع الحقوق محفوظة •
        <Link href="/policies/termsandcondition" className="hover:underline mr-1 ml-1">
          السياسة
        </Link> •
        <Link href="/policies/termsandcondition" className="hover:underline mr-1 ml-1">
          الشروط
        </Link>
      </div>
    </footer>
  );
};

export default Footer;