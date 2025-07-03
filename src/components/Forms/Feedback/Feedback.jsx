"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaSpinner } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Feedback = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
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
    const savedData = localStorage.getItem("feedbackFormData");
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  // Save form data on change
  useEffect(() => {
    localStorage.setItem("feedbackFormData", JSON.stringify(formData));
  }, [formData]);

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    // Phone validation
    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/[^0-9]/g, ''))) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }
    
    // Message validation
    if (!formData.message) {
      newErrors.message = "Feedback is required";
    } else if (formData.message.length < 10) {
      newErrors.message = "Please provide more detailed feedback (at least 10 characters)";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_PROD_API_URL}/api/support/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (data.success) {
        setSubmitStatus({
          type: "success",
          message: "Thank you for your feedback!"
        });
        toast.success("Feedback submitted successfully!");
        // Clear form and localStorage on successful submission
        localStorage.removeItem("feedbackFormData");
        setFormData({ email: "", phone: "", message: "" });
        // Redirect after delay, if desired
        setTimeout(() => {
          router.push("/");
        }, 3000);
      } else {
        setSubmitStatus({
          type: "error",
          message: data.message || "Failed to submit feedback. Please try again."
        });
        toast.error(data.message || "Failed to submit feedback. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
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
    <div className="min-h-screen bg-[#EDECE8] py-12 px-4 sm:px-6 lg:px-8 flex justify-center my-4">
      <ToastContainer />
      <div className="w-full max-w-full sm:max-w-3xl bg-white rounded-lg my-20 shadow-md overflow-hidden">
        {/* Header Section */}
        <div className="bg-black px-4 sm:px-6 lg:px-8 py-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Give Us Feedback</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-300">
            We value your opinion! Share your thoughts about Shourk and help us improve.
          </p>
        </div>
        
        {/* Form Section */}
        <div className="px-4 sm:px-6 lg:px-8 py-8">
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
            
            {/* Feedback Message Field */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Your Feedback <span className="text-red-500">*</span>
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
                placeholder="Tell us what you think about our platform, services, or any suggestions you have for improvement..."
              ></textarea>
              {errors.message && (
                <p className="mt-1 text-sm text-red-600">{errors.message}</p>
              )}
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
                  "Submit Feedback"
                )}
              </button>
            </div>
          </form>
        </div>
        
        {/* Footer Section */}
        <div className="px-4 sm:px-6 lg:px-8 py-4 bg-gray-50 border-t border-gray-200">
          <div className="text-center text-sm text-gray-600">
            <p>
              Have a more specific request? <Link href="/contactus" className="font-medium text-black hover:underline">Contact us</Link> directly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;