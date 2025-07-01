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
import { useExpertChatStore } from "@/store/expertChatStore";
import { toast } from "react-toastify";

const ExpertChatComponent = () => {
  const [text, setText] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState("");
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
    experts,
    selectedExpert,
    messages,
    isExpertsLoading,
    isMessagesLoading,
    loggedInExpert,
    getExperts,
    selectExpert,
    isExpertOnline,
    getExpertMessages,
    sendExpertMessage,
    deleteExpertMessage,
    editExpertMessage,
    deleteExpertAllMessage,
    uploadFileToExpert,
    downloadExpertFile,
    downloadExpertVoice,
    deleteExpertFileMessage,
    uploadVoiceToExpert,
    supportedFileTypes,
    supportedVoiceTypes,
    isFileUploading,
    isVoiceUploading,
    subscribeToExpertMessages,
  } = useExpertChatStore();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  // Fetch experts and connect socket on mount
  useEffect(() => {
    getExperts();
    return () => {
      useExpertChatStore.getState().disconnectExpertSocket();
    };
  }, []);

  // Handle expert selection and message subscription
  useEffect(() => {
    if (selectedExpert?._id) {
      getExpertMessages(selectedExpert._id);
      subscribeToExpertMessages();
      setEditingMessage(null);
      setSelectedFile(null);
      setShowFilePreview(false);
      stopRecording();
      stopPlaying();
    }
  }, [selectedExpert?._id, getExpertMessages, subscribeToExpertMessages]);

  // Clean up audio and recording on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current.removeEventListener("ended", handleAudioEnded);
      }
      stopRecording();
      stopPlaying();
    };
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const messageText = (text ?? "").toString().trim();

    // Handle editing message
    if (editingMessage) {
      try {
        await editExpertMessage(editingMessage._id, messageText);
        setEditingMessage(null);
        setText("");
      } catch (error) {
        toast.error("Failed to edit message");
        console.error("Edit message error:", error);
      }
      return;
    }

    // Handle voice message
    if (recordedBlob) {
      try {
        const voiceFile = new File([recordedBlob], `voice-${Date.now()}.webm`, {
          type: "audio/webm",
        });
        await uploadVoiceToExpert(voiceFile, recordingDuration);
        setRecordedBlob(null);
        setRecordingDuration(0);
        setText("");
      } catch (error) {
        toast.error("Failed to send voice message");
        console.error("Voice message error:", error);
      }
      return;
    }

    // Handle file upload
    if (selectedFile) {
      try {
        await uploadFileToExpert(selectedFile, messageText);
        setSelectedFile(null);
        setShowFilePreview(false);
        setText("");
      } catch (error) {
        toast.error("Failed to upload file");
        console.error("File upload error:", error);
      }
      return;
    }

    // Regular text message
    if (!messageText) return;

    try {
      await sendExpertMessage(messageText);
      setText("");
    } catch (error) {
      toast.error("Failed to send message");
      console.error("Send message error:", error);
    }
  };

  const handleDeleteMessage = async (messageId, fileId, isVoice) => {
    try {
      if (fileId) {
        await deleteExpertFileMessage(messageId, fileId);
      } else {
        await deleteExpertMessage(messageId);
      }
      setShowMenu(null);
      if (isVoice && currentPlayingVoice === messageId) {
        stopPlaying();
      }
    } catch (error) {
      toast.error("Failed to delete message");
      console.error("Delete message error:", error);
    }
  };

  const handleEditClick = (message) => {
    if (message.isFile || message.isVoice) {
      toast.error("File or voice messages cannot be edited");
      return;
    }
    setEditingMessage(message);
    setText(message.text);
    setShowMenu(null);
  };

  const handleClearEditState = () => {
    setEditingMessage(null);
    setText("");
  };

  const handleDeleteAllMessages = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAllMessages = async () => {
    try {
      await deleteExpertAllMessage();
      setShowDeleteConfirm(false);
    } catch (error) {
      toast.error("Failed to delete conversation");
      console.error("Delete all messages error:", error);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!supportedFileTypes.includes(file.type)) {
        toast.error("Unsupported file type");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size exceeds 10MB limit");
        return;
      }
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
      await downloadExpertFile(fileId, fileName);
    } catch (error) {
      toast.error("Failed to download file");
      console.error("Download file error:", error);
    }
  };

  const handleVoiceDownload = async (voiceId) => {
    try {
      await downloadExpertVoice(voiceId);
    } catch (error) {
      toast.error("Failed to download voice message");
      console.error("Download voice error:", error);
    }
  };

  const openFileModal = async (
    fileId,
    fileName,
    fileType,
    fileSize,
    fileUrl
  ) => {
    try {
      setSelectedFileToView({
        id: fileId,
        name: fileName || "unnamed_file",
        contentType: fileType,
        size: fileSize,
        uploadDate: new Date().toISOString(),
        url: fileUrl,
      });
      setIsFileModalOpen(true);
    } catch (error) {
      toast.error("Failed to open file preview");
      console.error("Open file modal error:", error);
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
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        setRecordedBlob(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

      setRecordingDuration(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      toast.error("Could not access microphone");
      console.error("Start recording error:", error);
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

const playVoiceMessage = async (voiceId, voiceDuration) => {
  try {
    if (currentPlayingVoice === voiceId) {
      if (audioRef.current.paused) {
        audioRef.current.play();
        setIsPlaying(true);
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
      return;
    }

    stopPlaying(); // Stop any currently playing audio

    const token = useExpertChatStore.getState().getAuthToken();
    if (!token) {
      throw new Error("Unauthorized access");
    }

    const streamUrl = `${
      process.env.NEXT_PUBLIC_BASE_URL || "https://amd-chat.code4bharat.com"
    }/api/message/expert-voice/stream/${voiceId}?token=${token}`;

    // Test the stream URL
    const response = await fetch(streamUrl, { method: "HEAD" });
    if (!response.ok) {
      throw new Error(`Streaming failed: ${response.statusText}`);
    }

    const contentType = response.headers.get("Content-Type");
    if (!contentType || !contentType.startsWith("audio/")) {
      console.warn(`Invalid Content-Type: ${contentType}. Attempting download fallback.`);
      handleVoiceDownload(voiceId); // Fallback to download
      return;
    }

    audioRef.current.src = streamUrl;
    await audioRef.current.play(); // Use await to catch play errors
    setIsPlaying(true);
    setCurrentPlayingVoice(voiceId);
  } catch (error) {
    console.error("Play voice message error:", error);
    toast.error("Failed to play voice message. Try downloading it.");
    // Fallback: Trigger download
    handleVoiceDownload(voiceId);
  }
};

  const stopPlaying = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentPlayingVoice(null);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentPlayingVoice(null);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const getFileIcon = (fileType) => {
    if (!fileType) return <BsFileEarmark size={22} />;
    if (fileType.startsWith("image/")) return <BsFileEarmarkImage size={22} />;
    if (fileType === "application/pdf") return <BsFileEarmarkPdf size={22} />;
    if (fileType.startsWith("text/")) return <BsFileEarmarkText size={22} />;
    return <BsFileEarmark size={22} />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const isCurrentExpertMessage = (senderId) => {
    return senderId === loggedInExpert?._id;
  };

  if (isExpertsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading experts...
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-auto bg-gray-200 p-5 gap-4">
      {/* Left Sidebar */}
      <div className="w-full md:w-1/4 space-y-5">
        <div className="p-5 bg-white shadow-lg rounded-lg">
          <p className="text-sm text-gray-600">
            Connect with other experts to collaborate on cases and share
            knowledge.
          </p>
        </div>

        <div className="flex space-x-2">
          <button
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            onClick={getExperts}
          >
            Refresh Expert List
          </button>
        </div>

        <div className="p-4 overflow-y-auto bg-white shadow-lg rounded-lg h-[400px]">
          {experts.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              No experts available
            </div>
          ) : (
            experts.map((expert) => (
              <motion.div
                key={expert._id}
                whileHover={{ scale: 1.05 }}
                onClick={() => selectExpert(expert)}
                className={`flex items-center gap-3 p-3 mb-3 rounded-lg cursor-pointer ${
                  selectedExpert?._id === expert._id
                    ? "border-2 border-blue-500 bg-gray-200"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <div className="relative">
                  <img
                    src={expert.photoFile || "/expert-avatar.png"}
                    alt={`${expert.firstName} ${expert.lastName}`}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {isExpertOnline(expert._id) && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                  )}
                </div>
                <span className="text-sm font-semibold">
                  {expert.firstName} {expert.lastName}
                </span>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Right Chat Panel */}
      <div className="w-full md:w-3/4 p-2">
        {selectedExpert ? (
          <div className="h-[600px] bg-gray-100 rounded-xl shadow-lg p-4 flex flex-col justify-between">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b bg-white rounded-t-lg shadow-sm">
              <div className="flex items-center">
                <img
                  src={selectedExpert.photoFile || "/expert-avatar.png"}
                  alt={`${selectedExpert.firstName} ${selectedExpert.lastName}`}
                  className="w-12 h-12 rounded-full mr-4 object-cover border-2 border-gray-200"
                />
                <div>
                  <p className="font-medium text-lg">
                    {selectedExpert.firstName} {selectedExpert.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {isExpertOnline(selectedExpert._id) ? "Online" : "Offline"}
                  </p>
                </div>
              </div>

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
                      isCurrentExpertMessage(msg.senderId)
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div className="relative group">
                      <div
                        className={`p-4 max-w-xs md:max-w-sm rounded-2xl ${
                          isCurrentExpertMessage(msg.senderId)
                            ? "bg-blue-500 text-white rounded-tr-none"
                            : "bg-white rounded-tl-none shadow-md"
                        }`}
                      >
                        {msg.isVoice ? (
                          <div className="flex flex-col">
                            <p className="text-sm mb-2">{msg.text}</p>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  playVoiceMessage(
                                    msg.voiceId,
                                    msg.voiceDuration
                                  )
                                }
                                className={`p-2 rounded-full ${
                                  isCurrentExpertMessage(msg.senderId)
                                    ? "bg-blue-600 hover:bg-blue-700"
                                    : "bg-gray-200 hover:bg-gray-300"
                                }`}
                                disabled={!msg.voiceId}
                              >
                                {isPlaying &&
                                currentPlayingVoice === msg.voiceId ? (
                                  <FaPause size={14} />
                                ) : (
                                  <FaPlay size={14} />
                                )}
                              </button>
                              <span
                                className={`text-xs ${
                                  isCurrentExpertMessage(msg.senderId)
                                    ? "text-blue-100"
                                    : "text-gray-500"
                                }`}
                              >
                                {formatDuration(msg.voiceDuration || 0)}
                              </span>
                              <button
                                onClick={() => handleVoiceDownload(msg.voiceId)}
                                className={`p-2 rounded-full ${
                                  isCurrentExpertMessage(msg.senderId)
                                    ? "bg-blue-600 hover:bg-blue-700"
                                    : "bg-gray-200 hover:bg-gray-300"
                                }`}
                              >
                                <FaDownload size={14} />
                              </button>
                            </div>
                            {msg.voiceSize && (
                              <span
                                className={`text-xs ${
                                  isCurrentExpertMessage(msg.senderId)
                                    ? "text-blue-100"
                                    : "text-gray-500"
                                } mt-1`}
                              >
                                {formatFileSize(msg.voiceSize)}
                              </span>
                            )}
                            {!msg.voiceId && (
                              <span className="text-xs text-red-500 mt-1">
                                Voice message unavailable
                              </span>
                            )}
                          </div>
                        ) : msg.isFile ? (
                          <div className="flex flex-col">
                            <div
                              onClick={() =>
                                openFileModal(
                                  msg.fileId,
                                  msg.fileName,
                                  msg.fileType,
                                  msg.fileSize,
                                  msg.fileUrl
                                )
                              }
                              className="flex items-center gap-2 mb-2 cursor-pointer hover:underline"
                            >
                              {getFileIcon(msg.fileType)}
                              <span className="text-sm font-medium truncate max-w-[200px]">
                                {msg.fileName}
                              </span>
                            </div>
                            {msg.filePreviewUrl && (
                              <img
                                src={msg.filePreviewUrl}
                                alt={msg.fileName}
                                className="max-w-[150px] max-h-[100px] object-cover rounded mt-2"
                              />
                            )}
                            {msg.text && !msg.text.startsWith("📎") && (
                              <p className="text-sm mt-2">{msg.text}</p>
                            )}
                            {msg.fileSize && (
                              <span
                                className={`text-xs ${
                                  isCurrentExpertMessage(msg.senderId)
                                    ? "text-blue-100"
                                    : "text-gray-500"
                                }`}
                              >
                                {formatFileSize(msg.fileSize)}
                                {msg.isPending &&
                                  msg.uploadProgress !== undefined && (
                                    <span> ({msg.uploadProgress}%)</span>
                                  )}
                              </span>
                            )}
                            {msg.isPending && (
                              <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                                <div
                                  className="bg-blue-600 h-1 rounded-full"
                                  style={{ width: `${msg.uploadProgress}%` }}
                                ></div>
                              </div>
                            )}
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() =>
                                  handleFileDownload(msg.fileId, msg.fileName)
                                }
                                className={`p-1 rounded text-xs flex items-center gap-1 ${
                                  isCurrentExpertMessage(msg.senderId)
                                    ? "bg-blue-600 hover:bg-blue-700"
                                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                                }`}
                              >
                                <FaDownload size={10} /> Download
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm mb-1">{msg.text}</p>
                        )}

                        <div className="flex items-center justify-between mt-1">
                          <span
                            className={`text-xs ${
                              isCurrentExpertMessage(msg.senderId)
                                ? "text-blue-100"
                                : "text-gray-400"
                            }`}
                          >
                            {new Date(
                              msg.time || msg.createdAt
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            {msg.isEdited && (
                              <span className="ml-1 italic">(edited)</span>
                            )}
                          </span>
                        </div>
                      </div>

                      {isCurrentExpertMessage(msg.senderId) && (
                        <div className="absolute top-0 right-0 -mr-2 -mt-2">
                          <button
                            onClick={() => setShowMenu(msg._id)}
                            className="p-1 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <FaEllipsisV size={14} className="text-gray-600" />
                          </button>

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
                              {(msg.isFile || msg.isVoice) && (
                                <button
                                  onClick={() =>
                                    msg.isFile
                                      ? handleFileDownload(
                                          msg.fileId,
                                          msg.fileName || "unnamed_file"
                                        )
                                      : handleVoiceDownload(msg.voiceId)
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
                                    msg.isVoice
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

            {/* Audio Recording Preview Section */}
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
                    onClick={() => {
                      if (audioRef.current.src) {
                        if (audioRef.current.paused) {
                          audioRef.current.play();
                          setIsPlaying(true);
                        } else {
                          audioRef.current.pause();
                          setIsPlaying(false);
                        }
                      } else {
                        audioRef.current.src =
                          URL.createObjectURL(recordedBlob);
                        audioRef.current.play();
                        setIsPlaying(true);
                      }
                    }}
                    className="text-blue-600"
                  >
                    {isPlaying && currentPlayingVoice === null ? (
                      <FaPause size={24} />
                    ) : (
                      <FaPlay size={24} />
                    )}
                  </button>
                  <p className="text-sm">{formatDuration(recordingDuration)}</p>
                </div>
              </div>
            )}

            {/* File Preview Section */}
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
                      {formatFileSize(selectedFile.size)}
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
                          : `Message ${selectedExpert.firstName}...`
                      }
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="flex-1 bg-transparent outline-none p-3 text-sm md:text-base"
                      disabled={isFileUploading || isVoiceUploading}
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileInput}
                      accept={supportedFileTypes.join(",")}
                      className="hidden"
                      disabled={
                        isFileUploading || isVoiceUploading || editingMessage
                      }
                    />
                    <button
                      type="button"
                      onClick={() =>
                        !editingMessage && fileInputRef.current?.click()
                      }
                      disabled={
                        isFileUploading || isVoiceUploading || editingMessage
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
                        isVoiceUploading ||
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
                    !selectedExpert ||
                    isFileUploading ||
                    isVoiceUploading ||
                    isRecording
                  }
                >
                  {isFileUploading || isVoiceUploading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <FaRegPaperPlane size={18} />
                  )}
                </button>
              </div>
            </form>

            <audio ref={audioRef} onEnded={handleAudioEnded} />
          </div>
        ) : (
          <div className="h-[600px] bg-white rounded-xl shadow-lg flex items-center justify-center text-gray-500">
            Select an expert to start chatting.
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-lg font-medium mb-4">
              Delete all messages with {selectedExpert.firstName}?
            </p>
            <div className="flex space-x-4 justify-center">
              <button
                onClick={confirmDeleteAllMessages}
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
                ×
              </button>
            </div>

            <div className="flex flex-col items-center mb-4">
              {selectedFileToView.contentType?.startsWith("image/") ? (
                <img
                  src={selectedFileToView.url}
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

export default ExpertChatComponent;
