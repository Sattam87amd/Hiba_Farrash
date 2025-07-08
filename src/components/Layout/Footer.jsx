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
    const token = localStorage.getItem('expertToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const status = payload.status;
        if (status === 'Pending') setExpertLink('/reviewingexpertpanel/experts');
        else if (status === 'Approved') setExpertLink('/expertpanel/experts');
        else setExpertLink('/experts');
      } catch {
        setExpertLink('/experts');
      }
    }
  }, []);

  const handleGiftSessionClick = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('expertToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.status === "Pending") {
          toast.error("This feature is not available for pending experts");
          return;
        }
      } catch {
        toast.error("Error decoding token");
        return;
      }
    }
    router.push("/giftsession");
  };

  const handleExpertRedirect = () => {
    const expertToken = localStorage.getItem('expertToken');
    if (expertToken) {
      try {
        const payload = JSON.parse(atob(expertToken.split('.')[1]));
        if (payload.status === 'Pending') router.push('/reviewingexpertpanel/expertpanelprofile');
        else router.push('/expertpanel/expertpanelprofile');
      } catch {
        router.push('/expertpanel/expertlogin');
      }
    } else {
      router.push('/expertpanel/expertlogin');
    }
  };

  return (
    <footer className="p-6 md:p-10 bg-[#EDECE8] w-full">
      <ToastContainer />
      <div className="max-w-6xl mx-auto flex flex-col items-center md:items-start md:flex-row md:justify-between gap-10">

        {/* Logo and Main CTA */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <img
            src="/HomeImg/Hiba_logo.svg"
            alt="Hiba Farrash Logo"
            className="w-24 md:w-32 mb-4"
          />
          <h1 className="text-xl md:text-2xl font-bold text-black">Hiba Farrash</h1>
          <p className="mt-2 text-black text-sm md:text-base max-w-xs">
             Book a 1-on-1 with Hiba Farrash<br />
              One of Saudi Arabia's top luxury designers
          </p>
          <button
            onClick={handleExpertRedirect}
            className="mt-4 px-6 py-2 bg-black text-white rounded-lg text-sm md:text-base hover:bg-gray-900 transition"
          >
            Book a Session
          </button>
        </div>

        {/* Links Section */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 w-full md:w-auto text-center md:text-left">

          <div>
            <h2 className="mb-3 text-sm md:text-lg font-semibold text-black">Company</h2>
            <ul className="text-gray-700 text-sm md:text-base space-y-2">
              <li>
                <button onClick={handleGiftSessionClick} className="hover:underline">
                  Gift a Session
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-3 text-sm md:text-lg font-semibold text-black">Support</h2>
            <ul className="text-gray-700 text-sm md:text-base space-y-2">
              <li>
                <Link href="/contactus" className="hover:underline">Contact 24/7</Link>
              </li>
              <li>
                <Link href="/forms/feedback" className="hover:underline">Give us feedback</Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-3 text-sm md:text-lg font-semibold text-black">Policies</h2>
            <ul className="text-gray-700 text-sm md:text-base space-y-2">
              <li>
                <Link href="/policies/privacy" className="hover:underline">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/policies/cancellation-policy" className="hover:underline">Cancellation Policy</Link>
              </li>
              <li>
                <Link href="/policies/refund-policy" className="hover:underline">Refund Policy</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Media */}
        <div className="flex flex-col items-center md:items-start">
          <h2 className="mb-3 text-sm md:text-lg font-semibold text-black">Hiba Farrash</h2>
          <div className="flex space-x-4">
            <Link href="https://www.instagram.com/hibafarrash?igsh=eTJ0cHJ6anY3ZnJv" target="_blank" className="text-black hover:text-gray-600">
              <FaInstagram size={24} />
            </Link>
          </div>
        </div>
      </div>

      <hr className="my-6 border-gray-300 w-full" />

      {/* Copyright */}
      <div className="text-center text-sm text-gray-500">
        © Shourk 2025. ALL RIGHTS RESERVED •
        <Link href="/policies/termsandcondition" className="hover:underline ml-1">Policy</Link> •
        <Link href="/policies/termsandcondition" className="hover:underline ml-1">Terms</Link>
      </div>
    </footer>
  );
};

export default Footer;
