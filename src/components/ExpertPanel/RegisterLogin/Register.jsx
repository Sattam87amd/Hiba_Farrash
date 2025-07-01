"use client";

import Image from "next/image";
import { IoIosSearch } from "react-icons/io";
import { LuNotepadText } from "react-icons/lu";
import { Inter } from "next/font/google";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const interFont = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [errors, setErrors] = useState({});

  // ✅ Prefill email from query string or localStorage
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const emailFromQuery = queryParams.get("email");
    const userData = JSON.parse(localStorage.getItem("registerData")) || {};
    setEmail(emailFromQuery || userData.email || "");
  }, []);

  // ✅ Form validation
  const handleValidation = () => {
    let tempErrors = {};

    if (!email) {
      tempErrors.email = "Email address is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = "Invalid email format.";
    }

    if (!firstName) {
      tempErrors.firstName = "First name is required.";
    } else if (!/^[A-Za-z]+$/.test(firstName)) {
      tempErrors.firstName = "First name can only contain letters.";
    }

    if (!lastName) {
      tempErrors.lastName = "Last name is required.";
    } else if (!/^[A-Za-z]+$/.test(lastName)) {
      tempErrors.lastName = "Last name can only contain letters.";
    }

    if (!gender) {
      tempErrors.gender = "Gender is required.";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // ✅ Submit and redirect
  const handleSubmit = (e) => {
    if (e) e.preventDefault(); // Important: prevent page reload on form submit

    if (handleValidation()) {
      localStorage.setItem(
        "registerData",
        JSON.stringify({ firstName, lastName, email, gender })
      );
      router.push("/expertpanel/registerform");
    }
  };

  return (
    <div className={`min-h-screen flex ${interFont.variable}`}>
      {/* Left Image Section */}
      <div className="hidden md:flex w-1/2 flex-col relative">
        <div className="relative hidden md:block">
          <Image
            src="/AwabWomen.png"
            alt="Arab Woman"
            height={0}
            width={800}
            className="object-cover"
          />
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full md:w-1/2 bg-white flex flex-col items-center justify-center relative">
        <div className="w-full max-w-md p-8 -mt-20 md:-mt-0">
          <h1 className="text-[29px] md:text-[35px] font-extrabold text-center">
            Please Enter Your Info
          </h1>

          {/* ✅ Wrap in form */}
          <form className="mt-8 space-y-8" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors({ ...errors, email: "" });
                }}
                placeholder="Enter your email address"
                className="w-full px-4 py-3 border rounded-lg focus:outline-8 focus:border-black"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* First Name */}
            <div>
              <label className="block text-sm font-medium">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^A-Za-z]/g, "");
                  setFirstName(value);
                  setErrors({ ...errors, firstName: "" });
                }}
                placeholder="Enter your first name"
                className="w-full px-4 py-3 border rounded-lg focus:outline-8 focus:border-black"
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^A-Za-z]/g, "");
                  setLastName(value);
                  setErrors({ ...errors, lastName: "" });
                }}
                placeholder="Enter your last name"
                className="w-full px-4 py-3 border rounded-lg focus:outline-8 focus:border-black"
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium">Gender</label>
              <select
                value={gender}
                onChange={(e) => {
                  setGender(e.target.value);
                  setErrors({ ...errors, gender: "" });
                }}
                className="w-full px-4 py-3 border rounded-lg focus:outline-8 focus:border-black"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Prefer not to Say">Prefer not to say</option>
              </select>
              {errors.gender && (
                <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full py-3 rounded-lg transition ${
                email && firstName && lastName && gender
                  ? "bg-black text-white hover:bg-gray-800"
                  : "bg-gray-300 text-gray-600 cursor-not-allowed"
              }`}
              disabled={!email || !firstName || !lastName || !gender}
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
