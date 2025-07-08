"use client";

import React from "react";
import Link from "next/link";
import { FaInstagram, FaTwitter, FaFacebook } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="relative p-4 md:p-10 md:py-6 bg-[#EDECE8] w-full  z-10">
      <div className="w-full">
        <div className="md:flex md:justify-between md:items-start">
          {/* Left Section - Shourk and Tagline */}
          <div className="mb-6 md:mb-0">
            <h1 className="text-3xl md:text-4xl font-bold text-black">Shourk</h1>
            <p className="mt-2 text-black text-base md:text-2xl md:py-4 leading-relaxed">
              Book a 1-on-1 with Hiba Farrash<br />
              One of Saudi Arabia's top luxury designers
            </p>
            <Link href="/userpanel/booksession">
              <button className="mt-4 px-6 py-2 md:px-16 md:py-3 md:text-xl bg-black text-white rounded-lg">
                Book a Session
              </button>
            </Link>
          </div>

          {/* Middle Section - Company and Support */}
          <div className="flex flex-col md:flex-row md:space-x-16 gap-10">
            {/* Company Section */}
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
                  <Link href="/giftsession" className="hover:underline">
                    Gift a Session
                  </Link>
                </li>
                <li>
                  <Link href="/" className="hover:underline">
                    Experts
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support Section */}
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
                  <Link href="/userpanel/forms/feedback" className="hover:underline">
                    Give us feedback
                  </Link>
                </li>
                <li className="mb-2">
                  <Link href="/userpanel/forms/feature" className="hover:underline">
                    Suggest a feature 
                  </Link>
                </li>
                <li className="mb-2">
                  <Link href="/userpanel/forms/newtopic" className="hover:underline">
                    Suggest a new topic
                  </Link>
                </li>
                <li>
                  <Link href="/userpanel/termsandconditions" className="hover:underline">
                    Terms & Conditions
                  </Link>
                </li>
              </ul>

            </div>
            {/* Policies Section */}
            <div>
              <h2 className="mb-4 text-sm md:text-lg font-semibold text-black">
                Policies
              </h2>
              <ul className="text-gray-700 text-sm md:text-lg">
                {/* <li className="mb-2">
                  <Link href="/policies/about" className="hover:underline">
                    About Shourk
                  </Link>
                </li> */}
                {/* <li className="mb-2">
                  <Link href="/policies/contact" className="hover:underline">
                    Contact
                  </Link>
                </li> */}
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
                {/* <li className="mb-2">
                  <Link
                    href="/policies/product-pricing"
                    className="hover:underline"
                  >
                    Product Pricing
                  </Link>
                </li> */}
                {/* <li className="mb-2">
                  <Link
                    href="/policies/cancellation-policy"
                    className="hover:underline"
                  >
                    Cancelation Policy
                  </Link>
                </li> */}
                <li className="mb-2">
                  <Link
                    href="/policies/refund-policy"
                    className="hover:underline"
                  >
                    Refund Policy
                  </Link>
                </li>
                {/* <li>
                  <Link
                    href="/policies/shipping-policies"
                    className="hover:underline"
                  >
                    Shipping & Delivery Policy
                  </Link>
                </li> */}
              </ul>
            </div>
            
          </div>

          {/* Right Section - Social Media */}
          <div>
            <h2 className="mb-4 text-sm md:text-lg font-semibold text-black">
              Hiba Farrash
            </h2>
            <div className="flex justify-start md:justify-center items-center space-x-4">
              <Link href="https://www.instagram.com" target="_blank" className="text-[#A6A6A6] hover:text-black">
                <FaInstagram size={28} />
              </Link>
              <Link href="https://www.twitter.com" target="_blank" className="text-[#A6A6A6] hover:text-black">
                <FaTwitter size={28} />
              </Link>
              <Link href="https://www.facebook.com" target="_blank" className="text-[#A6A6A6] hover:text-black">
                <FaFacebook size={28} />
              </Link>
            </div>
          </div>
        </div>

        <hr className="my-6 border-gray-300" />

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <span className="text-sm text-gray-500 text-center">
            © Shourk 2025. ALL RIGHTS RESERVED •
            <Link href="/userpanel/termsandconditions" className="hover:underline ml-1">
              Policy
            </Link>
            •
            <Link href="/userpanel/termsandconditions" className="hover:underline ml-1">
              Terms
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
