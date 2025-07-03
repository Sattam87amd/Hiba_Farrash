"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaSpinner, FaLightbulb } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const NewTopic = () => {
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
    type: "",
    message: ""
  });

  useEffect(() => {
    const savedData = localStorage.getItem("topicFormData");
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("topicFormData", JSON.stringify(formData));
  }, [formData]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = "Name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/[^0-9]/g, ""))) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    if (!formData.subject) {
      newErrors.subject = "Topic name is required";
    }

    if (!formData.message) {
      newErrors.message = "Topic description is required";
    } else if (formData.message.length < 20) {
      newErrors.message =
        "Please provide more details about your topic (at least 20 characters)";
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_PROD_API_URL}/api/support/topic`, {
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
            "Thank you for your topic suggestion! We'll review it and may contact you for more details."
        });
        toast.success("Topic suggestion submitted successfully!");

        localStorage.removeItem("topicFormData");
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: ""
        });

        setTimeout(() => {
          router.push("/");
        }, 3000);
      } else {
        setSubmitStatus({
          type: "error",
          message: data.message || "Failed to submit topic suggestion. Please try again."
        });
        toast.error(data.message || "Failed to submit topic suggestion. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting topic suggestion:", error);
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
        <div className="bg-black px-6 py-8 text-center">
          <h1 className="text-3xl font-bold text-white">Suggest a Topic</h1>
          <p className="mt-2 text-gray-300">
            Know a topic we should cover? Let us know!
          </p>
        </div>

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
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

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
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

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
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Topic Name <span className="text-red-500">*</span>
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
                placeholder="Enter the topic name"
              />
              {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject}</p>}
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Topic Description <span className="text-red-500">*</span>
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
                placeholder="Describe the topic. Why is this important? Who would benefit?"
              ></textarea>
              {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
            </div>

            <div className="bg-[#EDECE8] p-4 rounded-md">
              <div className="flex items-start">
                <div className="mr-3 mt-1">
                  <FaLightbulb className="text-yellow-500" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-800">
                    Tips for creating a great topic:
                  </h3>
                  <ul className="mt-2 text-sm text-gray-700 list-disc pl-5 space-y-1">
                    <li>Be clear and concise in your title</li>
                    <li>Provide background details in your description</li>
                    <li>Explain why this topic is important</li>
                    <li>Include any relevant context or examples</li>
                  </ul>
                </div>
              </div>
            </div>

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
                  "Submit Topic"
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="text-center text-sm text-gray-600">
            <p>
              Want to suggest a feature instead?{" "}
              <Link href="/forms/feature" className="font-medium text-black hover:underline">
                Suggest a Feature
              </Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewTopic;
