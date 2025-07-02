"use client";

import React from "react";
import { LuVideo, LuCreditCard, LuDollarSign } from "react-icons/lu";
import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/navigation";

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [expertId, setExpertId] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();

  useEffect(() => {
    const expertToken = localStorage.getItem("expertToken");

    if (expertToken) {
      try {
        const decodedToken = JSON.parse(atob(expertToken.split(".")[1]));
        const expertId = decodedToken._id;
        setExpertId(expertId);
      } catch (error) {
        console.error("Error parsing expertToken:", error);
        setLoading(false);
      }
    } else {
      toast.error("Expert token not found");
      setLoading(false);
    }
  }, []);

  const getPaymentHistory = async () => {
    if (!expertId) return;
    
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/expertauth/getTransactionHistory/${expertId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("expertToken")}`,
          },
        }
      );
      
      const formattedPayments = response.data.data
        .map((item) => ({
          id: item._id,
          shortId: item._id.slice(-6),
          amount: parseFloat(item.amount).toFixed(2),
          date: new Date(item.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }),
          time: new Date(item.createdAt).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          method: item.paymentMethod || 'TAP',
          status: item.status || 'COMPLETED',
          createdAt: new Date(item.createdAt) // Keep original date for sorting
        }))
        .sort((a, b) => b.createdAt - a.createdAt); // Sort newest first
      
      setPayments(formattedPayments);
    } catch (error) {
      console.error("Error fetching payment history:", error);
      // toast.error("Failed to load payment history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (expertId) {
      getPaymentHistory();
    }
  }, [expertId]);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-100 h-16 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="p-6 text-center py-12">
        <LuDollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No payments yet</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="space-y-3">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow"
          >
            {/* Mobile & Desktop - Same Clean Layout */}
            <div className="flex items-center justify-between">
              {/* Left Section */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                  <LuVideo className="w-6 h-6 text-blue-600" />
                </div>
                
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono text-sm text-gray-500">
                      {payment.shortId}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-2xl font-semibold text-gray-900">
                      SAR {payment.amount}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm">Full consultation</p>
                </div>
              </div>

              {/* Right Section */}
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end mb-2">
                  <span className="text-gray-900 font-medium">
                    {payment.date}
                  </span>
                  <span className="text-gray-500 text-sm">
                    {payment.time}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 justify-end">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <LuDollarSign className="w-4 h-4 text-green-600" />
                    <span>{payment.method}</span>
                  </div>
                  
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    payment.status.toLowerCase() === 'completed' || payment.status.toLowerCase() === 'success'
                      ? 'bg-green-100 text-green-700'
                      : payment.status.toLowerCase() === 'pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : payment.status.toLowerCase() === 'failed' || payment.status.toLowerCase() === 'cancelled'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {payment.status.toLowerCase() === 'completed' || payment.status.toLowerCase() === 'success'
                      ? '✓'
                      : payment.status.toLowerCase() === 'pending'
                      ? '⏳'
                      : payment.status.toLowerCase() === 'failed' || payment.status.toLowerCase() === 'cancelled'
                      ? '✗'
                      : '•'
                    } {payment.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Simple Summary */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>{payments.length} transactions</span>
          <span className="font-semibold text-gray-900">
            Total: SAR {payments.reduce((sum, p) => sum + parseFloat(p.amount), 0).toFixed(2)}
          </span>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default PaymentHistory;