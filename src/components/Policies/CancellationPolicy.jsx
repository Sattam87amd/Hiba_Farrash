import React from 'react';

export default function CancellationPolicy() {
  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-100 px-4 pt-8 pb-8">
      <div className="max-w-4xl w-full bg-white shadow-lg rounded-lg p-6 md:p-10 mt-20">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
          Cancellation Policy
        </h1>
        <div className="space-y-8 text-gray-700 text-lg">
          <p>
            At <strong>Shourk</strong>, we aim to provide a transparent and user-friendly cancellation process. You may cancel your course enrollment under the following conditions:
          </p>
          <ol className="list-decimal list-inside space-y-4">
            <li>
              <strong>Submission of Cancellation Requests:</strong>
              <p>
                All cancellation requests must be submitted in writing via email to&nbsp;
                <a href="mailto:amd@gmail.com" className="text-blue-500 hover:underline">
                  amd.help@gmail.com
                </a>.
              </p>
            </li>
            <li>
              <strong>Eligibility:</strong>
              <p>
                Cancellations will not be eligible for refunds if more than <strong>25% of the course content</strong> has been accessed.
              </p>
            </li>
            <li>
              <strong>Cancellation Fees:</strong>
              <p>Any applicable cancellation fees will be deducted before processing refunds.</p>
            </li>
          </ol>
          <p>
            For assistance or queries, please contact our support team. We’re here to help.
          </p>
        </div>
      </div>
    </div>
  );
}
