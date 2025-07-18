import { create } from "zustand";
import axios from "axios";
import { io } from "socket.io-client";
import { toast } from "react-toastify";

const BASE_URL = "https://hiba-chat.shourk.com";
// const BASE_URL = "http://localhost:8080";
export const useExpertChatStore = create((set, get) => ({
  messages: [],
  experts: [],
  selectedExpert: null,
  isExpertsLoading: false,
  isMessagesLoading: false,
  socket: null,
  onlineExperts: [],
  loggedInExpert: null,
  processedMessageIds: new Set(),
  deletedMessages: new Set(),
  isFileUploading: false,
  uploadProgress: {},
  filePreviewUrls: new Map(),
  // Added for voice message handling
  isVoiceUploading: false,
  supportedFileTypes: [
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
  ],
  // Added supported voice types to match backend
  supportedVoiceTypes: [
    "audio/mpeg",
    "audio/mp4",
    "audio/webm",
    "audio/ogg",
    "audio/wav",
    "audio/x-wav",
    "audio/aac",
    "audio/x-m4a",
  ],

  // Check if expert is online
  isExpertOnline: (expertId) => {
    return get().onlineExperts.includes(expertId);
  },

  // Only use expertToken
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

  // Fetch list of experts for chat
  getExperts: async () => {
    set({ isExpertsLoading: true });
    try {
      const token = get().getAuthToken();

      if (!token) {
        throw new Error("Unauthorized access or invalid path");
      }

      const response = await axios.get(`${BASE_URL}/api/message/expert`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      set({
        experts: response.data || [],
        supportedFileTypes: response.data.supportedFileTypes || [
          "image/png",
          "image/jpeg",
          "application/pdf",
          "text/plain",
        ],
        isExpertsLoading: false,
      });
      await get().getLoggedInExpert();
      console.log("Experts Data:", response.data);
    } catch (error) {
      console.error("Fetch experts error:", error);
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Something went wrong"
      );
    } finally {
      set({ isExpertsLoading: false });
    }
  },

  // Enhanced message fetching with proper file and voice handling
  getExpertMessages: async (receiverExpertId) => {
    if (!receiverExpertId) return;

    set({ isMessagesLoading: true, messages: [] });

    try {
      const token = get().getAuthToken();
      if (!token) {
        throw new Error("Unauthorized access or missing token");
      }

      const response = await axios.get(
        `${BASE_URL}/api/message/expert-messages/get/${receiverExpertId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const messages = response.data?.messages || [];

      const newProcessedIds = new Set();
      messages.forEach((msg) => {
        const messageId =
          msg._id ||
          `${msg.senderId}-${msg.text || msg.fileId || msg.voiceId}-${new Date(
            msg.time
          ).getTime()}`; // Updated to include voiceId
        newProcessedIds.add(messageId);
      });

      set({
        messages,
        processedMessageIds: newProcessedIds,
        deletedMessages: new Set(),
        isMessagesLoading: false,
      });
    } catch (error) {
      console.error("Expert-to-expert chat error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to load expert messages"
      );
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // Enhanced delete all messages with file and voice cleanup
  deleteExpertAllMessage: async () => {
    const { selectedExpert, loggedInExpert } = get();

    if (!selectedExpert || !loggedInExpert) {
      console.error("No expert selected or not logged in");
      toast.error("Please select an expert to delete conversation");
      return;
    }

    // Save current messages for potential rollback and clean up file URLs
    const originalMessages = [...get().messages];

    // Clean up file preview URLs before deletion
    originalMessages.forEach((msg) => {
      if (msg.filePreviewUrl && msg.filePreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(msg.filePreviewUrl);
      }
    });

    // Optimistically clear messages
    set({
      messages: [],
      deletedMessages: new Set(),
    });

    try {
      const token = get().getAuthToken();

      if (!token) {
        throw new Error("Unauthorized access or invalid path");
      }

      const response = await axios.delete(
        `${BASE_URL}/api/message/expert-message/deleteallmessage`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            senderID: loggedInExpert._id,
            receiverID: selectedExpert._id,
          },
        }
      );

      console.log("Delete all messages response:", response.data);

      // Emit socket event for real-time updates
      const { socket } = get();
      if (socket && socket.connected) {
        socket.emit("allExpertMessagesDeleted", {
          senderID: loggedInExpert._id,
          receiverID: selectedExpert._id,
          deletedBy: loggedInExpert._id,
          deletedAt: new Date(),
        });
      }

      toast.success("Conversation deleted");
      return response.data;
    } catch (error) {
      console.error("Delete all messages error:", error);

      if (error.response?.data?.alreadyDeleted) {
        toast.info("Conversation already deleted");
      } else {
        // Restore messages on error (but don't restore preview URLs to avoid memory leaks)
        const restoredMessages = originalMessages.map((msg) => ({
          ...msg,
          filePreviewUrl:
            msg.isFile && msg.fileType?.startsWith("image/")
              ? msg.fileUrl // Use server URL instead of blob URL
              : msg.filePreviewUrl,
        }));

        set({
          messages: restoredMessages,
        });

        toast.error(
          error?.response?.data?.message || "Failed to delete conversation"
        );
      }
    }
  },

  // Send message to expert
  sendExpertMessage: async (text) => {
    const { messages, loggedInExpert, selectedExpert } = get();

    // Check if expert is selected
    if (!selectedExpert || !selectedExpert._id) {
      console.error("No expert selected or expert ID is missing");
      toast.error("Please select an expert to chat with");
      return;
    }

    // Check if logged-in expert exists
    if (!loggedInExpert || !loggedInExpert._id) {
      console.error("Logged-in expert not found or missing ID");
      toast.error("Authentication error. Please log in again.");
      return;
    }

    // Check if text is valid
    if (!text || !text.trim()) {
      toast.error("Message cannot be empty");
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const newMessage = {
      _id: tempId,
      senderId: loggedInExpert._id,
      receiverId: selectedExpert._id,
      text: text.trim(),
      time: new Date(),
      isPending: true,
    };

    // Optimistic UI update
    set((state) => ({
      messages: [...state.messages, newMessage],
    }));

    try {
      const token = get().getAuthToken();
      if (!token) {
        throw new Error("Unauthorized access");
      }

      const response = await axios.post(
        `${BASE_URL}/api/message/expert-messages/send/${selectedExpert._id}`,
        { text: text.trim() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Expert message sent:", response.data);

      // Replace the temp message with server response
      const serverMessage = response.data;
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === tempId ? { ...serverMessage, isPending: false } : msg
        ),
        processedMessageIds: new Set([
          ...state.processedMessageIds,
          serverMessage._id,
        ]),
      }));

      return response.data;
    } catch (error) {
      console.error("Error sending expert message:", error);
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== tempId),
      }));
      toast.error(
        error?.response?.data?.message || "Failed to send expert message"
      );
    }
  },

  // Updated to handle text, file, and voice deletions
  deleteExpertMessage: async (messageId) => {
    try {
      const token = get().getAuthToken();
      if (!token) {
        toast.error("Authentication error");
        return;
      }

      console.log(`Attempting to delete expert message: ${messageId}`);

      // Find the message
      const message = get().messages.find((msg) => msg._id === messageId);

      if (!message) {
        console.log(`Message ${messageId} not found in store`);
        toast.error("Message not found");
        return;
      }

      // Optimistic update: remove from UI first
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== messageId),
        deletedMessages: new Set([...state.deletedMessages, messageId]),
      }));

      let response;
      if (message.isVoice) {
        // Delete voice message
        response = await axios.delete(
          `${BASE_URL}/api/message/expert-voice/delete`,
          {
            headers: { Authorization: `Bearer ${token}` },
            data: { voiceId: messageId },
          }
        );
      } else if (message.isFile) {
        // Delete file message
        response = await axios.delete(
          `${BASE_URL}/api/message/expert-file/delete/${messageId}/${message.fileId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        // Delete text message
        response = await axios.delete(
          `${BASE_URL}/api/message/expert-message/delete`,
          {
            headers: { Authorization: `Bearer ${token}` },
            data: { messageID: messageId },
          }
        );
      }

      console.log("Delete expert message response:", response.data);

      if (response.data.success || response.data.deleted) {
        toast.success("Message deleted");

        // Emit socket event for real-time updates
        const { socket, loggedInExpert, selectedExpert } = get();
        if (socket && socket.connected && loggedInExpert && selectedExpert) {
          socket.emit("expertMessageDeleted", {
            messageId: messageId,
            senderId: loggedInExpert._id,
            receiverId: selectedExpert._id,
            isVoice: message.isVoice,
            isFile: message.isFile,
            voiceId: message.isVoice ? messageId : undefined,
            fileId: message.isFile ? message.fileId : undefined,
          });
        }
      } else if (response.data.alreadyDeleted) {
        toast.info("Message already deleted");
      } else {
        throw new Error(response.data.message || "Failed to delete message");
      }

      return response.data;
    } catch (error) {
      console.error("Delete expert message error:", error);

      // Log more detailed information about the error for debugging
      if (error.response) {
        console.error(
          `Status: ${error.response.status}, Data:`,
          error.response.data
        );
      } else if (error.request) {
        console.error("No response received:", error.request);
      }

      // Handle already deleted messages
      if (error.response?.data?.alreadyDeleted) {
        console.log("Expert message already deleted");
        toast.info("Message already deleted");
        return;
      }

      // If deletion fails, restore the message in UI
      const messageToRestore = get().messages.find(
        (msg) => msg._id === messageId
      );
      if (messageToRestore) {
        set((state) => ({
          messages: [...state.messages, messageToRestore],
          deletedMessages: new Set(
            [...state.deletedMessages].filter((id) => id !== messageId)
          ),
        }));
      }

      toast.error(error.response?.data?.message || "Failed to delete message");
    }
  },

  // Edit expert message
  editExpertMessage: async (messageId, newText) => {
    const { messages, deletedMessages } = get();

    // Check if message is deleted
    if (deletedMessages.has(messageId)) {
      console.error("Cannot edit a deleted message");
      toast.error("This message has been deleted and cannot be edited");
      return;
    }

    // Check if message exists in current messages
    const messageExists = messages.some((msg) => msg._id === messageId);
    if (!messageExists) {
      console.error("Cannot edit: Message not found in current conversation");
      toast.error("Cannot edit this message");
      return;
    }

    // Check if the message is a file or voice message
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
        `${BASE_URL}/api/message/expert-message/edit`,
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

      // Emit socket event for real-time updates
      const { socket, loggedInExpert, selectedExpert } = get();
      if (socket && socket.connected && loggedInExpert && selectedExpert) {
        socket.emit("expertMessageEdited", {
          _id: messageId,
          text: newText,
          senderId: loggedInExpert._id,
          receiverId: selectedExpert._id,
          isEdited: true,
          editedAt: new Date(),
        });
      }

      toast.success("Message updated");
      return response.data;
    } catch (error) {
      console.error("Edit message error:", error.message);
      set({ messages: originalMessages });
      toast.error(error?.message || "Failed to edit message");
    }
  },

  getLoggedInExpert: async () => {
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

      set({ loggedInExpert: response.data });
      console.log("Logged In Expert:", response.data);

      // Connect socket after getting expert info
      if (response.data && response.data._id) {
        get().connectExpertSocket();
      }
    } catch (error) {
      console.error("Fetch logged-in expert error:", error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  },

  uploadFileToExpert: async (file, additionalText = "") => {
    const { selectedExpert, messages, loggedInExpert } = get();

    console.log("🚀 Starting file upload...");
    console.log("Selected expert:", selectedExpert);
    console.log("Logged in expert:", loggedInExpert);
    console.log("File:", file);

    if (!selectedExpert || !selectedExpert._id) {
      console.error("❌ No expert selected or expert ID is missing");
      toast.error("Please select an expert to chat with");
      return;
    }

    if (!loggedInExpert || !loggedInExpert._id) {
      console.error("❌ Logged-in expert not found");
      toast.error("Authentication error. Please log in again.");
      return;
    }

    if (!file) {
      console.error("❌ No file selected");
      toast.error("No file selected");
      return;
    }

    // File size validation (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("File size must be less than 10MB");
      return;
    }

    // File type validation
    const allowedTypes = get().supportedFileTypes;
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
    if (additionalText && additionalText.trim() !== "") {
      formData.append("text", additionalText.trim());
    }

    set({ isFileUploading: true });
    try {
      const token = get().getAuthToken();

      if (!token) {
        throw new Error("Unauthorized access or invalid token");
      }

      console.log("📤 Uploading file to expert:", selectedExpert._id);
      console.log("File details:", {
        name: file.name,
        size: file.size,
        type: file.type,
      });

      // Upload the file
      const response = await axios.post(
        `${BASE_URL}/api/message/expert-file/upload/${selectedExpert._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("✅ File upload response:", response.data);

      // Create the final message object based on server response
      const newMessage = {
        _id: response.data._id,
        senderId: loggedInExpert._id,
        receiverId: selectedExpert._id,
        text: response.data.text || `File: ${file.name}`,
        fileId: response.data.fileId,
        isFile: true,
        fileType: file.type,
        fileSize: file.size,
        time: new Date(response.data.time),
      };

      set({ messages: [...messages, newMessage] });

      // Add to processed IDs to prevent duplicates
      set((state) => ({
        processedMessageIds: new Set([
          ...state.processedMessageIds,
          newMessage._id,
        ]),
      }));

      set({ isFileUploading: false });
      toast.success("File uploaded successfully");
      return response.data;
    } catch (error) {
      console.error("❌ File upload error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);

      // Clean up preview URL on error
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
      }

      set({ isFileUploading: false });

      // Show appropriate error message
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to upload file";
      toast.error(errorMessage);

      throw error;
    }
  },

  // New function to upload voice messages
  uploadVoiceToExpert: async (voiceFile, duration) => {
    const { selectedExpert, messages, loggedInExpert } = get();

    console.log("🚀 Starting voice upload...");
    console.log("Selected expert:", selectedExpert);
    console.log("Logged in expert:", loggedInExpert);
    console.log("Voice file:", voiceFile);
    console.log("Duration:", duration);

    if (!selectedExpert || !selectedExpert._id) {
      console.error("❌ No expert selected or expert ID is missing");
      toast.error("Please select an expert to chat with");
      return;
    }

    if (!loggedInExpert || !loggedInExpert._id) {
      console.error("❌ Logged-in expert not found");
      toast.error("Authentication error. Please log in again.");
      return;
    }

    if (!voiceFile) {
      console.error("❌ No voice file selected");
      toast.error("No voice file selected");
      return;
    }

    // File size validation (10MB limit to match backend)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (voiceFile.size > maxSize) {
      toast.error("Voice file size must be less than 10MB");
      return;
    }

    // File type validation
    const allowedTypes = get().supportedVoiceTypes;
    if (!allowedTypes.includes(voiceFile.type)) {
      toast.error(
        "Voice file type not supported. Please upload an audio file."
      );
      return;
    }

    // Create form data for voice upload
    const formData = new FormData();
    formData.append("voice", voiceFile);
    if (duration) {
      formData.append("duration", duration.toString());
    }

    set({ isVoiceUploading: true });
    try {
      const token = get().getAuthToken();

      if (!token) {
        throw new Error("Unauthorized access or invalid token");
      }

      console.log("📤 Uploading voice to expert:", selectedExpert._id);
      console.log("Voice details:", {
        name: voiceFile.name,
        size: voiceFile.size,
        type: voiceFile.type,
        duration,
      });

      // Upload the voice file
      const response = await axios.post(
        `${BASE_URL}/api/message/expert-voice/upload/${selectedExpert._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("✅ Voice upload response:", response.data);

      // Create the final message object based on server response
      const newMessage = {
        _id: response.data._id,
        senderId: loggedInExpert._id,
        receiverId: selectedExpert._id,
        text: response.data.text || "Voice message",
        voiceId: response.data.voiceId,
        isVoice: true,
        voiceDuration: response.data.voiceDuration,
        voiceSize: response.data.voiceSize,
        time: new Date(response.data.time),
      };

      set({ messages: [...messages, newMessage] });

      // Add to processed IDs to prevent duplicates
      set((state) => ({
        processedMessageIds: new Set([
          ...state.processedMessageIds,
          newMessage._id,
        ]),
      }));

      set({ isVoiceUploading: false });
      toast.success("Voice message uploaded successfully");
      return response.data;
    } catch (error) {
      console.error("❌ Voice upload error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);

      set({ isVoiceUploading: false });

      // Show appropriate error message
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to upload voice message";
      toast.error(errorMessage);

      throw error;
    }
  },

  // Updated to handle file and voice details
  getExpertFileDetails: async (id, type) => {
    try {
      const token = get().getAuthToken();
      if (!token) {
        throw new Error("Unauthorized access");
      }

      if (!id) {
        throw new Error("ID is required");
      }

      const endpoint =
        type === "voice"
          ? `${BASE_URL}/api/message/expert-voice/details/${id}`
          : `${BASE_URL}/api/message/expert-file/details/${id}`;

      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(`${type} details:`, response.data);
      return response.data[type] || response.data;
    } catch (error) {
      console.error(`Get ${type} details error:`, error);
      toast.error(
        error?.response?.data?.message || `Failed to get ${type} details`
      );
      return null;
    }
  },

  downloadExpertFile: async (fileId, fileName) => {
    try {
      const token = get().getAuthToken();
      if (!token) {
        throw new Error("Unauthorized access");
      }

      if (!fileId) {
        toast.error("File ID is required");
        return;
      }

      const loadingToast = toast.loading("Downloading file...");

      const response = await axios.get(
        `${BASE_URL}/api/message/expert-file/download/${fileId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );

      // Get MIME type from response headers
      const contentType =
        response.headers["content-type"] || "application/octet-stream";

      // Ensure filename has an extension
      const extension = contentType.split("/")[1] || "file";
      const safeFileName =
        fileName && typeof fileName === "string" && fileName.trim()
          ? fileName.includes(".")
            ? fileName
            : `${fileName}.${extension}`
          : `download.${extension}`; // Fallback filename

      // Create blob with correct MIME type
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: contentType })
      );

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", safeFileName);
      document.body.appendChild(link);
      link.click();

      // Clean up
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.dismiss(loadingToast);
      toast.success("File downloaded successfully");
      return true;
    } catch (error) {
      console.error("Download file error:", error);
      toast.error(error?.response?.data?.message || "Failed to download file");
    }
  },

  // New function to download voice messages
  downloadExpertVoice: async (voiceId) => {
    try {
      const token = get().getAuthToken();
      if (!token) {
        throw new Error("Unauthorized access");
      }

      if (!voiceId) {
        toast.error("Voice ID is required");
        return;
      }

      const loadingToast = toast.loading("Downloading voice message...");

      const response = await axios.get(
        `${BASE_URL}/api/message/expert-voice/download/${voiceId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );

      // Get MIME type from response headers
      const contentType = response.headers["content-type"] || "audio/mpeg";

      // Use a generic filename with correct extension
      const extension = contentType.split("/")[1] || "mp3";
      const safeFileName = `voice-message-${voiceId}.${extension}`;

      // Create blob with correct MIME type
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: contentType })
      );

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", safeFileName);
      document.body.appendChild(link);
      link.click();

      // Clean up
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.dismiss(loadingToast);
      toast.success("Voice message downloaded successfully");
      return true;
    } catch (error) {
      console.error("Download voice error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to download voice message"
      );
    }
  },

  // Delete file message for expert
  deleteExpertFileMessage: async (messageId, fileId) => {
    try {
      const token = get().getAuthToken();
      if (!token) {
        toast.error("Authentication error");
        return;
      }

      if (!messageId || !fileId) {
        toast.error("Message ID and File ID are required");
        return;
      }

      console.log(
        `Attempting to delete expert file message: ${messageId}, file: ${fileId}`
      );

      // Find the message
      const message = get().messages.find((msg) => msg._id === messageId);
      if (!message) {
        toast.error("Message not found");
        return;
      }

      // Optimistic update: remove from UI first
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== messageId),
        deletedMessages: new Set([...state.deletedMessages, messageId]),
      }));

      const response = await axios.delete(
        `${BASE_URL}/api/message/expert-file/delete/${messageId}/${fileId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Delete expert file response:", response.data);

      if (response.data.deleted || response.data.alreadyDeleted) {
        toast.success("File message deleted");

        // Emit socket event for real-time updates
        const { socket, loggedInExpert, selectedExpert } = get();
        if (socket && socket.connected && loggedInExpert && selectedExpert) {
          socket.emit("expertMessageDeleted", {
            messageId: messageId,
            senderId: loggedInExpert._id,
            receiverId: selectedExpert._id,
            isFile: true,
            fileId: fileId,
          });
        }
      }

      return response.data;
    } catch (error) {
      console.error("Delete expert file message error:", error);

      // Handle already deleted messages
      if (error.response?.data?.alreadyDeleted) {
        toast.info("File message already deleted");
        return;
      }

      // Restore message on error
      const messageToRestore = get().messages.find(
        (msg) => msg._id === messageId
      );
      if (messageToRestore) {
        set((state) => ({
          messages: [...state.messages, messageToRestore],
          deletedMessages: new Set(
            [...state.deletedMessages].filter((id) => id !== messageId)
          ),
        }));
      }

      toast.error(
        error.response?.data?.message || "Failed to delete file message"
      );
    }
  },

  subscribeToExpertMessages: () => {
    const { socket, loggedInExpert, selectedExpert } = get();

    if (!socket || !loggedInExpert || !selectedExpert) {
      console.warn(
        "Cannot subscribe to expert messages: missing socket, loggedInExpert, or selectedExpert",
        {
          socket: !!socket,
          loggedInExpert: !!loggedInExpert,
          selectedExpert: !!selectedExpert,
        }
      );
      return;
    }

    // Join the conversation room
    const roomId = [
      loggedInExpert._id.toString(),
      selectedExpert._id.toString(),
    ]
      .sort()
      .join("-");
    console.log(`Joining room: ${roomId}`);
    socket.emit("joinRoom", roomId);

    // Clean up previous listeners
    const eventsToCleanup = [
      "newExpertMessage",
      "expertFileUploaded",
      "expertMessageEdited",
      "expertMessageDeleted",
      "expertFileDeleted",
      "allExpertMessagesDeleted",
      "conversationDeleted",
    ];

    eventsToCleanup.forEach((event) => socket.off(event));

    // Handle new expert-to-expert messages (text, file, and voice)
    socket.on("newExpertMessage", (newMessage) => {
      console.log(
        `New expert ${
          newMessage.isVoice ? "voice" : newMessage.isFile ? "file" : "text"
        } message received:`,
        newMessage
      );

      const messageId =
        newMessage._id ||
        `${newMessage.senderId}-${
          newMessage.text || newMessage.fileId || newMessage.voiceId
        }-${new Date(newMessage.time).getTime()}`; // Updated to include voiceId

      set((state) => {
        const processedIds = state.processedMessageIds;
        if (processedIds.has(messageId)) {
          console.log("Skipping duplicate message:", messageId);
          return state;
        }

        const messageExists = state.messages.some(
          (msg) =>
            (msg._id && msg._id === newMessage._id) ||
            (msg.senderId.toString() === newMessage.senderId.toString() &&
              (msg.text === newMessage.text ||
                msg.fileId === newMessage.fileId ||
                msg.voiceId === newMessage.voiceId) &&
              Math.abs(new Date(msg.time) - new Date(newMessage.time)) < 5000)
        );

        if (messageExists) {
          console.log("Message already exists:", newMessage);
          return {
            ...state,
            processedMessageIds: new Set([...processedIds, messageId]),
          };
        }

        if (
          !state.selectedExpert ||
          (newMessage.senderId.toString() !==
            state.selectedExpert._id.toString() &&
            newMessage.receiverId.toString() !==
              state.selectedExpert._id.toString())
        ) {
          console.log("Message not for current conversation:", newMessage);
          return {
            ...state,
            processedMessageIds: new Set([...processedIds, messageId]),
          };
        }

        console.log(
          `Adding new ${
            newMessage.isVoice ? "voice" : newMessage.isFile ? "file" : "text"
          } message to state:`,
          newMessage
        );

        // Create file preview URL for images
        let filePreviewUrl = null;
        if (newMessage.isFile && newMessage.fileType?.startsWith("image/")) {
          filePreviewUrl = `${BASE_URL}/api/message/expert-file/download/${newMessage.fileId}`;
        }

        return {
          messages: [...state.messages, { ...newMessage, filePreviewUrl }],
          processedMessageIds: new Set([...processedIds, messageId]),
        };
      });
    });

    // Handle message edits (text only)
    socket.on("expertMessageEdited", (updatedMessage) => {
      console.log("Received expertMessageEdited event:", updatedMessage);

      // Don't allow editing file or voice messages
      if (updatedMessage.isFile || updatedMessage.isVoice) {
        console.log("Ignoring edit attempt on file or voice message");
        return;
      }

      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === updatedMessage._id
            ? {
                ...msg,
                ...updatedMessage,
                isEdited: true,
                editedAt: new Date(),
              }
            : msg
        ),
      }));
    });

    // Handle message deletions (text, file, or voice)
    socket.on("expertMessageDeleted", (data) => {
      console.log("Expert message deleted event received:", data);
      handleMessageDeletion(data);
    });

    // Handle file-specific deletions
    socket.on("expertFileDeleted", (data) => {
      console.log("Expert file deleted event received:", data);
      handleMessageDeletion({ ...data, isFile: true });
    });

    // Helper function for handling deletions
    const handleMessageDeletion = (data) => {
      const messageId = data.messageId || data.messageID;
      if (!messageId) {
        console.error("Missing message ID in deletion event");
        return;
      }

      // Check if already marked as deleted
      if (get().deletedMessages.has(messageId)) {
        console.log(`Message ${messageId} already deleted locally`);
        return;
      }

      console.log(
        `Processing delete for ${
          data.isVoice ? "voice" : data.isFile ? "file" : "text"
        } message: ${messageId}`
      );

      // Remove message and mark as deleted
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== messageId),
        deletedMessages: new Set([...state.deletedMessages, messageId]),
      }));

      // Clean up file preview URLs for file messages
      if (data.isFile) {
        const message = get().messages.find((msg) => msg._id === messageId);
        if (message?.filePreviewUrl) {
          URL.revokeObjectURL(message.filePreviewUrl);
        }
      }
    };

    // Handle conversation-wide deletions
    socket.on("allExpertMessagesDeleted", (data) => {
      const { loggedInExpert, selectedExpert } = get();
      console.log("Received allExpertMessagesDeleted event:", data);

      // Check if deletion affects current conversation
      if (
        loggedInExpert &&
        selectedExpert &&
        ((data.senderID === selectedExpert._id &&
          data.receiverID === loggedInExpert._id) ||
          (data.senderID === loggedInExpert._id &&
            data.receiverID === selectedExpert._id))
      ) {
        console.log("Clearing all messages due to remote deletion");

        // Clean up any file preview URLs
        get().messages.forEach((msg) => {
          if (msg.filePreviewUrl) {
            URL.revokeObjectURL(msg.filePreviewUrl);
          }
        });

        set({
          messages: [],
          deletedMessages: new Set(),
        });

        // Notify if deleted by other expert
        if (data.senderID !== loggedInExpert._id) {
          toast.info("Conversation was deleted by the other expert");
        }
      }
    });
  },

  // Connect socket for expert chat
  connectExpertSocket: () => {
    try {
      const { loggedInExpert } = get();
      if (!loggedInExpert || !loggedInExpert._id) {
        console.error(
          "Cannot connect expert socket: Expert information missing"
        );
        return;
      }

      // Clean up existing socket connection
      if (get().socket) {
        get().socket.disconnect();
      }

      // Create new socket connection
      const socket = io(BASE_URL, {
        query: {
          expertId: loggedInExpert._id,
        },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socket.on("connect", () => {
        console.log("✅ Expert socket connected with ID:", socket.id);

        // Handle list of online experts
        socket.on("getOnlineExperts", (experts) => {
          console.log("Online experts updated:", experts);
          set({ onlineExperts: experts });
        });

        // Subscribe to message events specific to expert chat
        get().subscribeToExpertMessages();
      });

      socket.on("connect_error", (error) => {
        console.error("Expert socket connection error:", error);
        toast.error("Chat connection failed. Try reloading.");
      });

      socket.on("disconnect", (reason) => {
        console.log("Expert socket disconnected. Reason:", reason);
      });

      socket.on("reconnect", (attemptNumber) => {
        console.log(`Socket reconnected after ${attemptNumber} attempts`);
        get().subscribeToExpertMessages(); // Re-subscribe after reconnection
      });

      set({ socket });
    } catch (error) {
      console.error("Expert socket connection error:", error);
      toast.error("Failed to connect expert chat");
    }
  },

  // Disconnect socket for expert chat
  disconnectExpertSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      console.log("🔌 Expert socket disconnected");
      set({ socket: null });
    }
  },

  // Updated to refresh socket subscription when selecting a different expert
  selectExpert: (expert) => {
    const previousExpert = get().selectedExpert;

    // Only update if actually changing experts
    if (!previousExpert || previousExpert._id !== expert._id) {
      console.log(`Selecting expert: ${expert.name || expert._id}`);
      set({
        selectedExpert: expert,
        messages: [], // Clear messages when changing experts
        deletedMessages: new Set(), // Reset deleted message tracking
      });

      // Get messages for the newly selected expert
      get().getExpertMessages(expert._id);

      // Re-subscribe to messages to ensure events are handled for the new conversation
      const { socket } = get();
      if (socket && socket.connected) {
        get().subscribeToExpertMessages();
      }
    }
  },
}));
