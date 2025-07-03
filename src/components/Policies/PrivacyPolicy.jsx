import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-100 px-4 pt-8 pb-8">
      <div className="max-w-4xl w-full bg-white shadow-lg rounded-lg p-6 md:p-10 mt-20">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
          Privacy & Policy
        </h1>
        <div className="space-y-8 text-gray-700 text-lg">
          <p>
            At <strong>Shourk</strong>, we are committed to safeguarding your privacy. This policy explains how we
            collect, use, and protect your personal information to ensure a secure and transparent experience.
          </p>
          <ul className="list-decimal list-inside space-y-4">
            <li>
              <strong>Data Collection:</strong>
              <p>
                We collect only the essential personal data required to provide you with our services, including:
              </p>
              <ul className="list-disc list-inside ml-4">
                <li>Name</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Payment details</li>
              </ul>
              <p>This information helps us process your enrollment and ensure a seamless user experience.</p>
            </li>
            <li>
              <strong>Data Usage:</strong>
              <p>Your personal information is used strictly for:</p>
              <ul className="list-disc list-inside ml-4">
                <li>Processing your course enrollment and payments.</li>
                <li>Sending updates regarding our programs, services, and policies.</li>
                <li>Enhancing and personalizing your experience by improving our offerings.</li>
              </ul>
              <p>We value your trust and ensure your data is used responsibly.</p>
            </li>
            <li>
              <strong>Data Security:</strong>
              <p>
                We take your data security seriously and have implemented the following measures:
              </p>
              <ul className="list-disc list-inside ml-4">
                <li>Industry-standard encryption to protect your sensitive information.</li>
                <li>Secure storage systems to prevent unauthorized access.</li>
              </ul>
              <p>Your privacy is our priority, and we continuously enhance our security protocols.</p>
            </li>
            <li>
              <strong>Third-Party Sharing:</strong>
              <p>
                Your data is never shared with third parties except in the following scenarios:
              </p>
              <ul className="list-disc list-inside ml-4">
                <li>For secure payment processing via trusted payment gateways.</li>
              </ul>
              <p>We ensure that all third-party service providers adhere to strict data protection standards.</p>
            </li>
            <li>
              <strong>Cookies:</strong>
              <p>
                Our website uses cookies to:
              </p>
              <ul className="list-disc list-inside ml-4">
                <li>Enhance your browsing experience.</li>
                <li>Analyze website traffic and improve functionality.</li>
              </ul>
              <p>You can manage your cookie preferences through your browser settings.</p>
            </li>
            <li>
              <strong>Policy Updates:</strong>
              <p>
                <strong>Shourk</strong> reserves the right to update this privacy policy to reflect changes in our
                practices or legal requirements.
              </p>
              <ul className="list-disc list-inside ml-4">
                <li>All updates will be communicated through our website.</li>
                <li>We encourage you to review the policy periodically to stay informed.</li>
              </ul>
            </li>
          </ul>
          <p>
            If you have any questions or concerns about this policy, please feel free to contact us. At{' '}
            <strong>Shourk</strong>, your privacy and trust are of utmost importance to us.
          </p>
        </div>
      </div>
    </div>
  );
}
