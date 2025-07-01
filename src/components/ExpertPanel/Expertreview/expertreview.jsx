"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";

const ExpertReview = () => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const router = useRouter();

  const fetchExpertReviews = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    let proceed = true; // Flag to control execution flow

    try {
      const token = localStorage.getItem("expertToken");
      if (!token) {
        toast.error("Authentication token not found. Please login.");
        setError("Authentication required.");
        proceed = false;
      }

      let currentExpertId = null;
      if (proceed) {
        try {
          const decodedToken = JSON.parse(atob(token.split('.')[1]));
          currentExpertId = decodedToken._id;
        } catch (e) {
          console.error("Failed to decode token:", e);
          toast.error("Invalid authentication token.");
          setError("Authentication error.");
          proceed = false;
        }
      }

      if (proceed && !currentExpertId) {
        toast.error("Could not retrieve expert ID from token.");
        setError("Authentication error.");
        proceed = false;
      }

      if (proceed) {
        console.log("Fetching expert reviews for ID:", currentExpertId);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/ratings/${currentExpertId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Full API Response for Reviews:", JSON.stringify(response.data, null, 2));

        if (response.data && Array.isArray(response.data.data)) {
          const formattedReviews = response.data.data.map((review) => ({
            id: review._id,
            sessionId: review.sessionId || "N/A",
            user: review.raterName || "N/A",
            reviews: review.rating,
            dateTime: review.dateTime ? new Date(review.dateTime).toLocaleString() : "N/A",
            duration: review.duration || "N/A",
            feedback: review.comment || "No feedback provided.",
          }));
          console.log("Formatted Reviews for UI:", JSON.stringify(formattedReviews, null, 2));
          setReviews(formattedReviews);
          if (formattedReviews.length === 0) {
            toast.info("No reviews found for you yet.");
          }
        } else {
          setReviews([]);
          toast.info("No reviews found or unexpected data format.");
        }
      }
    } catch (err) {
      console.error("Error fetching expert reviews:", err);
      setError(err.response?.data?.message || "Failed to fetch reviews.");
      toast.error(err.response?.data?.message || "Failed to load reviews.");
      setReviews([]);
    } finally {
      setIsLoading(false); 
    }
  }, [setIsLoading, setError, setReviews]); 

  useEffect(() => {
    fetchExpertReviews(); 
  }, [fetchExpertReviews]);

  useEffect(() => {
    const handleFocus = () => {
      console.log("Window gained focus, re-fetching reviews.");
      fetchExpertReviews();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchExpertReviews]); 

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = reviews.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(reviews.length / itemsPerPage);

  if (isLoading) {
    return (
      <div className="p-4 bg-white flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="ml-3 text-gray-600">Loading reviews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-white text-center min-h-[300px]">
        <p className="text-red-500 text-lg">Error: {error}</p>
        <p className="text-gray-500 mt-2">Could not load your reviews at this time. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white">
      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => router.push("/expertpanel/payments")}
          className="px-4 py-2 rounded-lg text-lg bg-gray-200 text-black hover:bg-gray-300 transition"
        >
          Payments
        </button>
        <button className="px-4 py-2 rounded-lg text-lg bg-black text-white">
          Reviews
        </button>
      </div>

      {/* Table for Desktop, Cards for Mobile */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
        {/* Desktop View */}
        <div className="hidden md:block">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-300 text-left text-sm">
                {["SESSION ID", "USER", "REVIEWS", "DATE/TIME", "DURATION", "FEEDBACK"].map((heading) => (
                  <th key={heading} className="py-3 px-4 font-semibold tracking-wide">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentItems.map((review, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="border-b border-gray-200 hover:bg-gray-100 transition"
                >
                  <td className="py-3 px-4">{review.sessionId}</td>
                  <td className="py-3 px-4">{review.user}</td>
                  <td className="py-3 px-4">{review.reviews}</td>
                  <td className="py-3 px-4">{review.dateTime}</td>
                  <td className="py-3 px-4">{review.duration}</td>
                  <td className="py-3 px-4">{review.feedback}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="block md:hidden space-y-4">
          {currentItems.map((review, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="p-4 bg-gray-100 rounded-lg shadow hover:bg-gray-200 transition"
            >
              <p><span className="font-semibold">Session ID:</span> {review.sessionId}</p>
              <p><span className="font-semibold">User:</span> {review.user}</p>
              <p><span className="font-semibold">Reviews:</span> {review.reviews}</p>
              <p><span className="font-semibold">Date/Time:</span> {review.dateTime}</p>
              <p><span className="font-semibold">Duration:</span> {review.duration}</p>
              <p><span className="font-semibold">Feedback:</span> {review.feedback}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Pagination */}
      <div className="flex justify-center items-center mt-6">
        <div className="flex items-center space-x-2">
          <button
            disabled={currentPage === 1}
            onClick={() => paginate(currentPage - 1)}
            className={`p-2 rounded-full border ${currentPage === 1 ? "cursor-not-allowed" : "hover:bg-gray-200"}`}
          >
            <FaChevronLeft />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => paginate(num)}
              className={`px-4 py-2 rounded-lg ${
                currentPage === num ? "bg-red-500 text-white" : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {num}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => paginate(currentPage + 1)}
            className={`p-2 rounded-full border ${ (currentPage === totalPages || totalPages === 0) ? "cursor-not-allowed" : "hover:bg-gray-200"}`}
          >
            <FaChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpertReview;