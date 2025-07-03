"use client";

import Image from "next/image";
import { IoIosSearch } from "react-icons/io";
import { LuNotepadText } from "react-icons/lu";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Inter } from "next/font/google";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ArrowLeft } from "lucide-react";

import GoogleTranslateButton from "@/components/GoogleTranslateButton.jsx"; 
import ReactivationModal from "./ReactivationModal"; // Import the Reactivation Modal

const interFont = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [formError, setFormError] = useState("");
  const [useEmail, setUseEmail] = useState(true);
  const [email, setEmail] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [showReactivationModal, setShowReactivationModal] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        const activeElement = document.activeElement;

        const isEmailValid = useEmail && email.includes("@");
        const isPhoneValid = !useEmail && phone && isValidPhoneNumber(phone);

        // If focused on email or phone input
        if (
          (useEmail && activeElement.type === "email") ||
          (!useEmail && activeElement.tagName === "INPUT")
        ) {
          if ((isEmailValid || isPhoneValid) && !isTimerActive) {
            generateOtp();
          }
        }

        // If focused on OTP input
        if (activeElement.placeholder === "Enter OTP") {
          if (otp.length === 4) {
            handleSubmit();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [useEmail, email, phone, otp, isTimerActive]);

  // Countdown timer effect
  useEffect(() => {
    let interval;

    if (isTimerActive && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prevCount) => prevCount - 1);
      }, 1000);
    } else if (countdown === 0) {
      setIsTimerActive(false);
    }

    return () => clearInterval(interval);
  }, [isTimerActive, countdown]);

  // Toggle handler
  const toggleLoginMethod = () => {
    setUseEmail(!useEmail);
    setPhone("");
    setEmail("");
    setPhoneError("");
    setFormError("");
  };

  const handlePhoneChange = (value) => {
    if (!value) {
      setPhone(value);
      setPhoneError("Phone number is required.");
    } else if (!isValidPhoneNumber(value)) {
      setPhone(value);
      setPhoneError("Invalid phone number.");
    } else {
      setPhone(value);
      setPhoneError("");
    }
    setFormError("");
  };

  const otpInputRef = useRef(null);

  const focusOtpInput = () => {
  setTimeout(() => {
    if (otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, 100);
};

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 4) {
      setOtp(value);
      setOtpError("");
    } else {
      setOtpError("OTP cannot be more than 4 digits.");
    }
  };

  const generateOtp = async () => {
    if (isTimerActive) return;

    const contactInfo = useEmail ? email : phone;
    const contactType = useEmail ? "email" : "phone";

    if (useEmail) {
      if (!email || !email.includes("@")) {
        setFormError("Please enter a valid email address.");
        return;
      }
    } else {
      if (!phone || !isValidPhoneNumber(phone)) {
        setPhoneError("Please enter a valid phone number.");
        return;
      }
    }

    try {
      // First check if the account is deactivated
      const checkResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/expertauth/check-account-status`,
        useEmail ? { email } : { phone }
      );

      // If account is deactivated, show reactivation modal
      if (checkResponse.data.status === "Deactivated") {
        setShowReactivationModal(true);
        return;
      }

      // If account is active or doesn't exist, proceed with OTP flow
      await sendOtp();
      focusOtpInput(); // Focus on OTP input
      
    } catch (error) {
      console.log(error);
      
      // If the check endpoint returns 404, it means user doesn't exist or is in normal state
      if (error.response && error.response.status === 404) {
        await sendOtp();
        focusOtpInput(); // Focus on OTP input
      } else {
        toast.error("Error checking account status. Please try again.");
      }
    }
  };


  const sendOtp = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/expertauth/request-otp`,
        useEmail ? { email } : { phone }
      );
      
      toast.success(`OTP sent to your ${useEmail ? "email" : "phone"}!`);
      // Start countdown
      setCountdown(30);
      setIsTimerActive(true);
    } catch (error) {
      console.log(error);

      if (error.response && error.response.status === 400) {
        toast.info(
          `${useEmail ? "Email" : "Phone number"} already exists as an User. Please try another ${useEmail ? "email" : "number"}.`
        );
      } else {
        toast.error("Error sending OTP. Please try again.");
      }
    }
  };

  const handleSubmit = async () => {
    if (!otp || otp.length !== 4) {
      setFormError("Please enter a valid 4-digit OTP.");
      return;
    }

    try {
      const payload = useEmail ? { email, otp } : { phone, otp };
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/expertauth/verify-otp`,
        payload
      );

      if (response.data.data.isNewExpert) {
        const identifier = useEmail
          ? `email=${encodeURIComponent(email)}`
          : `phone=${encodeURIComponent(phone)}`;
        router.push(`/expertpanel/register?${identifier}`);
      } else {
        localStorage.setItem("expertToken", response.data.data.token);

        // Use backend-provided redirect path
        router.push(response.data.data.redirectTo);

        // Show status message if pending
        if (response.data.data.status === "Pending") {
          toast.info(
            "Your account is pending approval. You can explore our website in limited mode."
          );
        }
      }
    } catch (error) {
      console.error("Login error:", error);

      // Simplified error handling
      const errorMessage =
        error.response?.data?.message ||
        "Invalid OTP or login credentials. Please try again.";
      toast.error(errorMessage);
    }
  };

  // Handle successful reactivation
  const handleReactivationSuccess = () => {
    setShowReactivationModal(false);
    // Proceed with OTP flow after successful reactivation
    sendOtp();
  };

  return (
    <div className={`min-h-screen flex ${interFont.variable}`}>
      <div className="hidden md:flex w-1/2 flex-col relative">
        <div className="relative">
          <Image
            src="/AwabWomen.png"
            alt="Arab Woman"
            height={100}
            width={800}
            className="object-cover"
          />
        </div>
      </div>

      <div className="w-full md:w-1/2 bg-white flex flex-col items-center justify-center relative">
        {/* Add GoogleTranslateButton at the top right */}
        <div className="absolute top-4 right-4">
          <GoogleTranslateButton />
        </div>

        <div className="absolute top-6 left-5 md:hidden">
          <Image
            src="/Shourk_mobile_logo.png"
            alt="Mobile Logo"
            width={60}
            height={40}
          />
        </div>

        <div className="w-full max-w-md p-8 -mt-20 md:-mt-0">

          <button
             className="absolute top-6 left-6 z-10 p-2 flex items-center text-black transition-colors "

            onClick={() => router.push("/")}
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            <span className="text-sm font-medium">Back</span>
          </button>

          <h1 className="text-3xl md:text-[40px] font-extrabold text-center">
            Login
          </h1>
          <p className="text-center text-[#878787] mt-1 md:mt-2">
            or <span className="text-black font-semibold">Sign up</span>
          </p>

          <div className="mt-8 space-y-8">
            <div>
              {useEmail ? (
                <>
                  <label className="block text-sm font-medium">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-8 focus:border-black"
                  />
                  <p
                    className="text-sm text-blue-600 mt-2 cursor-pointer underline"
                    onClick={toggleLoginMethod}
                  >
                    Use phone number instead
                  </p>
                </>
              ) : (
                <>
                  <label className="block text-sm font-medium">
                    Phone Number
                  </label>
                  <PhoneInput
                    international
                    defaultCountry="SA"
                    value={phone}
                    onChange={handlePhoneChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-8 focus:border-black pl-4"
                  />
                  {phoneError && (
                    <p className="text-red-500 text-xs mt-1">{phoneError}</p>
                  )}
                  <p
                    className="text-sm text-blue-600 mt-2 cursor-pointer underline"
                    onClick={toggleLoginMethod}
                  >
                    Use email instead
                  </p>
                </>
              )}
            </div>

            {!useEmail && phoneError && (
              <p className="text-red-500 text-xs mt-1">{phoneError}</p>
            )}
            {useEmail && !email.includes("@") && formError && (
              <p className="text-red-500 text-xs mt-1">{formError}</p>
            )}

            <button
              className={`w-full py-3 rounded-lg transition mt-8 ${((useEmail && email.includes("@")) ||
                  (!useEmail && phone && isValidPhoneNumber(phone))) &&
                  !isTimerActive
                  ? "bg-black text-white hover:bg-gray-800"
                  : "bg-gray-400 text-white cursor-not-allowed"
                }`}
              onClick={generateOtp}
              disabled={
                isTimerActive ||
                (useEmail
                  ? !email || !email.includes("@")
                  : !phone || !isValidPhoneNumber(phone))
              }
            >
              {isTimerActive ? `Resend OTP in ${countdown}s` : "Send OTP"}
            </button>

            <div>
              <label className="block text-sm font-medium">OTP</label>
              <input
                ref={otpInputRef}
                type="text"
                value={otp}
                onChange={handleOtpChange}
                placeholder="Enter OTP"
                maxLength={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-8 focus:border-black"
              />
              {otpError && (
                <p className="text-red-500 text-xs mt-1">{otpError}</p>
              )}
            </div>

            {formError && <p className="text-red-500 text-sm">{formError}</p>}

            <button
              className={`w-full py-3 rounded-lg transition ${otp.length === 4
                  ? "bg-black text-white hover:bg-gray-800"
                  : "bg-gray-400 text-white cursor-not-allowed"
                }`}
              onClick={handleSubmit}
              disabled={
                (!useEmail && (!phone || !isValidPhoneNumber(phone))) ||
                (useEmail && !email.includes("@")) ||
                otp.length !== 4
              }
            >
              Proceed
            </button>
            
            {/* Reactivation Modal */}
            <ReactivationModal 
              isOpen={showReactivationModal}
              onClose={() => setShowReactivationModal(false)}
              contactInfo={useEmail ? email : phone}
              contactType={useEmail ? "email" : "phone"}
              onReactivate={handleReactivationSuccess}
            />
            
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;