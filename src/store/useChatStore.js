import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "axios";
import { io } from "socket.io-client";

// const BASE_URL = "https://hiba-chat.shourk.com"; // Update with your actual base URL
const BASE_URL = "http://localhost:8080"; // Update with your actual base URL

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isFileUploading: false,
  isVoiceRecording: false,
  isVoiceSending: false, // New state for voice upload status
  socket: null,
  onlineUsers: [],
  logginUser: null,
  processedMessageIds: new Set(),
  // Track deleted message IDs to prevent editing/viewing deleted messages
  deletedMessages: new Set(),
  // Track conversation files
  conversationFiles: [],
  // Track conversation voice messages
  conversationVoiceMessages: [],
  isFilesLoading: false,
  isVoiceMessagesLoading: false, // New state for voice messages loading

  // Add isUserOnline function to check if a user is online
  isUserOnline: (userId) => {
    return get().onlineUsers.includes(userId);
  },

  // Helper function to get authentication token
  getAuthToken: () => {
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

    return token;
  },

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const token = get().getAuthToken();

      if (!token) {
        throw new Error("Unauthorized access or invalid path");
      }

      const response = await axios.get(`${BASE_URL}/api/message/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      set({ users: response.data });
      await get().getLogginUser();
      console.log("Users Data:", response.data);
    } catch (error) {
      console.error("Fetch users error:", error);
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Something went wrong"
      );
    } finally {
      set({ isUsersLoading: false });
    }
  },
  // Send text message function for Zustand store
  sendMessage: async (text) => {
    const { selectedUser, messages, logginUser } = get();

    if (!selectedUser || !selectedUser._id) {
      console.error("No user selected or user ID is missing");
      toast.error("Please select a user to chat with");
      return;
    }

    if (!text || !text.trim()) {
      toast.error("Message cannot be empty");
      return;
    }

    // Create temporary message with local ID for optimistic update
    const tempId = `temp-${Date.now()}`;
    const newMessage = {
      _id: tempId,
      senderId: logginUser._id,
      receiverId: selectedUser._id,
      text: text.trim(),
      time: new Date(),
      // Flag to indicate this is a pending message
      isPending: true,
    };

    // Optimistically add message to the UI
    set((state) => ({
      messages: [...state.messages, newMessage],
    }));

    try {
      const token = get().getAuthToken();

      if (!token) {
        throw new Error("Unauthorized access or invalid path");
      }

      // Send the message to the server
      const response = await axios.post(
        `${BASE_URL}/api/message/send/${selectedUser._id}`,
        { text: text.trim() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Message sent successfully:", response.data);

      // Replace the temporary message with the real one from server
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === tempId ? { ...response.data, isPending: false } : msg
        ),
        // Add to processed IDs to prevent duplicate from socket
        processedMessageIds: new Set([
          ...state.processedMessageIds,
          response.data._id,
        ]),
      }));

      return response.data;
    } catch (error) {
      console.error("Send message error:", error);

      // Remove the temporary message on failure
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== tempId),
      }));

      toast.error(error?.response?.data?.error || "Failed to send message");
    }
  },

  getMessages: async (userId) => {
    if (!userId) return;

    set({ isMessagesLoading: true, messages: [] }); // Clear messages when loading new ones
    try {
      const token = get().getAuthToken();

      if (!token) {
        throw new Error("Unauthorized access or invalid path");
      }
      const fullUrl = `${BASE_URL}/api/message/get/${userId}`; // Add this line
      console.log("🔍 Full URL:", fullUrl);
      console.log("➡️ getMessages called with userId:", userId);

      const response = await axios.get(fullUrl, {
        // Use fullUrl here
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const messages = response.data?.messages || [];

      // Create a new Set of processed message IDs from the fetched messages
      const newProcessedIds = new Set();
      messages.forEach((msg) => {
        const messageId =
          msg._id ||
          `${msg.senderId}-${msg.text}-${new Date(msg.time).getTime()}`;
        newProcessedIds.add(messageId);
      });

      set({
        messages: messages,
        processedMessageIds: newProcessedIds, // Reset processed IDs when loading new conversation
        deletedMessages: new Set(), // Reset deleted messages for new conversation
      });

      console.log("Message Data:", response.data);

      // Load conversation files when loading messages
      get().getConversationFiles(userId);

      // Load conversation voice messages when loading messages
      get().getConversationVoiceMessages(userId);
    } catch (error) {
      console.error("Fetch messages error:", error);
      toast.error(error?.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  getLogginUser: async () => {
    try {
      const token = get().getAuthToken();

      if (!token) {
        throw new Error("Unauthorized access or invalid path");
      }

      const response = await axios.get(`${BASE_URL}/api/message/logginuser`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      set({ logginUser: response.data });
      console.log("Logged In User:", response.data);

      // Connect socket after getting user info
      if (response.data && response.data._id) {
        get().connectSocket();
      }
    } catch (error) {
      console.error("Fetch logged in user error:", error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  },

  // Complete replacement for the sendVoiceMessage function
  // This version includes detailed logging and handles both API formats

  sendVoiceMessage: async (voiceBlob, duration) => {
    const { selectedUser, messages, logginUser } = get();

    if (!selectedUser || !selectedUser._id) {
      console.error("No user selected or user ID is missing");
      toast.error("Please select a user to chat with");
      return;
    }

    if (!voiceBlob) {
      toast.error("No voice recording to send");
      return;
    }

    set({ isVoiceSending: true });

    try {
      const formData = new FormData();
      const token = get().getAuthToken();

      // IMPORTANT: The backend expects the field to be named 'voice'
      formData.append("voice", voiceBlob, "voice_message.webm");

      if (duration) {
        formData.append("duration", duration.toString());
      }

      // DEBUG: Log detailed information about the request
      console.group("Voice Message Request Debug");
      console.log("User ID:", selectedUser._id);
      console.log("Voice blob type:", voiceBlob.type);
      console.log("Voice blob size:", voiceBlob.size);
      console.log("FormData keys:", [...formData.keys()]);
      console.groupEnd();

      // TRY BOTH ENDPOINTS: First try the singular version (which should be correct)
      let response;
      let endpointUsed;

      try {
        console.log("Trying first endpoint: /api/message/voice/");
        endpointUsed = `${BASE_URL}/api/message/voice/${selectedUser._id}`;
        response = await axios.post(endpointUsed, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      } catch (firstError) {
        console.error("First endpoint failed:", firstError.message);

        // If first attempt fails, try the plural version as fallback
        console.log("Trying fallback endpoint: /api/messages/voice/");
        endpointUsed = `${BASE_URL}/api/messages/voice/${selectedUser._id}`;
        response = await axios.post(endpointUsed, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      console.log(`Voice message successfully sent to: ${endpointUsed}`);
      console.log("Voice message upload response:", response.data);

      // Create message object
      const newMessage = {
        _id: response.data._id,
        senderId: logginUser._id,
        receiverId: selectedUser._id,
        text: "Voice message",
        voiceId: response.data.voiceId || response.data.voice?.id, // Handle different response formats
        isVoice: true,
        voiceDuration: duration,
        voiceSize: response.data.voiceSize || response.data.voice?.size,
        time: new Date(),
      };

      // Update state
      set((state) => ({
        messages: [...state.messages, newMessage],
        processedMessageIds: new Set([
          ...state.processedMessageIds,
          newMessage._id,
        ]),
      }));

      // Refresh voice messages list
      get().getConversationVoiceMessages(selectedUser._id);

      toast.success("Voice message sent");
      return response.data;
    } catch (error) {
      console.group("Voice Message Error");
      console.error("Voice message upload error:", error.message);

      if (error.response) {
        // Server responded with error status
        console.error("Status:", error.response.status);
        console.error("Server response:", error.response.data);
        // If HTML error, show the relevant part
        if (
          typeof error.response.data === "string" &&
          error.response.data.includes("<!DOCTYPE html>")
        ) {
          const match = error.response.data.match(/<pre>(.*?)<\/pre>/);
          if (match && match[1]) {
            console.error("Error details:", match[1]);
            toast.error(`Server error: ${match[1]}`);
          } else {
            toast.error("Failed to send voice message");
          }
        } else {
          toast.error(
            error.response.data.message || "Failed to send voice message"
          );
        }
      } else if (error.request) {
        // Request was made but no response
        console.error("No response received:", error.request);
        toast.error("No response from server. Please try again.");
      } else {
        // Something else happened
        console.error("Error:", error.message);
        toast.error("An error occurred while sending voice message");
      }
      console.groupEnd();

      throw error; // Re-throw the error for component to handle
    } finally {
      set({ isVoiceSending: false });
    }
  },
  // Set recording state
  setVoiceRecording: (isRecording) => {
    set({ isVoiceRecording: isRecording });
  },

  // Get voice message info
  getVoiceInfo: async (voiceId) => {
    try {
      const token = get().getAuthToken();

      if (!token) {
        throw new Error("Unauthorized access or invalid path");
      }

      const response = await axios.get(
        `${BASE_URL}/api/message/voice/info/${voiceId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Voice info:", response.data);
      return response.data;
    } catch (error) {
      console.error("Get voice info error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to get voice information"
      );
      return null;
    }
  },
  getVoiceStreamUrl: (voiceId) => {
    if (!voiceId) {
      console.warn("Voice ID is missing");
      return null;
    }

    // Make sure BASE_URL is defined and has the correct value
    const baseUrl =
      typeof BASE_URL !== "undefined" && BASE_URL
        ? BASE_URL
        : window.location.origin; // Fallback to current origin if BASE_URL is undefined

    // Add a cache-busting parameter to prevent caching issues
    const cacheBuster = `?cb=${Date.now()}`;

    console.log(`Generating voice stream URL for ID: ${voiceId}`);

    // Ensure the API endpoint matches the server route exactly
    // Update this path to match your server-side route configuration
    return `${baseUrl}/api/message/voice/stream/${voiceId}${cacheBuster}`;
  },

  // Enhanced function to play audio with proper error handling
  playVoiceMessage: (voiceId) => {
    const audioUrl = get().getVoiceStreamUrl(voiceId);
    if (!audioUrl) {
      console.warn("Cannot play: Voice URL is null");
      return Promise.reject(new Error("Invalid voice ID"));
    }

    // Create audio element
    const audio = new Audio();

    // Add detailed logging
    console.log(`Attempting to play voice message: ${voiceId}`);
    console.log(`Using URL: ${audioUrl}`);

    // Try multiple formats if necessary
    const tryFormats = async () => {
      // List of formats to try in order of preference
      const formats = [
        { extension: "", type: "audio/mpeg" }, // Default - no extension
        { extension: "?format=mp3", type: "audio/mpeg" },
        { extension: "?format=aac", type: "audio/aac" },
        { extension: "?format=wav", type: "audio/wav" },
      ];

      // Try each format until one works
      for (const format of formats) {
        try {
          const formatUrl = `${audioUrl}${format.extension}`;
          console.log(`Trying format: ${format.type} with URL: ${formatUrl}`);

          // Set the source and type
          audio.src =
            "https://amd-chat.code4bharat.com/api/message/voice/stream/681d9629e340e7ad55cf3697?cb=1746771905696&t=1746771905696";
          // Wait for metadata to load to confirm format compatibility
          await new Promise((resolve, reject) => {
            const metadataTimeout = setTimeout(() => {
              reject(new Error("Metadata load timeout"));
            }, 5000); // 5 second timeout

            audio.onloadedmetadata = () => {
              clearTimeout(metadataTimeout);
              console.log(`Successfully loaded metadata for ${format.type}`);
              resolve();
            };

            audio.onerror = (e) => {
              clearTimeout(metadataTimeout);
              console.error(`Failed to load ${format.type}:`, e);
              console.error(
                `Error code: ${audio.error?.code}, message: ${audio.error?.message}`
              );
              reject(new Error(`Format ${format.type} failed to load`));
            };
          });

          // If we get here, metadata loaded successfully
          console.log(`Starting playback of ${format.type}`);
          await audio.play();
          return; // Success - exit the loop
        } catch (error) {
          console.warn(`Format attempt failed: ${error.message}`);
          // Continue to next format
        }
      }

      // If we get here, all formats failed
      throw new Error("All audio formats failed to play");
    };

    // Return a promise that resolves when audio plays or rejects on error
    return new Promise((resolve, reject) => {
      audio.onended = () => {
        console.log("Playback completed successfully");
        resolve();
      };

      // Start trying formats and handle the result
      tryFormats().catch((error) => {
        console.error("All playback attempts failed:", error);
        reject(error);
      });
    });
  },

  // Download voice message
  downloadVoice: async (voiceId, fileName = "voice-message") => {
    try {
      const token = get().getAuthToken();

      if (!token) {
        throw new Error("Unauthorized access or invalid path");
      }

      // Use axios to download the file with responseType blob
      const response = await axios.get(
        `${BASE_URL}/api/message/voice/download/${voiceId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob", // Important for file downloads
        }
      );

      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));

      // Create a link element and trigger download
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${fileName}.mp3`);
      document.body.appendChild(link);
      link.click();

      // Clean up
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Voice message downloaded successfully");
      return true;
    } catch (error) {
      console.error("Voice download error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to download voice message"
      );
      return false;
    }
  },

  // Delete voice message
  deleteVoiceMessage: async (messageId, voiceId) => {
    try {
      const token = get().getAuthToken();

      if (!token) {
        throw new Error("Unauthorized access or invalid path");
      }

      console.log(
        `Deleting voice message: ${voiceId} and message: ${messageId}`
      );

      // Optimistic update
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== messageId),
        deletedMessages: new Set([...state.deletedMessages, messageId]),
        conversationVoiceMessages: state.conversationVoiceMessages.filter(
          (voice) => voice.id !== voiceId
        ),
      }));

      // Send deletion request
      const response = await axios.delete(
        `${BASE_URL}/api/message/voice/delete`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { messageId, voiceId },
        }
      );

      console.log("Voice delete response:", response.data);
      toast.success("Voice message deleted");
      return response.data;
    } catch (error) {
      console.error("Delete voice message error:", error);

      // Return early if the response indicates the voice was already deleted
      if (error.response?.data?.alreadyDeleted) {
        console.log("Voice message already deleted");
        toast.info("Voice message already deleted");
        return;
      }

      toast.error(
        error?.response?.data?.message || "Failed to delete voice message"
      );
    }
  },

  getConversationVoiceMessages: async (userId) => {
    if (!userId) return;

    set({ isVoiceMessagesLoading: true });
    try {
      const token = get().getAuthToken();
      if (!token) throw new Error("Unauthorized access or invalid path");

      const response = await axios.get(
        `${BASE_URL}/api/message/voice/conversation/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Conversation voice messages:", response.data);

      // Validate the response safely
      if (Array.isArray(response.data)) {
        set({ conversationVoiceMessages: response.data });
      } else {
        set({ conversationVoiceMessages: [] }); // fallback to empty array
      }

      return response.data;
    } catch (error) {
      console.error("Get conversation voice messages error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to load voice messages"
      );
    } finally {
      set({ isVoiceMessagesLoading: false });
    }
  },

  deleteMessage: async (messageId) => {
    try {
      const token = get().getAuthToken();
      if (!token) {
        toast.error("Authentication error");
        return;
      }

      console.log(`Deleting message: ${messageId}`);

      // Get the message to check if it's a file or voice message
      const message = get().messages.find((msg) => msg._id === messageId);

      if (message && message.isFile) {
        // If it's a file message, use the file deletion endpoint
        return get().deleteFile(messageId, message.fileId);
      } else if (message && message.isVoice) {
        // If it's a voice message, use the voice deletion endpoint
        return get().deleteVoiceMessage(messageId, message.voiceId);
      }

      // Optimistic update
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== messageId),
        deletedMessages: new Set([...state.deletedMessages, messageId]),
      }));

      // Send deletion request
      const response = await axios.delete(`${BASE_URL}/api/message/delete`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { messageID: messageId },
      });

      console.log("Delete response:", response.data);
      toast.success("Message deleted");
      return response.data;
    } catch (error) {
      console.error("Delete message error:", error);

      // Return early if the response indicates the message was already deleted
      if (error.response?.data?.alreadyDeleted) {
        console.log("Message already deleted");
        toast.info("Message already deleted");
        return;
      }

      // Don't restore message in UI - it's been deleted server-side
      toast.error(error.response?.data?.message || "Failed to delete message");
    }
  },

  // File handling methods
  uploadFile: async (file, additionalText = "") => {
    const { selectedUser, messages, logginUser } = get();

    if (!selectedUser || !selectedUser._id) {
      console.error("No user selected or user ID is missing");
      toast.error("Please select a user to chat with");
      return;
    }

    if (!file) {
      toast.error("No file selected");
      return;
    }

    // File type validation
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain",
      "application/zip",
      "application/x-rar-compressed",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error(
        "File type not supported. Please upload images, documents, or common files."
      );
      return;
    }

    // Create file preview URL for images
    let filePreviewUrl = null;
    if (file.type.startsWith("image/")) {
      filePreviewUrl = URL.createObjectURL(file);
    }

    // Create form data for file upload
    const formData = new FormData();
    formData.append("file", file);

    // If there's additional text to include with the file
    if (additionalText) {
      formData.append("text", additionalText);
    }

    set({ isFileUploading: true });

    try {
      const token = get().getAuthToken();

      if (!token) {
        throw new Error("Unauthorized access or invalid path");
      }

      // Upload the file
      const response = await axios.post(
        `${BASE_URL}/api/message/upload/${selectedUser._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("File upload response:", response.data);

      // Create a new message object for the file
      const newMessage = {
        _id: response.data._id,
        senderId: logginUser._id,
        receiverId: selectedUser._id,
        text: response.data.text || `File: ${file.name}`,
        fileId: response.data.fileId,
        isFile: true,
        fileType: file.type,
        fileSize: file.size,
        time: new Date(),
      };

      // Update local messages immediately
      set({ messages: [...messages, newMessage] });

      // Add to processed IDs to prevent duplicates
      set((state) => ({
        processedMessageIds: new Set([
          ...state.processedMessageIds,
          newMessage._id,
        ]),
      }));

      // Refresh conversation files
      get().getConversationFiles(selectedUser._id);

      toast.success("File uploaded successfully");
      return response.data;
    } catch (error) {
      console.error("File upload error:", error);
      toast.error(error?.response?.data?.message || "Failed to upload file");
    } finally {
      set({ isFileUploading: false });
    }
  },

  getFileInfo: async (fileId) => {
    try {
      const token = get().getAuthToken();

      if (!token) {
        throw new Error("Unauthorized access or invalid path");
      }

      if (!fileId) {
        throw new Error("File ID is required");
      }

      const response = await axios.get(
        `${BASE_URL}/api/message/files/info/${fileId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("File info:", response.data);
      return response.data;
    } catch (error) {
      console.error("Get file info error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to get file information"
      );
      return null;
    }
  },

  downloadFile: async (fileId, fileName) => {
    try {
      const token = get().getAuthToken();

      if (!token) {
        throw new Error("Unauthorized access or invalid path");
      }

      if (!fileId) {
        toast.error("File ID is required");
        return;
      }
      const loadingToast = toast.loading("Downloading file...");

      // Use axios to download the file with responseType blob
      const response = await axios.get(
        `${BASE_URL}/api/message/files/download/${fileId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob", // Important for file downloads
        }
      );

      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));

      // Create a link element and trigger download
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName || "download");
      document.body.appendChild(link);
      link.click();

      // Clean up
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("File downloaded successfully");
      return true;
    } catch (error) {
      console.error("File download error:", error);
      toast.error(error?.response?.data?.message || "Failed to download file");
      return false;
    }
  },

  deleteFile: async (messageId, fileId) => {
    try {
      const token = get().getAuthToken();

      if (!token) {
        throw new Error("Unauthorized access or invalid path");
      }

      console.log(`Deleting file: ${fileId} and message: ${messageId}`);

      // Optimistic update
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== messageId),
        deletedMessages: new Set([...state.deletedMessages, messageId]),
        conversationFiles: state.conversationFiles.filter(
          (file) => file.id !== fileId
        ),
      }));

      // Send deletion request
      const response = await axios.delete(
        `${BASE_URL}/api/message/files/delete`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { messageId, fileId },
        }
      );

      console.log("File delete response:", response.data);
      toast.success("File deleted");
      return response.data;
    } catch (error) {
      console.error("Delete file error:", error);

      // Return early if the response indicates the file was already deleted
      if (error.response?.data?.alreadyDeleted) {
        console.log("File already deleted");
        toast.info("File already deleted");
        return;
      }

      toast.error(error?.response?.data?.message || "Failed to delete file");
    }
  },

  getConversationFiles: async (userId) => {
    if (!userId) return;

    set({ isFilesLoading: true });
    try {
      const token = get().getAuthToken();

      if (!token) {
        throw new Error("Unauthorized access or invalid path");
      }

      const response = await axios.get(
        `${BASE_URL}/api/message/files/conversation/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Conversation files:", response.data);
      set({ conversationFiles: response.data });
      return response.data;
    } catch (error) {
      console.error("Get conversation files error:", error);
      toast.error(error?.response?.data?.message || "Failed to load files");
    } finally {
      set({ isFilesLoading: false });
    }
  },

  editMessage: async (messageId, newText) => {
    // First check if the message has been deleted locally
    const { deletedMessages, messages } = get();

    if (deletedMessages.has(messageId)) {
      console.error("Cannot edit a deleted message");
      toast.error("This message has been deleted and cannot be edited");
      return;
    }

    // Also check if message exists in current messages
    const messageExists = messages.some((msg) => msg._id === messageId);
    if (!messageExists) {
      console.error("Cannot edit: Message not found in current conversation");
      toast.error("Cannot edit this message");
      return;
    }

    // Check if the message is a file message or voice message
    const message = messages.find((msg) => msg._id === messageId);
    if (message && (message.isFile || message.isVoice)) {
      console.error("Cannot edit a file or voice message");
      toast.error("File and voice messages cannot be edited");
      return;
    }

    // Optimistically update the message in the UI first
    const originalMessages = [...messages];
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg._id === messageId
          ? {
              ...msg,
              text: newText,
              isEdited: true,
              editedAt: new Date(),
            }
          : msg
      ),
    }));

    try {
      const token = get().getAuthToken();

      if (!token) {
        throw new Error("Unauthorized access or invalid path");
      }

      console.log("Sending edit request for message:", messageId);

      const response = await axios.put(
        `${BASE_URL}/api/message/edit`,
        { messageID: messageId, newText },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Check if the request was successful based on the success flag
      if (response.data.success === false) {
        throw new Error(response.data.message || "Failed to edit message");
      }

      console.log("Edit message response:", response.data);

      // IMPORTANT FIX: Don't update messages again here,
      // as the "messageEdited" socket event will handle it

      toast.success("Message updated");
      return response.data;
    } catch (error) {
      console.error("Edit message error:", error.message);

      // Don't check for 404 specifically, handle any error
      set({ messages: originalMessages });
      toast.error(error?.message || "Failed to edit message");
    }
  },

  // FIXED: Delete all messages with improved error handling
  deleteAllMessages: async () => {
    const { selectedUser, logginUser } = get();

    if (!selectedUser || !logginUser) {
      console.error("No user selected or not logged in");
      toast.error("Please select a user to delete conversation");
      return;
    }

    // Save current messages for potential rollback
    const originalMessages = [...get().messages];
    const originalFiles = [...get().conversationFiles];
    const originalVoiceMessages = [...get().conversationVoiceMessages];

    // Optimistically clear messages and files
    set({
      messages: [],
      deletedMessages: new Set(), // Reset deletion tracking
      conversationFiles: [],
      conversationVoiceMessages: [],
    });

    try {
      const token = get().getAuthToken();

      if (!token) {
        throw new Error("Unauthorized access or invalid path");
      }

      const response = await axios.delete(
        `${BASE_URL}/api/message/deleteallmessage`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            senderID: logginUser._id,
            reciverID: selectedUser._id, // Note: using reciverID to match backend (keep this as is)
          },
        }
      );

      toast.success("Conversation deleted");
      return response.data;
    } catch (error) {
      console.error("Delete all messages error:", error);

      // Restore messages on error, unless it's a "already deleted" response
      if (
        error.response &&
        error.response.data &&
        error.response.data.alreadyDeleted
      ) {
        toast("Conversation already deleted");
      } else {
        // Restore messages, files, and voice messages
        set({
          messages: originalMessages,
          conversationFiles: originalFiles,
          conversationVoiceMessages: originalVoiceMessages,
        });
        toast.error(
          error?.response?.data?.message || "Failed to delete conversation"
        );
      }
    }
  },

  subscribeToMessages: () => {
    const { socket, logginUser } = get();

    if (!socket || !logginUser) return;

    // Clean up previous listeners
    socket.off("newMessage");
    socket.off("messageEdited");
    socket.off("messageDeleted");
    socket.off("allMessagesDeleted");
    socket.off("conversationDeleted");

    // FIXED: Handle new messages with better duplicate prevention
    socket.on("newMessage", (newMessage) => {
      console.log("New message received:", newMessage);

      // Generate a unique identifier for this message
      const messageId =
        newMessage._id ||
        `${newMessage.senderId}-${newMessage.text}-${new Date(
          newMessage.time
        ).getTime()}`;

      set((state) => {
        // Check if we've already processed this message
        const processedIds = state.processedMessageIds;
        if (processedIds.has(messageId)) {
          console.log("Skipping duplicate message:", messageId);
          return state; // Don't modify state if already processed
        }

        // Check if this message already exists in the messages array
        const messageExists = state.messages.some(
          (msg) =>
            (msg._id && msg._id === newMessage._id) || // Same ID
            (msg.senderId === newMessage.senderId && // Or same content/timestamps
              msg.text === newMessage.text &&
              Math.abs(new Date(msg.time) - new Date(newMessage.time)) < 5000)
        );

        if (messageExists) {
          // Just mark as processed but don't add again
          return {
            ...state,
            processedMessageIds: new Set([...processedIds, messageId]),
          };
        }

        // Check if message is relevant to current conversation
        const { selectedUser } = get();
        if (
          !selectedUser ||
          (newMessage.senderId !== selectedUser._id &&
            newMessage.receiverId !== selectedUser._id)
        ) {
          // Message not for current conversation, only track the ID
          return {
            ...state,
            processedMessageIds: new Set([...processedIds, messageId]),
          };
        }

        // If it's a file message, refresh conversation files
        if (newMessage.isFile && selectedUser) {
          get().getConversationFiles(selectedUser._id);
        }

        // If it's a voice message, refresh conversation voice messages
        if (newMessage.isVoice && selectedUser) {
          get().getConversationVoiceMessages(selectedUser._id);
        }

        // Add to processed set and update messages
        return {
          messages: [...state.messages, newMessage],
          processedMessageIds: new Set([...processedIds, messageId]),
        };
      });
    });

    socket.on("messageEdited", (updatedMessage) => {
      console.log("Received messageEdited event:", updatedMessage);
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === updatedMessage._id
            ? { ...updatedMessage, isEdited: true }
            : msg
        ),
      }));
    });

    // FIXED: Handle deleted messages with consistent property names
    // In your Zustand store socket setup
    socket.on("messageDeleted", (data) => {
      console.log("Message deleted event received:", data);

      // Handle case inconsistency
      const messageId = data.messageID || data.messageId;

      if (!messageId) {
        console.error("Missing message ID in deletion event");
        return;
      }

      // Separate log messages to identify exact issue
      console.log(`Processing delete for message: ${messageId}`);
      console.log(
        `Current messages:`,
        get().messages.map((m) => m._id)
      );

      set((state) => {
        // Find if message exists in current conversation
        const messageToDelete = state.messages.find(
          (msg) => msg._id === messageId
        );

        if (!messageToDelete) {
          console.log(`Message ${messageId} not found in current messages`);
          return state; // No change
        }

        console.log(`Found message to delete:`, messageToDelete);

        // If it's a file message, also update conversationFiles
        if (messageToDelete.isFile && messageToDelete.fileId) {
          const fileId = messageToDelete.fileId;
          const { selectedUser } = get();

          // Refresh files list if needed
          if (selectedUser && selectedUser._id) {
            get().getConversationFiles(selectedUser._id);
          }

          return {
            messages: state.messages.filter((msg) => msg._id !== messageId),
            deletedMessages: new Set([...state.deletedMessages, messageId]),
            conversationFiles: state.conversationFiles.filter(
              (file) => file.id !== fileId
            ),
          };
        }

        // Remove the message and update deleted set
        return {
          messages: state.messages.filter((msg) => msg._id !== messageId),
          deletedMessages: new Set([...state.deletedMessages, messageId]),
        };
      });
    });

    // FIXED: Handle all messages deleted for a conversation
    socket.on("allMessagesDeleted", (data) => {
      console.log("All messages deleted received:", data);

      const { selectedUser, logginUser } = get();

      // Check if this deletion event applies to current conversation
      if (!selectedUser || !logginUser) return;

      const isCurrentConversation =
        (data.senderID === logginUser._id &&
          data.reciverID === selectedUser._id) ||
        (data.senderID === selectedUser._id &&
          data.reciverID === logginUser._id);

      if (isCurrentConversation) {
        set({
          messages: [],
          conversationFiles: [],
          deletedMessages: new Set(), // Reset deletion tracking for new conversation
        });
      }
    });
  },

  connectSocket: () => {
    try {
      const { logginUser } = get();
      if (!logginUser || !logginUser._id) {
        console.error("Cannot connect socket: User information missing");
        return;
      }

      // Clean up existing socket connection
      if (get().socket) {
        get().socket.disconnect();
      }

      // Create new socket connection
      const socket = io(BASE_URL, {
        query: {
          userId: logginUser._id,
        },
      });

      socket.on("connect", () => {
        console.log("Socket connected!");

        // Setup online user tracking
        socket.on("getOnlineUsers", (users) => {
          set({ onlineUsers: users });
        });

        // Subscribe to message-related events
        get().subscribeToMessages();
      });

      socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        toast.error("Chat connection error. Please reload the page.");
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected");
      });

      // Store socket reference
      set({ socket });
    } catch (error) {
      console.error("Socket connection error:", error);
      toast.error("Failed to establish chat connection");
    }
  },

  // For cleaning up the socket when component unmounts
  disconnectExpertSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      console.log("🔌 Expert socket disconnected");
      set({ socket: null });
    }
  },

  selectUser: (user) => {
    set({ selectedUser: user });
  },
}));
