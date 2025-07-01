"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaExclamationTriangle, FaCheck, FaTimes } from "react-icons/fa";

const DeactivateAccount = () => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [reason, setReason] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpMethod, setOtpMethod] = useState("email"); // "email" or "phone"
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [expertId, setExpertId] = useState("");

  // Extract expert ID from token on component mount
  useEffect(() => {
    try {
      const token = localStorage.getItem("expertToken");
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload && payload._id) {
          setExpertId(payload._id);
        }
      }
    } catch (error) {
      console.error("Error extracting expert ID:", error);
    }
  }, []);

  // Request OTP
  const handleRequestOtp = async () => {
    // Basic validation
    if (!reason.trim()) {
      toast.error("Please provide a reason for deactivation");
      return;
    }

    if (otpMethod === "email" && !email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    if (otpMethod === "phone" && !phone.trim()) {
      toast.error("Please enter your phone number with country code");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("expertToken");
      if (!token) {
        throw new Error("Not authenticated");
      }

      // Send either email or phone based on selected method
      const requestBody = otpMethod === "email" 
        ? { email } 
        : { phone };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/expertauth/request-otp`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setOtpSent(true);
        toast.success(`OTP sent to your ${otpMethod}`);
      } else {
        toast.error(response.data.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Error requesting OTP:", error);
      toast.error(error.response?.data?.message || "Error requesting OTP");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP and deactivate account
  const handleVerifyOtpAndDeactivate = async () => {
    if (!otp.trim()) {
      toast.error("Please enter the OTP");
      return;
    }

    if (!expertId) {
      // Try to get expertId again if it's not already set
      try {
        const token = localStorage.getItem("expertToken");
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload && payload._id) {
            setExpertId(payload._id);
          } else {
            toast.error("Expert ID not found. Please refresh the page or try logging in again.");
            return;
          }
        } else {
          toast.error("Authentication token not found. Please log in again.");
          return;
        }
      } catch (error) {
        console.error("Error getting expert ID:", error);
        toast.error("Could not retrieve your account information. Please log in again.");
        return;
      }
    }

    setDeactivating(true);

    try {
      const token = localStorage.getItem("expertToken");
      if (!token) {
        throw new Error("Not authenticated");
      }

      // Verify OTP with appropriate contact method
      const verifyBody = {
        otp,
        ...(otpMethod === "email" ? { email } : { phone })
      };

      // First verify OTP
      const verifyResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/expertauth/verify-otp`,
        verifyBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!verifyResponse.data.success) {
        toast.error("Invalid OTP. Please try again.");
        setDeactivating(false);
        return;
      }

      // Then deactivate account with expert ID in URL
      const deactivateResponse = await axios.put(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/expertauth/deactivateExpert/${expertId}`,
        { reason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (deactivateResponse.data.success) {
        toast.success("Your account has been deactivated successfully");
        
        // Clear localStorage and redirect to login after a short delay
        setTimeout(() => {
          localStorage.clear();
          window.location.href = "/expertlogin";
        }, 3000);
      } else {
        toast.error(deactivateResponse.data.message || "Failed to deactivate account");
      }
    } catch (error) {
      console.error("Error deactivating account:", error);
      toast.error(error.response?.data?.message || "Error deactivating account");
    } finally {
      setDeactivating(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 md:p-6">
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Deactivate Account</h2>
        
        <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg mb-6">
          <FaExclamationTriangle className="text-amber-500 mt-1 flex-shrink-0" />
          <div>
            <p className="text-amber-700 font-medium mb-2">Important Information</p>
            <ul className="list-disc pl-5 space-y-2 text-amber-700">
              <li>Your account will be deactivated immediately.</li>
              <li>You can reactivate your account within 1 month by simply logging in again.</li>
              <li>After 1 month, your account may be permanently deleted.</li>
              <li>Any scheduled sessions will be cancelled.</li>
            </ul>
          </div>
        </div>

        <button
          onClick={() => setShowConfirmModal(true)}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-medium transition-colors"
        >
          Deactivate Account
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 m-4">
            <h3 className="text-xl font-semibold mb-4">Confirm Deactivation</h3>
            
            <p className="mb-4 text-gray-600">
              Please tell us why you are deactivating your account.
              This feedback helps us improve our service.
            </p>
            
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a reason for deactivation..."
              className="w-full h-24 border border-gray-300 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            
            <div className="mb-4">
              <p className="font-medium mb-2">Send verification OTP to:</p>
              <div className="flex gap-4">
                <div
                  onClick={() => setOtpMethod("email")}
                  className={`flex-1 border rounded-lg p-3 cursor-pointer transition ${
                    otpMethod === "email" 
                      ? "border-red-500 bg-red-50" 
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>Email</span>
                    {otpMethod === "email" && <FaCheck className="text-red-500" />}
                  </div>
                </div>
                <div
                  onClick={() => setOtpMethod("phone")}
                  className={`flex-1 border rounded-lg p-3 cursor-pointer transition ${
                    otpMethod === "phone" 
                      ? "border-red-500 bg-red-50" 
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>Phone</span>
                    {otpMethod === "phone" && <FaCheck className="text-red-500" />}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Email or Phone input field based on selected method */}
            {otpMethod === "email" ? (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            ) : (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Phone Number (with country code)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91XXXXXXXXXX"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            )}
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleRequestOtp();
                  setShowOtpModal(true);
                  setShowConfirmModal(false);
                }}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Request OTP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 m-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">OTP Verification</h3>
              <button
                onClick={() => setShowOtpModal(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <FaTimes />
              </button>
            </div>
            
            <p className="mb-4 text-gray-600">
              {otpSent 
                ? `We've sent a verification code to your ${otpMethod}.` 
                : `Enter your ${otpMethod === "email" ? "email" : "phone"} to receive a verification code.`}
            </p>
            
            {otpSent && (
              <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">Verification code sent to:</p>
                <p className="font-medium">{otpMethod === "email" ? email : phone}</p>
              </div>
            )}
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter verification code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setOtp(value);
                }}
                placeholder="Enter OTP"
                className="w-full border border-gray-300 rounded-lg p-3 text-center text-lg tracking-widest focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex flex-col space-y-3">
              {!otpSent && (
                <button
                  onClick={handleRequestOtp}
                  disabled={loading}
                  className={`w-full py-3 rounded-lg transition-colors ${
                    loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              )}
              
              <button
                onClick={handleVerifyOtpAndDeactivate}
                disabled={deactivating || !otp}
                className={`w-full py-3 rounded-lg text-white transition-colors ${
                  deactivating || !otp
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {deactivating ? "Processing..." : "Deactivate Account"}
              </button>
              
              {otpSent && (
                <button
                  onClick={handleRequestOtp}
                  disabled={loading}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  {loading ? "Sending..." : "Resend OTP"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeactivateAccount;