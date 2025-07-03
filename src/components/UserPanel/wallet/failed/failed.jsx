"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const WalletFailedPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to wallet page after 5 seconds
    const redirectTimer = setTimeout(() => {
      router.push("https://shourk.com/userpanel/userpanelprofile");
    }, 5000);

    return () => clearTimeout(redirectTimer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h1>
        
        <p className="text-gray-600 mb-6">
          Your payment could not be processed. Please try again or use a different payment method.
        </p>
        
        <div className="text-sm text-gray-500 mb-6">
          You will be redirected back to your wallet page in a few seconds.
        </div>
        
        <div className="flex justify-center space-x-4">
          <Link href="/wallet">
            <span className="inline-block bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-md transition-colors">
              Back to Wallet
            </span>
          </Link>
          
          <Link href="/wallet/topup">
            <span className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-md transition-colors">
              Try Again
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WalletFailedPage;