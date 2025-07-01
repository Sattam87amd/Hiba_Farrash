'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Bot, User, Send, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import DOMPurify from 'dompurify';

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [botTyping, setBotTyping] = useState(false);
  const [error, setError] = useState(null);
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());
  const [sentInactivityMessage, setSentInactivityMessage] = useState(false);
  const inactivityTimerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const lastFailedMessageRef = useRef(null);

  const INACTIVITY_TIMEOUT = 120000;
  const INACTIVITY_CHECK_INTERVAL = 10000;
  const API_URL = 'https://shourk-chatbot.code4bharat.com/chat' ||'http://localhost:5001/chat';
  const RETRY_DELAY = 1000;

  // Custom Markdown renderer
  const renderers = {
    link: ({ href, children }) => (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-inherit hover:underline">
        {children}
      </a>
    ),
    html: ({ value }) => {
      const spanMatch = value.match(/<span style="color:blue">(.*?)<\/span>/);
      if (spanMatch) {
        const url = spanMatch[1];
        const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
        return (
          <a
            href={formattedUrl}
            target="_blank"   
            rel="noreferrer"
            className="text-inherit hover:underline"
          >
            {url}
          </a>
        );
      }
      const linkMatch = value.match(/<span style="color:blue">\[(.*?)\]\((.*?)\)<\/span>/);
      if (linkMatch) {
        return (
          <a
            href={linkMatch[2]}
            target="_blank"
            rel="noreferrer"
            className="text-inherit hover:underline"
          >
            {linkMatch[1]}
          </a>
        );
      }
      return <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(value) }} />;
    },
    text: ({ children }) => {
      const maxLength = 200;
      if (typeof children === 'string' && children.length > maxLength) {
        return (
          <>
            {children.slice(0, maxLength)}...
            <button
              onClick={() => alert(children)}
              className="text-black hover:underline text-sm ml-1"
            >
              Read more
            </button>
          </>
        );
      }
      return children;
    },
  };

  // Fetch bot response
  const fetchBotResponse = async (userMessage, retryCount = 0) => {
    const maxRetries = 2;
    try {
      setBotTyping(true);
      setError(null);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errorMsg = errorData.reply || errorData.error || `HTTP error: ${response.status}`;
        if (response.status === 500 && retryCount < maxRetries) {
          console.warn(`Retry ${retryCount + 1}/${maxRetries} for: ${userMessage}`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          return await fetchBotResponse(userMessage, retryCount + 1);
        }
        if (response.status === 400) {
          errorMsg = 'Invalid request. Please check your input.';
        } else if (response.status === 500) {
          errorMsg = 'Server issue. Please try again later.';
        } else if (!response.ok) {
          errorMsg = 'Network issue. Please check your connection.';
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      if (!data.reply) {
        throw new Error('No reply received from server');
      }
      return data.reply;
    } catch (error) {
      console.error('Error fetching bot response:', error);
      lastFailedMessageRef.current = userMessage;
      throw new Error(error.message || 'Failed to connect to the server.');
    } finally {
      setBotTyping(false);
    }
  };

  // Handle sending a message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || botTyping) return;

    const userMessage = input.trim();
    setMessages([...messages, { text: userMessage, sender: 'user' }]);
    setInput('');
    recordUserActivity();

    try {
      const botResponse = await fetchBotResponse(userMessage);
      setMessages((prev) => [...prev, { text: botResponse, sender: 'bot' }]);
      setSentInactivityMessage(false);
    } catch (error) {
      setError(error.message);
      setMessages((prev) => [
        ...prev,
        { text: `**Error: ${error.message}**`, sender: 'bot', isError: true },
      ]);
    }
  };

  // Retry last failed message
  const handleRetry = async () => {
    if (!lastFailedMessageRef.current || botTyping) return;

    const userMessage = lastFailedMessageRef.current;
    setMessages((prev) => [...prev, { text: userMessage, sender: 'user' }]);
    recordUserActivity();

    try {
      const botResponse = await fetchBotResponse(userMessage);
      setMessages((prev) => [...prev, { text: botResponse, sender: 'bot' }]);
      setSentInactivityMessage(false);
      setError(null);
    } catch (error) {
      setError(error.message);
      setMessages((prev) => [
        ...prev,
        { text: `**Error: ${error.message}**`, sender: 'bot', isError: true },
      ]);
    }
  };

  // Send inactivity message
  const sendInactivityMessage = () => {
    if (!isOpen || sentInactivityMessage || messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.sender === 'bot' && lastMessage.text.includes('Are you still there?')) {
      return;
    }

    setMessages((prev) => [
      ...prev,
      { text: 'Are you still there? I’m here to help!', sender: 'bot' },
    ]);
    setSentInactivityMessage(true);
  };

  // Record user activity
  const recordUserActivity = () => {
    setLastActivityTime(Date.now());
  };

  // Manage inactivity timer and activity listeners
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ text: 'Welcome! How can I assist you find an expert today?', sender: 'bot' }]);
    }

    const handleActivity = () => {
      if (isOpen) recordUserActivity();
    };

    if (isOpen) {
      inactivityTimerRef.current = setInterval(() => {
        const now = Date.now();
        if (now - lastActivityTime >= INACTIVITY_TIMEOUT) {
          sendInactivityMessage();
        }
      }, INACTIVITY_CHECK_INTERVAL);

      window.addEventListener('keydown', handleActivity);
      window.addEventListener('mousedown', handleActivity);
      window.addEventListener('touchstart', handleActivity);
    } else {
      clearInterval(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }

    return () => {
      clearInterval(inactivityTimerRef.current);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, [isOpen, lastActivityTime, messages]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, botTyping]);

  return (
    <>
      {/* Chat Widget */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-20 right-6 z-50 w-[40rem] max-w-[90vw] h-[28rem] rounded-3xl shadow-xl flex flex-col border border-gray-100 overflow-hidden bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 animate-gradient"
            onClick={recordUserActivity}
            role="dialog"
            aria-label="Chatbot"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="px-6 pt-8 pb-4">
                <div className="flex items-center mb-3">
                  <div className="bg-white p-3 rounded-2xl shadow-sm mr-4">
                    <Bot className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-gray-800">Shourk Chatbot Assistant</h1>
                    <p className="text-sm text-gray-500">Ask about experts</p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="ml-auto bg-white p-2 rounded-full hover:bg-gray-100 shadow-sm"
                    aria-label="Close chat"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 px-6 py-4 overflow-y-auto space-y-4 custom-scrollbar">
                <AnimatePresence initial={false}>
                  {messages.map((msg, index) => {
                    const isUser = msg.sender === 'user';
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isUser && (
                          <div className="flex-shrink-0 mt-1 bg-white p-2 rounded-full shadow-sm">
                            <Bot className="w-5 h-5 text-black" />
                          </div>
                        )}
                        <div
                          className={`px-4 py-3 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm break-words markdown-content debug-markdown ${
                            isUser ? 'bg-black text-white' : 'bg-white text-gray-700'
                          } ${msg.isError ? 'bg-red-50 text-red-700' : ''}`}
                        >
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                            components={renderers}
                          >
                            {msg.text}
                          </ReactMarkdown>
                        </div>
                        {isUser && (
                          <div className="flex-shrink-0 mt-1 bg-black p-2 rounded-full shadow-sm">
                            <User className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {botTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-start gap-3 justify-start"
                  >
                    <div className="flex-shrink-0 mt-1 bg-white p-2 rounded-full shadow-sm">
                      <Bot className="w-5 h-5 text-black" />
                    </div>
                    <div className="flex space-x-2 px-4 py-3 rounded-2xl max-w-[85%] text-sm bg-white text-gray-700 shadow-sm">
                      <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-0" />
                      <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-150" />
                      <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-300" />
                    </div>
                  </motion.div>
                )}

                {error && (
                  <div className="text-red-500 text-sm mt-4 text-center p-3 bg-red-50 rounded-lg flex items-center justify-between mx-2">
                    <span>{error}</span>
                    {lastFailedMessageRef.current && (
                      <button
                        onClick={handleRetry}
                        className="text-black hover:text-blue-800 font-medium flex items-center gap-2 disabled:opacity-50"
                        disabled={botTyping}
                        title="Retry last message"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Retry
                      </button>
                    )}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-6 border-t border-gray-100">
                <form onSubmit={handleSend} className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      recordUserActivity();
                    }}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-3 rounded-xl bg-white border border-gray-100 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                    disabled={botTyping}
                    aria-label="Type your message here"
                  />
                  <button
                    type="submit"
                    className="bg-black hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                    disabled={botTyping}
                    aria-label="Send message"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setIsOpen(!isOpen);
            recordUserActivity();
          }}
          className="bg-white p-3 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
          aria-label={isOpen ? 'Close chatbot' : 'Open chatbot'}
        >
          {isOpen ? (
            <X className="w-6 h-6 text-gray-600" />
          ) : (
            <Bot className="w-6 h-6 text-black" />
          )}
        </motion.button>
      </div>

      {/* Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(100, 116, 139, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background-color: transparent;
        }
        .custom-scrollbar {
          scroll-behavior: smooth;
        }
        .delay-0 {
          animation-delay: 0ms;
        }
        .delay-150 {
          animation-delay: 150ms;
        }
        .delay-100 {
          animation-delay: 100ms;
        }
        @keyframes gradientBg {
          0% {
            background: linear-gradient(135deg, #f3e8ff, #ede9fe, #f3e8ff);
          }
          50% {
            background: linear-gradient(135deg, #e0e7ff, #f3e8ff, #e0e7ff);
          }
          100% {
            background: linear-gradient(135deg, #f3e8ff, #ede9fe, #f3e8ff);
          }
        }
        .animate-gradient-bg {
          animation: gradientBg 6s ease infinite;
          background-size: 200% 200%;
        }
        .break-words {
          word-break: break-word;
          overflow-wrap: anywhere;
        }
        .markdown-content ul {
          margin: 1.5em 0 !important;
          padding-left: 2em !important;
        }
        .markdown-content li {
          margin-bottom: 1.5em !important;
          line-height: 1.6;
        }
        .markdown-content li + li {
          margin-top: 1.5em !important;
        }
      `}</style>
    </>
  );
}
