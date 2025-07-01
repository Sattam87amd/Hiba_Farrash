"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaInstagram, FaTwitter, FaFacebook } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Footer = () => {
  const router = useRouter();
  const [expertLink, setExpertLink] = useState('/experts');

  useEffect(() => {
    const token = localStorage.getItem('expertToken');
    if (token) {
      try {
        const payload = token.split('.')[1];
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const decodedPayload = atob(base64);
        const payloadObj = JSON.parse(decodedPayload);
        const status = payloadObj.status;
        if (status === 'Pending') {
          setExpertLink('/reviewingexpertpanel/experts');
        } else if (status === 'Approved') {
          setExpertLink('/expertpanel/experts');
        } else {
          setExpertLink('/experts');
        }
      } catch (error) {
        console.error('Error decoding expert token:', error);
        setExpertLink('/experts');
      }
    } else {
      setExpertLink('/experts');
    }
  }, []);

  // Function to handle Gift a Session click
  const handleGiftSessionClick = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('expertToken');
    if (token) {
      try {
        const payload = token.split('.')[1];
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const decodedPayload = atob(base64);
        const payloadObj = JSON.parse(decodedPayload);
        const status = payloadObj.status;
        if (status === "Pending") {
          toast.error("This feature is not available for pending experts");
          return;
        }
      } catch (error) {
        toast.error("Error decoding token");
        return;
      }
    }
    router.push("/giftsession");
  };

  // Existing expert redirect handler for Become Expert button
  const handleExpertRedirect = () => {
    try {
      const expertToken = localStorage.getItem('expertToken');
      if (expertToken) {
        try {
          const payload = expertToken.split('.')[1];
          const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
          const decodedPayload = atob(base64);
          const payloadObj = JSON.parse(decodedPayload);
          const status = payloadObj.status;
          if (status === 'Pending') {
            router.push('/reviewingexpertpanel/expertpanelprofile');
          } else {
            router.push('/expertpanel/expertpanelprofile');
          }
        } catch (error) {
          console.error('Error decoding expert token:', error);
          router.push('/joinasexpert');
        }
      } else {
        router.push('/joinasexpert');
      }
    } catch (error) {
      console.error('Error checking expert token:', error);
      router.push('/joinasexpert');
    }
  };

  return (
    <footer className="p-4 md:p-10 md:py-6 bg-[#EDECE8] w-full">
      <ToastContainer />
      <div className="w-full">
        <div className="md:flex md:justify-between md:items-start">
          {/* Left Section */}
          <div className="mb-6 md:mb-0">
            <h1 className="text-3xl md:text-4xl font-bold text-black">Shourk</h1>
            <p className="mt-2 text-black text-base md:text-2xl md:py-4 leading-relaxed">
              Book the most in-demand experts <br />& get advice over a video
              call.
            </p>
            <button 
              onClick={handleExpertRedirect} 
              className="mt-4 px-6 py-2 md:px-16 md:py-3 md:text-xl bg-black text-white rounded-lg"
            >
              Become Expert
            </button>
          </div>

          {/* Middle Section */}
          <div className="flex flex-col md:flex-row md:space-x-16 gap-10">
            <div>
              <h2 className="mb-4 text-sm md:text-lg font-semibold text-black">
                Company
              </h2>
              <ul className="text-gray-700 text-sm md:text-lg">
                <li className="mb-2">
                  <Link href="/ourmission" className="hover:underline">
                    About
                  </Link>
                </li>
                <li className="mb-2">
                  <Link href="/faq" className="hover:underline">
                    FAQ
                  </Link>
                </li>
                <li className="mb-2">
                  {/* Updated Gift a Session link with click handler */}
                  <a 
                    onClick={handleGiftSessionClick} 
                    className="mb-2 cursor-pointer hover:underline"
                  >
                    Gift a Session
                  </a>
                </li>
                <li>
                  <Link href={expertLink} className="hover:underline">
                    Experts
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="mb-4 text-sm md:text-lg font-semibold text-black">
                Support
              </h2>
              <ul className="text-gray-700 text-sm md:text-lg">
                <li className="mb-2">
                  <Link href="/contactus" className="hover:underline">
                    Contact
                  </Link>
                </li>
                <li className="mb-2">
                  <Link href="/forms/feedback" className="hover:underline">
                    Give us feedback 
                  </Link>
                </li>
                <li className="mb-2">
                  <Link href="/forms/feature" className="hover:underline">
                    Suggest a feature
                  </Link>
                </li>
                <li className="mb-2">
                  <Link href="/forms/newtopic" className="hover:underline">
                    Suggest a new topic
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="mb-4 text-sm md:text-lg font-semibold text-black">
                Policies
              </h2>
              <ul className="text-gray-700 text-sm md:text-lg">
                <li className="mb-2">
                  <Link
                    href="/policies/termsandcondition"
                    className="hover:underline"
                  >
                    Terms & Conditions
                  </Link>
                </li>
                <li className="mb-2">
                  <Link href="/policies/privacy" className="hover:underline">
                    Privacy & Policy
                  </Link>
                </li>
                <li className="mb-2">
                  <Link
                    href="/policies/cancellation-policy"
                    className="hover:underline"
                  >
                    Cancelation Policy
                  </Link>
                </li>
                <li className="mb-2">
                  <Link
                    href="/policies/refund-policy"
                    className="hover:underline"
                  >
                    Refund Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Section */}
          <div>
            <h2 className="mb-4 text-sm md:text-lg font-semibold text-black">
              Follow us for peaks
            </h2>
            <div className="flex justify-start md:justify-center items-center space-x-4">
              <Link
                href="https://www.instagram.com"
                target="_blank"
                className="text-[#A6A6A6] hover:text-black"
              >
                <FaInstagram size={28} />
              </Link>
              <Link
                href="https://www.twitter.com"
                target="_blank"
                className="text-[#A6A6A6] hover:text-black"
              >
                <FaTwitter size={28} />
              </Link>
              <Link
                href="https://www.facebook.com"
                target="_blank"
                className="text-[#A6A6A6] hover:text-black"
              >
                <FaFacebook size={28} />
              </Link>
            </div>
          </div>
        </div>

        <hr className="my-6 border-gray-300" />

        <div className="flex flex-col sm:flex-row justify-between items-center">
          <span className="text-sm text-gray-500 text-center">
            © Shourk 2025. ALL RIGHTS RESERVED •
            <Link href="/policies/termsandcondition" className="hover:underline ml-1">
              Policy
            </Link>
            •
            <Link href="/policies/termsandcondition" className="hover:underline ml-1">
              Terms
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
