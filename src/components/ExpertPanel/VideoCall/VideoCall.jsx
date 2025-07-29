"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { CiClock2 } from "react-icons/ci";
import {
  MessagesSquare,
  Video,
  ChevronDown,
  ChevronUp,
  XCircle,
  Filter,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react";
import { FaBook, FaMobile, FaUser, FaUserTie } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import Rate from "@/components/Rate/Rate.jsx";

const VideoCall = () => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [activeTab, setActiveTab] = useState("bookings");
  const [mySessions, setMySessions] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [errorBookings, setErrorBookings] = useState(null);
  const [errorSessions, setErrorSessions] = useState(null);
  const [showRateComponent, setShowRateComponent] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [expandedNotes, setExpandedNotes] = useState({});
  const [sessionState, setSessionState] = useState({});
  const [refreshReviews, setRefreshReviews] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [sessionFilter, setSessionFilter] = useState("all");
  
  // NEW: Status filter state
  const [statusFilter, setStatusFilter] = useState("all");
  const [showOlderSessions, setShowOlderSessions] = useState(false);
  const [autoRejectedSessions, setAutoRejectedSessions] = useState(new Set());
  
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
  const [sessionToCancel, setSessionToCancel] = useState(null);
  const [loadingCancel, setLoadingCancel] = useState(false);

  // Initialize client-side variables
  useEffect(() => {
    setIsClient(true);
    setSessionId(new URLSearchParams(window.location.search).get("sessionId"));
  }, []);

  // Authentication useEffect (unchanged)
  useEffect(() => {
    if (!isClient) return;

    const handleMessage = (event) => {
      if (
        event.origin === "http://www.hibafarrash.shourk.com" ||
        event.origin === "http://localhost:3000" ||
        event.origin === "https://hibafarrash.shourk.com"
      ) {
        if (event.data.type === "TOKEN_SYNC") {
          localStorage.setItem("expertToken", event.data.token);
        }
      }
    };

    window.addEventListener("message", handleMessage);

    const tempToken = sessionStorage.getItem("tempExpertToken");
    if (tempToken) {
      console.log("Found token in sessionStorage, restoring it");
      localStorage.setItem("expertToken", tempToken);
      sessionStorage.removeItem("tempExpertToken");
    }

    const prePaymentData = localStorage.getItem("prePaymentAuth");
    if (prePaymentData) {
      try {
        const { token, timestamp } = JSON.parse(prePaymentData);
        if (Date.now() - timestamp < 3600000) {
          console.log("Restoring token from prePaymentAuth");
          localStorage.setItem("expertToken", token);
          localStorage.removeItem("prePaymentAuth");
        }
      } catch (error) {
        console.error("Error parsing prePaymentAuth:", error);
      }
    }

    const checkAuth = async () => {
      const token = localStorage.getItem("expertToken");
      if (!token) {
        const parentToken = window.parent?.localStorage?.getItem("expertToken");
        if (parentToken) {
          localStorage.setItem("expertToken", parentToken);
          return;
        }
        router.push("/expertpanel/expertlogin");
      }

      if (sessionId) {
        try {
          console.log("Refreshing token using endpoint");
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/expertauth/refresh-token`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          localStorage.setItem("expertToken", response.data.newToken);
          console.log("Token refresh successful");
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

  // NEW: Helper function to check if session is expired
  const isSessionExpired = (session) => {
    if (!session.slots || !Array.isArray(session.slots) || session.slots.length === 0) {
      return false;
    }

    const now = new Date();
    let latestDateTime = null;

    // Handle nested slots structure: slots[0] is an array containing slot objects
    const slotsArray = Array.isArray(session.slots[0]) ? session.slots[0] : session.slots;
    
    slotsArray.forEach(slot => {
      if (slot.selectedDate && slot.selectedTime) {
        const slotDateTime = new Date(`${slot.selectedDate}T${convertTo24Hour(slot.selectedTime)}`);
        if (!latestDateTime || slotDateTime > latestDateTime) {
          latestDateTime = slotDateTime;
        }
      }
    });

    return latestDateTime && latestDateTime < now;
  };

  // NEW: Helper function to check if session is within 10 days
  const isSessionRecent = (session) => {
    if (!session.createdAt) return true; // Show if no creation date
    
    const sessionDate = new Date(session.createdAt);
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    
    return sessionDate >= tenDaysAgo;
  };

  // NEW: Helper function to check if session is upcoming (within 24h)
  const isSessionUpcoming = (session) => {
    if (!session.slots || !Array.isArray(session.slots) || session.slots.length === 0) {
      return false;
    }

    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Handle nested slots structure
    const slotsArray = Array.isArray(session.slots[0]) ? session.slots[0] : session.slots;

    return slotsArray.some(slot => {
      if (slot.selectedDate && slot.selectedTime) {
        const slotDateTime = new Date(`${slot.selectedDate}T${convertTo24Hour(slot.selectedTime)}`);
        return slotDateTime >= now && slotDateTime <= in24Hours;
      }
      return false;
    });
  };

  // NEW: Auto-reject expired sessions
  const autoRejectExpiredSessions = async (sessions) => {
    const token = localStorage.getItem("expertToken");
    if (!token) return;

    const expiredPendingSessions = sessions.filter(session => 
      (session.status === "pending" || session.status === "unconfirmed") &&
      isSessionExpired(session)
    );

    if (expiredPendingSessions.length === 0) return;

    console.log(`Found ${expiredPendingSessions.length} expired pending sessions to auto-reject`);

    const autoRejectedIds = new Set();

    for (const session of expiredPendingSessions) {
      try {
        await axios.put(
          `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/session/decline`,
          { id: session._id },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        autoRejectedIds.add(session._id);
        console.log(`Auto-rejected expired session: ${session._id}`);
      } catch (error) {
        console.error(`Failed to auto-reject session ${session._id}:`, error);
      }
    }

    if (autoRejectedIds.size > 0) {
      setAutoRejectedSessions(autoRejectedIds);
      
      // Update sessions state
      setMySessions(prevSessions => 
        prevSessions.map(session => 
          autoRejectedIds.has(session._id) 
            ? { ...session, status: "rejected" }
            : session
        )
      );

      toast.info(`${autoRejectedIds.size} expired session(s) were automatically declined`);
    }
  };

  // Fetch sessions useEffect with auto-reject functionality
  useEffect(() => {
    if (!isClient) return;

    const fetchSessions = async () => {
      try {
        setLoadingSessions(true);
        const token = localStorage.getItem("expertToken");
        if (!token) {
          setErrorSessions("Authentication token is required");
          return;
        }

        const sessionsResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/session/getexpertsession`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const userToExpertSessions = (sessionsResponse?.data.userSessions || []).map(
          (session) => ({
            ...session,
            sessionType: "User To Expert",
            clientName: session.firstName || "",
            clientLastName: session.lastName || "",
            expertName: session.expertID?.firstName || "",
            expertLastName: session.expertID?.lastName || "",
            contactNumber: session.phone || session.mobile || "",
          })
        );

        const normalized = userToExpertSessions.map((s) => ({
          ...s,
          sessionDate: s.slots?.[0]?.[0]?.selectedDate,
          sessionTime: s.slots?.[0]?.[0]?.selectedTime,
        }));

        setMySessions(normalized);

        // NEW: Auto-reject expired sessions
        await autoRejectExpiredSessions(normalized);
      } catch (err) {
        console.error("Error fetching sessions:", err);
        setErrorSessions("No sessions found.");

        if (
          err.response &&
          (err.response.status === 401 || err.response.status === 403)
        ) {
          router.push("/expertpanel/expertlogin");
        }
      } finally {
        setLoadingSessions(false);
      }
    };

    fetchSessions();
  }, [isClient, router]);

  const handleRateClick = (booking) => {
    setShowRateComponent(true);
    setSelectedBooking(booking);
  };

  const closeModal = () => {
    setShowRateComponent(false);
    setSelectedBooking(null);
  };

  const isJoinEnabled = (sessionDate, sessionTime, duration) => {
    if (!sessionDate || !sessionTime) {
      console.error("Session date or time is missing");
      return false;
    }

    const sessionDateTime = new Date(
      `${sessionDate}T${convertTo24Hour(sessionTime)}`
    );

    if (isNaN(sessionDateTime)) {
      console.error("Invalid date/time format");
      return false;
    }

    const now = new Date();
    const diffMinutes = (sessionDateTime - now) / 60000;
    return diffMinutes <= 2 && diffMinutes >= -duration;
  };

  const convertTo24Hour = (timeString) => {
    const [time, period] = timeString.split(" ");
    let [hours, minutes] = time.split(":");

    hours = parseInt(hours);
    if (period.toLowerCase() === "pm" && hours !== 12) {
      hours += 12;
    } else if (period.toLowerCase() === "am" && hours === 12) {
      hours = 0;
    }

    return `${hours.toString().padStart(2, "0")}:${minutes}`;
  };

  const handleDateChange = (sessionId, date) => {
    setSessionState((prevState) => ({
      ...prevState,
      [sessionId]: {
        ...prevState[sessionId],
        selectedDate: date,
        selectedTime: "",
      },
    }));
  };

  const handleTimeChange = (sessionId, time) => {
    setSessionState((prevState) => ({
      ...prevState,
      [sessionId]: {
        ...prevState[sessionId],
        selectedTime: time,
      },
    }));
  };

  const handleAccept = async (sessionId) => {
    const { selectedDate, selectedTime } = sessionState[sessionId] || {};

    if (!selectedDate || !selectedTime) {
      toast.error("Please select both a date and a time before accepting.");
      return;
    }

    try {
      const token = localStorage.getItem("expertToken");
      if (!token) {
        toast.error("Token is required");
        return;
      }

      const payload = {
        id: sessionId,
        selectedDate,
        selectedTime,
      };

      console.log(payload);
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/session/accept`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const updatedSessions = mySessions.map((session) =>
        session._id === sessionId
          ? { ...session, status: "confirmed" }
          : session
      );
      setMySessions(updatedSessions);

      toast.success(response.data.message || "Session accepted successfully");
    } catch (err) {
      console.error("Failed to accept the session:", err);
      toast.error(
        err.response?.data?.message ||
          "Failed to accept the session. Please try again."
      );
    }
  };

  const handleDecline = async (sessionId) => {
    try {
      const token = localStorage.getItem("expertToken");
      if (!token) {
        toast.error("Token is required");
        return;
      }

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/session/decline`,
        { id: sessionId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedSessions = mySessions.map((session) =>
        session._id === sessionId ? { ...session, status: "rejected" } : session
      );
      setMySessions(updatedSessions);
      toast.success(response.data.message);
    } catch (err) {
      toast.error("Failed to decline the session");
    }
  };

  const handleChatClick = () => {
    router.push("/expertpanel/userchat");
  };

  const toggleNoteExpand = (id) => {
    setExpandedNotes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const formatNote = (note) => {
    if (!note) return [];

    try {
      const noteStr = String(note);
      return noteStr
        .split(".")
        .map((sentence) => sentence.trim())
        .filter((sentence) => sentence.length > 0)
        .map((sentence) => `${sentence}.`);
    } catch (error) {
      console.error("Error formatting note:", error);
      return [];
    }
  };

  const groupByDate = (slotsArray) => {
    // Handle the nested slots structure: slots[0][0] where slots[0] is an array
    const slots = Array.isArray(slotsArray) && slotsArray.length > 0 && Array.isArray(slotsArray[0]) 
      ? slotsArray[0] 
      : Array.isArray(slotsArray) 
      ? slotsArray 
      : [];
      
    return slots.reduce((acc, slot) => {
      const date = slot.selectedDate;
      if (!date) return acc;

      if (!acc[date]) acc[date] = [];
      acc[date].push(slot.selectedTime);
      return acc;
    }, {});
  };

  const isNoteLong = (note) => note && note.length > 100;

  const getStatusStyle = (status) => {
    switch (status) {
      case "confirmed":
        return "text-green-500";
      case "unconfirmed":
      case "pending":
        return "text-yellow-500";
      case "rejected":
        return "text-red-500";
      case "completed":
        return "text-green-700";
      case "Rating Submitted":
        return "text-green-700";
      default:
        return "text-gray-500";
    }
  };

  const handleCancelClick = (session) => {
    setSessionToCancel(session);
    setShowCancelModal(true);

    setCancellationReasons((prevReasons) =>
      prevReasons.map((reason) => ({ ...reason, checked: false }))
    );
    setOtherReason("");
    setTermsAccepted(false);
  };

  const handleReasonChange = (id) => {
    setCancellationReasons((prevReasons) =>
      prevReasons.map(
        (reason) =>
          reason.id === id
            ? { ...reason, checked: !reason.checked }
            : { ...reason, checked: false }
      )
    );
  };

  const handleNextStep = () => {
    const hasSelectedReason = cancellationReasons.some(
      (reason) => reason.checked
    );
    const isOtherSelected = cancellationReasons.find(
      (r) => r.id === 6
    )?.checked;

    if (!hasSelectedReason) {
      toast.error("Please select at least one reason for cancellation");
      return;
    }

    if (isOtherSelected && !otherReason.trim()) {
      toast.error("Please provide details for 'Other' reason");
      return;
    }

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

      const selectedReasons = cancellationReasons
        .filter((reason) => reason.checked)
        .map((reason) => reason.reason);

      const sessionModel = sessionToCancel?.sessionType;

      const cancellationData = {
        sessionId: sessionToCancel._id,
        reasons: selectedReasons,
        otherReason: cancellationReasons.find((r) => r.id === 6)?.checked
          ? otherReason
          : "",
        sessionModel:
          sessionModel === "Expert To Expert"
            ? "ExpertToExpertSession"
            : "UserToExpertSession",
      };

      console.log("Sending cancellation request with data:", cancellationData);

      const token = localStorage.getItem("expertToken");
      await axios.post(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/cancelsession/cancelexpert`,
        cancellationData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (activeTab === "bookings") {
        setMyBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking._id === sessionToCancel._id
              ? { ...booking, status: "cancelled" }
              : booking
          )
        );
      } else {
        setMySessions((prevSessions) =>
          prevSessions.map((session) =>
            session._id === sessionToCancel._id
              ? { ...session, status: "cancelled" }
              : session
          )
        );
      }

      setShowTermsModal(false);
      toast.success("Session cancelled successfully");
    } catch (error) {
      console.error("Error cancelling session:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to cancel session. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoadingCancel(false);
    }
  };

  const handleRatingSubmitted = (updatedSession) => {
    setMyBookings((prevBookings) =>
      prevBookings.map((booking) =>
        booking._id === updatedSession._id
          ? { ...booking, ...updatedSession }
          : booking
      )
    );
  };

  // NEW: Enhanced filtering logic
  const filteredSessions = mySessions
    .filter((session) => {
      // Status filter
      if (statusFilter !== "all") {
        const sessionStatus = session.status === "unconfirmed" ? "pending" : session.status;
        if (statusFilter !== sessionStatus) return false;
      }
      
      // Hide rejected sessions by default (unless specifically filtered for)
      if (statusFilter === "all" && session.status === "rejected") return false;
      
      // Age filter (show older sessions only if toggle is on)
      if (!showOlderSessions && !isSessionRecent(session)) return false;
      
      return true;
    })
    .sort((a, b) => {
      // Sort by creation date, newest first
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  // NEW: Count older sessions
  const olderSessionsCount = mySessions.filter(session => 
    !isSessionRecent(session) && 
    (statusFilter === "all" ? session.status !== "rejected" : 
     (session.status === "unconfirmed" ? "pending" : session.status) === statusFilter)
  ).length;

  return (
    <div className="w-full mx-auto py-6 px-4 mt-2 md:max-w-6xl md:py-10 md:px-8 bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="mb-8 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          My Video Consultations
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your upcoming and past consultation sessions
        </p>
      </div>

      {/* NEW: Enhanced Filter Section */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
              >
                <option value="all">All Sessions</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Show Older Sessions Toggle */}
          {olderSessionsCount > 0 && (
            <button
              onClick={() => setShowOlderSessions(!showOlderSessions)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border rounded-md hover:bg-gray-50 w-full sm:w-auto justify-center sm:justify-start"
            >
              {showOlderSessions ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span className="whitespace-nowrap">
                {showOlderSessions ? "Hide" : "Show"} Older Sessions ({olderSessionsCount})
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-4 md:space-y-6">
        {loadingSessions ? (
          <div className="text-center p-10 bg-white rounded-lg shadow-md">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your sessions...</p>
          </div>
        ) : errorSessions ? (
          <div className="text-center p-10 bg-white rounded-lg shadow-md">
            <p className="text-red-500">{errorSessions}</p>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center p-10 bg-white rounded-lg shadow-md">
            <div className="text-4xl mb-4">🎥</div>
            <p className="text-gray-500 text-lg">No Sessions Found</p>
            <p className="text-gray-400 mt-2">
              {statusFilter !== "all" 
                ? `No ${statusFilter} sessions found`
                : "Your scheduled sessions will appear here"
              }
            </p>
          </div>
        ) : (
          filteredSessions.map((session) => {
            const isUpcoming = isSessionUpcoming(session);
            const isAutoRejected = autoRejectedSessions.has(session._id);
            
            return (
              <div
                key={session._id}
                className={`bg-white p-4 md:p-6 border rounded-lg shadow-sm hover:shadow-md transition transform hover:-translate-y-1 ${
                  isUpcoming ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''
                } ${isAutoRejected ? 'border-l-4 border-l-red-500' : ''}`}
              >
                {/* NEW: Status badges */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-700 font-medium">
                      {session.sessionType}
                    </span>
                    {isUpcoming && (
                      <span className="text-xs bg-blue-100 px-3 py-1 rounded-full text-blue-700 font-medium flex items-center gap-1">
                        <CiClock2 className="w-3 h-3" />
                        Upcoming (24h)
                      </span>
                    )}
                    {isAutoRejected && (
                      <span className="text-xs bg-red-100 px-3 py-1 rounded-full text-red-700 font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Auto-rejected
                      </span>
                    )}
                  </div>
                  <span
                    className={`${getStatusStyle(
                      session.status
                    )} px-3 py-1 rounded-full text-sm ${
                      session.status === "confirmed"
                        ? "bg-green-50"
                        : session.status === "rejected"
                        ? "bg-red-50"
                        : "bg-gray-100"
                    }`}
                  >
                    {session.status === "unconfirmed"
                      ? "Pending"
                      : session.status.charAt(0).toUpperCase() +
                        session.status.slice(1)}
                  </span>
                </div>

                {/* Mobile View */}
                <div className="md:hidden">
                  <div className="flex items-center text-xs mb-3 bg-gray-50 p-2 rounded-md">
                    <CiClock2 className="text-sm mr-1 text-blue-500" />
                    <span className="text-gray-700 font-medium">
                      {session.sessionTime}
                    </span>
                    <span className="ml-1 text-gray-500">
                      ({session.duration})
                    </span>
                  </div>

                  <div className="mb-3 bg-gray-50 p-2 rounded-md">
                    <p className="text-gray-700 mb-1 text-xs flex items-center">
                      <FaUser className="inline mr-1 text-blue-500" size={12} />
                      <span className="font-medium">Client:</span>{" "}
                      {session.clientName || "N/A"}{" "}
                      {session.clientLastName || ""}
                    </p>
                  </div>

                  {/* Date/Time Select & Actions */}
                  {session.status === "unconfirmed" ? (
                    <>
                      <div className="mb-3 grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs font-medium text-gray-700 block mb-1">
                            Select Date
                          </label>
                          <select
                            className="w-full text-xs border rounded-md p-2"
                            value={
                              sessionState[session._id]?.selectedDate || ""
                            }
                            onChange={(e) =>
                              handleDateChange(
                                session._id,
                                e.target.value
                              )
                            }
                          >
                            <option value="">Choose a date</option>
                            {Object.keys(
                              groupByDate(session.slots || [])
                            ).map((d, i) => (
                              <option key={i} value={d}>
                                {new Date(d).toLocaleDateString("en-US", {
                                  weekday: "short",
                                  day: "numeric",
                                  month: "short",
                                })}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-700 block mb-1">
                            Select Time
                          </label>
                          <select
                            className="w-full text-xs border rounded-md p-2"
                            value={
                              sessionState[session._id]?.selectedTime || ""
                            }
                            onChange={(e) =>
                              handleTimeChange(
                                session._id,
                                e.target.value
                              )
                            }
                            disabled={
                              !sessionState[session._id]?.selectedDate
                            }
                          >
                            <option value="">Choose a time</option>
                            {Object.entries(
                              groupByDate(session.slots || [])
                            )
                              .filter(
                                ([d]) =>
                                  d ===
                                  sessionState[session._id]?.selectedDate
                              )
                              .flatMap(([, times]) =>
                                times.map((t, idx) => (
                                  <option key={idx} value={t}>
                                    {t}
                                  </option>
                                ))
                              )}
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          className="px-3 py-2 border border-gray-300 rounded-md text-xs hover:bg-gray-50"
                          onClick={() => handleDecline(session._id)}
                        >
                          Decline
                        </button>
                        <button
                          className="px-3 py-2 bg-blue-500 text-white rounded-md text-xs hover:bg-blue-600 disabled:opacity-50"
                          onClick={() => handleAccept(session._id)}
                          disabled={
                            !sessionState[session._id]?.selectedDate ||
                            !sessionState[session._id]?.selectedTime
                          }
                        >
                          Accept
                        </button>
                      </div>
                    </>
                  ) : session.status === "confirmed" ? (
                    <div className="flex justify-end gap-2">
                      <button
                        className="px-3 py-2 border border-gray-300 rounded-md text-xs flex gap-1 hover:bg-gray-50"
                        onClick={handleChatClick}
                      >
                        <MessagesSquare className="w-3 h-3 text-blue-500" />
                        Chat
                      </button>
                      {session.zoomMeetingLink ? (
                        <button
                          onClick={() =>
                            router.push(
                              `/expertpanel/sessioncall?meetingId=${session.zoomMeetingId}&sessionId=${session._id}`
                            )
                          }
                          className="px-3 py-2 text-xs rounded-md bg-blue-500 text-white hover:bg-blue-600 flex gap-1"
                        >
                          <Video className="w-3 h-3" />
                          Join
                        </button>
                      ) : (
                        <span className="text-yellow-500 text-xs px-3 py-2 bg-yellow-50 rounded-md">
                          Link coming soon
                        </span>
                      )}
                    </div>
                  ) : null}
                </div>

                {/* Desktop View */}
                <div className="hidden md:block">
                  <div className="border-b pb-4 mb-4 flex justify-between">
                    <h2 className="text-xl font-semibold text-gray-800">
                      {session.sessionType === "Expert To Expert"
                        ? `Consultation with Expert ${session.expertName}`
                        : `Consultation with ${session.clientName}`}
                    </h2>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-gray-600 mb-6">
                    <CiClock2 className="text-blue-500" />
                    {session.slots?.[0]?.selectedTime || "TBD"} (
                    {session.duration})
                    <span className="bg-blue-50 px-3 py-1 rounded-full text-blue-600">
                      {session.sessionType}
                    </span>
                  </div>

                  <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-8">
                      <div className="flex items-start gap-8 mb-6">
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-gray-700 mb-3">
                            People
                          </h3>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="flex items-center text-sm text-gray-700 mb-2">
                              <FaUser className="mr-2 text-blue-500" />{" "}
                              <span className="font-medium w-16">Client:</span>{" "}
                              {session.clientName} {session.clientLastName}
                            </p>
                            <p className="flex items-center text-sm text-gray-700">
                              <FaMobile className="mr-2 text-blue-500" />{" "}
                              <span className="font-medium w-16">Mobile:</span>{" "}
                              {session.contactNumber}
                            </p>
                          </div>
                          {session.note && (
                            <div className="mt-4 border p-2 rounded-[5px]">
                              <p className="text-sm font-medium text-gray-700">
                                Note:
                              </p>
                              <ul className="list-disc pl-5 text-sm text-gray-700">
                                {session.note
                                  .split(".")
                                  .filter(Boolean)
                                  .map((n, i) => (
                                    <li key={i}>{n.trim()}.</li>
                                  ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {session.status === "unconfirmed" ? (
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">
                              Select Date & Time
                            </h3>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-sm font-medium mb-2">
                                    Date
                                  </label>
                                  <select
                                    className="w-full text-sm border rounded-md p-2"
                                    value={
                                      sessionState[session._id]?.selectedDate ||
                                      ""
                                    }
                                    onChange={(e) =>
                                      handleDateChange(
                                        session._id,
                                        e.target.value
                                      )
                                    }
                                  >
                                    <option value="">Select a Date</option>
                                    {Object.keys(
                                      groupByDate(session.slots || [])
                                    ).map((d, idx) => (
                                      <option key={idx} value={d}>
                                        {new Date(d).toLocaleDateString(
                                          "en-US",
                                          {
                                            weekday: "short",
                                            day: "numeric",
                                            month: "short",
                                          }
                                        )}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-2">
                                    Time
                                  </label>
                                  <select
                                    className="w-full text-sm border rounded-md p-2"
                                    value={
                                      sessionState[session._id]?.selectedTime ||
                                      ""
                                    }
                                    onChange={(e) =>
                                      handleTimeChange(
                                        session._id,
                                        e.target.value
                                      )
                                    }
                                    disabled={
                                      !sessionState[session._id]?.selectedDate
                                    }
                                  >
                                    <option value="">Select a Time</option>
                                    {Object.entries(
                                      groupByDate(session.slots || [])
                                    )
                                      .filter(
                                        ([d]) =>
                                          d ===
                                          sessionState[session._id]
                                            ?.selectedDate
                                      )
                                      .flatMap(([, times]) =>
                                        times.map((t, i) => (
                                          <option key={i} value={t}>
                                            {t}
                                          </option>
                                        ))
                                      )}
                                  </select>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">
                              Accepted Slot
                            </h3>
                            <div className="flex flex-wrap gap-3">
                              {Object.entries(
                                groupByDate(session.slots || [])
                              ).map(([d, times]) => (
                                <div
                                  key={d}
                                  className="bg-gray-50 px-4 py-3 rounded-lg border"
                                >
                                  <p className="text-sm font-medium text-gray-700">
                                    {new Date(d).toLocaleDateString("en-US", {
                                      weekday: "short",
                                      day: "numeric",
                                      month: "short",
                                    })}
                                  </p>
                                  <div className="mt-2 flex gap-2">
                                    {times.map((t, i) => (
                                      <span
                                        key={i}
                                        className="text-xs bg-white px-2 py-1 rounded-md border"
                                      >
                                        {t}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {session.sessionNotes && (
                        <div className="mt-4">
                          <h3 className="text-sm font-semibold text-gray-700 mb-3">
                            Session Notes
                          </h3>
                          <div className="bg-gray-50 p-4 rounded-lg border">
                            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                              {formatNote(session.sessionNotes).map(
                                (note, idx) => (
                                  <li key={idx}>{note}</li>
                                )
                              )}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="col-span-4">
                      <div className="bg-gray-50 p-4 rounded-lg flex flex-col gap-3">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">
                          Actions
                        </h3>

                        {session.status === "unconfirmed" && (
                          <>
                            <button
                              className="w-full px-4 py-2 border rounded-md text-sm hover:bg-gray-100"
                              onClick={() => handleDecline(session._id)}
                            >
                              Decline Request
                            </button>
                            <button
                              className={`w-full px-4 py-2 rounded-md text-sm transition ${
                                sessionState[session._id]?.selectedDate &&
                                sessionState[session._id]?.selectedTime
                                  ? "bg-blue-500 text-white hover:bg-blue-600"
                                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                              }`}
                              onClick={() => handleAccept(session._id)}
                              disabled={
                                !sessionState[session._id]?.selectedDate ||
                                !sessionState[session._id]?.selectedTime
                              }
                            >
                              Accept Request
                            </button>
                          </>
                        )}

                        {session.status === "confirmed" && (
                          <>
                            <button
                              onClick={handleChatClick}
                              className="w-full px-4 py-2 border rounded-md text-sm flex justify-center gap-2 hover:bg-gray-100"
                            >
                              <MessagesSquare className="w-4 h-4 text-blue-500" />
                              Chat with Client
                            </button>

                            {session.zoomMeetingLink ? (
                              <a
                                href={session.zoomMeetingLink}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full"
                              >
                                <button className="w-full px-4 py-2 rounded-md text-sm bg-blue-500 text-white hover:bg-blue-600 flex justify-center gap-2">
                                  <Video className="w-4 h-4" />
                                  Join Zoom Meeting
                                </button>
                              </a>
                            ) : (
                              <div className="w-full px-4 py-2 bg-yellow-50 rounded-md text-sm text-yellow-600 text-center">
                                Zoom link coming soon
                              </div>
                            )}

                            <button
                              className="px-3 py-2 text-xs rounded-md bg-red-100 text-red-600 hover:bg-red-200 flex justify-center items-center gap-1 mt-2"
                              onClick={() =>
                                handleCancelClick(session)
                              }
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Cancel Session</h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">
              Please select a reason for canceling this session:
            </p>
            
            <div className="space-y-3 mb-6">
              {cancellationReasons.map((reason) => (
                <label key={reason.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={reason.checked}
                    onChange={() => handleReasonChange(reason.id)}
                    className="mr-3"
                  />
                  <span className="text-sm">{reason.reason}</span>
                </label>
              ))}
            </div>
            
            {cancellationReasons.find(r => r.id === 6)?.checked && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Please specify:
                </label>
                <textarea
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  className="w-full p-3 border rounded-md resize-none"
                  rows="3"
                  placeholder="Please provide details..."
                />
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleNextStep}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Terms & Conditions</h3>
              <button
                onClick={() => setShowTermsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                By canceling this session, you agree to the following terms:
              </p>
              <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
                <li>Cancellation fees may apply based on timing</li>
                <li>Refunds will be processed according to our policy</li>
                <li>The client will be notified immediately</li>
              </ul>
            </div>
            
            <label className="flex items-center mb-6">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mr-3"
              />
              <span className="text-sm">I accept the terms and conditions</span>
            </label>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowTermsModal(false);
                  setShowCancelModal(true);
                }}
                className="flex-1 px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleCancelSession}
                disabled={!termsAccepted || loadingCancel}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
              >
                {loadingCancel ? "Canceling..." : "Cancel Session"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCall;