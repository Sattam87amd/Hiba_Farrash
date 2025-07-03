import React from 'react';

export default function TermsAndConditions() {
  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-100 px-4 pt-8 pb-8">
      <div className="max-w-4xl w-full bg-white shadow-lg rounded-lg p-6 md:p-10 mt-20">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
          Terms and Conditions
        </h1>
        <div className="space-y-8 text-gray-700 text-lg">
          <p>
            Welcome to <strong>Shourk</strong>. By accessing or using our website 
            (<a href="https://amd.code4bharat.com/" className="text-blue-500 hover:underline">
              www.Shourk.com
            </a>), you agree to comply with the following terms and conditions:
          </p>
          <ol className="list-decimal list-inside space-y-4">
            <li>
              <strong>Eligibility:</strong> Users must be at least 18 years old or have explicit parental/guardian
              consent to access and use our services.
            </li>
            <li>
              <strong>Accuracy of Information:</strong> All users are required to provide accurate, complete, and
              up-to-date personal and payment details. Falsified or misleading information may result in account
              suspension.
            </li>
            <li>
              <strong>Intellectual Property:</strong> All content, materials, and courses on our platform are owned
              by <strong>Shourk</strong> and protected by copyright laws. Unauthorized sharing, duplication, 
              or distribution is strictly prohibited and may lead to legal action.
            </li>
            <li>
              <strong>Service Modifications:</strong> <strong>Shourk</strong> reserves the right to modify, suspend, 
              or discontinue any service or course without prior notice.
            </li>
            <li>
              <strong>Limitation of Liability:</strong> We are not responsible for any indirect, incidental, or 
              consequential damages arising from the use of our services. Users agree to use the platform at their own risk.
            </li>
            <li>
              <strong>Dispute Resolution:</strong> Any disputes or claims arising from the use of our services shall 
              be governed by the laws of India and subject to the jurisdiction of Mumbai courts.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
