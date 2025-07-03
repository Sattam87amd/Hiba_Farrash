"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import axios from "axios"

const getOrCreatePersistentUserId = (sessionId) => {
  const key = `zoomUserId_${sessionId}`
  let userId = localStorage.getItem(key)
  if (!userId) {
    userId = `user_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem(key, userId)
  }
  return userId
}

const UserSessionCall = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const meetingId = searchParams.get("meetingId") ?? ""
  const sessionId = searchParams.get("sessionId") ?? ""

  // Zoom SDK state
  const [client, setClient] = useState(null)
  const [stream, setStream] = useState(null)
  const [isInSession, setIsInSession] = useState(false)
  const [participants, setParticipants] = useState([])
  const [localVideoElement, setLocalVideoElement] = useState(null)
  const [timerSyncInterval, setTimerSyncInterval] = useState(null)

  // State management
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [authData, setAuthData] = useState(null)
  const [sessionData, setSessionData] = useState(null)

  // Timer state
  const [sessionDuration, setSessionDuration] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [sessionStartTime, setSessionStartTime] = useState(null)
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [sessionEnded, setSessionEnded] = useState(false)
  const [warningShown, setWarningShown] = useState(false)

  // Media state
  const [isVideoOn, setIsVideoOn] = useState(false)
  const [isAudioOn, setIsAudioOn] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState("Connecting...")
  const [mediaError, setMediaError] = useState(null)
  const [audioJoined, setAudioJoined] = useState(false)

  // Add these state variables that were defined at the bottom
  const [expertJoined, setExpertJoined] = useState(false)
  const [timerStarted, setTimerStarted] = useState(false)

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sessioncall-darkmode") === "true"
    }
    return false
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.classList.toggle("dark", darkMode)
      localStorage.setItem("sessioncall-darkmode", darkMode)
    }
  }, [darkMode])

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const getTimeColor = () => {
    if (timeRemaining <= 30) return "text-red-500"
    if (timeRemaining <= 60) return "text-amber-500"
    if (timeRemaining <= 120) return "text-yellow-500"
    return "text-emerald-500"
  }

  const showTimeWarning = (message) => {
    const warningMessage = {
      id: Date.now(),
      sender: "System",
      text: `Time Warning: ${message}`,
      timestamp: new Date().toLocaleTimeString(),
      isSystem: true,
    }
  }

  // Refs
  const localVideoRef = useRef(null)
  const timerRef = useRef(null)
  const renderedVideos = useRef(new Map()) // Track rendered videos

  useEffect(() => {
    if (!meetingId || !sessionId) {
      setError("Meeting ID and Session ID are required")
      setIsLoading(false)
      return
    }

    initializeUserZoomVideoCall()
    return cleanup
  }, [meetingId, sessionId])

  // Timer effect
  useEffect(() => {
    console.log("Timer effect triggered:", {
      isSessionActive,
      timeRemaining,
      timerRef: timerRef.current,
    })

    if (isSessionActive && timeRemaining > 0 && !timerRef.current) {
      console.log("Starting timer interval")
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          const newTime = prev - 1
          console.log("Timer tick:", { newTime, prev })

          // Warning logic
          if (newTime === 120 && !warningShown) {
            setWarningShown(true)
            showTimeWarning("2 minutes remaining")
          }
          if (newTime === 60) {
            showTimeWarning("1 minute remaining")
          }
          if (newTime === 30) {
            showTimeWarning("30 seconds remaining")
          }

          if (newTime <= 0) {
            console.log("Timer reached zero, ending session")
            clearInterval(timerRef.current)
            timerRef.current = null
            endSessionAutomatically()
            return 0
          }
          return newTime
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) {
        console.log("Cleaning up timer interval")
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isSessionActive, warningShown])

  // Add this useEffect for session status checks
  useEffect(() => {
    const checkSessionStatus = async () => {
      try {
        const token = localStorage.getItem("userToken")
        const response = await axios.get(`${process.env.NEXT_PUBLIC_PROD_API_URL}/api/zoomVideo/session-status/${sessionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.data.status === "completed" && !sessionEnded) {
          endSessionAutomatically("Session marked as completed by system")
        }
      } catch (error) {
        console.error("Error checking session status:", error)
      }
    }

    // Check every 30 seconds
    const statusInterval = setInterval(checkSessionStatus, 30000)

    return () => clearInterval(statusInterval)
  }, [sessionId, sessionEnded])

  useEffect(() => {
    if (timeRemaining <= 0 && isSessionActive) {
      endSessionAutomatically()
    }
  }, [timeRemaining, isSessionActive])

  // Timer synchronization effect
  useEffect(() => {
    if (client && stream && authData?.role === 0) {
      // Only for users
      const handleCommandReceived = (payload) => {
        console.log("Received command:", payload)
        if (payload.cmd === "sync-timer" && payload.data) {
          console.log("Received timer sync from expert:", payload.data)

          // Clear existing timer if any
          if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
          }

          // Cap timeRemaining at 60 seconds (1 minute) for user sessions
          const syncedTimeRemaining = Math.min(payload.data.timeRemaining, 60)
          setTimeRemaining(syncedTimeRemaining)

          // Ensure sessionDuration is always 1 minute for user display
          const forcedDurationMinutes = 1
          setSessionDuration(forcedDurationMinutes)

          setSessionStartTime(new Date(payload.data.sessionStartTime))
          // Removed: setSessionDuration(payload.data.sessionDuration); // Expert's duration is ignored
          // Ensure these are explicitly set for visibility and logic
          setIsSessionActive(true)
          setTimerStarted(true)
          console.log("User timer synced and started:", {
            timeRemaining: syncedTimeRemaining,
            sessionDuration: forcedDurationMinutes,
            isSessionActive: true,
            timerStarted: true,
          })
        } else if (payload.cmd === "session-started" && payload.data) {
          setSessionStartTime(new Date(payload.data.sessionStartTime))
          setIsSessionActive(true)
          setTimerStarted(true)
          startTimer()
        } else if (payload.cmd === "session-ended" && payload.data) {
          endSessionAutomatically(payload.data.reason || "Session ended by expert")
        }
      }

      client.on("command-received", handleCommandReceived)

      return () => {
        client.off("command-received", handleCommandReceived)
      }
    }
  }, [client, stream, authData]) // authData is now in dependency array.

  // Expert joining and timer control effect - MOVED INSIDE COMPONENT
  useEffect(() => {
    if (client) {
      const handleUserAdded = async (user) => {
        console.log("Expert joined:", user)
        if (
          user &&
          (user.isHost ||
            user.role === "Expert" ||
            user.displayName?.toLowerCase().includes("expert") ||
            user.displayName?.toLowerCase().includes("dr.") ||
            user.displayName?.toLowerCase().includes("doctor"))
        ) {
          setExpertJoined(true)
          // User's timer starts ONLY when sync-timer command is received from expert
          // No direct startTimer() call here
        }
      }

      const handleUserRemoved = (user) => {
        console.log("Expert left:", user)
        if (
          user &&
          (user.isHost ||
            user.role === "Expert" ||
            user.displayName?.toLowerCase().includes("expert") ||
            user.displayName?.toLowerCase().includes("dr.") ||
            user.displayName?.toLowerCase().includes("doctor"))
        ) {
          setExpertJoined(false)
          // If expert leaves, session should end regardless of timer
          if (!sessionEnded) {
            endSessionAutomatically("Expert left the session prematurely")
          }
        }
      }

      client.on("user-added", handleUserAdded)
      client.on("user-removed", handleUserRemoved)

      return () => {
        client.off("user-added", handleUserAdded)
        client.off("user-removed", handleUserRemoved)
      }
    }
  }, [client, sessionEnded]) // Added sessionEnded to dependencies for endSessionAutomatically call

  // Add this effect for session status checks (moved to be close to other effects)
  useEffect(() => {
    const checkSessionStatus = async () => {
      try {
        const token = localStorage.getItem("userToken")
        const response = await axios.get(`${process.env.NEXT_PUBLIC_PROD_API_URL}/api/zoomVideo/session-status/${sessionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.data.status === "completed" && !sessionEnded) {
          endSessionAutomatically("Session marked as completed by system")
        }
      } catch (error) {
        console.error("Error checking session status:", error)
      }
    }

    // Check every 30 seconds
    const statusInterval = setInterval(checkSessionStatus, 30000)

    return () => clearInterval(statusInterval)
  }, [sessionId, sessionEnded]) // Added sessionEnded to dependencies

  // Timer effect for user panel (only runs if isSessionActive is true)
  useEffect(() => {
    console.log("User Timer effect triggered:", {
      isSessionActive,
      timeRemaining,
      timerRef: timerRef.current,
    })

    if (isSessionActive && timeRemaining > 0 && !timerRef.current) {
      console.log("Starting user timer interval")
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          const newTime = prev - 1
          console.log("User Timer tick:", { newTime, prev })

          // Warning logic
          if (newTime === 120 && !warningShown) {
            setWarningShown(true)
            showTimeWarning("2 minutes remaining")
          } else if (newTime === 60) {
            showTimeWarning("1 minute remaining")
          } else if (newTime === 30) {
            showTimeWarning("30 seconds remaining")
          }

          if (newTime <= 0) {
            console.log("User Timer reached zero, ending session")
            clearInterval(timerRef.current)
            timerRef.current = null // Ensure timerRef is cleared
            endSessionAutomatically()
            return 0
          }
          return newTime
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) {
        console.log("Cleaning up user timer interval")
        clearInterval(timerRef.current)
        timerRef.current = null // Ensure timerRef is cleared on cleanup
      }
    }
  }, [isSessionActive, warningShown, timeRemaining]) // Added timeRemaining to dependencies for warning logic

  // Auto-end session if time runs out (redundant with main timer, but good safeguard)
  useEffect(() => {
    if (timeRemaining <= 0 && isSessionActive) {
      endSessionAutomatically()
    }
  }, [timeRemaining, isSessionActive])

  // Add this effect after the existing useEffects
  useEffect(() => {
    if (client && isInSession) {
      // Sync participants with current Zoom session state
      const syncParticipants = () => {
        try {
          const currentUsers = client.getAllUser()
          const currentUserInfo = client.getCurrentUserInfo()

          console.log("User - Sync Participants: Current user info:", currentUserInfo)
          console.log("User - Sync Participants: All users from SDK:", currentUsers)

          if (currentUsers && currentUsers.length > 0) {
            // More robust filtering to exclude current user
            const filteredParticipants = currentUsers
              .filter((p) => {
                // Multiple ways to check if this is not the current user
                const isNotCurrentUser =
                  p.userId !== currentUserInfo.userId &&
                  p.userId !== currentUserInfo.id &&
                  p.userIdentity !== currentUserInfo.userIdentity

                console.log(`User - Sync Participants: User ${p.userId}: isNotCurrentUser = ${isNotCurrentUser}`)
                return isNotCurrentUser
              })
              .map((participant) => {
                let displayName = participant.displayName || participant.userIdentity || "Unknown User"
                const isExpert =
                  participant.isHost ||
                  displayName.toLowerCase().includes("expert") ||
                  displayName.toLowerCase().includes("dr.") ||
                  displayName.toLowerCase().includes("doctor")
                if (isExpert) {
                  displayName = getExpertDisplayName()
                }
                return {
                  userId: participant.userId,
                  displayName,
                  isHost: participant.isHost || false,
                  video: participant.bVideoOn || false,
                  audio: !participant.muted && participant.bAudioOn,
                }
              })

            console.log("User - Sync Participants: Filtered participants:", filteredParticipants)
            setParticipants(filteredParticipants)

            // Check if expert is present with more specific logic
            const hasExpert = filteredParticipants.some((p) => {
              const isExpert =
                p.isHost ||
                p.displayName?.toLowerCase().includes("expert") ||
                p.displayName?.toLowerCase().includes("dr.") ||
                p.displayName?.toLowerCase().includes("doctor")
              console.log(`User - Sync Participants: Checking if ${p.displayName} is expert: ${isExpert}`)
              return isExpert
            })

            setExpertJoined(hasExpert)

            if (hasExpert && !isSessionActive) {
              setConnectionStatus("Expert connected - session starting (User)")
              setIsSessionActive(true) // Re-added: Set isSessionActive to true when expert joins
              console.log("User - Expert connected, session is now active, awaiting timer sync") // Re-added log
            } else if (!hasExpert && filteredParticipants.length === 0) {
              setConnectionStatus("Waiting for expert to join...")
            } else if (!hasExpert && filteredParticipants.length > 0) {
              setConnectionStatus("Other participants connected - waiting for expert...")
            }
          } else {
            // No other participants
            setParticipants([])
            setExpertJoined(false)
            setConnectionStatus("Waiting for expert to join...")
          }
        } catch (error) {
          console.error("Error syncing participants:", error)
        }
      }

      // Sync immediately and then periodically
      syncParticipants()
      const syncInterval = setInterval(syncParticipants, 5000)

      return () => clearInterval(syncInterval)
    }
  }, [client, isInSession, isSessionActive])

  const initializeUserZoomVideoCall = async () => {
    try {
      setConnectionStatus("Authenticating as User...")

      const token = localStorage.getItem("userToken")
      if (!token) {
        throw new Error("User authentication token not found. Please log in again.")
      }

      await getSessionData(token)
      await generateUserAuth(token)

      setConnectionStatus("Initializing Zoom Video SDK...")
      await initializeZoomSDK(authData)

      setIsLoading(false)
      setConnectionStatus("Ready to join as User")
    } catch (error) {
      console.error("User video call initialization error:", error)
      handleInitializationError(error)
    }
  }

  const initializeZoomSDK = async (authData) => {
    try {
      let ZoomVideo
      if (typeof window !== "undefined") {
        const { default: ZoomVideoSDK } = await import("@zoom/videosdk")
        ZoomVideo = ZoomVideoSDK
      } else {
        throw new Error("ZoomVideo SDK can only be used in the browser")
      }

      const zoomClient = ZoomVideo.createClient()

      console.log("Initializing Zoom SDK for User...")
      await zoomClient.init("en-US", "Global", { patchJsMedia: true })
      console.log("✅ Zoom SDK initialized successfully for User")

      setClient(zoomClient)

      zoomClient.on("connection-change", (payload) => {
        console.log("User - Connection status changed:", payload.state)
        if (payload.state === "Connected") {
          setIsInSession(true)
          setConnectionStatus("Connected to Zoom (User)")
          notifyUserJoined()
        } else if (payload.state === "Disconnected") {
          setIsInSession(false)
          setConnectionStatus("Disconnected")
        } else if (payload.state === "Reconnecting") {
          setConnectionStatus("Reconnecting...")
        }
      })

      zoomClient.on("user-added", (payload) => {
        console.log("User - User joined:", payload)

        // Get current user info for comparison
        // Get current user info for comparison, ensure client is available
        const currentUserInfo = client?.getCurrentUserInfo()

        // Skip if this is the current user (shouldn't happen but safety check)
        if (
          !currentUserInfo ||
          payload.userId === currentUserInfo.userId ||
          payload.userId === currentUserInfo.id ||
          payload.userIdentity === currentUserInfo.userIdentity
        ) {
          console.log("Skipping current user in user-added event")
          return
        }

        const newParticipant = {
          userId: payload.userId,
          displayName: payload.displayName || payload.userIdentity || "Unknown User",
          isHost: payload.isHost || false,
          video: payload.bVideoOn || false,
          audio: payload.bAudioOn || false,
        }

        // Check if this is an expert with more specific criteria
        const isExpert =
          newParticipant.isHost ||
          newParticipant.displayName?.toLowerCase().includes("expert") ||
          newParticipant.displayName?.toLowerCase().includes("dr.") ||
          newParticipant.displayName?.toLowerCase().includes("doctor")

        // If this is the expert, set displayName to real name if available
        if (isExpert) {
          newParticipant.displayName = getExpertDisplayName()
        }

        console.log(`New participant: ${newParticipant.displayName}, isExpert: ${isExpert}`)

        setParticipants((prev) => {
          const existingIndex = prev.findIndex((p) => p.userId === newParticipant.userId)
          if (existingIndex >= 0) {
            const updated = [...prev]
            updated[existingIndex] = { ...updated[existingIndex], ...newParticipant }
            return updated
          } else {
            return [...prev, newParticipant]
          }
        })

        const joinMessage = {
          id: Date.now(),
          sender: "System",
          text: `${newParticipant.displayName} joined the meeting${isExpert ? " (Expert)" : ""}`,
          timestamp: new Date().toLocaleTimeString(),
          isSystem: true,
        }

        if (isExpert) {
          setExpertJoined(true)
          if (!isSessionActive) {
            console.log("Expert joined - awaiting timer sync")
            setConnectionStatus("Expert connected - session starting (User)")
          }
        }
      })

      // Update the user-removed event handler as well
      // In the main component's user-removed event handler
      zoomClient.on("user-removed", (payload) => {
        console.log("User - User left:", payload)

        // Update participants state
        setParticipants((prev) => {
          const updatedParticipants = prev.filter((p) => p.userId !== payload.userId)
          console.log("Participants after removal:", updatedParticipants)

          // Update expert status if expert left
          const wasExpert =
            payload.isHost ||
            payload.displayName?.toLowerCase().includes("expert") ||
            payload.displayName?.toLowerCase().includes("dr.") ||
            payload.displayName?.toLowerCase().includes("doctor")

          if (wasExpert) {
            setExpertJoined(false)
            setConnectionStatus("Expert disconnected - session will end soon")
            console.log("Expert left the session")

            // Show system message
            const leaveMessage = {
              id: Date.now(),
              sender: "System",
              text: `${getExpertDisplayName()} has left the session. The consultation will end shortly.`,
              timestamp: new Date().toLocaleTimeString(),
              isSystem: true,
            }

            // End session after short delay (5 seconds)
            setTimeout(() => {
              if (!sessionEnded) {
                endSessionAutomatically("Expert left the session")
              }
            }, 5000)
          } else if (updatedParticipants.length === 0) {
            setConnectionStatus("Waiting for expert to join...")
          }
          return updatedParticipants
        })
      })
      zoomClient.on("user-updated", (payload) => {
        console.log("User - User updated:", payload)
        setParticipants((prev) =>
          prev.map((p) =>
            p.userId === payload.userId
              ? {
                  ...p,
                  displayName: payload.displayName || p.displayName,
                  audio: payload.bAudioOn !== undefined ? payload.bAudioOn : p.audio,
                  video: payload.bVideoOn !== undefined ? payload.bVideoOn : p.video,
                  isHost: payload.isHost !== undefined ? payload.isHost : p.isHost,
                }
              : p,
          ),
        )
      })

      zoomClient.on("error", (error) => {
        console.error("User - Zoom SDK Error:", error)
        setError(`Zoom Error: ${error.message || "Unknown error"}`)
      })
    } catch (error) {
      console.error("Failed to initialize Zoom SDK for User:", error)
      throw error
    }
  }

  const notifyUserJoined = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/zoomVideo/user-joined`, // Back to 5070
        {
          sessionId, // Only send sessionId as expected by backend
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
            "Content-Type": "application/json",
          },
        },
      )
      console.log("✅ User join status notified to backend:", response.data)
    } catch (error) {
      console.error("❌ Failed to notify user join status:", error)
      if (error.response) {
        console.error("Response data:", error.response.data)
        console.error("Response status:", error.response.status)
        console.error("Response headers:", error.response.headers)
      } else if (error.request) {
        console.error("No response received:", error.request)
      } else {
        console.error("Error setting up request:", error.message)
      }
      // Don't throw error here as it's not critical for the session to continue
    }
  }

  const getSessionData = async (token) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/zoomVideo/user-session-details/${sessionId}`, // Back to 5070
        { headers: { Authorization: `Bearer ${token}` } },
      )

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch session data")
      }

      const session = response.data.session
      setSessionData(session)

      let durationMinutes = 1 // Default to 1 minute
      if (session && typeof session.duration === "string") {
        const match = session.duration.match(/\d+/) // Extract numbers from string
        if (match && match[0]) {
          const parsedDuration = Number.parseInt(match[0], 10)
          if (!isNaN(parsedDuration) && parsedDuration > 0) {
            durationMinutes = parsedDuration
          }
        }
      }

      setSessionDuration(durationMinutes)
      setTimeRemaining(durationMinutes * 60)
    } catch (error) {
      console.error("Error fetching user session data:", error)
      setSessionDuration(1) // Fallback to 1 minute on error
      setTimeRemaining(1 * 60) // Fallback to 1 minute on error
    }
  }

  const generateUserAuth = async (token) => {
    try {
      const authResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/zoomVideo/generate-user-video-token`,
        { meetingId, sessionId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      if (!authResponse.data.success) {
        throw new Error(authResponse.data.message || "Failed to authenticate with video service")
      }

      // Save firstName and lastName from response
      setAuthData({
        sessionName: String(authResponse.data.data.sessionName || ""),
        token: String(authResponse.data.data.token || ""),
        userIdentity: String(authResponse.data.data.userIdentity || ""),
        role: authResponse.data.data.role || 0,
        firstName: authResponse.data.data.firstName || "",
        lastName: authResponse.data.data.lastName || "",
      })
    } catch (error) {
      console.error("User video authentication error:", error)
      throw error
    }
  }

  const joinZoomSession = async () => {
    if (!client || !authData) {
      throw new Error("Zoom client not initialized or missing auth data")
    }
    try {
      setConnectionStatus("Joining Zoom session as User...")
      const userInfo = getUserInfo()
      const sessionName = String(authData.sessionName || "")
      const token = String(authData.token || "")
      const userName = userInfo.name
      const userId = userInfo.id
      // Join with persistent userId and displayName
      await client.join(sessionName, token, userName)

      const mediaStream = client.getMediaStream()
      setStream(mediaStream)

      const currentUserInfo = client.getCurrentUserInfo()
      console.log("Current user info:", currentUserInfo)

      const existingParticipants = client.getAllUser()
      console.log("Existing participants:", existingParticipants)

      if (existingParticipants && existingParticipants.length > 0) {
        const formattedParticipants = existingParticipants
          .filter((p) => p.userId !== currentUserInfo.userId)
          .map((participant) => ({
            userId: participant.userId,
            displayName: participant.displayName || "Unknown User",
            isHost: participant.isHost || false,
            video: participant.bVideoOn || false,
            audio: !participant.muted,
          }))

        setParticipants(formattedParticipants)

        const expertExists = formattedParticipants.some((p) => p.isHost)
        if (expertExists && !isSessionActive) {
          console.log("Expert already in session - awaiting timer sync")
          setConnectionStatus(`Expert connected - session starting (User)`)
        }
      }

      console.log("✅ User successfully joined Zoom session")
    } catch (error) {
      console.error("❌ User failed to join Zoom session:", error)
      throw error
    }
  }

  const startLocalVideo = async () => {
    try {
      setConnectionStatus("Starting session as User...")

      await joinZoomSession()
      await setupMedia()

      const systemMessage = {
        id: Date.now(),
        sender: "System",
        text: `Joined Zoom session as User. Waiting for expert to start the consultation.`,
        timestamp: new Date().toLocaleTimeString(),
        isSystem: true,
      }
    } catch (error) {
      console.error("User failed to start video session:", error)
      setError("Failed to start session: " + error.message)
    }
  }

  const setupMedia = async () => {
    try {
      if (!stream) {
        console.log("No media stream available")
        return
      }

      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const hasVideo = devices.some((device) => device.kind === "videoinput")
        const hasAudio = devices.some((device) => device.kind === "audioinput")

        if (!hasVideo || !hasAudio) {
          throw new Error(`Missing devices: ${!hasVideo ? "camera " : ""}${!hasAudio ? "microphone" : ""}`)
        }
      } catch (deviceError) {
        console.error("Failed to check media devices:", deviceError)
        setMediaError("Please ensure camera and microphone permissions are granted")
        return
      }

      try {
        await stream.startAudio()
        await stream.unmuteAudio()
        setIsAudioOn(true)
        setAudioJoined(true)
        console.log("✅ Audio started, audioJoined:", true)
      } catch (audioError) {
        setIsAudioOn(false)
        setAudioJoined(true)
        setMediaError(
          "Audio setup failed - microphone may not be available. Please check your device and permissions, then click the audio button to retry.",
        )
        console.error("Audio setup failed:", audioError)
      }

      if (localVideoRef.current) {
        try {
          await stream.startVideo()
          await new Promise((resolve) => setTimeout(resolve, 100))

          const userId = client.getCurrentUserInfo().userId
          const videoElement = await stream.attachVideo(
            userId,
            3, // Video quality
          )

          // Ensure the video absolutely fills the container
          const enforceVideoStyles = (video) => {
            if (!video) return;
            video.style.position = "absolute";
            video.style.top = "0";
            video.style.left = "0";
            video.style.width = "100%";
            video.style.height = "100%";
            video.style.minWidth = "100%";
            video.style.minHeight = "100%";
            video.style.objectFit = "cover";
            video.style.transform = "scaleX(-1)";
          };
          enforceVideoStyles(videoElement);
          // Observe for any changes and re-apply styles
          const observer = new MutationObserver(() => {
            enforceVideoStyles(videoElement);
          });
          observer.observe(videoElement, { attributes: true, attributeFilter: ['style', 'class'] });

          if (localVideoRef.current.parentNode) {
            localVideoRef.current.parentNode.replaceChild(videoElement, localVideoRef.current)
            localVideoRef.current = videoElement
          }

          setIsVideoOn(true)
          setLocalVideoElement(videoElement)
          console.log("✅ Video started")
        } catch (videoError) {
          console.error("Video setup failed:", videoError)
          setIsVideoOn(false)
          setMediaError("Video setup failed: " + videoError.message)
        }
      } else {
        console.error("No video element reference available")
        setMediaError("Failed to initialize video - no video element found")
      }
    } catch (error) {
      console.error("Media setup error:", error)
      setMediaError("Media setup failed: " + error.message)
    }
  }

  const toggleVideo = async () => {
    if (!stream) {
      console.error("No stream available")
      return
    }

    try {
      if (isVideoOn) {
        if (localVideoElement) {
          await stream.detachVideo(client.getCurrentUserInfo().userId)
        }
        await stream.stopVideo()
        setIsVideoOn(false)
      } else {
        await stream.startVideo()

        if (localVideoRef.current) {
          localVideoRef.current.autoplay = true
          localVideoRef.current.playsInline = true

          await new Promise((resolve) => setTimeout(resolve, 500))

          const videoElement = await stream.attachVideo(
            client.getCurrentUserInfo().userId,
            3, // Video quality
          )

          if (localVideoRef.current.parentNode) {
            localVideoRef.current.parentNode.replaceChild(videoElement, localVideoRef.current)
            localVideoRef.current = videoElement
          }

          setLocalVideoElement(videoElement)
        } else {
          throw new Error("Video element not found")
        }
        setIsVideoOn(true)
      }
    } catch (error) {
      console.error("Error toggling video:", error)
      setMediaError("Failed to toggle video: " + error.message)
    }
  }

  const toggleAudio = async () => {
    if (!stream || sessionEnded) return
    try {
      if (!audioJoined) {
        // Try to join audio again
        try {
          await stream.startAudio()
          await stream.unmuteAudio()
          setIsAudioOn(true)
          setAudioJoined(true)
          setMediaError(null)
          console.log("✅ Audio started (retry), audioJoined:", true)
          return
        } catch (audioError) {
          setIsAudioOn(false)
          setAudioJoined(true) // Allow retry
          setMediaError("Audio setup failed again - please check your device and permissions.")
          console.error("Audio setup failed (retry):", audioError)
          return
        }
      }
      if (isAudioOn) {
        await stream.muteAudio()
        setIsAudioOn(false)
        console.log("User audio muted")
      } else {
        await stream.unmuteAudio()
        setIsAudioOn(true)
        console.log("User audio unmuted")
      }
    } catch (error) {
      console.error("User failed to toggle audio:", error)
      setMediaError("Failed to toggle audio: " + (error?.reason || error?.message || "Unknown error"))
    }
  }

  useEffect(() => {
    const sessionTimeout = setTimeout(
      () => {
        if (isSessionActive && !sessionEnded) {
          console.log("Session duration expired - ending session")
          endSessionAutomatically("Session time completed")
        }
      },
      (sessionDuration || 1) * 60 * 1000,
    ) // Default to 1 minute

    return () => clearTimeout(sessionTimeout)
  }, [sessionDuration, isSessionActive, sessionEnded])

  const endSessionAutomatically = async (reason = "Session completed") => {
    // Prevent multiple calls
    if (sessionEnded) return

    console.log(`Ending user session: ${reason}`)

    // Clear timer immediately
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    setIsSessionActive(false)
    setSessionEnded(true)
    setConnectionStatus("Consultation completed")

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/zoomVideo/complete-user-session`,
        {
          sessionId,
          endTime: new Date().toISOString(),
          status: "completed",
          actualDuration: sessionDuration,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` } },
      )

      console.log("User session status updated successfully")
    } catch (error) {
      console.error("Failed to update user session status:", error)
    }

    // Call cleanup only after backend update attempt
    cleanup()

    setTimeout(() => {
      router.push("/userpanel/videocall")
    }, 5000)
  }

  const cleanup = async () => {
    try {
      // Clear all timers first
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }

      if (timerSyncInterval) {
        clearInterval(timerSyncInterval)
        setTimerSyncInterval(null)
      }

      if (stream) {
        if (isVideoOn) await stream.stopVideo()
        if (isAudioOn) await stream.stopAudio()
      }

      renderedVideos.current.forEach((element, userId) => {
        if (stream && client) {
          stream.detachVideo(element, userId)
        }
        element.remove()
      })
      renderedVideos.current.clear()

      if (client && isInSession) {
        await client.leave()
      }

      if (localVideoElement) {
        if (stream) {
          try {
            stream.detachVideo(client.getCurrentUserInfo().userId)
          } catch (error) {
            console.warn("Local video detach error:", error)
          }
        }
        localVideoElement.remove()
      }

      // Reset all state
      setClient(null)
      setStream(null)
      setIsInSession(false)
      setParticipants([])
      setLocalVideoElement(null)
      setAuthData(null)
      setSessionData(null)
      setIsLoading(true)
      setError(null)
      setSessionEnded(false)
      setIsSessionActive(false)
      setTimeRemaining(0)
      setSessionDuration(0)
      setSessionStartTime(null)
      setTimerStarted(false) // Reset timer started flag
      setExpertJoined(false) // Reset expert joined flag
      setWarningShown(false) // Reset warning flag
      setMediaError(null)
      setConnectionStatus("Disconnected")
    } catch (error) {
      console.error("Error during cleanup:", error)
    }
  }

  const getUserInfo = () => {
    if (authData && (authData.firstName || authData.lastName)) {
      const fullName = `${authData.firstName || ""} ${authData.lastName || ""}`.trim()
      return {
        id: getOrCreatePersistentUserId(sessionId),
        name: fullName || "Unknown User",
        email: "", // Add email if available
        role: "User",
      }
    }
    try {
      const token = localStorage.getItem("userToken")
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]))
        const firstName = String(payload.firstName || "").trim()
        const lastName = String(payload.lastName || "").trim()
        const fullName = `${firstName} ${lastName}`.trim() || "Unknown User"
        return {
          id: getOrCreatePersistentUserId(sessionId),
          name: fullName,
          email: String(payload.email || ""),
          role: "User",
        }
      }
    } catch (error) {
      console.error("User token parsing error:", error)
    }
    return {
      id: getOrCreatePersistentUserId(sessionId),
      name: "Unknown User",
      email: "",
      role: "User",
    }
  }

  const handleInitializationError = (error) => {
    let errorMessage = "Failed to initialize video call"

    if (error.response) {
      errorMessage = error.response.data.message || errorMessage
      if (error.response.status === 401) {
        errorMessage = "Authentication failed. Please log in again."
      } else if (error.response.status === 403) {
        errorMessage = "Not authorized for this session."
      } else if (error.response.status === 404) {
        errorMessage = "Session not found. Please ensure the expert has started the session first."
      }
    } else if (error.request) {
      errorMessage = "Network error. Please check your connection."
    } else {
      errorMessage = error.message || errorMessage
    }

    setError(errorMessage)
    setIsLoading(false)
  }

  // Helper to get expert display name from sessionData (preferred) or authData
  const getExpertDisplayName = () => {
    if (sessionData && (sessionData.expertFirstName || sessionData.expertLastName)) {
      return `${sessionData.expertFirstName || ""} ${sessionData.expertLastName || ""}`.trim() || "Expert"
    }
    if (authData && (authData.firstName || authData.lastName)) {
      return `${authData.firstName || ""} ${authData.lastName || ""}`.trim() || "Expert"
    }
    return "Expert"
  }

  // Update the startTimer function
  const startTimer = () => {
    // This function should effectively be dead code for the user panel
    console.log("User: startTimer called (should only be triggered by expert sync)", {
      timerStarted,
      isSessionActive,
      timeRemaining,
      sessionDuration,
    })

    if (timerStarted) {
      console.log("User: Timer already started, ignoring")
      return
    }

    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    setTimerStarted(true)
    setIsSessionActive(true)

    if (timeRemaining <= 0) {
      const duration = sessionDuration || 1 // fallback to 1 minute
      setTimeRemaining(duration * 60)
      console.log("User: Set initial time remaining:", duration * 60)
    }

    setSessionStartTime(new Date())
    console.log("User: Timer started successfully")
  }

  if (isLoading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center ${darkMode ? 'dark' : ''}`}>
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-12 max-w-md w-full mx-4">
          <div className="text-center space-y-6">
            {/* Professional Loading Spinner */}
            <div className="relative mx-auto w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-blue-600"></div>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-slate-900">Initializing Video Session</h2>
              <p className="text-slate-600 text-sm">{connectionStatus}</p>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>User Session</span>
            </div>

            <div className="pt-4 border-t border-slate-100">
              {/* Logo: show black in light mode, white in dark mode */}
              <Image
                src="/Shourk_logo.png"
                alt="Shourk Logo"
                width={120}
                height={60}
                className="object-contain block dark:hidden"
              />
              <Image
                src="/Shourk_logo - Edited.png"
                alt="Shourk Logo"
                width={120}
                height={60}
                className="object-contain hidden dark:block"
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center ${darkMode ? 'dark' : ''}`}>
        <div className="bg-white rounded-2xl shadow-xl border border-red-200 p-8 max-w-lg w-full mx-4">
          <div className="text-center space-y-6">
            {/* Error Icon */}
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.19 2.5 1.732 2.5z"
                />
              </svg>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-slate-900">Session Error</h2>
              <p className="text-slate-600 leading-relaxed">{error}</p>

              {mediaError && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-amber-800 text-sm">{mediaError}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push("/userpanel/videocall")}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                Go Back
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100">
              {/* Logo: show black in light mode, white in dark mode */}
              <Image
                src="/Shourk_logo.png"
                alt="Shourk Logo"
                width={120}
                height={60}
                className="object-contain block dark:hidden"
              />
              <Image
                src="/Shourk_logo - Edited.png"
                alt="Shourk Logo"
                width={120}
                height={60}
                className="object-contain hidden dark:block"
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Session Ended State
  if (sessionEnded) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center ${darkMode ? 'dark' : ''}`}>
        <div className="bg-white rounded-2xl shadow-xl border border-green-200 p-12 max-w-md w-full mx-4">
          <div className="text-center space-y-6">
            {/* Success Icon */}
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">Session Complete</h2>

              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-slate-700 font-medium">
                  Your {sessionDuration}-minute consultation has ended successfully
                </p>
              </div>

              <button
                onClick={() => router.push("/userpanel/videocall")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors duration-200"
              >
                Return to Dashboard
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100">
              {/* Logo: show black in light mode, white in dark mode */}
              <Image
                src="/Shourk_logo.png"
                alt="Shourk Logo"
                width={120}
                height={60}
                className="object-contain block dark:hidden"
              />
              <Image
                src="/Shourk_logo - Edited.png"
                alt="Shourk Logo"
                width={120}
                height={60}
                className="object-contain hidden dark:block"
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col ${darkMode ? 'dark' : ''}`}>
      {/* Professional Header */}
      <header className="bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Left section */}
            <div className="flex items-center gap-4">
              {/* Logo: show black in light mode, white in dark mode */}
              <Image
                src="/Shourk_logo.png"
                alt="Shourk Logo"
                width={120}
                height={60}
                className="object-contain block dark:hidden"
              />
              <Image
                src="/Shourk_logo - Edited.png"
                alt="Shourk Logo"
                width={120}
                height={60}
                className="object-contain hidden dark:block"
              />
              <div className="border-l border-slate-200 pl-4">
                <p className="text-slate-600 text-sm font-medium">Video Consultation</p>
                <p className="text-blue-600 text-sm font-semibold">User Portal</p>
              </div>
            </div>

            {/* Connection status */}
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 rounded-lg px-4 py-2 border border-slate-200 dark:border-slate-700">
              <div className={`w-2 h-2 rounded-full ${isInSession ? "bg-green-500" : "bg-amber-500"}`}></div>
              <span className="text-sm text-slate-700 font-medium">{connectionStatus}</span>
            </div>

            {/* User badge */}
            <div className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">User</div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-4">
            {/* Session details */}
            <div className="text-right">
              <div className="text-slate-700 text-sm font-medium">
                Meeting ID: <span className="font-mono text-slate-600">{meetingId}</span>
              </div>
              <div className="text-slate-500 text-xs mt-1 flex items-center justify-end gap-2">
                <span>
                  {participants.length + 1} participant{participants.length > 0 ? "s" : ""}
                </span>
                {expertJoined && <span className="text-green-600 font-medium">• Expert Connected</span>}
              </div>
            </div>
            {/* Dark mode toggle */}
            {/* <button
              onClick={() => setDarkMode((d) => !d)}
              className="ml-4 p-2 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? (
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.95l-.71.71M21 12h-1M4 12H3m16.66 5.66l-.71-.71M4.05 4.05l-.71-.71" /></svg>
              ) : (
                <svg className="w-6 h-6 text-slate-800 dark:text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" /></svg>
              )}
            </button> */}
          </div>
        </div>
      </header>

      {/* Warning Banners */}
      {mediaError && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                  </svg>
                </div>
                <span className="text-amber-800 font-medium text-sm">{mediaError}</span>
              </div>
              <button
                onClick={() => setMediaError(null)}
                className="text-amber-600 hover:text-amber-800 transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Time Warning Banner */}
      {timeRemaining <= 120 && timeRemaining > 0 && (
        <div
          className={`${
            timeRemaining <= 60 ? "bg-red-50 border-b border-red-200" : "bg-amber-50 border-b border-amber-200"
          }`}
        >
          <div className="px-6 py-3">
            <div className="flex items-center justify-center gap-3">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  timeRemaining <= 60 ? "bg-red-500" : "bg-amber-500"
                }`}
              >
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span className={`font-semibold text-sm ${timeRemaining <= 60 ? "text-red-800" : "text-amber-800"}`}>
                {timeRemaining <= 60 ? "Final Minute!" : "2 Minutes Remaining"} - Session ending soon
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-6">
        {!isInSession ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-lg">
              {/* Pre-Join Interface */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-12">
                <div className="mb-8">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Ready to Connect</h2>

                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Join your <span className="font-semibold text-blue-600">{sessionDuration}-minute</span> consultation
                    with the expert
                  </p>

                  <button
                    onClick={startLocalVideo}
                    className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Join Consultation
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-[calc(100vh-200px)]">
            {/* Video Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
              {/* Local Video (User) */}
              <div className="session-call-container relative w-full aspect-[4/3] min-h-[400px] bg-slate-900 rounded-xl overflow-hidden shadow-lg">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  style={{ display: isVideoOn ? "block" : "none" }}
                />

                {!isVideoOn && (
                  <div className="absolute inset-0 bg-slate-700 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-slate-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <p className="text-white font-semibold text-lg mb-1">You</p>
                      <p className="text-slate-300 text-sm">Camera is off</p>
                    </div>
                  </div>
                )}

                {/* Video Overlay */}
                <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium flex items-center gap-3">
                  <span>You - User</span>
                  <div className="flex items-center gap-1">
                    {isAudioOn ? (
                      <div className="flex items-center gap-1 text-green-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                          />
                        </svg>
                        <span className="text-xs">Live</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                          />
                        </svg>
                        <span className="text-xs">Muted</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* User badge */}
                <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-semibold">
                  You
                </div>
              </div>

              {/* Participants */}
              {participants.map((participant) => (
                <ParticipantVideo key={participant.userId} participant={participant} stream={stream} />
              ))}

              {/* Waiting for Expert */}
              {participants.length === 0 && (
                <div className="bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex items-center justify-center">
                  <div className="text-center p-12">
                    <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <p className="text-slate-700 dark:text-slate-200 font-semibold text-lg mb-2">Waiting for Expert</p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                      The consultation will begin once the expert connects to the session
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-200"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-400"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Professional Bottom Controls */}
      {isInSession && !sessionEnded && (
        <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 px-6 py-4">
          <div className="flex items-center justify-center gap-4">
            {/* Audio Toggle */}
            <button
              onClick={toggleAudio}
              className={`p-3 rounded-lg transition-all duration-200 ${
                isAudioOn ? "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200" : "bg-red-500 hover:bg-red-600 text-white"
              }`}
              title={isAudioOn ? "Mute Microphone" : "Unmute Microphone"}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isAudioOn ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                  />
                )}
              </svg>
            </button>

            {/* Video Toggle */}
            <button
              onClick={toggleVideo}
              className={`p-3 rounded-lg transition-all duration-200 ${
                isVideoOn ? "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200" : "bg-red-500 hover:bg-red-600 text-white"
              }`}
              title={isVideoOn ? "Stop Camera" : "Start Camera"}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isVideoOn ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                ) : (
                  <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
                )}
              </svg>
            </button>
          </div>
        </footer>
      )}
    </div>
  )
}

// Professional ParticipantVideo Component
const ParticipantVideo = ({ participant, stream }) => {
  const videoContainerRef = useRef(null)
  const [hasVideo, setHasVideo] = useState(participant.video || false)
  const [participantLeft, setParticipantLeft] = useState(false)
  const videoElementRef = useRef(null)

  useEffect(() => {
    setHasVideo(participant.video)
  }, [participant.video])

  useEffect(() => {
    let cancelled = false
    const attachVideo = async () => {
      if (!stream || !participant.userId || participantLeft) return
      try {
        // Detach and remove any existing video element
        if (
          videoElementRef.current &&
          videoContainerRef.current &&
          videoElementRef.current.parentNode === videoContainerRef.current
        ) {
          try {
            stream.detachVideo(participant.userId)
          } catch (err) {}
          videoContainerRef.current.removeChild(videoElementRef.current)
          videoElementRef.current = null
        }
        // Attach new video if video is on
        if (hasVideo) {
          const videoElement = await stream.attachVideo(participant.userId, 3)
          if (videoContainerRef.current && !cancelled) {
            videoContainerRef.current.appendChild(videoElement)
            videoElement.style.width = "100%"
            videoElement.style.height = "100%"
            videoElement.style.objectFit = "cover"
            videoElement.style.transform = "scaleX(-1)" // Mirror the local webcam
            videoElementRef.current = videoElement
          }
        } else {
          videoElementRef.current = null
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Error handling video for participant", participant.userId, err)
          setParticipantLeft(true)
        }
      }
    }
    attachVideo()
    return () => {
      cancelled = true
      // Detach and remove video element if present
      if (stream && participant.userId && videoElementRef.current) {
        try {
          stream.detachVideo(participant.userId)
        } catch (err) {}
        if (videoContainerRef.current && videoElementRef.current.parentNode === videoContainerRef.current) {
          videoContainerRef.current.removeChild(videoElementRef.current)
        }
        videoElementRef.current = null
      }
    }
  }, [hasVideo, stream, participant.userId, participantLeft])

  // Use the same role labeling as in SessionCall.jsx
  const roleLabel = participant.isHost ? "Expert" : "User"

  return (
    <div className="relative bg-slate-900 rounded-xl overflow-hidden shadow-lg">
      <div ref={videoContainerRef} className="video-container w-full h-full" />

      {(!hasVideo || participantLeft) && (
        <div className="absolute inset-0 bg-slate-700 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-slate-600 rounded-full flex items-center justify-center mb-4 mx-auto">
              <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <p className="text-white font-semibold text-lg mb-1">{participant.displayName}</p>
            <p className="text-slate-300 text-sm">{participantLeft ? "Has left the session" : "Camera is off"}</p>
          </div>
        </div>
      )}

      {/* Video Overlay */}
      <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium flex items-center gap-3">
        <span>
          {participant.displayName} - {roleLabel}
        </span>
        <div className="flex items-center gap-1">
          {participant.audio ? (
            <div className="flex items-center gap-1 text-green-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
              <span className="text-xs">Live</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-red-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                />
              </svg>
              <span className="text-xs">Muted</span>
            </div>
          )}
        </div>
      </div>

      <div
        className={`absolute top-4 left-4 ${participant.isHost ? "bg-indigo-600" : "bg-blue-600"} text-white px-3 py-1 rounded-lg text-sm font-semibold`}
      >
        {roleLabel === "Expert" ? "Expert" : "User"}
      </div>
    </div>
  )
}

export default UserSessionCall
