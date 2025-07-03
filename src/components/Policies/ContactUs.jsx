import React from 'react';

export default function ContactUs() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
      <div className="max-w-3xl w-full bg-white shadow-lg rounded-lg p-6 md:p-10 mt-20">
        <h1 className="text-4xl font-bold text-center mb-6">
          Contact Us
        </h1>
        <div className="space-y-6 text-gray-700 text-lg">
          <p>We're here to assist you! If you have any questions or need support, feel free to reach out through any of the following methods:</p>
          <ul className="list-disc list-inside space-y-4">
            <li>
              <strong>Email:</strong> <a href="mailto:nexcorealliance@gmail.com" className="text-blue-500 hover:underline">
                nexcorealliance@gmail.com
              </a>
            </li>
            <li>
              <strong>Phone:</strong> <a href="tel:+919594430295" className="text-blue-500 hover:underline">
                +91-9594430295
              </a>
            </li>
            <li>
              <strong>Address: </strong><a href='https://www.google.com/maps/place/Code4Bharat/@19.0726494,72.8804081,17z/data=!3m1!4b1!4m6!3m5!1s0x3be7c9598ad468b5:0xa355e25756e9a44f!8m2!3d19.0726494!4d72.8804081!16s%2Fg%2F11vyp7wnp7?entry=ttu&g_ep=EgoyMDI0MTIxMS4wIKXMDSoASAFQAw%3D%3D' className='text-blue-500 hover:underline'>
              Off BKC, Mumbai, India 400070
              </a>
            </li>
            <li>
              <strong>Contact Form:</strong> Use our online&nbsp;
              <a href="/contactus" className="text-blue-500 hover:underline">
                Contact Form
              </a> for prompt assistance.
            </li>
          </ul>
          <p>We value your inquiries and will respond promptly to ensure your needs are addressed effectively.</p>
        </div>
      </div>
    </div>
  );
}