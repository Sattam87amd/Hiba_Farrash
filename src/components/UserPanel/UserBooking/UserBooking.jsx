"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { FaStar } from "react-icons/fa"
import { useRouter } from "next/navigation"
import axios from "axios"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Calendar, Clock, CreditCard, Gift, Info, MessageSquare, Tag, User, Wallet } from "lucide-react"

const UserToExpertBooking = () => {
  const [sessionData, setSessionData] = useState(null)
  const [consultingExpert, setConsultingExpert] = useState(null)
  const [bookingData, setBookingData] = useState({
    firstName: "",
    lastName: "",
    mobileNumber: "",
    email: "",
    note: "",
    // promoCode: "", // Will be replaced by giftCardCodeInput
  })
  const [noteError, setNoteError] = useState("") // Error message for note
  const [noteWordCount, setNoteWordCount] = useState(0) // Word count
  const [token, setToken] = useState(null) // Ensure localStorage access only on client
  const [isSubmitting, setIsSubmitting] = useState(false) // To track if booking is in progress
  const [isFirstSession, setIsFirstSession] = useState(false) // Track if this is the first session
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(true) // Track if we're checking eligibility
  const [walletBalance, setWalletBalance] = useState(0); // Added for wallet balance
  const [isLoadingBalance, setIsLoadingBalance] = useState(true); // Added for loading wallet balance
  const [justPaidViaWallet, setJustPaidViaWallet] = useState(false); // Added state
  
  // Gift Card State
  const [giftCardCodeInput, setGiftCardCodeInput] = useState("");
  const [appliedGiftCard, setAppliedGiftCard] = useState(null); // Stores { code, amount, balance, etc. }
  const [isCheckingGiftCard, setIsCheckingGiftCard] = useState(false);
  const [giftCardDiscount, setGiftCardDiscount] = useState(0);

  const router = useRouter()

  // Wait until component is mounted
  useEffect(() => {
    const expertData = localStorage.getItem("expertData")
    if (expertData) {
      setConsultingExpert(JSON.parse(expertData))
    }

    const storedSessionData = localStorage.getItem("sessionData")
    if (storedSessionData) {
      setSessionData(JSON.parse(storedSessionData))
    }

    const userToken = localStorage.getItem("userToken")
    if (!userToken) {
      router.push("/userlogin")
    }
    setToken(userToken)
  }, [])

  // Fetch wallet balance
  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (!token) {
        setIsLoadingBalance(false);
        return;
      }
      try {
        setIsLoadingBalance(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/userwallet/balance`, // Assuming same endpoint for user
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data.success) {
          setWalletBalance(response.data.data.balance);
        } else {
          toast.error("Failed to fetch wallet balance");
        }
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
        if (error.response?.status === 401) {
          toast.error("Authentication failed. Please log in again.");
        } else {
          // Do not show toast error for general balance fetch failure, can be silent
          // toast.error("Error loading wallet balance");
        }
      } finally {
        setIsLoadingBalance(false);
      }
    };

    fetchWalletBalance();
  }, [token]);

  // Reset justPaidViaWallet when sessionData changes (new booking flow)
  useEffect(() => {
    setJustPaidViaWallet(false);
    // Also reset gift card when session data changes (i.e., user navigates to book a different session)
    setAppliedGiftCard(null);
    setGiftCardDiscount(0);
    setGiftCardCodeInput("");
  }, [sessionData]);

  // Check if this is the user's first session with this expert
  useEffect(() => {
    const checkFirstSessionEligibility = async () => {
      if (!consultingExpert?._id || !token) return

      try {
        setIsCheckingEligibility(true)
        
        // Extract userId from token
        const tokenData = JSON.parse(atob(token.split(".")[1]))
        const userId = tokenData._id

        // Make API call to check if this is the first session between user and expert
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/freesession/check-eligibility/${userId}/${consultingExpert._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // If eligible for free session and expert has enabled it
        if (response.data.eligible && consultingExpert.freeSessionEnabled) {
          setIsFirstSession(true)
        } else {
          setIsFirstSession(false)
        }
      } catch (error) {
        console.error("Error checking free session eligibility:", error)
        setIsFirstSession(false)
      } finally {
        setIsCheckingEligibility(false)
      }
    }

    checkFirstSessionEligibility()
  }, [consultingExpert, token])

  useEffect(() => {
    localStorage.setItem("bookingData", JSON.stringify(bookingData))
  }, [bookingData])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    // Special handling for giftCardCodeInput
    if (name === "giftCardCodeInput") {
      setGiftCardCodeInput(value);
      // If user is typing a new code, and one is already applied, remove the old one.
      // This makes UX simpler than having to click "Remove" first.
      if (appliedGiftCard) {
        setAppliedGiftCard(null);
        setGiftCardDiscount(0);
        // Optionally, show a toast that the previous card was un-applied.
        // toast.info("Previously applied gift card removed as new code is entered.");
      }
    } else {
      setBookingData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }))
    }

    if (name === "note") {
      const wordCount = value.trim().split(/\s+/).filter(Boolean).length
      setNoteWordCount(wordCount)
      setNoteError("") // Clear error when user starts typing
    }
  }

  const handleBookingRequest = async () => {
    if (!sessionData) {
      toast.error("No session data found.")
      return
    }

    if (noteWordCount < 25) {
      setNoteError("Note must contain at least 25 words.")
      toast.error("✍️ Your note must be at least 25 words.")
      return
    }

    // Calculate price based on whether this is a free first session or regular pricing
    const price = isFirstSession ? 0 : (sessionData?.price || 99) // Set to 0 if free first session
    const finalPriceAfterGiftCard = Math.max(0, price - giftCardDiscount);

    const fullBookingData = {
      expertId: consultingExpert?._id,
      areaOfExpertise: sessionData?.areaOfExpertise || "Home",
      slots: sessionData?.slots || [],
      duration: sessionData?.duration || "",
      firstName: bookingData?.firstName,
      lastName: bookingData?.lastName,
      email: bookingData?.email,
      phone: bookingData?.mobileNumber,
      note: bookingData?.note,
      price: finalPriceAfterGiftCard, // Price after potential gift card discount
      originalPrice: price, // Original session price before discount
      isFreeSession: isFirstSession, // Add flag to indicate this is a free session
      paymentMethod: isFirstSession || finalPriceAfterGiftCard === 0 ? 'free' : 'wallet', // or 'gift_card_covered'
      ...(appliedGiftCard && { redemptionCode: appliedGiftCard.code }) // Add redemption code if applied
    }

    if (
      !consultingExpert?._id ||
      !sessionData?.areaOfExpertise ||
      !sessionData.slots ||
      !bookingData.firstName ||
      !bookingData.lastName ||
      !bookingData.email
    ) {
      toast.error("Please fill in all required fields before submitting the booking.")
      return
    }

    // Wallet payment logic (now default for non-free)
    if (!isFirstSession && finalPriceAfterGiftCard > 0) { // Check only if not a free session and there's a cost
      if (walletBalance < finalPriceAfterGiftCard) {
        toast.error(`Insufficient wallet balance. Your balance (SAR ${walletBalance.toFixed(2)}) is less than the session price (SAR ${finalPriceAfterGiftCard.toFixed(2)}). Please top up your wallet.`, {
          position: "bottom-center",
          autoClose: 7000,
        });
        setIsSubmitting(false);
        return;
      }
    }

    try {
      setIsSubmitting(true) // Start processing state
      if (!token) throw new Error("No authentication token found")

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/session/usertoexpertsession`,
        fullBookingData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      // Store the session ID for later reference
      localStorage.setItem("pendingSessionId", response.data.session._id)

      // If it's a free session, or wallet payment successful, or gift card covered full amount
      const successMessage = isFirstSession 
        ? "Free session booked successfully! Redirecting to Video Call..."
        : finalPriceAfterGiftCard === 0 && appliedGiftCard
        ? `Gift card applied! Session booked successfully. Redirecting to Video Call...`
        : `Payment successful! Session booked. Redirecting to Video Call...`;
      
      toast.success(successMessage, {
        position: "bottom-center",
        autoClose: 2000,
      });
      
      // Update local state to reflect wallet deduction (backend already debits automatically)
      setJustPaidViaWallet(true);
      setWalletBalance(prevBalance => prevBalance - finalPriceAfterGiftCard);
      
      setTimeout(() => {
        // Redirect to video call page instead of payment URL
        router.push('/userpanel/videocall');
      }, 2000);
    } catch (error) {
      console.error("Booking error:", error.response?.data || error.message)
      toast.error(`Booking failed: ${error.response?.data?.message || error.message}`)
    } finally {
      setIsSubmitting(false) // Reset the processing state
    }
  }

  // Group time slots by date
  const groupByDate = (slots) => {
    return slots.reduce((grouped, slot) => {
      const date = slot.selectedDate
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(slot)
      return grouped
    }, {})
  }

  const handleTopUpWallet = () => {
    localStorage.setItem('redirectToWallet', 'true');
    router.push('/userpanel/userpanelprofile?section=payment');
  };

  const handleApplyGiftCard = async () => {
    if (!giftCardCodeInput.trim()) {
      toast.error("Please enter a gift card code.");
      return;
    }
    if (!token) {
      toast.error("Authentication token not found. Please log in.");
      return;
    }
    if (!sessionData?.price) {
        toast.error("Session price is not available to apply gift card.");
        return;
    }

    setIsCheckingGiftCard(true);
    try {
      // Use the GET /api/giftcard/check/:redemptionCode endpoint
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/giftcard/check/${giftCardCodeInput.trim()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
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
        
        const currentSessionPrice = isFirstSession ? 0 : (sessionData?.price || 99);
        if (currentSessionPrice === 0 && !isFirstSession) {
             toast.info("Cannot apply gift card to a session that is already free.");
             setIsCheckingGiftCard(false);
             return;
        }
        if (isFirstSession){
            toast.info("This is a free first session. Gift card not applicable.");
            setIsCheckingGiftCard(false);
            return;
        }

        const cardValueForDiscount = card.originalAmount !== undefined ? card.originalAmount : card.amount;
        const discountToApply = Math.min(cardValueForDiscount, currentSessionPrice);
        
        setAppliedGiftCard({ ...card, code: giftCardCodeInput.trim() });
        setGiftCardDiscount(discountToApply);
        setGiftCardCodeInput("");
        toast.success(`Gift card applied! SAR ${discountToApply.toFixed(2)} discount.`);
      } else {
        // Case: API call successful (e.g., 200 OK) but backend says card is invalid/not found/already used.
        const backendMessage = response.data.message;
        if (backendMessage && (backendMessage.toLowerCase().includes("not found") || backendMessage.toLowerCase().includes("already redeemed"))) {
            toast.error("Gift card not found or has already been redeemed.");
        } else if (backendMessage && backendMessage.toLowerCase().includes("redeemed")) { // More specific if backend uses just "redeemed"
            toast.error("This gift card has already been redeemed.");
        } else if (backendMessage) {
            toast.error(backendMessage); // Show specific message from backend if provided
        } else {
            toast.error("Invalid gift card code or it may have been used."); // Generic fallback
        }
        setAppliedGiftCard(null);
        setGiftCardDiscount(0);
      }
    } catch (error) {
      console.error("Error applying gift card:", error.response?.data || error.message);
      // Case: API call itself failed (e.g., 404, 500)
      if (error.response && error.response.status === 404) {
        toast.error("Gift card not found or has already been redeemed.");
      } else if (error.response && error.response.data && error.response.data.message) {
        // If backend provides a message even on error status codes
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
    setGiftCardCodeInput(""); // Clear any typed code as well
    toast.info("Gift card removed.");
  };

  if (!consultingExpert || isCheckingEligibility || isLoadingBalance)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="rounded-full bg-gray-200 h-24 w-24 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    )

  return (
    <div className="w-full max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="flex flex-col lg:flex-row gap-12 items-start">
        {/* Left Section - Expert Profile */}
        <div className="w-full lg:w-2/5 bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-[#F8F7F3] p-6">
            <div className="flex items-center gap-6">
              <div className="relative h-24 w-24 rounded-full overflow-hidden border-4 border-white shadow-md">
                <Image
                  src="/hiba_image.jpg"
                  alt={`${consultingExpert?.firstName} ${consultingExpert?.lastName}`}
                  fill
                  className="object-cover object-top"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {consultingExpert?.firstName} {consultingExpert?.lastName}
                </h1>
                <p className="text-gray-600">{consultingExpert?.areaOfExpertise || "Expert"}</p>
                <div className="flex items-center mt-2 gap-1">
                  {[...Array(5)].map((_, i) => {
                    const rating = consultingExpert.averageRating || 0
                    const isFilled = i < Math.floor(rating)
                    return <FaStar key={i} className={isFilled ? "text-[#FFA629]" : "text-gray-300"} size={16} />
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
                  <span className="text-2xl font-bold text-gray-800">SAR {sessionData?.price}</span>
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
              Object.entries(groupByDate(sessionData?.slots)).map(([date, slots], idx) => (
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
                You can add up to 5 sessions at different time slots. Any 1 time slot might get selected based on expert
                availability.
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
                      value={bookingData.firstName}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-black focus:border-transparent transition"
                      placeholder="John"
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
                      value={bookingData.lastName}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-black focus:border-transparent transition"
                      placeholder="Doe"
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
                    value={bookingData.mobileNumber}
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
                    value={bookingData.email}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black focus:border-transparent transition"
                    placeholder="john.doe@example.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Note to Expert</label>
                  <span className={`text-xs ${noteWordCount < 25 ? "text-red-500" : "text-green-600"}`}>
                    {noteWordCount}/25 words minimum
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute top-3 left-3">
                    <MessageSquare className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    name="note"
                    placeholder="Introduce yourself and describe what you'd like to discuss in the session (minimum 25 words)..."
                    value={bookingData.note}
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
                        name="giftCardCodeInput" // Changed from promoCode
                        value={giftCardCodeInput} // Bind to new state
                        onChange={handleInputChange} // Ensure this handles giftCardCodeInput
                        className="w-full border border-gray-300 rounded-l-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-black focus:border-transparent transition"
                        placeholder="Enter gift or promo code"
                        disabled={isCheckingGiftCard || !!appliedGiftCard} // Disable if checking or already applied
                      />
                    </div>
                    <button 
                      onClick={appliedGiftCard ? handleRemoveGiftCard : handleApplyGiftCard} 
                      disabled={isCheckingGiftCard || (!giftCardCodeInput && !appliedGiftCard)}
                      className={`bg-gray-800 hover:bg-black text-white px-6 py-3 rounded-r-lg font-medium transition-colors ${isCheckingGiftCard ? 'opacity-50' : ''}`}
                    >
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

              {/* Payment Method Selection and Wallet Balance - Only if not a free session */}
              {!isFirstSession && (
                <div className="mb-6 space-y-4">
                  {/* Wallet Balance Display */}
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-blue-600" />
                        <span className="text-blue-800 font-medium">Your Wallet Balance</span>
                      </div>
                      <span className="font-bold text-md">SAR {walletBalance.toFixed(2)}</span>
                    </div>
                    {walletBalance < (sessionData?.price || 0) && !justPaidViaWallet && (
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-red-600 text-sm">Insufficient balance for this session.</p>
                        <button
                          onClick={handleTopUpWallet}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded-lg font-medium transition-colors"
                        >
                          Top Up
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-4">
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Session Fee</span>
                    {isFirstSession ? (
                      <span className="font-medium text-green-600">Free</span>
                    ) : (
                      <span className={`font-medium ${giftCardDiscount > 0 ? 'line-through text-gray-500' : 'text-gray-800'}`}>SAR {sessionData?.price?.toFixed(2)}</span>
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
                  disabled={isSubmitting}
                  className={`w-full bg-black text-white rounded-lg px-8 py-4 text-base font-medium transition-all
                    ${isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:bg-gray-800 hover:shadow-lg"}`}
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
                            {appliedGiftCard && Math.max(0, (sessionData?.price || 0) - giftCardDiscount) === 0
                              ? "Confirm Free (Gift Card)"
                              : `Pay SAR ${Math.max(0, (sessionData?.price || 0) - giftCardDiscount).toFixed(2)} & Book`}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </button>

                <p className="text-xs text-center text-gray-500 mt-4">
                  By clicking "{isFirstSession ? 'Book Free Session' : (appliedGiftCard && Math.max(0, (sessionData?.price || 0) - giftCardDiscount) === 0 ? 'Confirm Free (Gift Card)' : `Pay SAR ${Math.max(0, (sessionData?.price || 0) - giftCardDiscount).toFixed(2)} & Book`)}", you agree to our Terms of Service and Privacy Policy.
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
  )
}

export default UserToExpertBooking