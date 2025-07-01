import { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import Box from "@mui/material/Box";
import Rating from "@mui/material/Rating";
import { IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

const Rate = ({ booking, setShowRateComponent, onRatingSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [starSize, setStarSize] = useState(50);
  const [comment, setComment] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const expertTokenValue = localStorage.getItem("expertToken");
    const userTokenValue = localStorage.getItem("userToken");
    const token = userTokenValue || expertTokenValue;

    console.log("Rate.jsx - handleSubmit: Attempting to submit rating.");
    console.log("Rate.jsx - expertToken found in localStorage:", expertTokenValue ? "Yes" : "No", expertTokenValue ? `(value: ${expertTokenValue.substring(0,15)}...)` : "");
    console.log("Rate.jsx - userToken found in localStorage:", userTokenValue ? "Yes" : "No", userTokenValue ? `(value: ${userTokenValue.substring(0,15)}...)` : "");
    console.log("Rate.jsx - Token being used for API call:", token ? "Yes" : "No", token ? `(value: ${token.substring(0,15)}...)` : "");
    console.log("Rate.jsx - Session ID being rated:", booking?._id);

    if (!token) {
      toast.error("Authentication token is required. Please log in.");
      return;
    }

    if (!booking || !booking._id) {
      toast.error("Session information is missing.");
      return;
    }

    if (rating === 0) {
      toast.error("Please select a rating before submitting.");
      return;
    }

    console.log("Submitting Rating for session:", booking._id, "Rating:", rating);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/session/${booking._id}/rating`,
        { rating, comment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(response.data.message || "Rating submitted successfully!");
      setShowRateComponent(false);
      if (onRatingSubmitted) {
        onRatingSubmitted(response.data.sessionData);
      }
    } catch (err) {
      console.error("Error submitting rating:", err);
      if (err.response) {
        toast.error(`Error: ${err.response.data.message || "Failed to submit rating"}`);
        console.log("Error details:", err.response.data);
      } else {
        toast.error(`Error: ${err.message || "An unexpected error occurred."}`);
      }
    }
  };
  

  return (
    <div className="mt-4 p-6 bg-white rounded-lg shadow-lg max-w-xl mx-auto relative">
      <IconButton
        aria-label="close rating modal"
        onClick={() => setShowRateComponent(false)}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>   

      <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">We'd love your feedback!</h3>

      <form onSubmit={handleSubmit}>
        <div className="flex justify-center mb-8">
          <Box sx={{ '& > legend': { mt: 2 } }}>
            <Rating
              name="session-rating"
              value={rating}
              size="large"
              onChange={(event, newValue) => {
                setRating(newValue === null ? 0 : newValue);
              }}
              sx={{
                fontSize: `${starSize}px`,
                '& .MuiRating-iconEmpty .MuiSvgIcon-root': {
                  color: '#e4e5e9',
                },
                '& .MuiRating-iconFilled .MuiSvgIcon-root': {
                  color: '#ffc107',
                },
              }}
            />
          </Box>
        </div>

        <div className="mb-8">
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Share your experience (optional):
          </label>
          <textarea
            id="comment"
            name="comment"
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition"
            placeholder="What did you like or dislike? How was your session overall?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            className="px-8 py-3 bg-black text-white font-semibold rounded-lg shadow-md transition duration-300 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
            disabled={rating === 0}
          >
            Submit Rating
          </button>
        </div>
      </form>
    </div>
  );
};

export default Rate;
