"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FaRegPaperPlane,
  FaEllipsisV,
  FaEdit,
  FaTrash,
  FaDownload,
  FaPaperclip,
  FaMicrophone,
  FaStop,
  FaPlay,
  FaPause,
} from "react-icons/fa";
import { MdDeleteSweep } from "react-icons/md";
import {
  BsFileEarmark,
  BsFileEarmarkImage,
  BsFileEarmarkText,
  BsFileEarmarkPdf,
} from "react-icons/bs";
import { useChatStore } from "@/store/useChatStore.js";

const UserChatComponent = () => {
  const [text, setText] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showMenu, setShowMenu] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [selectedFileToView, setSelectedFileToView] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingVoice, setCurrentPlayingVoice] = useState(null);

  const router = useRouter();
  const messagesContainerRef = useRef(null);
  const menuRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const recordingIntervalRef = useRef(null);

  // Zustand store hooks
  const {
    getUsers,
    users,
    selectedUser,
    selectUser,
    isUsersLoading,
    logginUser,
    onlineUsers,
    isUserOnline,
  } = useChatStore();

  const {
    messages,
    getMessages,
    isMessagesLoading,
    sendMessage,
    deleteMessage,
    editMessage,
    deleteAllMessages,
    subscribeToMessages,
    // File-related functions
    uploadFile,
    downloadFile,
    deleteFile,
    getFileInfo,
    conversationFiles,
    getConversationFiles,
    isFileUploading,
    isFilesLoading,
    // Voice-related functions
    sendVoiceMessage,
    isVoiceRecording,
    isVoiceSending,
    getVoiceStreamUrl,
    downloadVoice,
    deleteVoiceMessage,
    conversationVoiceMessages,
    getConversationVoiceMessages,
    isVoiceMessagesLoading,
  } = useChatStore();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Scroll to bottom of messages container
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      const { scrollHeight, clientHeight } = messagesContainerRef.current;
      messagesContainerRef.current.scrollTop = scrollHeight - clientHeight;
    }
  };

  // Scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get users on component mount
  useEffect(() => {
    getUsers();
  }, []);

  // Handle user selection and message subscription
  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
      getConversationFiles(selectedUser._id);
      getConversationVoiceMessages(selectedUser._id);
      subscribeToMessages();
      setEditingMessage(null); // Clear editing state when changing users
      setSelectedFile(null); // Clear any selected file
      setShowFilePreview(false);
      stopRecording(); // Stop any ongoing recording
      stopPlaying(); // Stop any playing audio
    }
  }, [selectedUser?._id]);
  const cleanup = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeEventListener("ended", handleAudioEnded);
      audioRef.current = null;
    }
    setIsPlaying(false);
    setCurrentPlayingVoice(null);
  };

  // Clean up audio and recording on unmount
  useEffect(() => {
    return () => {
      cleanup();
      stopRecording();
      stopPlaying();
      if (audioRef.current) {
        audioRef.current.removeEventListener("ended", handleAudioEnded);
      }
    };
  }, []);
  const handleSendMessage = async (e) => {
    e.preventDefault();

    const messageText = (text ?? "").toString().trim(); // Force string safely

    // First check if we're in edit mode
    if (editingMessage) {
      try {
        await editMessage(editingMessage._id, messageText);
        setEditingMessage(null); // Clear editing state
        setText(""); // Clear text input
        return;
      } catch (error) {
        console.error("Failed to edit message:", error);
        return;
      }
    }

    // Handle voice message
    if (recordedBlob) {
      try {
        await sendVoiceMessage(recordedBlob, recordingDuration);
        setRecordedBlob(null);
        setRecordingDuration(0);
        setText("");
        return;
      } catch (error) {
        console.error("Failed to send voice message:", error);
      }
    }

    // Handle file upload
    if (selectedFile) {
      try {
        await uploadFile(selectedFile, messageText);
        setSelectedFile(null);
        setShowFilePreview(false);
        setText("");
        return;
      } catch (error) {
        console.error("Failed to upload file:", error);
        return;
      }
    }

    // Regular text message
    if (!messageText) return;

    try {
      await sendMessage(messageText);
      setText("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };
  const handleDeleteMessage = async (messageId, fileId, voiceId) => {
    try {
      if (fileId) {
        await deleteFile(messageId, fileId);
      } else if (voiceId) {
        await deleteVoiceMessage(messageId, voiceId);
      } else {
        await deleteMessage(messageId);
      }
      setShowMenu(null);
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const handleEditClick = (message) => {
    if (message.isFile || message.isVoice) {
      // Can't edit file or voice messages
      return;
    }
    setEditingMessage(message);
    setText(message.text); // Set the text input to the message text
    setShowMenu(null); // Close the menu
  };

  const handleClearEditState = () => {
    setEditingMessage(null);
    setText("");
  };

  const handleDeleteAllMessages = async () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAllMessages = async () => {
    try {
      await deleteAllMessages();
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setShowFilePreview(true);
    }
  };

  const cancelFileUpload = () => {
    setSelectedFile(null);
    setShowFilePreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileDownload = async (fileId, fileName) => {
    try {
      await downloadFile(fileId, fileName);
    } catch (error) {
      console.error("Failed to download file:", error);
    }
  };

  const openFileModal = async (fileId, fileName) => {
    try {
      const fileInfo = await getFileInfo(fileId);
      setSelectedFileToView({
        ...fileInfo,
        id: fileId,
        name: fileName || fileInfo.originalName,
      });
      setIsFileModalOpen(true);
    } catch (error) {
      console.error("Failed to get file info:", error);
    }
  };

  const closeFileModal = () => {
    setIsFileModalOpen(false);
    setSelectedFileToView(null);
  };

  // Voice message functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/mp3",
        });
        setRecordedBlob(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

      // Start recording timer
      setRecordingDuration(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Could not access microphone");
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      clearInterval(recordingIntervalRef.current);
      setIsRecording(false);
    }
  };

  const cancelRecording = () => {
    stopRecording();
    setRecordedBlob(null);
    setRecordingDuration(0);
  };

  useEffect(() => {
    // Clean up function to handle component unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const playVoiceMessage = (voiceId) => {
    if (!voiceId) {
      console.error("No voice ID provided");
      return Promise.reject(new Error("Invalid voice ID"));
    }

    // Stop any currently playing audio
    if (currentPlayingVoice && currentPlayingVoice !== voiceId) {
      stopPlaying();
    }

    // If already playing this voice message, toggle pause/play
    if (isPlaying && currentPlayingVoice === voiceId && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return Promise.resolve();
    }

    // Set the current playing voice ID
    setCurrentPlayingVoice(voiceId);

    // Create or use existing audio element
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.addEventListener("ended", handleAudioEnded);
    }

    console.log(`Attempting to play voice message: ${voiceId}`);

    // Try multiple formats if necessary
    const tryFormats = async () => {
      // Get base URL for voice stream
      const baseUrl = getVoiceStreamUrl(voiceId);
      if (!baseUrl) {
        throw new Error("Could not get voice stream URL");
      }

      // List of formats to try in order of preference with cache busting
      const cacheBuster = `t=${Date.now()}`;
      const formats = [
        { extension: `?${cacheBuster}`, type: "audio/mpeg" },
        { extension: `?format=mp3&${cacheBuster}`, type: "audio/mpeg" },
        { extension: `?format=aac&${cacheBuster}`, type: "audio/aac" },
        { extension: `?format=wav&${cacheBuster}`, type: "audio/wav" },
        { extension: `?format=ogg&${cacheBuster}`, type: "audio/ogg" },
        { extension: `?format=webm&${cacheBuster}`, type: "audio/webm" },
        { extension: `?format=flac&${cacheBuster}`, type: "audio/flac" },
        { extension: `?format=opus&${cacheBuster}`, type: "audio/opus" },
        { extension: `?format=mp3&${cacheBuster}`, type: "audio/mp3" },
      ];

      for (const format of formats) {
        try {
          const formatUrl = `${baseUrl}${format.extension}`;
          console.log(`Trying format: ${format.type} with URL: ${formatUrl}`);
          const urlPath = window.location.pathname;
          let token = "";

          // Check for expert token and path
          if (
            localStorage.getItem("expertToken") &&
            urlPath.startsWith("/expertpanel")
          ) {
            token = localStorage.getItem("expertToken");
          }

          // Check for user token and path
          if (
            !token &&
            localStorage.getItem("userToken") &&
            urlPath.startsWith("/userpanel")
          ) {
            token = localStorage.getItem("userToken");
          }
          const res = await fetch(formatUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!res.ok) {
            throw new Error(`HTTP error ${res.status}`);
          }

          const blob = await res.blob();
          const blobUrl = URL.createObjectURL(blob);

          // 🔁 Feed the blob URL into the audio player
          audioRef.current.src = blobUrl;

          await new Promise((resolve, reject) => {
            const metadataTimeout = setTimeout(() => {
              reject(new Error("Metadata load timeout"));
            }, 5000);

            audioRef.current.onloadedmetadata = () => {
              clearTimeout(metadataTimeout);
              console.log(`Loaded metadata for ${format.type}`);
              resolve();
            };

            audioRef.current.onerror = (e) => {
              clearTimeout(metadataTimeout);
              reject(new Error(`Blob failed to load: ${format.type}`));
            };
          });

          await audioRef.current.play();
          setIsPlaying(true);
          return;
        } catch (error) {
          console.warn(`Format attempt failed: ${error.message}`);
          // Try next format
        }
      }

      // If we get here, all formats failed
      throw new Error("All audio formats failed to play");
    };

    // Return a promise that resolves when audio plays or rejects on error
    return tryFormats().catch((error) => {
      console.error("All playback attempts failed:", error);
      setIsPlaying(false);
      setCurrentPlayingVoice(null);
      throw error;
    });
  };

  // Improved function to handle audio ended event
  // Handle audio ending
  const handleAudioEnded = () => {
    console.log("Playback completed successfully");
    setIsPlaying(false);
    setCurrentPlayingVoice(null);
  };

  /**
   * Call this function to check which audio format was used in the last successful playback
   */
  const getLastSuccessfulFormat = () => {
    if (window._lastSuccessfulAudioFormat) {
      console.log(
        "Last successful audio format:",
        window._lastSuccessfulAudioFormat
      );
      return window._lastSuccessfulAudioFormat;
    } else {
      console.log("No successful audio playback recorded yet");
      return null;
    }
  };

  // Stop any currently playing audio
  const stopPlaying = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentPlayingVoice(null);
  };

  // Add these debugging hooks to your component
  useEffect(() => {
    // Debug voice store function to make sure it's working
    if (selectedUser && selectedUser._id) {
      // This will log the first voice message ID and URL for debugging
      const firstVoiceMessage = conversationVoiceMessages?.[0];
      if (firstVoiceMessage) {
        const voiceId = firstVoiceMessage.voiceId;
        const url = getVoiceStreamUrl(voiceId);
        console.log(`Voice ID: ${voiceId}`);
        console.log(`Voice URL: ${url}`);

        // Test if the URL is accessible
        fetch(url)
          .then((response) => {
            console.log(`Voice URL status: ${response.status}`);
            console.log(
              `Content-Type: ${response.headers.get("Content-Type")}`
            );
            return response.blob();
          })
          .then((blob) => {
            console.log(`Blob type: ${blob.type}`);
            console.log(`Blob size: ${blob.size} bytes`);
          })
          .catch((err) => {
            console.error("Error testing voice URL:", err);
          });
      }
    }
  }, [selectedUser, conversationVoiceMessages]);

  // Add this to check audio capabilities
  useEffect(() => {
    // Check audio element support and capabilities
    const audioTest = document.createElement("audio");
    console.log("Browser supports audio element:", !!audioTest);

    if (audioTest) {
      console.log("Browser supports MP3:", audioTest.canPlayType("audio/mpeg"));
      console.log("Browser supports WAV:", audioTest.canPlayType("audio/wav"));
      console.log("Browser supports OGG:", audioTest.canPlayType("audio/ogg"));
      console.log(
        "Browser supports WebM:",
        audioTest.canPlayType("audio/webm")
      );
    }
  }, []);

  const downloadVoiceMessage = async (voiceId, fileName = "voice-message") => {
    try {
      await downloadVoice(voiceId, fileName);
    } catch (error) {
      console.error("Failed to download voice message:", error);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const getFileIcon = (fileType) => {
    if (!fileType) return <BsFileEarmark size={22} />;

    if (fileType.startsWith("image/")) {
      return <BsFileEarmarkImage size={22} />;
    } else if (fileType === "application/pdf") {
      return <BsFileEarmarkPdf size={22} />;
    } else if (fileType.startsWith("text/")) {
      return <BsFileEarmarkText size={22} />;
    } else {
      return <BsFileEarmark size={22} />;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Check if the message was sent by the current user
  const isCurrentUserMessage = (senderId) => {
    return senderId === logginUser?._id;
  };

  if (isUsersLoading)
    return (
      <div className="flex items-center justify-center h-screen">
        Loading users...
      </div>
    );

  return (
    <div className="flex flex-col md:flex-row h-auto bg-gray-200 p-5 gap-4">
      {/* Left Sidebar */}
      <div className="w-full md:w-1/4 space-y-5">
        <div className="p-5 bg-white shadow-lg rounded-lg">
          <p className="text-sm text-gray-600">
            To be considered for verification, you need to do the following: Add
            your booking link to two or more of the following bios: Instagram,
            LinkedIn, Twitter, or TikTok.
          </p>
        </div>

        <div className="flex space-x-2">
          <button
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            onClick={getUsers}
          >
            Chat with Users
          </button>
          <button
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            onClick={() => router.push("/userpanel/videocall")}
          >
            Back
          </button>
        </div>

        <div className="p-4 overflow-y-auto bg-white shadow-lg rounded-lg h-[400px]">
          {users.length === 0 ? (
            <div className="text-center text-gray-500 py-4">No users found</div>
          ) : (
            users.map((user) => (
              <motion.div
                key={user._id}
                whileHover={{ scale: 1.05 }}
                onClick={() => selectUser(user)}
                className={`flex items-center gap-3 p-3 mb-3 rounded-lg cursor-pointer ${
                  selectedUser?._id === user._id
                    ? "border-2 border-blue-500 bg-gray-200"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <div className="relative">
                  <img
                    src={user.photoFile || "/avatar.png"}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {isUserOnline(user._id) && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                  )}
                </div>
                <span className="text-sm font-semibold">
                  {user.firstName} {user.lastName}
                </span>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Right Chat Panel */}
      <div className="w-full md:w-3/4 p-2">
        {selectedUser ? (
          <div className="h-[600px] bg-gray-100 rounded-xl shadow-lg p-4 flex flex-col justify-between">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b bg-white rounded-t-lg shadow-sm">
              <div className="flex items-center">
                <img
                  src={selectedUser.photoFile || "/avatar.png"}
                  alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                  className="w-12 h-12 rounded-full mr-4 object-cover border-2 border-gray-200"
                />
                <div>
                  <p className="font-medium text-lg">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {isUserOnline(selectedUser._id) ? "Online" : "Offline"}
                  </p>
                </div>
              </div>

              {/* Delete All Messages Button */}
              <button
                onClick={handleDeleteAllMessages}
                className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors"
                title="Delete entire conversation"
              >
                <MdDeleteSweep size={22} />
              </button>
            </div>

            {/* Messages */}
            <div
              className="overflow-y-auto flex-1 py-6 px-4"
              ref={messagesContainerRef}
            >
              {isMessagesLoading ? (
                <div className="flex justify-center items-center h-full">
                  <p>Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex justify-center items-center h-full text-gray-500">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <motion.div
                    key={msg._id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex mb-5 ${
                      isCurrentUserMessage(msg.senderId)
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div className="relative group">
                      <div
                        className={`p-4 max-w-xs md:max-w-sm rounded-2xl ${
                          isCurrentUserMessage(msg.senderId)
                            ? "bg-blue-500 text-white rounded-tr-none"
                            : "bg-white rounded-tl-none shadow-md"
                        }`}
                      >
                        {/* Render file message */}
                        {msg.isFile ? (
                          <div className="flex flex-col">
                            <div
                              onClick={() =>
                                openFileModal(
                                  msg.fileId,
                                  msg.text.replace("File: ", "")
                                )
                              }
                              className="flex items-center gap-2 mb-2 cursor-pointer hover:underline"
                            >
                              {getFileIcon(msg.fileType)}
                              <span className="text-sm font-medium truncate">
                                {msg.text.replace("File: ", "")}
                              </span>
                            </div>
                            {msg.fileSize && (
                              <span
                                className={`text-xs ${
                                  isCurrentUserMessage(msg.senderId)
                                    ? "text-blue-100"
                                    : "text-gray-500"
                                }`}
                              >
                                {formatFileSize(msg.fileSize)}
                              </span>
                            )}
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() =>
                                  handleFileDownload(
                                    msg.fileId,
                                    msg.text.replace("File: ", "")
                                  )
                                }
                                className={`p-1 rounded text-xs flex items-center gap-1 ${
                                  isCurrentUserMessage(msg.senderId)
                                    ? "bg-blue-600 hover:bg-blue-700"
                                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                                }`}
                              >
                                <FaDownload size={10} /> Download
                              </button>
                            </div>
                          </div>
                        ) : msg.isVoice ? (
                          // Voice message
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  playVoiceMessage(msg.voiceId).then(() => {
                                    getLastSuccessfulFormat();
                                  })
                                }
                                className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                {currentPlayingVoice === msg.voiceId &&
                                isPlaying ? (
                                  <FaPause size={14} />
                                ) : (
                                  <FaPlay size={14} />
                                )}
                              </button>
                              <div className="flex-1">
                                <div className="text-sm">Voice message</div>
                                <div
                                  className={`text-xs ${
                                    isCurrentUserMessage(msg.senderId)
                                      ? "text-blue-100"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {formatDuration(msg.voiceDuration || 0)}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() =>
                                  downloadVoiceMessage(
                                    msg.voiceId,
                                    `voice-${msg._id}`
                                  )
                                }
                                className={`p-1 rounded text-xs flex items-center gap-1 ${
                                  isCurrentUserMessage(msg.senderId)
                                    ? "bg-blue-600 hover:bg-blue-700"
                                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                                }`}
                              >
                                <FaDownload size={10} /> Download
                              </button>
                            </div>
                          </div>
                        ) : (
                          // Regular text message
                          <p className="text-sm mb-1">{msg.text}</p>
                        )}

                        <div className="flex items-center justify-between mt-1">
                          <span
                            className={`text-xs ${
                              isCurrentUserMessage(msg.senderId)
                                ? "text-blue-100"
                                : "text-gray-400"
                            }`}
                          >
                            {new Date(msg.time).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            {msg.isEdited && (
                              <span className="ml-1 italic">(edited)</span>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Message Options - Only show for user's messages */}
                      {isCurrentUserMessage(msg.senderId) && (
                        <div className="absolute top-0 right-0 -mr-2 -mt-2">
                          <button
                            onClick={() => setShowMenu(msg._id)}
                            className="p-1 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <FaEllipsisV size={14} className="text-gray-600" />
                          </button>

                          {/* Dropdown Menu */}
                          {showMenu === msg._id && (
                            <div
                              ref={menuRef}
                              className="absolute right-0 mt-1 bg-white rounded-md shadow-lg z-10 py-1 min-w-[120px]"
                            >
                              {!msg.isFile && !msg.isVoice && (
                                <button
                                  onClick={() => handleEditClick(msg)}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                >
                                  <FaEdit className="mr-2" /> Edit
                                </button>
                              )}
                              {msg.isFile && (
                                <button
                                  onClick={() =>
                                    handleFileDownload(
                                      msg.fileId,
                                      msg.text.replace("File: ", "")
                                    )
                                  }
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                >
                                  <FaDownload className="mr-2" /> Download
                                </button>
                              )}
                              {msg.isVoice && (
                                <button
                                  onClick={() =>
                                    downloadVoiceMessage(
                                      msg.voiceId,
                                      `voice-${msg._id}`
                                    )
                                  }
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                >
                                  <FaDownload className="mr-2" /> Download
                                </button>
                              )}
                              <button
                                onClick={() =>
                                  handleDeleteMessage(
                                    msg._id,
                                    msg.fileId,
                                    msg.voiceId
                                  )
                                }
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                              >
                                <FaTrash className="mr-2" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* --- Audio Recording Preview Section --- */}
            {recordedBlob && !selectedFile && (
              <div className="p-3 border rounded-md mb-2 bg-blue-100 relative">
                <button
                  onClick={cancelRecording}
                  className="absolute top-1 right-1 text-red-500 hover:text-red-700"
                >
                  ✕
                </button>

                <div className="flex items-center space-x-4">
                  <button
                    onClick={isPlaying ? stopPlaying : playVoiceMessage}
                    className="text-blue-600"
                  >
                    {isPlaying ? <FaPause size={24} /> : <FaPlay size={24} />}
                  </button>
                  <p className="text-sm">{formatDuration(recordingDuration)}</p>
                </div>
              </div>
            )}

            {/* --- File Preview Section --- */}
            {showFilePreview && selectedFile && (
              <div className="p-3 border rounded-md mb-2 bg-gray-100 relative">
                <button
                  onClick={cancelFileUpload}
                  className="absolute top-1 right-1 text-red-500 hover:text-red-700"
                >
                  ✕
                </button>

                <div className="flex items-center space-x-3">
                  {selectedFile.type.startsWith("image/") ? (
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded"
                    />
                  ) : selectedFile.type === "application/pdf" ? (
                    <BsFileEarmarkPdf size={40} />
                  ) : (
                    <BsFileEarmark size={40} />
                  )}
                  <div>
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Message Input */}
            <form
              onSubmit={handleSendMessage}
              className="flex flex-col mt-2 pb-2"
            >
              {editingMessage && (
                <div className="bg-yellow-50 p-3 mb-3 rounded-lg flex justify-between items-center border border-yellow-200">
                  <span className="text-sm text-gray-600">Editing message</span>
                  <button
                    type="button"
                    onClick={handleClearEditState}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              )}

              <div className="flex items-center border rounded-lg p-2 bg-white shadow-md">
                {!isRecording && !recordedBlob && (
                  <>
                    <input
                      type="text"
                      placeholder={
                        editingMessage
                          ? "Edit your message..."
                          : selectedFile
                          ? "Add a message with this file (optional)..."
                          : "Type Something..."
                      }
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="flex-1 bg-transparent outline-none p-3 text-sm md:text-base"
                      disabled={isFileUploading || isVoiceSending}
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileInput}
                      className="hidden"
                      disabled={
                        isFileUploading || isVoiceSending || editingMessage
                      }
                    />
                    <button
                      type="button"
                      onClick={() =>
                        !editingMessage && fileInputRef.current?.click()
                      }
                      disabled={
                        isFileUploading || isVoiceSending || editingMessage
                      }
                      className={`p-3 rounded-lg text-gray-500 hover:bg-gray-100 ${
                        editingMessage ? "opacity-30 cursor-not-allowed" : ""
                      }`}
                    >
                      <FaPaperclip size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={startRecording}
                      disabled={
                        isRecording ||
                        isFileUploading ||
                        isVoiceSending ||
                        editingMessage
                      }
                      className={`p-3 rounded-lg text-gray-500 hover:bg-gray-100 ${
                        editingMessage ? "opacity-30 cursor-not-allowed" : ""
                      }`}
                    >
                      <FaMicrophone size={18} />
                    </button>
                  </>
                )}

                {isRecording && (
                  <div className="flex-1 flex items-center justify-between px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-600">
                        Recording: {formatDuration(recordingDuration)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="p-2 text-red-500 hover:bg-red-100 rounded-full"
                    >
                      <FaStop size={16} />
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                  disabled={
                    (!text.trim() && !selectedFile && !recordedBlob) ||
                    !selectedUser ||
                    isFileUploading ||
                    isVoiceSending ||
                    isRecording
                  }
                >
                  {isFileUploading || isVoiceSending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <FaRegPaperPlane size={18} />
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="h-[600px] bg-white rounded-xl shadow-lg flex items-center justify-center text-gray-500">
            Select a user to start chatting.
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-lg font-medium mb-4">Delete all messages?</p>
            <div className="flex space-x-4 justify-center">
              <button
                onClick={async () => {
                  await deleteAllMessages();
                  setShowDeleteConfirm(false);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File View Modal */}
      {isFileModalOpen && selectedFileToView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800 truncate">
                {selectedFileToView.name}
              </h2>
              <button
                onClick={closeFileModal}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>

            <div className="flex flex-col items-center mb-4">
              {selectedFileToView.contentType?.startsWith("image/") ? (
                <img
                  src={`${BASE_URL}/api/message/files/download/${selectedFileToView.id}`}
                  alt={selectedFileToView.name}
                  className="max-w-full max-h-[50vh] object-contain"
                />
              ) : (
                <div className="p-10 bg-gray-100 rounded-lg flex flex-col items-center">
                  {getFileIcon(selectedFileToView.contentType)}
                  <p className="mt-2 text-gray-500">Preview not available</p>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center border-t pt-4">
              <div>
                <p className="text-sm text-gray-500">
                  {selectedFileToView.contentType || "Unknown type"} •{" "}
                  {formatFileSize(selectedFileToView.size)}
                </p>
                <p className="text-xs text-gray-400">
                  Uploaded{" "}
                  {new Date(selectedFileToView.uploadDate).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() =>
                  handleFileDownload(
                    selectedFileToView.id,
                    selectedFileToView.name
                  )
                }
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
              >
                <FaDownload size={14} /> Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserChatComponent;