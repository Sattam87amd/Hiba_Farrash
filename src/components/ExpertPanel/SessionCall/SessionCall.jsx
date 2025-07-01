"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import axios from "axios"

const getOrCreatePersistentUserId = (sessionId) => {
  const key = `zoomUserId_${sessionId}`
  let userId = localStorage.getItem(key)
  if (!userId) {
    userId = `expert_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem(key, userId)
  }
  return userId
}

const SessionCall = () => {
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
  const [isHostExpert, setIsHostExpert] = useState(true)

  // Media state
  const [isVideoOn, setIsVideoOn] = useState(false)
  const [isAudioOn, setIsAudioOn] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState("Connecting...")
  const [mediaError, setMediaError] = useState(null)
  const [audioJoined, setAudioJoined] = useState(false)

  // Expert-specific state
  const [userJoined, setUserJoined] = useState(false)
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
  const renderedVideos = useRef(new Map())

  // Effect to set isHostExpert based on sessionData
  useEffect(() => {
    if (sessionData?.session && sessionData.session.consultingExpertID && sessionData.session.expertId) {
      let expertIdFromToken = null
      try {
        const token = localStorage.getItem("expertToken")
        if (token) {
          const payload = JSON.parse(atob(token.split(".")[1]))
          expertIdFromToken = String(payload._id || payload.id || payload.userId || "")
        }
      } catch (e) {
        // Optionally keep this error log for debugging token issues
        // console.error('Failed to parse expert token for ID:', e);
      }
      const consultingExpertID = String(sessionData.session.consultingExpertID)
      const expertID = String(sessionData.session.expertId)
      if (expertIdFromToken === consultingExpertID) {
        setIsHostExpert(true)
      } else if (expertIdFromToken === expertID) {
        setIsHostExpert(false)
      } else {
        setIsHostExpert(false)
      }
    }
  }, [sessionData])

  useEffect(() => {
    if (!meetingId || !sessionId) {
      setError("Meeting ID and Session ID are required")
      setIsLoading(false)
      return
    }

    initializeExpertZoomVideoCall()
    return cleanup
  }, [meetingId, sessionId])

  // Timer effect
  useEffect(() => {
    if (isSessionActive && timeRemaining > 0 && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          const newTime = prev - 1

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
            clearInterval(timerRef.current)
            timerRef.current = null
            endSessionAutomatically("Session duration completed")
            return 0
          }
          return newTime
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isSessionActive, warningShown])

  // Add effect to ensure session ends when time is up
  useEffect(() => {
    if (timeRemaining <= 0 && isSessionActive) {
      endSessionAutomatically("Session duration completed")
    }
  }, [timeRemaining, isSessionActive])

  // Expert joining and timer control effect
  useEffect(() => {
    if (client) {
      const handleUserAdded = async (user) => {
        console.log("User joined:", user)
        if (user && !user.isHost) {
          setUserJoined(true)
        }
      }

      const handleUserRemoved = (user) => {
        console.log("User left:", user)
        if (user && !user.isHost) {
          setUserJoined(false)
        }
      }

      client.on("user-added", handleUserAdded)
      client.on("user-removed", handleUserRemoved)

      return () => {
        client.off("user-added", handleUserAdded)
        client.off("user-removed", handleUserRemoved)
      }
    }
  }, [client, timerStarted, isSessionActive])

  // Add this effect after the existing useEffects
  useEffect(() => {
    if (client && isInSession) {
      // Sync participants with current Zoom session state
      const syncParticipants = () => {
        try {
          const currentUsers = client.getAllUser()
          const currentUserInfo = client.getCurrentUserInfo()

          console.log("Expert - Sync Participants: Current user info:", currentUserInfo) // Added log
          console.log("Expert - Sync Participants: All users from SDK:", currentUsers) // Added log

          if (currentUsers && currentUsers.length > 0) {
            // More robust filtering to exclude current user
            const filteredParticipants = currentUsers
              .filter((p) => {
                // Multiple ways to check if this is not the current user
                const isNotCurrentUser =
                  p.userId !== currentUserInfo.userId &&
                  p.userId !== currentUserInfo.id &&
                  p.userIdentity !== currentUserInfo.userIdentity

                console.log(
                  `Expert - Sync Participants: User ${p.userId} (${p.displayName || p.userIdentity}) isNotCurrentUser = ${isNotCurrentUser}`,
                ) // Added log
                return isNotCurrentUser
              })
              .map((participant) => {
                let displayName = participant.displayName || participant.userIdentity || "Unknown User"
                const isUser =
                  !participant.isHost &&
                  !displayName.toLowerCase().includes("expert") &&
                  !displayName.toLowerCase().includes("dr.") &&
                  !displayName.toLowerCase().includes("doctor")
                if (isUser) {
                  displayName = getUserDisplayName()
                }
                return {
                  userId: participant.userId,
                  displayName,
                  isHost: participant.isHost || false,
                  video: participant.bVideoOn || false,
                  audio: !participant.muted && participant.bAudioOn,
                }
              })

            console.log("Expert - Sync Participants: Filtered participants:", filteredParticipants) // Added log
            setParticipants(filteredParticipants)

            // Check if user is present
            const hasUser = filteredParticipants.some((p) => {
              const isUser =
                !p.isHost &&
                !p.displayName?.toLowerCase().includes("expert") &&
                !p.displayName?.toLowerCase().includes("dr.") &&
                !p.displayName?.toLowerCase().includes("doctor")
              console.log(`Expert - Sync Participants: Checking if ${p.displayName} is user: ${isUser}`) // Added log
              return isUser
            })

            setUserJoined(hasUser)

            if (hasUser && !isSessionActive) {
              setConnectionStatus("User connected - session starting (Expert)")
            } else if (!hasUser && filteredParticipants.length === 0) {
              setConnectionStatus("Waiting for user to join...")
            } else if (!hasUser && filteredParticipants.length > 0) {
              setConnectionStatus("Other participants connected - waiting for user...")
            }
          } else {
            // No other participants
            setParticipants([])
            setUserJoined(false)
            setConnectionStatus("Waiting for user to join...")
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

  const initializeExpertZoomVideoCall = async () => {
    try {
      setConnectionStatus("Authenticating as Expert...")

      const token = localStorage.getItem("expertToken")
      if (!token) {
        throw new Error("Expert authentication token not found. Please log in again.")
      }

      await getSessionData(token)
      const authResponseData = await generateExpertAuth(token) // Capture the returned auth data

      // console.log('authData after generation:', authData); // Remove or keep for debugging isHostExpert state
      // console.log('authData.role:', authData?.role); // Remove or keep for debugging isHostExpert state

      setConnectionStatus("Initializing Zoom Video SDK...")
      await initializeZoomSDK(authResponseData) // Use the immediately available authResponseData

      setIsLoading(false)
      setConnectionStatus("Ready to join as Expert")
    } catch (error) {
      console.error("Expert video call initialization error:", error)
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

      console.log("Initializing Zoom SDK for Expert...")
      await zoomClient.init("en-US", "Global", { patchJsMedia: true })
      console.log("✅ Zoom SDK initialized successfully for Expert")

      setClient(zoomClient)

      zoomClient.on("connection-change", (payload) => {
        console.log("Expert - Connection status changed:", payload.state)
        if (payload.state === "Connected") {
          setIsInSession(true)
          setConnectionStatus("Connected to Zoom (Expert)")
          notifyExpertJoined()
        } else if (payload.state === "Disconnected") {
          setIsInSession(false)
          setConnectionStatus("Disconnected")
        } else if (payload.state === "Reconnecting") {
          setConnectionStatus("Reconnecting...")
        }
      })

      zoomClient.on("user-added", (payload) => {
        console.log("Expert - User added payload:", payload) // Enhanced log
        const currentUserInfo = client?.getCurrentUserInfo()
        console.log("Expert - Current user info (at user-added):", currentUserInfo) // Enhanced log

        // Check if the added user is the current expert themselves using userId and id
        if (currentUserInfo && (payload.userId === currentUserInfo.userId || payload.userId === currentUserInfo.id)) {
          console.log("Expert - Skipping self (current expert) in user-added event, User ID matches current user.")
          return
        }

        const newParticipant = {
          userId: payload.userId,
          displayName: payload.displayName || payload.userIdentity || "Unknown User",
          isHost: payload.isHost || false,
          video: payload.bVideoOn || false,
          audio: payload.bAudioOn || false,
        }

        // Ensure this is a genuine 'user' joining, not another expert or system participant
        const isGenuineUser =
          !newParticipant.isHost &&
          !newParticipant.displayName?.toLowerCase().includes("expert") &&
          !newParticipant.displayName?.toLowerCase().includes("dr.") &&
          !newParticipant.displayName?.toLowerCase().includes("doctor") &&
          newParticipant.displayName !== "Unknown User" && // Added condition
          newParticipant.userIdentity !== "Unknown User" // Added condition

        console.log(`Expert - Processed participant: ${newParticipant.displayName}, isGenuineUser: ${isGenuineUser}`)

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

        // The timer should only start if a genuine user is detected AND the session is not yet active.
        // Rely on syncParticipants to update userJoined accurately.
        if (isGenuineUser && !isSessionActive) {
          setUserJoined(true) // Ensure userJoined state is set based on this event
          console.log("Expert - Confirmed genuine user, and session not active. Setting userJoined state.")
          setConnectionStatus("User connected - session starting (Expert)")
        }
      })

      zoomClient.on("user-removed", (payload) => {
        console.log("Expert - User left:", payload)

        // Update participants state
        setParticipants((prev) => {
          const updatedParticipants = prev.filter((p) => p.userId !== payload.userId)
          console.log("Participants after removal:", updatedParticipants)

          // Update user status if user left
          const wasUser =
            !payload.isHost &&
            !payload.displayName?.toLowerCase().includes("expert") &&
            !payload.displayName?.toLowerCase().includes("dr.") &&
            !payload.displayName?.toLowerCase().includes("doctor")

          // Only end session if user was previously joined
          if (wasUser && userJoined) {
            setUserJoined(false)
            setConnectionStatus("User disconnected - session will end soon")
            console.log("User left the session")

            // Show system message
            const leaveMessage = {
              id: Date.now(),
              sender: "System",
              text: `${getUserDisplayName()} has left the session. The consultation will end shortly.`,
              timestamp: new Date().toLocaleTimeString(),
              isSystem: true,
            }

            // End session after short delay (5 seconds)
            setTimeout(() => {
              if (!sessionEnded) {
                endSessionAutomatically("User left the session")
              }
            }, 5000)
          } else if (updatedParticipants.length === 0) {
            setConnectionStatus("Waiting for user to join...")
          }
          return updatedParticipants
        })
      })

      zoomClient.on("user-updated", (payload) => {
        console.log("Expert - User updated:", payload)
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
        console.error("Expert - Zoom SDK Error:", error)
        setError(`Zoom Error: ${error.message || "Unknown error"}`)
      })
    } catch (error) {
      console.error("Failed to initialize Zoom SDK for Expert:", error)
      throw error
    }
  }

  const notifyExpertJoined = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/zoomVideo/expert-joined`,
        {
          sessionId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("expertToken")}`,
            "Content-Type": "application/json",
          },
        },
      )
      console.log("✅ Expert join status notified to backend:", response.data)
    } catch (error) {
      console.error("❌ Failed to notify expert join status:", error)
      if (error.response) {
        console.error("Response data:", error.response.data)
        console.error("Response status:", error.response.status)
        console.error("Response headers:", error.response.headers)
      } else if (error.request) {
        console.error("No response received:", error.request)
      } else {
        console.error("Error setting up request:", error.message)
      }
    }
  }

  const getSessionData = async (token) => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_PROD_API_URL}/api/zoomVideo/get-session/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = response.data
      console.log("Session data from backend (raw):", data)
      console.log("data.session.duration (raw):", data.session?.duration)
      console.log("data.session.isExpertToExpert (raw):", data.session?.isExpertToExpert)

      let durationMinutes = 1 // Default to 1 minute
      if (data.session && data.session.duration) {
        // Handle both string and number formats
        const match = data.session.duration.match(/(\d+)\s*(?:minutes|min)?/i)
        if (match && match[1]) {
          const parsedDuration = Number.parseInt(match[1], 10)
          if (!isNaN(parsedDuration) && parsedDuration > 0) {
            durationMinutes = parsedDuration
          }
        } else if (typeof data.session.duration === "number") {
          durationMinutes = data.session.duration
        }
      }

      // Check if this is an expert-to-expert session and set isHostExpert accordingly
      console.log("getSessionData - data.session?.sessionType:", data.session?.sessionType)
      const isExpertToExpert = data.session?.sessionType === "expert-to-expert"
      console.log("getSessionData - computed isExpertToExpert:", isExpertToExpert)
      console.log("getSessionData - value to be passed to setIsHostExpert:", !isExpertToExpert)

      setSessionDuration(durationMinutes)
      setTimeRemaining(durationMinutes * 60)

      setSessionData(data)
      console.log("Current isHostExpert state AFTER setSessionData (still might be stale):", isHostExpert)
      return data
    } catch (error) {
      console.error("Error fetching expert session data:", error)
      setSessionDuration(1) // Fallback to 1 minute on error
      setTimeRemaining(1 * 60) // Fallback to 1 minute on error
    }
  }

  const generateExpertAuth = async (token) => {
    try {
      const authResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/zoomVideo/generate-expert-video-token`,
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

      console.log("Raw authResponse from axios:", authResponse)
      console.log("Raw authResponse.data from backend:", authResponse.data)
      console.log("Raw authResponse.data.data from backend:", authResponse.data.data)

      setAuthData({
        sessionName: String(authResponse.data.data.sessionName || ""),
        token: String(authResponse.data.data.token || ""),
        userIdentity: String(authResponse.data.data.userIdentity || ""),
        role: authResponse.data.data.role || 1,
        firstName: String(authResponse.data.data.firstName || ""),
        lastName: String(authResponse.data.data.lastName || ""),
      })

      return authResponse.data.data // Return the data directly
    } catch (error) {
      console.error("Expert video authentication error:", error)
      // More detailed error logging
      if (error.response) {
        console.error("Auth Response error data:", error.response.data)
        console.error("Auth Response error status:", error.response.status)
      } else if (error.request) {
        console.error("Auth No response received:", error.request)
      } else {
        console.error("Auth Error setting up request:", error.message)
      }
      setAuthData(null) // Explicitly set to null on error
      throw error
    }
  }

  const joinZoomSession = async () => {
    if (!client || !authData || isInSession) {
      return
    }

    try {
      setConnectionStatus("Joining Zoom session as Expert...")

      const expertInfo = getExpertInfo()
      const sessionName = String(authData.sessionName || "")
      const token = String(authData.token || "")
      const expertName = String(expertInfo.name || "Dr. Expert")

      await client.join(sessionName, token, expertName) // Only pass 3 params, do not pass userId

      const mediaStream = client.getMediaStream()
      setStream(mediaStream)

      const existingParticipants = client.getAllUser()
      if (existingParticipants && existingParticipants.length > 0) {
        const formattedParticipants = existingParticipants
          .filter((p) => p.userId !== client.getCurrentUserInfo().userId)
          .map((participant) => ({
            userId: participant.userId,
            displayName: participant.displayName || "User",
            isHost: participant.isHost || false,
            video: participant.bVideoOn || false,
            audio: !participant.muted,
          }))
        setParticipants(formattedParticipants)
      }
      console.log(
        "Expert successfully joined Zoom session. sessionDuration:",
        sessionDuration,
        "timeRemaining:",
        timeRemaining,
      )
    } catch (error) {
      console.error("❌ Expert failed to join Zoom session:", error)
      throw error
    }
  }

  const startLocalVideo = async () => {
    try {
      setConnectionStatus("Starting session as Expert...")

      await joinZoomSession()
      await startSession() // Notify backend that session has started
      await setupMedia()

      const systemMessage = {
        id: Date.now(),
        sender: "System",
        text: `Joined Zoom session as Expert. Waiting for user to join the consultation.`,
        timestamp: new Date().toLocaleTimeString(),
        isSystem: true,
      }
    } catch (error) {
      console.error("Expert failed to start video session:", error)
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
          const videoElement = await stream.attachVideo(userId, 3)

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

  const startSession = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/zoomVideo/start-session`,
        { sessionId, meetingId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("expertToken")}` } },
      )

      const systemMessage = {
        id: Date.now(),
        sender: "System",
        text: `Expert session started using Zoom Video SDK. Duration: ${sessionDuration} minutes. Waiting for patient to join.`,
        timestamp: new Date().toLocaleTimeString(),
        isSystem: true,
      }
    } catch (error) {
      console.error("Expert failed to start session in backend:", error)
      throw error
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

          const videoElement = await stream.attachVideo(client.getCurrentUserInfo().userId, 3)

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
          setAudioJoined(true)
          setMediaError("Audio setup failed again - please check your device and permissions.")
          console.error("Audio setup failed (retry):", audioError)
          return
        }
      }
      if (isAudioOn) {
        await stream.muteAudio()
        setIsAudioOn(false)
        console.log("Expert audio muted")
      } else {
        await stream.unmuteAudio()
        setIsAudioOn(true)
        console.log("Expert audio unmuted")
      }
    } catch (error) {
      console.error("Expert failed to toggle audio:", error)
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
    )

    return () => clearTimeout(sessionTimeout)
  }, [sessionDuration, isSessionActive, sessionEnded])

  const endSessionAutomatically = async (reason = "Session completed") => {
    if (sessionEnded) return

    try {
      // Clear timer if it's still running
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }

      setIsSessionActive(false)
      setSessionEnded(true)
      setConnectionStatus("Consultation completed")

      // Update session status in backend
      await axios.put(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/zoomVideo/complete-user-session`,
        {
          sessionId,
          endTime: new Date().toISOString(),
          status: "completed",
          actualDuration: sessionDuration,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("expertToken")}`,
          },
        },
      )

      // Clean up video session
      cleanup()

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/expertpanel/videocall")
      }, 5000)
    } catch (error) {
      console.error("Failed to end session:", error)
      // Still attempt cleanup and redirect even if backend update fails
      cleanup()
      setTimeout(() => {
        router.push("/expertpanel/videocall")
      }, 5000)
    }
  }

  const cleanup = async () => {
    try {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
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
      setTimerStarted(false)
      setUserJoined(false)
      setWarningShown(false)
      setMediaError(null)
      setConnectionStatus("Disconnected")
    } catch (error) {
      console.error("Error during cleanup:", error)
    }
  }

  const getExpertInfo = () => {
    if (authData && (authData.firstName || authData.lastName)) {
      const fullName = `${authData.firstName || ""} ${authData.lastName || ""}`.trim()
      return {
        id: getOrCreatePersistentUserId(sessionId),
        name: fullName || "Expert",
        email: "",
        role: "Expert",
      }
    }
    try {
      const token = localStorage.getItem("expertToken")
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]))
        const firstName = String(payload.firstName || "").trim()
        const lastName = String(payload.lastName || "").trim()
        const fullName = `${firstName} ${lastName}`.trim() || "Expert"
        return {
          id: getOrCreatePersistentUserId(sessionId),
          name: fullName,
          email: String(payload.email || ""),
          role: "Expert",
        }
      }
    } catch (error) {
      console.error("Expert token parsing error:", error)
    }
    return {
      id: getOrCreatePersistentUserId(sessionId),
      name: "Expert",
      email: "",
      role: "Expert",
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
        errorMessage = "Session not found. Please check the session details."
      }
    } else if (error.request) {
      errorMessage = "Network error. Please check your connection."
    } else {
      errorMessage = error.message || errorMessage
    }

    setError(errorMessage)
    setIsLoading(false)
  }

  const getUserDisplayName = () => {
    if (sessionData && (sessionData.userFirstName || sessionData.userLastName)) {
      return `${sessionData.userFirstName || ""} ${sessionData.userLastName || ""}`.trim() || "User"
    }
    return "User"
  }

  const startTimer = () => {
    console.log("startTimer called", {
      timerStarted,
      isSessionActive,
      timeRemaining,
      sessionDuration,
    })

    if (timerStarted) {
      console.log("Timer already started, ignoring")
      return
    }

    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    setTimerStarted(true)
    setIsSessionActive(true)

    if (timeRemaining <= 0) {
      const duration = sessionDuration || 1
      setTimeRemaining(duration * 60)
      console.log("Set initial time remaining:", duration * 60)
    }

    setSessionStartTime(new Date())
    console.log("Timer started successfully")

    // Sync timer with user
    if (client && stream) {
      try {
        const timerData = {
          timeRemaining: timeRemaining > 0 ? timeRemaining : (sessionDuration || 1) * 60,
          sessionStartTime: new Date().toISOString(),
          sessionDuration: sessionDuration || 1,
        }

        client.sendCommand("sync-timer", timerData)
        console.log("Timer sync command sent to user:", timerData)
      } catch (error) {
        console.error("Failed to sync timer with user:", error)
      }
    }
  }

  // New useEffect to start the timer reliably when a user joins
  useEffect(() => {
    if (isInSession && userJoined && !isSessionActive && !timerStarted) {
      console.log("Expert - Both expert and user are in session, and timer not active. Initiating timer.")
      setConnectionStatus("User connected - session starting (Expert)")
      startTimer()
    }
  }, [isInSession, userJoined, isSessionActive, timerStarted])

  if (isLoading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center ${darkMode ? 'dark' : ''}`}>
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-12 max-w-md w-full mx-4">
          <div className="text-center space-y-6">
            {/* Professional Loading Spinner */}
            <div className="relative mx-auto w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-700"></div>
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-indigo-600"></div>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Setting Up Expert Portal</h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm">{connectionStatus}</p>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              <span>Expert Session</span>
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
              <p className="text-xs text-slate-400 mt-2">Powered by Zoom Video SDK</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center ${darkMode ? 'dark' : ''}`}>
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-red-200 dark:border-red-700 p-8 max-w-lg w-full mx-4">
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
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Expert Portal Error</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{error}</p>

              {mediaError && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-amber-800 text-sm">{mediaError}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                Retry Connection
              </button>
              <button
                onClick={() => router.push("/expertpanel/videocall")}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                Go Back
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Image src="/Shourk_logo.png" alt="Shourk Logo" width={100} height={50} className="mx-auto opacity-50" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (sessionEnded) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center ${darkMode ? 'dark' : ''}`}>
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-green-200 dark:border-green-700 p-12 max-w-md w-full mx-4">
          <div className="text-center space-y-6">
            {/* Success Icon */}
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Consultation Completed</h2>

              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-2">
                <p className="text-slate-700 dark:text-slate-200 font-medium">
                  Your {sessionDuration}-minute expert consultation has ended successfully.
                </p>
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  Session summary and recording will be available in your expert dashboard
                </p>
              </div>

              <button
                onClick={() => router.push("/expertpanel/videocall")}
                className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-8 py-4 rounded-lg font-semibold transition-colors duration-200"
              >
                Return to Expert Dashboard
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Image src="/Shourk_logo.png" alt="Shourk Logo" width={100} height={50} className="mx-auto opacity-50" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col ${darkMode ? 'dark' : ''}`}>
      {/* Professional Header */}
      <header className="bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
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
                <p className="text-indigo-600 text-sm font-semibold">Expert Portal</p>
              </div>
            </div>

            {/* Connection status */}
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 rounded-lg px-4 py-2 border border-slate-200 dark:border-slate-700">
              <div className={`w-2 h-2 rounded-full ${isInSession ? "bg-green-500" : "bg-amber-500"}`}></div>
              <span className="text-sm text-slate-700 font-medium">{connectionStatus}</span>
            </div>

            {/* Expert badge */}
            <div className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
              Expert {isHostExpert ? "(Host)" : ""}
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-4">
            {/* Session timer */}
            {isSessionActive && (
              <div className="flex items-center gap-3 bg-slate-50 rounded-lg px-4 py-2 border border-slate-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-600 font-medium">Session Time:</span>
                <span className={`font-mono text-lg font-semibold ${getTimeColor()}`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}

            {/* Session details */}
            <div className="text-right">
              <div className="text-slate-700 text-sm font-medium">
                Meeting ID: <span className="font-mono text-slate-600">{meetingId}</span>
              </div>
              <div className="text-slate-500 text-xs mt-1 flex items-center justify-end gap-2">
                <span>
                  {participants.length + 1} participant{participants.length > 0 ? "s" : ""}
                </span>
                {userJoined && <span className="text-green-600 font-medium">• User Connected</span>}
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
                {timeRemaining <= 60 ? "Final minute!" : "2 minutes remaining"} - Session ending soon
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-6">
        {!isInSession ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-2xl">
              {/* Pre-Join Interface */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-12">
                <div className="mb-8">
                  <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                    {console.log("Rendering - isHostExpert state before title:", isHostExpert)}
                    {isHostExpert ? "Ready to Start Expert Session" : "Ready to Join Expert Session"}
                  </h2>

                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {console.log("Rendering - isHostExpert state before paragraph:", isHostExpert)}
                    {isHostExpert
                      ? `Begin your ${sessionDuration}-minute consultation session`
                      : `Join the ${sessionDuration}-minute expert consultation`}
                  </p>

                  <div className="bg-slate-50 rounded-lg p-6 space-y-3">
                    <h3 className="text-slate-700 font-semibold text-sm">Session Details:</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-slate-600">
                        <span className="font-medium">Duration:</span> {sessionDuration} minutes
                      </div>
                      <div className="text-slate-600">
                        <span className="font-medium">Role:</span>{" "}
                        {isHostExpert ? "Expert (Host)" : "Expert (Participant)"}
                      </div>
                      <div className="text-slate-600">
                        <span className="font-medium">Meeting ID:</span> {meetingId}
                      </div>
                      <div className="text-slate-600">
                        <span className="font-medium">Platform:</span> Zoom Video SDK
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={startLocalVideo}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    {console.log("Rendering - isHostExpert state before button:", isHostExpert)}
                    {isHostExpert ? "Start Expert Session" : "Join the Session"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-[calc(100vh-200px)]">
            {/* Video Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
              {/* Local Video (Expert) */}
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
                      <p className="text-white font-semibold text-lg mb-1">You (Expert)</p>
                      <p className="text-slate-300 text-sm">Camera is off</p>
                    </div>
                  </div>
                )}

                {/* Video Overlay */}
                <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium flex items-center gap-3">
                  <span>You - Expert</span>
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

                {/* Expert badge */}
                <div className="absolute top-4 left-4 bg-indigo-600 text-white px-3 py-1 rounded-lg text-sm font-semibold">
                  Expert {isHostExpert ? "(Host)" : ""}
                </div>
              </div>

              {/* Participants */}
              {participants.map((participant) => (
                <ParticipantVideo key={participant.userId} participant={participant} stream={stream} />
              ))}

              {/* Waiting for User */}
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
                    <p className="text-slate-700 dark:text-slate-200 font-semibold text-lg mb-2">Waiting for user to join...</p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                      The consultation will begin once the user connects to the session
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
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
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
          {participant.displayName} - {participant.isHost ? "Expert" : "User"}
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
        {participant.isHost ? "Expert" : "User"}
      </div>
    </div>
  )
}

export default SessionCall
