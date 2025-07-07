"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const WalletSuccessPage = () => {
  const [amount, setAmount] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const amountParam = searchParams.get("amount");
    if (amountParam) {
      setAmount(amountParam);
    }

    const markSessionAsPaidIfNeeded = async () => {
      try {
        const pendingSessionId = localStorage.getItem("pendingSessionId");
        if (!pendingSessionId) {
          console.log("No pending session found, skipping mark-paid step.");
          return;
        }

        const token = localStorage.getItem("userToken");
        if (!token) {
          console.error("No user token found in localStorage.");
          return;
        }

        // Mark session as paid
        await axios.put(
          `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/session/mark-paid/${pendingSessionId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        toast.success("Session marked as paid successfully. Redirecting...");
        console.log(`Session ${pendingSessionId} marked as paid successfully.`);

        // Redirect to videocall after marking session as paid
        setTimeout(() => {
          router.push(`/userpanel/videocall?sessionId=${pendingSessionId}`);
        }, 3000);
      } catch (error) {
        console.error("Error marking session as paid:", error);
        toast.error("Error marking session as paid. Please contact support.");
      }
    };

    markSessionAsPaidIfNeeded();

    // If no session, fallback redirect to wallet page after 5 seconds
    const fallbackRedirectTimer = setTimeout(() => {
      router.push("https://hibafarrash.shourk.com/userpanel/userpanelprofile");
    }, 5000);

    return () => clearTimeout(fallbackRedirectTimer);
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <ToastContainer />
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
          You will be redirected shortly. If you booked a session, you will join your session automatically.
        </div>

        <div className="flex justify-center">
          <Link href="/userpanel/userpanelprofile">
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
