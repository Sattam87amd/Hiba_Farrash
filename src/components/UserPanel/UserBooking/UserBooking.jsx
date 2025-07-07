"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { FaStar } from "react-icons/fa"
import { useRouter } from "next/navigation"
import axios from "axios"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Calendar, Clock, CreditCard, Gift, Info, MessageSquare, Tag, User } from "lucide-react"

const UserToExpertBooking = () => {
  const [sessionData, setSessionData] = useState(null)
  const [consultingExpert, setConsultingExpert] = useState(null)
  const [bookingData, setBookingData] = useState({
    firstName: "",
    lastName: "",
    mobileNumber: "",
    email: "",
    note: "",
  })
  const [noteError, setNoteError] = useState("")
  const [noteWordCount, setNoteWordCount] = useState(0)
  const [token, setToken] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFirstSession, setIsFirstSession] = useState(false)
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState("VISA");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  // Gift Card State
  const [giftCardCodeInput, setGiftCardCodeInput] = useState("");
  const [appliedGiftCard, setAppliedGiftCard] = useState(null);
  const [isCheckingGiftCard, setIsCheckingGiftCard] = useState(false);
  const [giftCardDiscount, setGiftCardDiscount] = useState(0);

  const router = useRouter()

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
      router.push("/userpanel/userlogin")
    }
    setToken(userToken)
  }, [])

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

  // Store token before payment to handle redirects
  const storeTokenBeforePayment = () => {
    const userToken = localStorage.getItem("userToken");
    if (userToken) {
      sessionStorage.setItem("tempUserToken", userToken);
      
      const prePaymentAuth = {
        token: userToken,
        timestamp: Date.now()
      };
      localStorage.setItem("prePaymentAuth", JSON.stringify(prePaymentAuth));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    if (name === "giftCardCodeInput") {
      setGiftCardCodeInput(value);
      if (appliedGiftCard) {
        setAppliedGiftCard(null);
        setGiftCardDiscount(0);
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
      setNoteError("")
    }
  }

  // Direct payment function copied from wallet
  const initiateDirectPayment = async (amount) => {
    try {
      if (!amount || Number(amount) < 10) {
        toast.error("Please enter a valid amount (minimum 10 SAR)");
        return;
      }

      if (!paymentMethod) {
        toast.error("Please select a payment method");
        return;
      }

      setIsProcessingPayment(true);
      const token = localStorage.getItem("userToken");
      
      if (!token) {
        setIsProcessingPayment(false);
        return;
      }

      storeTokenBeforePayment();
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/userwallet/topup`,
        { 
          amount: Number(amount),
          paymentMethod: paymentMethod,
          walletType: "TOP-UP"
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data && response.data.data && response.data.data.checkoutId) {
        toast.success("Redirecting to payment page...");
        window.location.href = `https://hibafarrash.shourk.com/userpanel/payment-user?checkoutId=${response.data.data.checkoutId}`;
      } else {
        toast.error("Failed to initiate payment - no checkout ID received");
        setIsProcessingPayment(false);
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error.response?.data?.message || "Payment initiation failed");
      setIsProcessingPayment(false);
    }
  };

const handleBookingRequest = async () => {
  if (!sessionData) {
    toast.error("No session data found.");
    return;
  }

  if (noteWordCount < 25) {
    setNoteError("Note must contain at least 25 words.");
    toast.error("✍️ Your note must be at least 25 words.");
    return;
  }

  const price = isFirstSession ? 0 : (sessionData?.price || 99);
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
    price: finalPriceAfterGiftCard,
    originalPrice: price,
    isFreeSession: isFirstSession,
    paymentMethod: finalPriceAfterGiftCard === 0 ? "free" : "tap",
    ...(appliedGiftCard && { redemptionCode: appliedGiftCard.code }),
  };

  if (
    !consultingExpert?._id ||
    !sessionData?.areaOfExpertise ||
    !sessionData.slots ||
    !bookingData.firstName ||
    !bookingData.lastName ||
    !bookingData.email
  ) {
    toast.error("Please fill in all required fields before submitting the booking.");
    return;
  }

  try {
    setIsSubmitting(true);
    if (!token) throw new Error("No authentication token found");

    // 1️⃣ Create session immediately with paymentStatus: pending
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/session/usertoexpertsession`,
      fullBookingData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const pendingSessionId = response.data.session._id;
    localStorage.setItem("pendingSessionId", pendingSessionId);

    if (finalPriceAfterGiftCard === 0) {
      // Free or gift-card-covered booking: Redirect directly
      toast.success("Session booked successfully! Redirecting to Video Call...", {
        position: "bottom-center",
        autoClose: 2000,
      });
      setTimeout(() => {
        router.push(`/userpanel/videocall?sessionId=${pendingSessionId}`);
      }, 2000);
      return;
    }

    // 2️⃣ If payment needed, initiate HyperPay payment
    storeTokenBeforePayment();

    const paymentRes = await axios.post(
      `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/userwallet/topup`,
      {
        amount: finalPriceAfterGiftCard,
        paymentMethod: paymentMethod || "VISA",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const { checkoutId } = paymentRes.data.data;
    toast.success("Redirecting to payment page...");
    window.location.href = `https://hibafarrash.shourk.com/userpanel/payment-user?checkoutId=${checkoutId}`;
  } catch (error) {
    console.error("Booking error:", error.response?.data || error.message);
    toast.error(`Booking failed: ${error.response?.data?.message || error.message}`);
  } finally {
    setIsSubmitting(false);
  }
};


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

  if (!consultingExpert || isCheckingEligibility)
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

              {/* Payment Method Selection - Only if not a free session */}
              {!isFirstSession && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                  <div className="relative">
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="block w-full rounded-md border-gray-300 py-3 pl-3 pr-10 text-gray-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm appearance-none bg-white"
                      disabled={isSubmitting || isProcessingPayment}
                    >
                      <option value="VISA">Visa / Mastercard</option>
                      <option value="MADA">Mada</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <CreditCard className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {paymentMethod === "VISA" 
                      ? "International cards accepted (Visa, Mastercard)" 
                      : "Local Saudi payment method"}
                  </p>
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
                  disabled={isSubmitting || isProcessingPayment}
                  className={`w-full bg-black text-white rounded-lg px-8 py-4 text-base font-medium transition-all
                    ${isSubmitting || isProcessingPayment ? "opacity-70 cursor-not-allowed" : "hover:bg-gray-800 hover:shadow-lg"}`}
                >
                  {isSubmitting || isProcessingPayment ? (
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
                          <CreditCard className="h-5 w-5" />
                          <span>
                            {appliedGiftCard && Math.max(0, (sessionData?.price || 0) - giftCardDiscount) === 0
                              ? "Confirm Free (Gift Card)"
                              : `Pay SAR ${Math.max(0, (sessionData?.price || 0) - giftCardDiscount).toFixed(2)}`}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </button>

               <p className="text-xs text-center text-gray-500 mt-4">
  By clicking "
  {isFirstSession
    ? 'Book Free Session'
    : (appliedGiftCard && Math.max(0, (sessionData?.price || 0) - giftCardDiscount) === 0
        ? 'Confirm Free (Gift Card)'
        : `Pay SAR ${Math.max(0, (sessionData?.price || 0) - giftCardDiscount).toFixed(2)} & Book`
      )
  }
  ", you agree to our Terms of Service and Privacy Policy.
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