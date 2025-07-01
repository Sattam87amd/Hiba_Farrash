"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const WalletSuccessPage = () => {
  const [amount, setAmount] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get amount from URL query params
    const amountParam = searchParams.get("amount");
    if (amountParam) {
      setAmount(amountParam);
    }

    // Redirect to wallet page after 5 seconds
    const redirectTimer = setTimeout(() => {
      router.push("https://shourk.com/expertpanel/expertpanelprofile");
    }, 5000);

    return () => clearTimeout(redirectTimer);
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
        
        <p className="text-gray-600 mb-6">
          Your wallet has been successfully recharged with{" "}
          <span className="font-semibold">{amount} SAR</span>.
        </p>
        
        <div className="text-sm text-gray-500 mb-6">
          You will be redirected back to your wallet page in a few seconds.
        </div>
        
        <div className="flex justify-center">
          <Link href="/wallet">
            <span className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-md transition-colors">
              Back to Wallet
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WalletSuccessPage;