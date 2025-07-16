"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaInstagram } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Footer = () => {
  const router = useRouter();
  const [expertLink, setExpertLink] = useState('/experts');

  useEffect(() => {
    // Check if we're in the browser before accessing localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('expertToken');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const status = payload.status;
          if (status === 'Pending') setExpertLink('/reviewingexpertpanel/experts');
          else if (status === 'Approved') setExpertLink('/expertpanel/experts');
          else setExpertLink('/experts');
        } catch (error) {
          console.error('Error parsing expert token:', error);
          setExpertLink('/experts');
        }
      }
    }
  }, []);

  const handleGiftSessionClick = (e) => {
    e.preventDefault();
    try {
      if (typeof window !== 'undefined') {
        const userToken = localStorage.getItem('userToken');
        if (userToken) {
          router.push('/userpanel/userpanelprofile?tab=giftcard');
        } else {
          router.push('/giftcard');
        }
      } else {
        router.push('/giftcard');
      }
    } catch (error) {
      console.error('Error handling gift session click:', error);
      router.push('/giftcard');
    }
  };

  const handleExpertRedirect = () => {
    if (typeof window !== 'undefined') {
      const expertToken = localStorage.getItem('expertToken');
      if (expertToken) {
        try {
          const payload = JSON.parse(atob(expertToken.split('.')[1]));
          if (payload.status === 'Pending') router.push('/reviewingexpertpanel/expertpanelprofile');
          else router.push('/expertpanel/expertpanelprofile');
        } catch (error) {
          console.error('Error parsing expert token:', error);
          router.push('/expertpanel/expertlogin');
        }
      } else {
        router.push('/expertpanel/expertlogin');
      }
    }
  };

  return (
    <footer className="p-6 md:p-10 bg-[#EDECE8] w-full" dir="ltr">
      <ToastContainer />
      <div className="max-w-6xl mx-auto flex flex-col items-center md:items-start md:flex-row md:justify-between gap-10">

        {/* الشعار والعبارة الرئيسية */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <img
            src="/HomeImg/Hiba_logo.svg"
            alt="شعار هبة فراش"
            className="w-24 md:w-32 mb-4"
          />
          <h1 className="text-xl md:text-2xl font-bold text-black">هبة فراش</h1>
          <p className="mt-2 text-black text-sm md:text-base max-w-xs">
             احجز جلسة فردية مع هبة فراش<br />
              واحدة من أفضل مصممي الأزياء الفاخرة في المملكة العربية السعودية
          </p>
          <button
            onClick={() => router.push('/userpanel/booksession')}
            className="mt-4 px-6 py-2 bg-black text-white rounded-lg text-sm md:text-base hover:bg-gray-900 transition"
          >
            احجز جلسة
          </button>
        </div>

        {/* قسم الروابط */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 w-full md:w-auto text-center md:text-right md:mr-40">

          <div>
            <h2 className="mb-3 text-sm md:text-lg font-semibold text-black">الشركة:</h2>
            <ul className="text-gray-700 text-sm md:text-base space-y-2">
              <li>
                <button onClick={handleGiftSessionClick} className="hover:underline">
                  قدم جلسة كهدية
                </button>
              </li>
            </ul>
          </div>
    
          <div>
            <h2 className="mb-3 text-sm md:text-lg font-semibold text-black">الدعم:</h2>
            <ul className="text-gray-700 text-sm md:text-base space-y-2">
              <li>
                <Link href="/contactus" className="hover:underline">تواصل معنا 7/24 </Link>
              </li>
              <li>
                <Link href="/forms/feedback" className="hover:underline">أرسل لنا ملاحظاتك</Link>
              </li>
            </ul>
          </div>

          <div >
            <h2 className="mb-3 text-sm md:text-lg font-semibold text-black">السياسات:</h2>
            <ul className="text-gray-700 text-sm md:text-base space-y-2">
              <li>
                <Link href="/policies/privacy" className="hover:underline">سياسة الخصوصية</Link>
              </li>
              <li>
                <Link href="/policies/cancellation-policy" className="hover:underline">سياسة الإلغاء</Link>
              </li>
              <li>
                <Link href="/policies/refund-policy" className="hover:underline">سياسة الاسترجاع</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* وسائل التواصل الاجتماعي */}
        <div className="flex flex-col items-center md:items-start">
          <h2 className="mb-3 text-sm md:text-lg font-semibold text-black">هبة فراش</h2>
          <div className="flex space-x-4">
            <Link 
              href="https://www.instagram.com/hibafarrash?igsh=eTJ0cHJ6anY3ZnJv" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-black hover:text-gray-600"
            >
              <FaInstagram size={24} />
            </Link>
          </div>
        </div>
      </div>

      <hr className="my-6 border-gray-300 w-full" />

      {/* حقوق النشر */}
      <div className="text-center text-sm text-gray-500">
        © شورك ٢٠٢٥. جميع الحقوق محفوظة •{' '}
        <Link href="/policies/termsandcondition" className="hover:underline ml-1">السياسة</Link> •{' '}
        <Link href="/policies/termsandcondition" className="hover:underline ml-1">الشروط</Link>
      </div>
    </footer>
  );
};

export default Footer;