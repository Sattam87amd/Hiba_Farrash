"use client";

import Image from "next/image";
import { IoIosSearch } from "react-icons/io";
import { LuNotepadText } from "react-icons/lu";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Inter } from "next/font/google";
import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Fullscreen, ArrowLeft } from "lucide-react";

import GoogleTranslateButton from "../../GoogleTranslateButton"; // Import the Google Translate component

const interFont = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

function UserLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState(""); // State for email
  const [useEmail, setUseEmail] = useState(true); // Toggle between email and phone login
  const [phoneError, setPhoneError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [formError, setFormError] = useState("");
  const [emailError, setEmailError] = useState(""); // State for email validation
  const [countdown, setCountdown] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Countdown timer effect
  useEffect(() => {
    let interval;
    
    if (isTimerActive && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prevCount => prevCount - 1);
      }, 1000);
    } else if (countdown === 0) {
      setIsTimerActive(false);
    }
    
    return () => clearInterval(interval);
  }, [isTimerActive, countdown]);

  // Add keyboard event listener for Enter key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        const activeElement = document.activeElement;
  
        const isEmailValid = useEmail && email.includes("@");
        const isPhoneValid = !useEmail && phone && isValidPhoneNumber(phone);
  
        // If focused on email or phone input
        if (
          (useEmail && activeElement.type === "email") ||
          (!useEmail && activeElement.tagName === "INPUT") // In react-phone-number-input, the input is just an INPUT tag
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
  }, [useEmail, email, phone, otp, isTimerActive]); // Dependencies ensure the latest state values are used

  // Toggle between phone and email login
  const toggleLoginMethod = () => {
    setUseEmail(!useEmail);
    setPhone("");
    setEmail("");
    setPhoneError("");
    setEmailError("");
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
  
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);

    if (!value || !value.includes("@")) {
      setEmailError("Please enter a valid email.");
    } else {
      setEmailError("");
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
    
    if (useEmail) {
      if (!email || !email.includes("@")) {
        setFormError("Please enter a valid email address.");
        return;
      }
      try {
        await axios.post(`${process.env.NEXT_PUBLIC_PROD_API_URL}/api/userauth/request-otp`, {
          email,
        });
        toast.success("OTP sent to your email!");
        // Start countdown
        setCountdown(15)
        setIsTimerActive(true);
        focusOtpInput(); // Focus on OTP input
      } catch (error) {
        console.log(error);
        if (error.response && error.response.status === 400) {
          toast.error("Email already exists as an Expert. Please try another email.");
        } else {
          toast.error("Failed to send OTP. Please try again.");
        }
      }
    } else {
      if (!phone || !isValidPhoneNumber(phone)) {
        setPhoneError("Please enter a valid phone number.");
        return;
      }
      try {
        await axios.post(`${process.env.NEXT_PUBLIC_PROD_API_URL}/api/userauth/request-otp`, {
          phone,
        });
        toast.success("OTP sent to your phone!");
        // Start countdown
        setCountdown(30);
        setIsTimerActive(true);
        focusOtpInput(); // Focus on OTP input
      } catch (error) {
        console.log(error);
        if (error.response && error.response.status === 400) {
          toast.error("Phone Number already exists as an Expert. Please try another number.");
        } else {
          toast.error("Failed to send OTP. Please try again.");
        }
      }
    }
  };

  const handleSubmit = async () => {
    if (!otp || otp.length !== 4) {
      // toast.error("OTP verification failed.");
      console.error("OTP verification failed.");
      return;
    }

    try {
      const payload = useEmail ? { email, otp } : { phone, otp };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/userauth/verify-otp`,
        payload
      );

      if (response.data.data.isNewUser) {
        const identifier = useEmail
          ? `email=${encodeURIComponent(email)}`
          : `phone=${encodeURIComponent(phone)}`;
        router.push(`/userpanel/register?${identifier}`);
      } else {
        localStorage.setItem("userToken", response.data.data.token);
        router.push("/userpanel/userpanelprofile");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      // toast.error("OTP verification failed.");
      setFormError("OTP verification failed.");
    }
  };

  return (
    <div className={`min-h-screen flex ${interFont.variable}`}>
      <div className="relative hidden md:block">
        <Image
          src="/AwabWomen.png"
          alt="Arab Woman"
          height={0}
          width={800}
          className="object-cover"
        />
      </div>
      <div className="w-full md:w-1/2 bg-white flex flex-col items-center justify-center relative">
        {/* Add GoogleTranslateButton at the top right */}
        <div className="absolute top-4 right-4">
          <GoogleTranslateButton />
        </div>

        <div className="w-full max-w-md p-8 -mt-20 md:-mt-0">

           <button
                      className="absolute top-6 left-6 z-10 p-2 flex items-center text-black transition-colors "
                      onClick={() => router.push("/")}
                    >
                      <ArrowLeft className="w-5 h-5 mr-1" />
                      <span className="text-sm font-medium">Back</span>
                    </button>
          
          <h1 className="text-2xl md:text-[35px] font-bold text-center">
            Create an Account
          </h1>
          <p className="text-center text-[#878787] mt-1 md:mt-2">
            or <span className="text-black font-semibold">Login</span>
          </p>

          <div className="mt-8 space-y-8">
            <div>
              {useEmail ? (
                <>
                  <label className="block text-sm font-medium">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-8 focus:border-black"
                  />
                  {emailError && (
                    <p className="text-red-500 text-xs mt-1">{emailError}</p>
                  )}
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
              className={`w-full py-3 rounded-lg transition mt-8 ${
                (((useEmail && email.includes("@")) ||
                (!useEmail && phone && isValidPhoneNumber(phone))) && !isTimerActive)
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
              {isTimerActive 
                ? `Resend OTP in ${countdown}s` 
                : "Send OTP"}
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
              className={`w-full py-3 rounded-lg transition ${
                ((!useEmail && phone && isValidPhoneNumber(phone)) || 
                (useEmail && email.includes("@"))) && otp.length === 4
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

export default UserLoginPage;