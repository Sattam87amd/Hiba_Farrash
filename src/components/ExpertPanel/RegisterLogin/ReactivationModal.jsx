"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const ReactivationModal = ({ 
  isOpen, 
  onClose, 
  contactInfo, 
  contactType, 
  onReactivate 
}) => {
  const [loading, setLoading] = useState(false);

  // Handler for reactivating the account
  const handleReactivateAccount = async () => {
    setLoading(true);
    
    try {
      const payload = contactType === "email" 
        ? { email: contactInfo } 
        : { phone: contactInfo };
      
      // Call the reactivate endpoint
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/expertauth/reactivate-account`,
        payload
      );
      
      if (response.data.success) {
        toast.success("Your account has been reactivated successfully!");
        // Notify parent component that reactivation was successful
        onReactivate();
      } else {
        toast.error(response.data.message || "Failed to reactivate account");
        onClose();
      }
    } catch (error) {
      console.error("Error reactivating account:", error);
      toast.error(error.response?.data?.message || "Error reactivating account");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 m-4">
        <h3 className="text-xl font-semibold mb-3">Reactivate Your Account?</h3>
        
        <div className="mb-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-amber-800">
            We noticed your account was previously deactivated. Would you like to reactivate it?
          </p>
        </div>
        
        <p className="mb-4 text-gray-600">
          If you proceed with reactivation:
        </p>
        
        <ul className="list-disc pl-5 space-y-1 mb-6 text-gray-700">
          <li>Your account will be immediately reactivated</li>
          <li>You'll have access to all your previous data and settings</li>
          <li>You can continue using our services as before</li>
        </ul>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleReactivateAccount}
            disabled={loading}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            {loading ? "Processing..." : "Reactivate Account"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReactivationModal;