"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { FaStar } from "react-icons/fa";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Calendar, Clock, Info, MessageSquare, Tag, User, Wallet, Gift } from "lucide-react";

const ExpertBooking = () => {
  const [consultingExpert, setConsultingExpert] = useState(null);
  const [expertData, setExpertData] = useState({
    firstName: '',
    lastName: '',
    mobileNumber: '',
    email: '',
    note: '',
    bookingType: 'individual',
    inviteFriend: '',
  });

  const [sessionData, setSessionData] = useState(null);
  const [noteError, setNoteError] = useState(""); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [isFirstSession, setIsFirstSession] = useState(false);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(true);
  const [justPaidViaWallet, setJustPaidViaWallet] = useState(false);

  // Gift Card State (mirrors UserBooking.jsx)
  const [giftCardCodeInput, setGiftCardCodeInput] = useState("");
  const [appliedGiftCard, setAppliedGiftCard] = useState(null); 
  const [isCheckingGiftCard, setIsCheckingGiftCard] = useState(false);
  const [giftCardDiscount, setGiftCardDiscount] = useState(0);

  const router = useRouter();

  useEffect(() => {
    const expertData = localStorage.getItem("consultingExpertData");
    if (expertData) {
      setConsultingExpert(JSON.parse(expertData));
    }
  }, []);

  useEffect(() => {
    const savedData = localStorage.getItem("bookingData");
    if (savedData) {
      setExpertData(JSON.parse(savedData));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("bookingData", JSON.stringify(expertData));
  }, [expertData]);

  useEffect(() => {
    const storedSessionData = localStorage.getItem('sessionData');
    if (storedSessionData) {
      setSessionData(JSON.parse(storedSessionData));
    }
  }, []);

  // New effect to fetch wallet balance
    useEffect(() => {
    fetchWalletBalance();
  }, []);

  // Check if this is the expert's first session with this consulting expert
  useEffect(() => {
    const checkFirstSessionEligibility = async () => {
      const expertToken = localStorage.getItem("expertToken");
      if (!consultingExpert?._id || !expertToken) {
        setIsCheckingEligibility(false);
        return;
      }

      try {
        setIsCheckingEligibility(true);
        
        // Extract current expert's ID from token
        const tokenData = JSON.parse(atob(expertToken.split(".")[1]));
        const currentExpertId = tokenData._id;

        // Make API call to check if this is the first session between current expert and consulting expert
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_PROD_API_URL}}/api/freesession/check-eligibility/${currentExpertId}/${consultingExpert._id}`,
          {
            headers: {
              Authorization: `Bearer ${expertToken}`,
            },
          }
        );

        // If eligible for free session and consulting expert has enabled it (assuming consultingExpert has a similar flag)
        // We need to check if consultingExpert has free sessions enabled. For now, let's assume it does or add a check.
        // For this example, let's assume if the API says eligible, it's a free session.
        // You might need to fetch `consultingExpert.freeSessionEnabled` similar to UserBooking.jsx
        if (response.data.eligible) { // Potentially add: && consultingExpert.freeSessionEnabled
          setIsFirstSession(true);
        } else {
          setIsFirstSession(false);
        }
      } catch (error) {
        console.error("Error checking free session eligibility:", error);
        setIsFirstSession(false); // Default to not free if error
      } finally {
        setIsCheckingEligibility(false);
      }
    };

    // Only run if consultingExpert and token are available.
    if (consultingExpert?._id) {
        checkFirstSessionEligibility();
    } else {
        // If consultingExpert is not loaded yet, we are not ready to check.
        // This will be triggered again when consultingExpert is set.
        setIsCheckingEligibility(false); 
    }
  }, [consultingExpert]);

  // Reset justPaidViaWallet when sessionData changes (new booking flow)
  useEffect(() => {
    setJustPaidViaWallet(false);
    // Also reset gift card when session data changes
    setAppliedGiftCard(null);
    setGiftCardDiscount(0);
    setGiftCardCodeInput("");
  }, [sessionData]);

  // Function to fetch wallet balance
  const fetchWalletBalance = async () => {
    try {
      setIsLoadingBalance(true);
      // Get token from localStorage or wherever you store it
      const token = localStorage.getItem("expertToken");
      
      if (!token) {
        console.error("No token found");
        toast.error("Please LOG IN ");
        setIsLoadingBalance(false);
        return;
      }
       console.log("Using token:", token.substring(0, 10) + "...");
      
      const response = await axios.get(`${process.env.NEXT_PUBLIC_PROD_API_URL}/api/expertwallet/balances`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setWalletBalance(response.data.data.spending);
      } else {
        toast.error("Failed to fetch wallet balance");
      }
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
      if (error.response?.status === 401) {
        toast.error(" Please log in again.");
      } else {
        toast.error("Error loading wallet balance");
      }
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Special handling for giftCardCodeInput
    if (name === "giftCardCodeInput") {
      setGiftCardCodeInput(value);
      if (appliedGiftCard) {
        setAppliedGiftCard(null);
        setGiftCardDiscount(0);
        // toast.info("Previously applied gift card removed as new code is entered."); // Optional toast
      }
    } else {
      setExpertData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }

    if (name === "note") {
      setNoteError("");
      setWordCount(value.trim().split(/\s+/).filter(Boolean).length);
    }
  };

  const storeTokenBeforePayment = () => {
    const expertToken = localStorage.getItem("expertToken");
    if (expertToken) {
      // Store in sessionStorage as primary method
      sessionStorage.setItem("tempExpertToken", expertToken);
      
      // Store in localStorage with timestamp as backup
      const prePaymentAuth = {
        token: expertToken,
        timestamp: Date.now()
      };
      localStorage.setItem("prePaymentAuth", JSON.stringify(prePaymentAuth));
      
      console.log("Expert token stored for payment process");
    } else {
      console.error("No expert token found to store before payment");
    }
  };

  const handleApplyGiftCard = async () => {
    if (!giftCardCodeInput.trim()) {
      toast.error("Please enter a gift card code.");
      return;
    }
    const token = localStorage.getItem("expertToken"); // Use expertToken
    if (!token) {
      toast.error("Authentication token not found. Please log in.");
      return;
    }
    if (!sessionData?.price && !isFirstSession) { // Check price only if not a free first session
        toast.error("Session price is not available to apply gift card.");
        return;
    }

    setIsCheckingGiftCard(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/giftcard/check/${giftCardCodeInput.trim()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Use expertToken
          },
        }
      );

      if (response.data.success && response.data.giftCard) {
        const card = response.data.giftCard;
        if ((card.status !== 'active' && card.status !== 'anonymous_active') || card.balance <= 0) {
          toast.error("This gift card is inactive or has no balance.");
          setAppliedGiftCard(null);
          setGiftCardDiscount(0);
          return;
        }
        
        const currentSessionPrice = isFirstSession ? 0 : (sessionData?.price || 0); // Use 0 if sessionData or price is missing for safety
        
        if (isFirstSession){ // This check should come before price check for free session
            toast.info("This is a free first session. Gift card not applicable.");
            setIsCheckingGiftCard(false);
            return;
        }

        if (currentSessionPrice === 0 && !isFirstSession) { // If not first session but price is 0
             toast.info("Cannot apply gift card to a session that is already free (price is SAR 0).");
             setIsCheckingGiftCard(false);
             return;
        }
        
        // For one-time use, discount is based on originalAmount/amount, not balance.
        const cardValueForDiscount = card.originalAmount !== undefined ? card.originalAmount : card.amount;
        const discountToApply = Math.min(cardValueForDiscount, currentSessionPrice);
        
        setAppliedGiftCard({ ...card, code: giftCardCodeInput.trim() });
        setGiftCardDiscount(discountToApply);
        setGiftCardCodeInput(""); // Clear input after successful apply
        toast.success(`Gift card applied! SAR ${discountToApply.toFixed(2)} discount.`);
      } else {
        const backendMessage = response.data.message;
        if (backendMessage && (backendMessage.toLowerCase().includes("not found") || backendMessage.toLowerCase().includes("already redeemed"))) {
            toast.error("Gift card not found or has already been redeemed.");
        } else if (backendMessage && backendMessage.toLowerCase().includes("redeemed")) {
            toast.error("This gift card has already been redeemed.");
        } else if (backendMessage) {
            toast.error(backendMessage);
        } else {
            toast.error("Invalid gift card code or it may have been used.");
        }
        setAppliedGiftCard(null);
        setGiftCardDiscount(0);
      }
    } catch (error) {
      console.error("Error applying gift card:", error.response?.data || error.message);
      if (error.response && error.response.status === 404) {
        toast.error("Gift card not found or has already been redeemed.");
      } else if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to apply gift card. Please check the code and try again.");
      }
      setAppliedGiftCard(null);
      setGiftCardDiscount(0);
    } finally {
      setIsCheckingGiftCard(false);
    }
  };

  const handleRemoveGiftCard = () => {
    setAppliedGiftCard(null);
    setGiftCardDiscount(0);
    setGiftCardCodeInput(""); 
    toast.info("Gift card removed.");
  };

  const handleBookingRequest = async () => {
    if (!sessionData) {
      toast.error("No session data found.");
      return;
    }

    const noteWords = expertData.note.trim().split(/\s+/).filter(Boolean);
    if (noteWords.length < 25) {
      setNoteError("Note must contain at least 25 words.");
      toast.error("✍️ Your note must be at least 25 words.");
      return;
    }

    setNoteError("");

    // Calculate price based on whether this is a free first session or regular pricing
    let price;
    if (isFirstSession) {
      price = 0;
    } else {
      if (sessionData && typeof sessionData.price === 'number' && sessionData.price >= 0) { // Allow 0 price if set, but not negative
        price = sessionData.price;
      } else {
        console.error("Invalid or missing session price for a non-free session. Price was:", sessionData?.price);
        toast.error("Session price information is missing or invalid. Cannot proceed with booking.");
        setIsSubmitting(false); 
        return; 
      }
    }
    const finalPriceAfterGiftCard = Math.max(0, price - giftCardDiscount);

    // Check if wallet balance is sufficient, only if not a free session and there's a cost
    if (!isFirstSession && finalPriceAfterGiftCard > 0 && walletBalance < finalPriceAfterGiftCard) {
      toast.error(`Insufficient wallet balance. Your balance (SAR ${walletBalance.toFixed(2)}) is less than the session price (SAR ${finalPriceAfterGiftCard.toFixed(2)}). Please top up your wallet.`, {
        position: "bottom-center",
        autoClose: 7000,
      });
      return;
    }

    const fullBookingData = {
      ...sessionData, // Spreads slots, duration, areaOfExpertise etc. from sessionData
      consultingExpertId: consultingExpert?._id, // Make sure this is what backend expects for the one being booked
      firstName: expertData.firstName,
      lastName: expertData.lastName,
      mobile: expertData.mobileNumber,
      email: expertData.email,
      note: expertData.note,
      bookingType: expertData.bookingType,
      inviteFriend: expertData.inviteFriend,
      paymentMethod: isFirstSession || finalPriceAfterGiftCard === 0 ? 'free' : 'wallet',
      price: finalPriceAfterGiftCard, 
      originalPrice: price, // Send original price before discount
      isFreeSession: isFirstSession,
      ...(appliedGiftCard && { redemptionCode: appliedGiftCard.code }) // Add redemption code if applied
    };

    storeTokenBeforePayment();
   
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("expertToken");
      if (!token) throw new Error("No authentication token found");

      // First create the session
      const sessionResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/session/experttoexpertsession`,
        fullBookingData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      const sessionId = sessionResponse.data.session._id;
      
      if (!isFirstSession && finalPriceAfterGiftCard > 0) {
        // Then make the payment from wallet only if not a free session and there's a cost
        const paymentResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/expertwallet/spending/pay`,
          {
            sessionId: sessionId,
            amount: finalPriceAfterGiftCard, // Pay the final amount
            payeeExpertId: consultingExpert?._id
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        // Update local wallet balance AFTER confirming payment success
        setJustPaidViaWallet(true);
        setWalletBalance(prevBalance => prevBalance - finalPriceAfterGiftCard);
      }

      localStorage.setItem('pendingSessionId', sessionId);
      localStorage.removeItem('sessionData');
      localStorage.removeItem('consultingExpertData');
      localStorage.removeItem('bookingData');

      const successMessage = isFirstSession
        ? "Free session booked successfully! Redirecting to video call..."
        : finalPriceAfterGiftCard === 0 && appliedGiftCard
        ? "Gift card applied! Session booked successfully. Redirecting to video call..."
        : "Payment successful! Redirecting to video call...";

      toast.success(successMessage, {
        position: "bottom-center",
        autoClose: 2000,
      });

      setTimeout(() => {
        // Redirect to video call page instead of payment URL
        router.push('/expertpanel/videocall');
      }, 2000);

    } catch (error) {
      console.error("Booking error:", error.response?.data || error.message);

      toast.error(`Booking failed: ${error.response?.data?.message || error.message}`, {
        position: "bottom-center",
        autoClose: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const groupByDate = (slots) => {
    return slots.reduce((grouped, slot) => {
      const date = slot.selectedDate;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(slot);
      return grouped;
    }, {});
  };

  const handleTopUpWallet = () => {
  // Store a flag to indicate wallet top-up is needed
  localStorage.setItem('redirectToWallet', 'true');
  
  // Redirect to expert panel profile page with payment section query param
  router.push('/expertpanel/expertpanelprofile?section=payment');
};

  if (!consultingExpert || isLoadingBalance || isCheckingEligibility) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-pulse flex flex-col items-center">
        <div className="rounded-full bg-gray-200 h-24 w-24 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-32"></div>
      </div>
    </div>
  );

  // Calculate price and final price in the component scope for JSX usage
  const price = isFirstSession ? 0 : (sessionData?.price || 0); // Default to 0 if sessionData or price is missing
  const finalPriceAfterGiftCard = Math.max(0, price - giftCardDiscount);

  return (
    <div className="w-full max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="flex flex-col lg:flex-row gap-12 items-start">
        {/* Left Section - Expert Profile */}
        <div className="w-full lg:w-2/5 bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-[#F8F7F3] p-6">
            <div className="flex items-center gap-6">
              <div className="relative h-24 w-24 rounded-full overflow-hidden border-4 border-white shadow-md">
                <Image
                  src={consultingExpert?.photoFile || "/guyhawkins.png"}
                  alt={`${consultingExpert?.firstName} ${consultingExpert?.lastName}`}
                  fill
                  className="object-cover object-top"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {consultingExpert?.firstName} {consultingExpert?.lastName}
                </h1>
                <p className="text-gray-600">{consultingExpert?.designation || "Expert"}</p>
                <div className="flex items-center mt-2 gap-1">
                  {[...Array(5)].map((_, i) => {
                    const rating = consultingExpert.averageRating || 0;
                    const isFilled = i < Math.floor(rating);
                    return <FaStar key={i} className={isFilled ? "text-[#FFA629]" : "text-gray-300"} size={16} />;
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-gray-600" />
                {isFirstSession ? (
                  <span className="text-2xl font-bold text-green-600 flex items-center gap-2">
                    Free <Gift className="h-5 w-5" />
                  </span>
                ) : (
                  <span className="text-2xl font-bold text-gray-800">
                    {sessionData?.price ? `SAR ${sessionData.price}` : "Consultation"}
                  </span>
                )}
              </div>
              <span className="text-gray-600 text-sm bg-white px-3 py-1 rounded-full shadow-sm">Per Session</span>
            </div>

            {/* Free first session badge - only show if it's a free session */}
            {isFirstSession && (
              <div className="mt-4 bg-green-50 p-3 rounded-lg flex items-start gap-2">
                <Gift className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-green-700">
                  You're eligible for a free first session with this expert!
                </p>
              </div>
            )}
          </div>

          <div className="p-6">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-gray-600" />
              <span>Selected Sessions</span>
            </h2>

            {sessionData?.slots &&
              Object.entries(groupByDate(sessionData.slots)).map(([date, slots], idx) => (
                <div key={idx} className="mb-5 border-b border-gray-100 pb-4 last:border-0">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    {new Date(date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {slots.map((slot) => (
                      <div
                        key={slot.selectedTime}
                        className="px-4 py-2 text-sm bg-gray-100 text-gray-800 rounded-lg flex items-center gap-1"
                      >
                        <Clock className="h-3 w-3" />
                        {slot.selectedTime}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

            <div className="mt-4 flex items-start gap-2 bg-amber-50 p-3 rounded-lg">
              <Info className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-700">
                You can add up to 5 sessions at different time slots. Any 1 time slot might get selected based on availability.
              </p>
            </div>
          </div>
        </div>

        {/* Right Section - Booking Form */}
        <div className="w-full lg:w-3/5">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Complete Your Booking</h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="firstName"
                      value={expertData.firstName}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-black focus:border-transparent transition"
                      placeholder="Enter your first name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="lastName"
                      value={expertData.lastName}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-black focus:border-transparent transition"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={expertData.mobileNumber}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black focus:border-transparent transition"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={expertData.email}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black focus:border-transparent transition"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Note to Expert</label>
                  <span className={`text-xs ${wordCount < 25 ? "text-red-500" : "text-green-600"}`}>
                    {wordCount}/25 words minimum
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute top-3 left-3">
                    <MessageSquare className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    name="note"
                    placeholder="Introduce yourself and describe what you'd like to discuss in the session (minimum 25 words)..."
                    value={expertData.note}
                    onChange={handleInputChange}
                    className={`w-full h-32 border ${noteError ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-black"} rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:border-transparent transition resize-none`}
                  />
                </div>
                {noteError && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    {noteError}
                  </p>
                )}
              </div>

              {/* Hide promo code section if it's a free session */}
              {!isFirstSession && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gift Card / Promo Code</label>
                  <div className="flex">
                    <div className="relative flex-grow">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Tag className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="giftCardCodeInput"
                        value={giftCardCodeInput}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-l-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-black focus:border-transparent transition"
                        placeholder="Enter gift or promo code"
                        disabled={isCheckingGiftCard || !!appliedGiftCard}
                      />
                    </div>
                    <button 
                      onClick={appliedGiftCard ? handleRemoveGiftCard : handleApplyGiftCard} 
                      disabled={isCheckingGiftCard || (!giftCardCodeInput && !appliedGiftCard)}
                      className={`bg-gray-800 hover:bg-black text-white px-6 py-3 rounded-r-lg font-medium transition-colors ${isCheckingGiftCard ? 'opacity-50' : ''}`}>
                      {isCheckingGiftCard ? (
                        <div className="flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      ) : appliedGiftCard ? "Remove" : "Apply"}
                    </button>
                  </div>
                  {appliedGiftCard && (
                    <p className="text-sm text-green-600 mt-2">
                      Gift Card ({appliedGiftCard.code}) applied: -SAR {giftCardDiscount.toFixed(2)}
                    </p>
                  )}
                </div>
              )}

              <div className="pt-4">
                {/* Wallet Balance Card - only show if not a free session */}
                {!isFirstSession && (
                  <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-100">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-blue-600" />
                        <span className="text-blue-800 font-medium">Your Wallet Balance</span>
                      </div>
                      <span className="font-bold text-lg">SAR {walletBalance}</span>
                    </div>
                    
                    {walletBalance < (sessionData?.price || 0) && !justPaidViaWallet && (
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-red-600 text-sm">Insufficient balance for this booking</p>
                        <button 
                          onClick={handleTopUpWallet}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded-lg font-medium transition-colors"
                        >
                          Top Up
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Session Fee</span>
                    {isFirstSession ? (
                      <span className="font-medium text-green-600">Free</span>
                    ) : (
                      <span className={`font-medium ${giftCardDiscount > 0 ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                        {sessionData?.price ? `SAR ${sessionData.price.toFixed(2)}` : "Consultation"}
                      </span>
                    )}
                  </div>
                  {giftCardDiscount > 0 && !isFirstSession && (
                     <div className="flex justify-between items-center mb-2">
                       <span className="text-gray-600">Gift Card Discount</span>
                       <span className="font-medium text-green-600">- SAR {giftCardDiscount.toFixed(2)}</span>
                     </div>
                  )}
                  <div className="border-t border-gray-200 my-2 pt-2">
                    <div className="flex justify-between items-center font-bold">
                      <span>Total</span>
                      {isFirstSession ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        <span>SAR {Math.max(0, (sessionData?.price || 0) - giftCardDiscount).toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleBookingRequest}
                  disabled={isSubmitting || (!isFirstSession && finalPriceAfterGiftCard > 0 && walletBalance < finalPriceAfterGiftCard) || (!isFirstSession && finalPriceAfterGiftCard <0) }
                  className={`w-full bg-black text-white rounded-lg px-8 py-4 text-base font-medium transition-all
                    ${(isSubmitting || (!isFirstSession && finalPriceAfterGiftCard > 0 && walletBalance < finalPriceAfterGiftCard) || (!isFirstSession && finalPriceAfterGiftCard < 0) ) ? "opacity-70 cursor-not-allowed" : "hover:bg-gray-800 hover:shadow-lg"}`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      {isFirstSession ? (
                        <>
                          <Gift className="h-5 w-5" />
                          <span>Book Free Session</span>
                        </>
                      ) : (
                        <>
                          <Wallet className="h-5 w-5" />
                           <span>
                            {appliedGiftCard && finalPriceAfterGiftCard === 0
                              ? "Confirm Free (Gift Card)"
                              : `Pay SAR ${finalPriceAfterGiftCard.toFixed(2)} & Book`}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </button>

                <p className="text-xs text-center text-gray-500 mt-4">
                  By clicking "{isFirstSession ? 'Book Free Session' : (appliedGiftCard && finalPriceAfterGiftCard === 0 ? 'Confirm Free (Gift Card)' : `Pay SAR ${finalPriceAfterGiftCard.toFixed(2)} & Book`)}", you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toastify container */}
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default ExpertBooking;