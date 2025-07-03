"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaSpinner, FaLightbulb } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Feature = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({
    type: "", // "success" or "error"
    message: ""
  });

  // Load saved form data if available
  useEffect(() => {
    const savedData = localStorage.getItem("featureFormData");
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  // Save form data on change
  useEffect(() => {
    localStorage.setItem("featureFormData", JSON.stringify(formData));
  }, [formData]);

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name) {
      newErrors.name = "Name is required";
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    // Phone validation
    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/[^0-9]/g, ""))) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    // Subject validation
    if (!formData.subject) {
      newErrors.subject = "Feature name is required";
    }

    // Message validation
    if (!formData.message) {
      newErrors.message = "Feature description is required";
    } else if (formData.message.length < 20) {
      newErrors.message =
        "Please provide more details about your feature suggestion (at least 20 characters)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: "", message: "" });

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_PROD_API_URL}/api/support/feature`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message:
            "Thank you for your feature suggestion! We'll review it and may contact you for more details."
        });
        toast.success(
          "Feature suggestion submitted successfully!"
        );
        // Clear form and localStorage on successful submission
        localStorage.removeItem("featureFormData");
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: ""
        });
        // Redirect after a delay, if desired
        setTimeout(() => {
          router.push("/");
        }, 3000);
      } else {
        setSubmitStatus({
          type: "error",
          message: data.message || "Failed to submit feature suggestion. Please try again."
        });
        toast.error(data.message || "Failed to submit feature suggestion. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting feature suggestion:", error);
      setSubmitStatus({
        type: "error",
        message: "An unexpected error occurred. Please try again later."
      });
      toast.error("An unexpected error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EDECE8] py-12 px-4 sm:px-6 lg:px-8 my-4">
      <ToastContainer />
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md my-20 overflow-hidden">
        {/* Header Section */}
        <div className="bg-black px-6 py-8 text-center">
          <h1 className="text-3xl font-bold text-white">Suggest a Feature</h1>
          <p className="mt-2 text-gray-300">
            Have an idea that could improve Shourk? We're listening!
          </p>
        </div>

        {/* Form Section */}
        <div className="px-6 py-8">
          {submitStatus.message && (
            <div
              className={`p-4 mb-6 rounded-md ${
                submitStatus.type === "success"
                  ? "bg-green-100 text-green-800 border border-green-400"
                  : "bg-red-100 text-red-800 border border-red-400"
              }`}
            >
              {submitStatus.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-md border ${
                  errors.name ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-black transition duration-150`}
                placeholder="Enter your name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-md border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-black transition duration-150`}
                placeholder="example@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-md border ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-black transition duration-150`}
                placeholder="Enter your phone number"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Feature Name Field */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Feature Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-md border ${
                  errors.subject ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-black transition duration-150`}
                placeholder="Give your feature idea a name"
              />
              {errors.subject && (
                <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
              )}
            </div>

            {/* Feature Description Field */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Feature Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="6"
                className={`w-full px-4 py-3 rounded-md border ${
                  errors.message ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-black transition duration-150`}
                placeholder="Describe your feature idea in detail. How would it work? What problem does it solve? Who would benefit from it?"
              ></textarea>
              {errors.message && (
                <p className="mt-1 text-sm text-red-600">{errors.message}</p>
              )}
            </div>

            {/* Tips Section */}
            <div className="bg-[#EDECE8] p-4 rounded-md">
              <div className="flex items-start">
                <div className="mr-3 mt-1">
                  <FaLightbulb className="text-yellow-500" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-800">
                    Tips for a great feature suggestion:
                  </h3>
                  <ul className="mt-2 text-sm text-gray-700 list-disc pl-5 space-y-1">
                    <li>Be specific about what the feature should do</li>
                    <li>Explain the problem it solves</li>
                    <li>Describe who would benefit from this feature</li>
                    <li>Consider how it would integrate with existing features</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-8 py-3 bg-black text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition duration-150 ${
                  isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <FaSpinner className="animate-spin mr-2" />
                    <span>Submitting...</span>
                  </div>
                ) : (
                  "Submit Feature Idea"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer Section */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="text-center text-sm text-gray-600">
            <p>
              Want to share general feedback instead?{" "}
              <Link href="/forms/feedback" className="font-medium text-black hover:underline">
                Give us feedback
              </Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feature;