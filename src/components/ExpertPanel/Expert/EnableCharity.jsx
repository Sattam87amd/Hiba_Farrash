import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EnableCharity = () => {
  const [charityData, setCharityData] = useState({
    name: "Charity",
    percentage: "0%",
  });

  const [isEnabled, setIsEnabled] = useState(false);
  const [expertId, setExpertId] = useState(null);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [errorSessions, setErrorSessions] = useState("");

  useEffect(() => {
    const expertToken = localStorage.getItem("expertToken");

    if (expertToken) {
      try {
        const decodedToken = JSON.parse(atob(expertToken.split(".")[1]));
        const expertId = decodedToken._id;
        setExpertId(expertId);
        fetchCharitySettings(expertId);
      } catch (error) {
        console.error("Error parsing expertToken:", error);
        toast.error("Invalid expert token. Please login again!");
      }
    } else {
      toast.error("Expert token not found. Please login again!");
    }
  }, []);

  const fetchCharitySettings = async (expertId) => {
    try {
      setLoadingSessions(true);
      const token = localStorage.getItem("expertToken");

      if (!token) {
        setErrorSessions("Token is required");
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
        const { charityEnabled, charityPercentage, charityName } = response.data.data;
        setIsEnabled(charityEnabled);
        setCharityData({
          name: charityName || "Charity",
          percentage: `${charityPercentage}%` || "0%",
        });
        // toast.success("Charity settings loaded!");
      } else {
        setErrorSessions("Failed to fetch charity settings");
        toast.error("Failed to fetch charity settings.");
      }
    } catch (error) {
      console.error("Error fetching charity settings:", error);
      setErrorSessions("Error fetching charity settings");
      toast.error("Error fetching charity settings.");
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleSave = async () => {
    if (!expertId) {
      toast.error("Expert ID not found.");
      return;
    }

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/expertauth/update-charity`,
        {
          charityEnabled: isEnabled,
          charityPercentage: parseInt(charityData.percentage, 10),
          charityName: charityData.name,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('expertToken')}`,
            expertid: expertId,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success("Charity settings updated successfully!");
      } else {
        toast.error("Failed to update charity settings.");
      }
    } catch (error) {
      console.error("Error updating charity settings:", error);
      toast.error("There was an error updating the charity settings.");
    }
  };

  return (
    <div className="bg-white rounded-2xl p-1 space-y-6">
      {/* Toast Container */}
      <ToastContainer
  position="top-right"         // Move it to the right side
  autoClose={3000}              // Auto close in 3 seconds
  hideProgressBar={false}
  newestOnTop={true}
  closeOnClick
  pauseOnHover
  draggable
  theme="light"                 // <-- Light theme gives white background
/>

      {loadingSessions && <div>Loading...</div>}
      {errorSessions && <div className="text-red-600">{errorSessions}</div>}

      {/* Header with Toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg md:text-2xl font-semibold text-black">
          Enable Charity
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

      {/* Charity Form */}
      <div className={`mt-4 ${!isEnabled ? "opacity-50" : ""}`}>
        <div>
          <label className="block text-black text-sm font-semibold mb-3">
            Name of Charity
          </label>
          <input
            type="text"
            value={charityData.name}
            onChange={(e) =>
              setCharityData({ ...charityData, name: e.target.value })
            }
            disabled={!isEnabled}
            className="bg-white border border-gray-300 text-gray-600 text-sm rounded-xl focus:ring-black focus:border-black block w-full p-2.5 py-4"
            placeholder="Charity"
          />
        </div>

        <div>
          <label className="block text-black text-sm font-semibold mb-3">
            What % of proceeds would you like to donate?
          </label>
          <input
            type="text"
            value={charityData.percentage}
            onChange={(e) =>
              setCharityData({ ...charityData, percentage: e.target.value })
            }
            disabled={!isEnabled}
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-black focus:border-black block w-full p-2.5 py-4"
            placeholder="0%"
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-center items-center mt-8 pt-20">
          <button
            onClick={handleSave}
            className={`w-44 text-sm font-semibold py-2.5 rounded-2xl bg-black text-white`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnableCharity;
