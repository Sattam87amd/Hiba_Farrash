"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaChevronLeft, FaChevronRight, FaSortUp, FaSortDown } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";

const PaymentLogin = () => {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const router = useRouter();

  const fetchPaymentHistory = useCallback(async () => {
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

      if (proceed) {
        console.log("Fetching payment history..."); 
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/wallet/expert-payout-history`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Full API Response for Payments:", JSON.stringify(response.data, null, 2));

        if (response.data && Array.isArray(response.data.payouts)) {
          const formattedPayments = response.data.payouts.map((payout) => ({
            rating: payout.rating || "N/A",
            duration: payout.duration || "N/A",
            fee: `SAR ${payout.sessionFee || 0}`,
            earnings: `SAR ${payout.expertEarnings || 0}`,
            datetime: payout.processedDateTime
                        ? new Date(payout.processedDateTime).toLocaleString()
                        : "N/A",
            status: payout.status?.toUpperCase() || "N/A",
          }));
          console.log("Formatted Payments for UI:", JSON.stringify(formattedPayments, null, 2));
          setPayments(formattedPayments);
          if (formattedPayments.length === 0) { 
              toast.info("No payment history found for you yet.");
          }
        } else {
          setPayments([]);
          toast.info("No payment history found or unexpected data format.");
        }
      }
    } catch (err) {
      console.error("Error fetching payment history:", err);
      setError(err.response?.data?.message || "Failed to fetch payment history.");
      // toast.error(err.response?.data?.message || "Failed to load payment history.");
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setError, setPayments]);

  useEffect(() => {
    fetchPaymentHistory(); // Initial fetch
  }, [fetchPaymentHistory]);

  useEffect(() => {
    const handleFocus = () => {
      console.log("Window gained focus, re-fetching payment history.");
      fetchPaymentHistory();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchPaymentHistory]);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = payments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(payments.length / itemsPerPage);

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 bg-white flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="ml-3 text-gray-600">Loading payments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 bg-white text-center min-h-[300px]">
        <p className="text-red-500 text-lg">Error: {error}</p>
        <p className="text-gray-500 mt-2">Could not load your payment history. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-white">
      {/* Tabs */}
      <div className="flex space-x-4 md:space-x-6 mb-4">
        <button className="px-3 md:px-4 py-2 rounded-lg text-sm md:text-lg bg-black text-white">
          Payments
        </button>
        <button
          onClick={() => router.push("/expertpanel/expertreview")}
          className="px-3 md:px-4 py-2 rounded-lg text-sm md:text-lg bg-gray-200 text-black hover:bg-gray-300 transition"
        >
          Reviews
        </button>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <motion.table
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full border-collapse"
        >
          <thead>
            <tr className="border-b border-gray-300 text-left text-xs md:text-sm">
              {["RATING", "SESSION DURATION", "SESSION FEE", "EXPERT EARNINGS", "DATE AND TIME", "STATUS"].map((heading) => (
                <th key={heading} className="py-2 px-2 md:py-3 md:px-4 font-semibold tracking-wide cursor-pointer hover:text-black whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    {heading}
                    <div className="flex flex-col">
                      <FaSortUp className="text-xs" />
                      <FaSortDown className="text-xs -mt-1" />
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentItems.map((payment, index) => (
              <motion.tr
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="border-b border-gray-200 hover:bg-gray-100 transition"
              >
                <td className="py-2 md:py-3 px-2 md:px-4">{payment.rating}</td>
                <td className="py-2 md:py-3 px-2 md:px-4">{payment.duration}</td>
                <td className="py-2 md:py-3 px-2 md:px-4">{payment.fee}</td>
                <td className="py-2 md:py-3 px-2 md:px-4">{payment.earnings}</td>
                <td className="py-2 md:py-3 px-2 md:px-4">{payment.datetime}</td>
                <td className="py-2 md:py-3 px-2 md:px-4">{payment.status}</td>
              </motion.tr>
            ))}
          </tbody>
        </motion.table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center mt-8 md:mt-20">
        <div className="flex items-center space-x-2">
          <button
            disabled={currentPage === 1}
            onClick={() => paginate(currentPage - 1)}
            className={`p-2 rounded-full border ${
              currentPage === 1 ? "cursor-not-allowed" : "hover:bg-gray-200"
            }`}
          >
            <FaChevronLeft />
          </button>
          {[1, 2, 3].map((num) => (
            <button
              key={num}
              onClick={() => paginate(num)}
              className={`px-3 md:px-4 py-2 rounded-lg ${
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

export default PaymentLogin;
