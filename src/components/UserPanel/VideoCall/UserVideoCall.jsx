"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { CiClock2 } from "react-icons/ci";
import { FaUser, FaUserTie } from "react-icons/fa";
import { MessagesSquare, Video, XCircle } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Rate from "@/components/Rate/Rate.jsx";
import { useRouter } from "next/navigation";

const UserVideoCall = () => {
  const router = useRouter();
  const [sessionId, setSessionId] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [sessionState, setSessionState] = useState({});
  const [activeTab, setActiveTab] = useState("bookings");
  const [myBookings, setMyBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [errorBookings, setErrorBookings] = useState(null);
  const [showRateComponent, setShowRateComponent] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState("");
  
  // New states for cancellation flow
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [cancellationReasons, setCancellationReasons] = useState([
    { id: 1, reason: "Schedule conflict", checked: false },
    { id: 2, reason: "Found alternative solution", checked: false },
    { id: 3, reason: "Expert not suitable for my needs", checked: false },
    { id: 4, reason: "Technical issues", checked: false },
    { id: 5, reason: "Cost concerns", checked: false },
    { id: 6, reason: "Other", checked: false },
  ]);
  const [otherReason, setOtherReason] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [loadingCancel, setLoadingCancel] = useState(false);

 


  useEffect(() => {
    setIsClient(true);
    setSessionId(new URLSearchParams(window.location.search).get('sessionId'));
  }, []);

  // Modified auth useEffect
  useEffect(() => {
    if (!isClient) return;

    const handleMessage = (event) => {
      if (event.origin === "https://www.hibafarrash.shourk.com") {
        if (event.data.type === "TOKEN_SYNC") {
          localStorage.setItem("userToken", event.data.token);
        }
      }
    };

    window.addEventListener("message", handleMessage);

    const prePaymentData = localStorage.getItem("prePaymentAuth");
    if (prePaymentData) {
      const { token, timestamp } = JSON.parse(prePaymentData);
      if (Date.now() - timestamp < 3600000) {
        localStorage.setItem("userToken", token);
        localStorage.removeItem("prePaymentAuth");
      }
    }

    const checkAuth = async () => {
      const token = localStorage.getItem("userToken");
      if (!token) {
        const parentToken = window.parent?.localStorage?.getItem("userToken");
        if (parentToken) {
          localStorage.setItem("userToken", parentToken);
          return;
        }
        router.push("/userpanel/userlogin");
      }
      
      if (sessionId) {
        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/userauth/refresh-token`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          localStorage.setItem("userToken", response.data.newToken);
        } catch (error) {
          console.error("Token refresh failed:", error);
        }
      }
    };

    checkAuth();

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [sessionId, router, isClient]);


  useEffect(() => {
    const fetchBookingsAndSessions = async () => {
      try {
        setLoadingBookings(true);
        const token = localStorage.getItem("userToken");

        if (!token) {
          setErrorBookings("Token is required");
          return;
        }

        const bookingsResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/session/Userbookings`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // Add sessionType property to each booking if it doesn't exist
        const bookingsWithType = (bookingsResponse.data || []).map(booking => ({
          ...booking,
          sessionType: booking.sessionType || "User To Expert" // Default type if not present
        }));
        setMyBookings(bookingsWithType);
      } catch (error) {
        setErrorBookings("No bookings found for this user.");
        console.error("Error fetching data:", error);
      } finally {
        setLoadingBookings(false);
      }
    };

    fetchBookingsAndSessions();
  }, []);

  const groupByDate = (slotsArray) => {
    const slots = Array.isArray(slotsArray) ? slotsArray : [];
    return slots.reduce((acc, slot) => {
      const date = slot.selectedDate;
      if (!date) return acc;
  
      if (!acc[date]) acc[date] = [];
      acc[date].push(slot.selectedTime);
      return acc;
    }, {});
  };

  const handleDateChange = (sessionId, date) => {
    setSessionState(prevState => ({
      ...prevState,
      [sessionId]: {
        ...prevState[sessionId],
        selectedDate: date,
        selectedTime: "",  // Reset the time when the date changes
      }
    }));
  };

  
  const handleTimeChange = (sessionId, time) => {
    setSessionState(prevState => ({
      ...prevState,
      [sessionId]: {
        ...prevState[sessionId],
        selectedTime: time,
      }
    }));
  };

  const handleUserChat = () =>{
    router.push('/userpanel/chat')
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case "confirmed":
        return "text-green-500";
      case "unconfirmed":
        return "text-yellow-500";
      case "rejected":
        return "text-red-500";
      case "completed":
        return "text-green-700";
      case "Rating Submitted":
        return "text-green-700";
      case "cancelled":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };
  
  // Rate component handlers
  const handleRateClick = (booking) => {
    setShowRateComponent(true);
    setSelectedBooking(booking);
  };
  
  const closeModal = () => {
    setShowRateComponent(false);
    setSelectedBooking(null);
  };

  // Cancel session handlers
  const handleCancelClick = (booking) => {
    setBookingToCancel(booking);
    setShowCancelModal(true);
    // Reset states when opening modal
    setCancellationReasons(prevReasons => 
      prevReasons.map(reason => ({ ...reason, checked: false }))
    );
    setOtherReason("");
    setTermsAccepted(false);
  };
  
  const handleReasonChange = (id) => {
    setCancellationReasons(prevReasons =>
      prevReasons.map(reason =>
        reason.id === id
          ? { ...reason, checked: !reason.checked } // Toggle the selected reason
          : { ...reason, checked: false } // Uncheck all other reasons
      )
    );
  };

  const handleNextStep = () => {
    // Check if at least one reason is selected or other reason is provided
    const hasSelectedReason = cancellationReasons.some(reason => reason.checked);
    const isOtherSelected = cancellationReasons.find(r => r.id === 6)?.checked;
    
    if (!hasSelectedReason) {
      toast.error("Please select at least one reason for cancellation");
      return;
    }
    
    if (isOtherSelected && !otherReason.trim()) {
      toast.error("Please provide details for 'Other' reason");
      return;
    }
    
    // If validation passes, proceed to terms screen
    setShowCancelModal(false);
    setShowTermsModal(true);
  };
  
  const handleCancelSession = async () => {
    if (!termsAccepted) {
      toast.error("Please accept the terms and conditions to proceed");
      return;
    }
    
    try {
      setLoadingCancel(true);
      
      // Prepare cancellation data
      const selectedReasons = cancellationReasons
        .filter(reason => reason.checked)
        .map(reason => reason.reason);
      
        const cancellationData = {
          sessionId: bookingToCancel._id, // ✅ match backend
          reasons: selectedReasons,
          otherReason: cancellationReasons.find(r => r.id === 6)?.checked ? otherReason : ""
        };
      
      // TODO: Replace with actual API endpoint when backend is ready
      const token = localStorage.getItem("userToken");
      await axios.post(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/cancelsession/canceluser`,
        cancellationData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state to reflect cancellation
      setMyBookings(prevBookings => 
        prevBookings.map(booking => 
          booking._id === bookingToCancel._id 
            ? { ...booking, status: "cancelled" } 
            : booking
        )
      );
      
      // Close modals and show success
      setShowTermsModal(false);
      setBookingToCancel(null);
      toast.success("Session cancelled successfully");
      
    } catch (error) {
      console.error("Error cancelling session:", error);
      toast.error("Failed to cancel session. Please try again.");
    } finally {
      setLoadingCancel(false);
    }
  };

  const handleRatingSubmitted = (updatedSession) => {
    setMyBookings((prevBookings) =>
      prevBookings.map((booking) =>
        booking._id === updatedSession._id ? { ...booking, ...updatedSession } : booking
      )
    );
    // Optionally, close the modal if not already handled by Rate component
    // setShowRateComponent(false); 
    // setSelectedBooking(null);
  };

  if (!isClient) return null;

  return (
    <div className="w-full mx-auto py-4 px-2 mt-2 md:max-w-6xl md:py-10 md:px-4">
      <ToastContainer />

      {/* Tabs */}
      <div className="flex space-x-2 mb-3 md:mb-6">
        <button
          className={`px-3 py-1 text-xs md:px-4 md:py-2 md:text-sm font-medium rounded ${
            activeTab === "bookings" ? "bg-black text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("bookings")}
        >
          My Bookings
        </button>
      </div>
      
      {/* Content Container */}
      <div className="space-y-4 md:space-y-6 max-h-[calc(100vh-220px)] md:max-h-none overflow-y-auto pb-10">
        {/* My Bookings Tab */}
        {activeTab === "bookings" && (
          <div className="space-y-4 md:space-y-6">
            {loadingBookings ? (
              <div className="text-center p-10 bg-white rounded-lg shadow-md">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your bookings...</p>
              </div>
            ) : errorBookings ? (
              <div className="text-center p-10 bg-white rounded-lg shadow-md">
                <div className="text-red-500 text-lg mb-2"></div>
                <p className="text-red-500">{errorBookings}</p>
              </div>
            ) : myBookings.length === 0 ? (
              <div className="text-center p-10 bg-white rounded-lg shadow-md">
                <div className="text-4xl mb-4">📅</div>
                <p className="text-gray-500 text-lg">No Bookings Yet</p>
                <p className="text-gray-400 mt-2">Your upcoming bookings will appear here</p>
              </div>
            ) : (
              myBookings.map((booking) => (
                <div
                  key={booking._id}
                  className="bg-white p-4 md:p-6 border rounded-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
                >
                {/* Mobile: Enhanced comprehensive layout */}
<div className="md:hidden w-full">
  {/* Header Section */}
  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-t-lg border-b border-gray-100">
    <div className="flex justify-between items-start mb-3">
      <div className="flex-1">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">
          Consultation Session
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-blue-100 px-3 py-1 rounded-full text-blue-700 font-medium">
            {booking.sessionType}
          </span>
          <span
            className={`text-xs font-medium px-3 py-1 rounded-full ${
              booking.status === "confirmed" 
                ? "bg-green-100 text-green-700" 
                : booking.status === "cancelled" 
                ? "bg-red-100 text-red-700"
                : booking.status === "completed"
                ? "bg-green-100 text-green-800"
                : booking.status === "Rating Submitted"
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {booking.status === "confirmed"
              ? "Confirmed"
              : booking.status === "unconfirmed"
              ? "Pending"
              : booking.status === "rejected"
              ? "Rejected"
              : booking.status === "completed"
              ? "Completed"
              : booking.status === "Rating Submitted"
              ? "Rated"
              : booking.status === "cancelled"
              ? "Cancelled"
              : booking.status}
          </span>
        </div>
      </div>
    </div>

    {/* Date and Time Info */}
    <div className="bg-white p-3 rounded-lg shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* <CiClock2 className="text-lg text-blue-500" /> */}
          <div>
            {/* <p className="text-sm font-medium text-gray-800">
              {(() => {
                // Handle the nested slots structure
                if (booking.slots && Array.isArray(booking.slots) && booking.slots.length > 0) {
                  const firstSlotGroup = booking.slots[0];
                  if (Array.isArray(firstSlotGroup) && firstSlotGroup.length > 0) {
                    const firstSlot = firstSlotGroup[0];
                    if (firstSlot.selectedDate) {
                      return new Date(firstSlot.selectedDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      });
                    }
                  }
                }
                return "Date not available";
              })()}
            </p> */}
               <div className="space-y-3">
      {(() => {
        // Handle the nested slots structure properly
        let flattenedSlots = [];
        
        if (booking.slots && Array.isArray(booking.slots)) {
          booking.slots.forEach(slotGroup => {
            if (Array.isArray(slotGroup)) {
              flattenedSlots = [...flattenedSlots, ...slotGroup];
            }
          });
        }
        
        const groupedSlots = groupByDate(flattenedSlots);
        
        return Object.entries(groupedSlots).length > 0 ? 
          Object.entries(groupedSlots).map(([date, times]) => {
            const parsedDate = new Date(date);
            const isValidDate = !isNaN(parsedDate.getTime());
            
            return (
              <div key={date} className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center mb-2">
                  {/* <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                    <span className="text-xs font-bold text-blue-600">
                      {isValidDate ? parsedDate.getDate() : '?'}
                    </span>
                  </div> */}
                  <p className="text-sm font-medium text-gray-800">
                    {isValidDate
                      ? parsedDate.toLocaleDateString("en-US", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        })
                      : date || 'Date not available'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 ml-8">
                  {times.map((time, index) => (
                    <span
                      key={index}
                      className="text-xs bg-white -ml-5 px-3 py-2  rounded-full text-gray-700 font-medium shadow-sm border border-gray-200"
                    >
                      {time || 'Time not set'}
                    </span>
                  ))}
                </div>
              </div>
            );
          }) : (
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-500">No time slots available</p>
            </div>
          );
      })()}
    </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* People Section */}
  <div className="p-4 bg-white border-b border-gray-100">
    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
      Participants
    </h3>
    <div className="space-y-3">
      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
          <FaUser className="text-blue-600 text-sm" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-800">
            {booking?.firstName || "Client"} {booking?.lastName || ""}
          </p>
          <p className="text-xs text-gray-500">Client</p>
        </div>
      </div>
      
      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
          <FaUserTie className="text-green-600 text-sm" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-800">
            {booking.consultingExpertID?.firstName || booking.expertId?.firstName || "Expert"} {booking.consultingExpertID?.lastName || booking.expertId?.lastName || ""}
          </p>
          <p className="text-xs text-gray-500">Expert Consultant</p>
        </div>
      </div>
    </div>
  </div>

  {/* Available Slots Section */}
  {/* <div className="p-4 bg-white border-b border-gray-100">
    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
      {booking.status === "unconfirmed" ? "Requested Time Slots" : "Booked Time Slots"}
    </h3>
    
    <div className="space-y-3">
      {(() => {
        let flattenedSlots = [];
        
        if (booking.slots && Array.isArray(booking.slots)) {
          booking.slots.forEach(slotGroup => {
            if (Array.isArray(slotGroup)) {
              flattenedSlots = [...flattenedSlots, ...slotGroup];
            }
          });
        }
        
        const groupedSlots = groupByDate(flattenedSlots);
        
        return Object.entries(groupedSlots).length > 0 ? 
          Object.entries(groupedSlots).map(([date, times]) => {
            const parsedDate = new Date(date);
            const isValidDate = !isNaN(parsedDate.getTime());
            
            return (
              <div key={date} className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center mb-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                    <span className="text-xs font-bold text-blue-600">
                      {isValidDate ? parsedDate.getDate() : '?'}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-800">
                    {isValidDate
                      ? parsedDate.toLocaleDateString("en-US", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        })
                      : date || 'Date not available'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 ml-8">
                  {times.map((time, index) => (
                    <span
                      key={index}
                      className="text-xs bg-white px-3 py-2 rounded-full text-gray-700 font-medium shadow-sm border border-gray-200"
                    >
                      {time || 'Time not set'}
                    </span>
                  ))}
                </div>
              </div>
            );
          }) : (
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-500">No time slots available</p>
            </div>
          );
      })()}
    </div>
  </div> */}

  {/* Action Buttons Section */}
  <div className="p-4 bg-white">
    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
      <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
      Available Actions
    </h3>
    
    <div className="space-y-3">
      {/* Unconfirmed Status Actions */}
      {booking.status === "unconfirmed" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
              <CiClock2 className="text-yellow-600 text-lg" />
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-800">Awaiting Confirmation</p>
              <p className="text-xs text-yellow-600">Your request is being reviewed by the expert</p>
            </div>
          </div>
        </div>
      )}

      {/* Confirmed Status Actions */}
      {booking.status === "confirmed" && (
        <div className="space-y-3">
          {/* Primary Action - Join Meeting */}
          {booking.userMeetingLink ? (
            <a
              href={booking.userMeetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full"
            >
              <button className="w-full px-4 py-4 text-sm rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-3 font-medium shadow-lg transform hover:scale-105">
                <Video className="w-5 h-5" />
                <span>Join Video Meeting</span>
              </button>
            </a>
          ) : (
            <div className="w-full px-4 py-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg text-sm text-yellow-700 flex items-center justify-center gap-2 font-medium">
              <CiClock2 className="w-4 h-4" />
              <span>Meeting link will be available soon</span>
            </div>
          )}

          {/* Secondary Actions */}
          <div className="grid grid-cols-1 gap-3">
            <button 
              onClick={handleUserChat}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm flex items-center justify-center gap-3 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium"
            >
              <MessagesSquare className="w-4 h-4 text-blue-500" />
              <span className="text-gray-700">Chat with Expert</span>
            </button>
          </div>
        </div>
      )}

      {/* Completed Status Actions */}
      {booking.status === "completed" && !booking.rating && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-green-600 text-lg">✓</span>
            </div>
            <div>
              <p className="text-sm font-medium text-green-800">Session Completed</p>
              <p className="text-xs text-green-600">How was your experience?</p>
            </div>
          </div>
          
          <button
            className="w-full px-4 py-3 text-white bg-gradient-to-r from-green-500 to-green-600 rounded-lg text-sm hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium shadow-lg transform hover:scale-105"
            onClick={() => handleRateClick(booking)}
          >
            ⭐ Rate This Session
          </button>
        </div>
      )}

      {/* Rating Submitted Status */}
      {booking.status === "Rating Submitted" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-blue-600 text-lg">⭐</span>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-blue-800">Thank you for your feedback!</p>
              <p className="text-xs text-blue-600">Your rating has been submitted (Rating: {booking.rating}/5)</p>
            </div>
          </div>
        </div>
      )}

      {/* Cancelled Status */}
      {booking.status === "cancelled" && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
              <XCircle className="text-red-600 w-4 h-4" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-red-800">Session Cancelled</p>
              <p className="text-xs text-red-600">This session has been cancelled</p>
            </div>
          </div>
        </div>
      )}

      {/* Rejected Status */}
      {booking.status === "rejected" && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-red-600 text-lg">✕</span>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-red-800">Request Declined</p>
              <p className="text-xs text-red-600">The expert was unable to accept this booking</p>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
</div>

                  {/* Desktop: Modified layout with status and buttons on right */}
                  <div className="hidden md:block">
                    <div className="border-b pb-4 mb-4">
                      <h2 className="text-xl font-semibold text-gray-800 mb-2">
                        Consultation with {booking?.expertId?.firstName || ""} {booking?.expertId?.lastName || ""}
                      </h2>

                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="flex items-center">
                          <CiClock2 className="mr-1 text-blue-500" />
                          {booking.sessionTime} ({booking.duration})
                        </div>
                        <span className="bg-blue-50 px-3 py-1 rounded-full text-blue-600">
                          {booking.sessionType}
                        </span>
                        <span
                          className={`${getStatusStyle(booking.status)} px-3 py-1 rounded-full ${
                            booking.status === "confirmed" ? "bg-green-50" : 
                            booking.status === "cancelled" ? "bg-red-50" : "bg-gray-100"
                          }`}
                        >
                          {booking.status === "confirmed"
                            ? "Confirmed"
                            : booking.status === "unconfirmed"
                            ? "Unconfirmed"
                            : booking.status === "rejected"
                            ? "Rejected"
                            : booking.status === "completed"
                            ? "Completed"
                            : booking.status === "Rating Submitted"
                            ? "Rating Submitted"
                            : booking.status === "cancelled"
                            ? "Cancelled"
                            : booking.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 gap-6">
                      {/* Left Side - Details & Selected Slot */}
                      <div className="col-span-8">
                        <div className="flex items-start gap-8 mb-6">
                          {/* People Details */}
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">People</h3>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                <FaUser className="mr-2 text-blue-500" />
                                <span className="text-gray-500 w-16">Client:</span>
                                <span>{booking?.firstName || ""} {booking?.lastName || ""}</span>
                              </p>
                              <p className="text-sm font-medium text-gray-700 flex items-center">
                                <FaUserTie className="mr-2 text-blue-500" />
                                <span className="text-gray-500 w-16">Expert:</span>
                                <span>{booking?.expertId?.firstName || ""} {booking?.expertId?.lastName || ""}</span>
                              </p>
                            </div>
                          </div>

                          {/* Available Time Slots */}
                          <div className="flex-1">
                            {booking.status === "unconfirmed" ? (
                              <h3 className="text-sm font-semibold text-gray-700 mb-3">Requested Slots</h3>
                            ) : (
                              <h3 className="text-sm font-semibold text-gray-700 mb-3">Booked Slots</h3>
                            )}
                            <div className="flex flex-wrap gap-3">
                              {Object.entries(groupByDate(booking.slots?.[0] || [])).map(([date, times]) => {
                                const parsedDate = new Date(date);
                                return (
                                  <div
                                    key={date}
                                    className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200"
                                  >
                                    <p className="text-sm font-medium text-gray-700">
                                      {!isNaN(parsedDate)
                                        ? parsedDate.toLocaleDateString("en-US", {
                                            weekday: "short",
                                            day: "numeric",
                                            month: "short",
                                          })
                                        : null}
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                      {times.map((time, index) => (
                                        <span
                                          key={index}
                                          className="text-xs bg-white px-2 py-1 rounded-md text-gray-700"
                                        >
                                          {time}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Side - Actions */}
                      <div className="col-span-4">
                        <div className="bg-gray-50 p-4 rounded-lg flex flex-col gap-3">
                          <h3 className="text-sm font-semibold text-gray-700 mb-2">Actions</h3>
                          {booking.status === "unconfirmed" && (
                            <>
                              <p className="text-gray-400">Waiting for Confirmation</p>
                              {/* Add the cancel button for unconfirmed status */}
                              {/* <button
                                className="w-full px-4 py-2 text-sm rounded-md bg-red-100 text-red-600 hover:bg-red-200 transition-all duration-200 flex items-center justify-center gap-2"
                                onClick={() => handleCancelClick(booking)}
                              >
                                <XCircle className="w-4 h-4" />
                                <span>Cancel Request</span>
                              </button> */}
                            </>
                          )}

                          {booking.status === "confirmed" && (
                            <>
                              <button 
                              onClick={() => {handleUserChat()}}
                              className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-all duration-200">
                                <MessagesSquare className="w-4 h-4 text-blue-500" />
                                <span>Chat with Expert</span>
                              </button>

                              {booking.userMeetingLink ? (
                                <a
                                  href={booking.userMeetingLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full"
                                >
                                  <button className="w-full px-4 py-2 text-sm rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-all duration-200 flex items-center justify-center gap-2 transform hover:scale-105">
                                    <Video className="w-4 h-4" />
                                    <span>Join Zoom Meeting</span>
                                  </button>
                                </a>
                              ) : (
                                <div className="w-full px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-600 flex items-center justify-center gap-2">
                                  <span>Zoom link coming soon</span>
                                </div>
                              )}
                              
                              {/* Cancel Button */}
                              {/* <button
                                className="w-full px-4 py-2 text-sm rounded-md bg-red-100 text-red-600 hover:bg-red-200 transition-all duration-200 flex items-center justify-center gap-2"
                                onClick={() => handleCancelClick(booking)}
                              >
                                <XCircle className="w-4 h-4" />
                                <span>Cancel Session</span>
                              </button> */}
                            </>
                          )}

                          {booking.status === "completed" && !booking.rating && (
                            <button
                              className="w-full px-4 py-2 text-white bg-blue-500 rounded-md text-sm hover:bg-blue-600 transition-all duration-200 transform hover:scale-105"
                              onClick={() => handleRateClick(booking)}
                            >
                              Rate This Session
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        
        {/* Rate Component Modal */}
        {showRateComponent && selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Rate Your Session</h2>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={closeModal}
                >
                  ✕
                </button>
              </div>
              <Rate
                booking={selectedBooking}
                setShowRateComponent={setShowRateComponent}
                onRatingSubmitted={handleRatingSubmitted}
              />
            </div>
          </div>
        )}
        
        {/* Cancellation Reason Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Cancel Session</h2>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setShowCancelModal(false)}
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-600 mb-4">Please select your reason(s) for cancellation:</p>
                
                <div className="space-y-3">
                  {cancellationReasons.map((item) => (
                    <div key={item.id} className="flex items-start">
                      <input
                        id={`reason-${item.id}`}
                        type="checkbox"
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={item.checked}
                        onChange={() => handleReasonChange(item.id)}
                      />
                      <label htmlFor={`reason-${item.id}`} className="ml-2 block text-sm text-gray-700">
                        {item.reason}
                      </label>
                    </div>
                  ))}
                </div>
                
                {/* Other reason text input */}
                {cancellationReasons.find(r => r.id === 6)?.checked && (
                  <div className="mt-4">
                    <label htmlFor="other-reason" className="block text-sm font-medium text-gray-700 mb-1">
                      Please specify your reason:
                    </label>
                    <textarea
                      id="other-reason"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                      placeholder="Please provide details..."
                      value={otherReason}
                      onChange={(e) => setOtherReason(e.target.value)}
                    />
                  </div>
                )}
              </div>
              
              <div className="flex justify-end">
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md mr-3 hover:bg-gray-300 transition-colors duration-200"
                  onClick={() => setShowCancelModal(false)}
                >
                  Back
                </button>
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
                  onClick={handleNextStep}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Terms & Conditions Modal */}
        {showTermsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Cancellation Terms</h2>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setShowTermsModal(false)}
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-6">
                <div className="bg-gray-50 p-4 rounded-md mb-6 max-h-60 overflow-y-auto">
                  <h3 className="font-medium text-gray-800 mb-2">Terms and Conditions for Cancellation</h3>
                  <p className="text-sm text-gray-600 mb-3">Please read the following terms carefully:</p>
                  
                  <ol className="text-sm text-gray-600 list-decimal list-inside space-y-2">
                    <li>Cancellations made within 24 hours of the scheduled session may be subject to a cancellation fee.</li>
                    <li>If you cancel more than 24 hours before your scheduled session, you will receive a full refund.</li>
                    <li>Expert's availability for rescheduling is not guaranteed after cancellation.</li>
                    <li>Multiple cancellations may affect your ability to book future sessions.</li>
                    <li>For emergency cancellations, please contact customer support directly.</li>
                    <li>Refunds will be processed within 5-7 business days to the original payment method.</li>
                    <li>We reserve the right to review each cancellation on a case-by-case basis.</li>
                  </ol>
                </div>
                
                <div className="mt-4">
                  <div className="flex items-start">
                    <input
                      id="accept-terms"
                      type="checkbox"
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={termsAccepted}
                      onChange={() => setTermsAccepted(!termsAccepted)}
                    />
                    <label htmlFor="accept-terms" className="ml-2 block text-sm text-gray-700">
                      I have read and agree to the cancellation terms and conditions
                    </label>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md mr-3 hover:bg-gray-300 transition-colors duration-200"
                    onClick={() => setShowTermsModal(false)}
                  >
                    Back
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
                    onClick={handleCancelSession}
                  >
                    Confirm Cancellation
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserVideoCall;
