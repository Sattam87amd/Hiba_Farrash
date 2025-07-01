import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EnableFreeSession = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [expertId, setExpertId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const expertToken = localStorage.getItem("expertToken");

    if (expertToken) {
      try {
        const decodedToken = JSON.parse(atob(expertToken.split(".")[1]));
        const expertId = decodedToken._id;
        setExpertId(expertId);
        fetchFreeSessionSettings(expertId);
      } catch (error) {
        console.error("Error parsing expertToken:", error);
        toast.error("Invalid expert token. Please login again!");
      }
    } else {
      toast.error("Expert token not found. Please login again!");
    }
  }, []);

  const fetchFreeSessionSettings = async (expertId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("expertToken");

      if (!token) {
        setError("Token is required");
        toast.error("Token missing. Please login again!");
        return;
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/expertauth/${expertId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const { freeSessionEnabled } = response.data.data;
        setIsEnabled(freeSessionEnabled || false);
      } else {
        setError("Failed to fetch free session settings");
        toast.error("Failed to fetch free session settings.");
      }
    } catch (error) {
      console.error("Error fetching free session settings:", error);
      setError("Error fetching free session settings");
      toast.error("Error fetching free session settings.");
    } finally {
      setLoading(false);
    }
  };

  const checkUserEligibilityForFreeSession = async (userId, expertId) => {
  try {
    const token = localStorage.getItem("userToken"); // or expertToken depending on the context
    
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL || `${process.env.NEXT_PUBLIC_PROD_API_URL}`}/api/expertauth/check-eligibility/${userId}/${expertId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success) {
      return response.data.eligible;
    } else {
      console.error("Failed to check eligibility:", response.data.message);
      return false;
    }
  } catch (error) {
    console.error("Error checking free session eligibility:", error);
    return false;
  }
};

const handleSave = async () => {
  if (!expertId) {
    toast.error("Expert ID not found.");
    return;
  }

  try {
    setLoading(true);
    const response = await axios.put(
      // Remove ${expertId} from URL
      `${process.env.REACT_APP_API_URL || `${process.env.NEXT_PUBLIC_PROD_API_URL}`}/api/expertauth/update-free-session`,
      {
        freeSessionEnabled: isEnabled,
      },
      {
        headers: {
          // Remove expertid header
          Authorization: `Bearer ${localStorage.getItem('expertToken')}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.success) {
      toast.success("Free session settings updated successfully!");
    } else {
      toast.error("Failed to update free session settings.");
    }
  } catch (error) {
    console.error("Error updating free session settings:", error);
    toast.error("There was an error updating the free session settings.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="bg-white rounded-2xl p-6 space-y-6">
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />

      {loading && <div className="text-center py-4">Loading...</div>}
      {error && <div className="text-red-600 text-center py-2">{error}</div>}

      {/* Header with Toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg md:text-2xl font-semibold text-black">
          Enable Free Session for New Users
        </h2>

        {/* Toggle Switch */}
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={isEnabled}
            onChange={() => setIsEnabled(!isEnabled)}
          />
          <div
            className={`relative w-11 h-6 rounded-full transition ${
              isEnabled ? "bg-black" : "bg-gray-300"
            }`}
          >
            <div
              className={`absolute top-[2px] left-[2px] bg-white border-gray-300 border w-5 h-5 rounded-full transition-all ${
                isEnabled ? "translate-x-full border-white" : ""
              }`}
            ></div>
          </div>
        </label>
      </div>

      {/* Description */}
      <div className={!isEnabled ? "opacity-50" : ""}>
        <p className="text-sm text-gray-600 mb-2">
          When enabled, new users who have never booked a session with you will get their first session completely free.
        </p>
        <p className="text-sm text-gray-600">
          The system will automatically check if the user has had any previous sessions with you before applying the free session benefit.
        </p>
      </div>

      {/* Save Button */}
      <div className="flex justify-center items-center mt-8">
        <button
          onClick={handleSave}
          disabled={loading}
          className={`w-44 text-sm font-semibold py-2.5 rounded-2xl bg-black text-white ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

export default EnableFreeSession;