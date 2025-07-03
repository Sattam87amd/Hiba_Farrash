"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

const UserWalletCallbackPage = () => {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Processing your payment...");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get HyperPay parameters from URL
        const resourcePath = searchParams.get("resourcePath");
        const id = searchParams.get("id") || searchParams.get("checkoutId");
        const resultCode = searchParams.get("resultCode");
        const resultDescription = searchParams.get("resultDescription");
        
        console.log("HyperPay callback parameters:", {
          resourcePath,
          id,
          resultCode,
          resultDescription
        });

        // Handle payment failure immediately
        if (resultCode && !resultCode.startsWith("000.")) {
          console.error("Payment failed with code:", resultCode, resultDescription);
          setStatus("error");
          setMessage(`Payment failed: ${resultDescription || "Unknown error"}`);
          
          setTimeout(() => {
            router.push(`/userpanel/wallet/failed?error=${encodeURIComponent(resultDescription || "Payment failed")}`);
          }, 3000);
          return;
        }

        // Validate we have required parameters
        if (!resourcePath && !id) {
          console.error("Missing HyperPay parameters");
          setStatus("error");
          setMessage("Missing payment information");
          setTimeout(() => router.push("/userpanel/wallet/failed"), 3000);
          return;
        }
        
        // Make API call to backend for verification
        console.log("Calling HyperPay verify API...");
        const params = new URLSearchParams();
        if (resourcePath) params.append("resourcePath", resourcePath);
        if (id) params.append("checkoutId", id);
        
        const backendUrl = `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/userwallet/verify?${params.toString()}`;
        console.log("Backend verification URL:", backendUrl);
        
        const response = await axios.get(backendUrl);
        console.log("Verify API response:", response.data);
        
        // Handle based on response
        if (response.data?.success) {
          console.log("Payment successful!");
          setStatus("success");
          setMessage("Payment successful! Redirecting to wallet...");
          
          setTimeout(() => {
            // Full page reload to update wallet balance
            window.location.href = "https://shourk.com/userpanel/userpanelprofile";
          }, 3000);
        } else {
          console.log("Payment verification failed:", response.data?.message);
          setStatus("error");
          setMessage(response.data?.message || "Payment verification failed");
          
          setTimeout(() => {
            router.push(`/userpanel/wallet/failed?error=${encodeURIComponent(response.data?.message || "Payment verification failed")}`);
          }, 3000);
        }
      } catch (error) {
        console.error("Error during payment verification:", error);
        
        setStatus("error");
        setMessage("Error verifying payment: " + (error.response?.data?.message || error.message || "Unknown error"));
        
        setTimeout(() => {
          router.push(`/userpanel/wallet/failed?error=${encodeURIComponent(error.message || "Payment verification failed")}`);
        }, 3000);
      }
    };

    verifyPayment();
  }, [router, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        {status === "loading" && (
          <>
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Processing Your Payment</h1>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500 mt-4">
              {searchParams.get("resourcePath") && `Resource Path: ${searchParams.get("resourcePath")}`}
              {searchParams.get("id") && `Checkout ID: ${searchParams.get("id")}`}
            </p>
          </>
        )}
        
        {status === "success" && (
          <>
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-green-500"
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
            <p className="text-gray-600">{message}</p>
          </>
        )}
        
        {status === "error" && (
          <>
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-red-500"
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
            <p className="text-gray-600">{message}</p>
            <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => router.push("/userpanel/wallet")}
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default UserWalletCallbackPage;