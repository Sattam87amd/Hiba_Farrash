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
            At <strong>Shourk</strong>, we aim to provide a seamless and user-friendly experience. Please review the following policy regarding cancellations and refunds:
          </p>
          <ol className="list-decimal list-inside space-y-4">
            <li>
              <strong>Cancellation Requests:</strong>
              <p>
                Users are not allowed to cancel a session once it has been booked.
              </p>
            </li>
            <li>
              <strong>Refunds due to Expert Unavailability:</strong>
              <p>
                If the expert is unavailable at the scheduled session time and rejects the session request, you will receive a full refund, which will be credited back to your bank account.
              </p>
            </li>
            <li>
              <strong>Eligibility for Refunds:</strong>
              <p>
                Refunds will only be issued if the session is rejected by the expert. If the session is not rejected, no refund will be processed.
              </p>
            </li>
          </ol>
          <p>
            For assistance or queries, please contact our support team at <a href="url" className='text-blue-300'>Shourk.ksa@gmail.com</a>. We’re here to help.
          </p>
        </div>
      </div>
    </div>
  );
}
