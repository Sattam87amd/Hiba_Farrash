import React from 'react';

export default function RefundPolicy() {
  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-100 px-4 pt-8 pb-8">
      <div className="max-w-4xl w-full bg-white shadow-lg rounded-lg p-6 md:p-10 mt-20">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
          Refund Policy
        </h1>
        <div className="space-y-8 text-gray-700 text-lg">
          <p>
            At <strong>Shourk</strong>, we strive to ensure your satisfaction. However, we understand that circumstances may change, and we are here to assist you with a fair refund process:
          </p>
          <ol className="list-decimal list-inside space-y-4">
            <li>
              <strong>Eligibility for Refunds:</strong>
              <p>Refund requests must be submitted within <strong>7 days</strong> of enrollment.</p>
              <p>Refunds are applicable only if less than <strong>25% of the course content</strong> has been accessed.</p>
            </li>
            <li>
              <strong>Processing Fees:</strong>
              <p>Any applicable processing fees will be deducted from the refund amount.</p>
            </li>
            <li>
              <strong>Refund Timeline:</strong>
              <p>Approved refunds will be processed within <strong>10 business days</strong>.</p>
            </li>
          </ol>
          <p>
            We are committed to providing a seamless refund experience while maintaining fairness for all parties.
          </p>
        </div>
      </div>
    </div>
  );
}
