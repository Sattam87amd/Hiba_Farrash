"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaRegPaperPlane } from "react-icons/fa";

const experts = [
  { name: "Alice Johnson", image: "/ralphedwards.png" },
  { name: "James Brown", image: "/ralphedwards.png" },
  { name: "Sophia Martinez", image: "/ralphedwards.png" },
  { name: "Michael Lee", image: "/ralphedwards.png" },
  { name: "Olivia Davis", image: "/ralphedwards.png" },
  { name: "Emma Wilson", image: "/ralphedwards.png" },
];

const randomReplies = [
  "That's a great question!",
  "Let me explain that in more detail.",
  "We can explore that further if you'd like.",
  "I'll provide a detailed answer shortly.",
  "That's an interesting perspective!",
];

const ExpertChat = () => {
  const [selectedExpert, setSelectedExpert] = useState(experts[0]);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const router = useRouter();

  const handleSendMessage = () => {
    if (inputMessage.trim() !== "") {
      const newMessage = {
        sender: "You",
        text: inputMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, newMessage]);
      setInputMessage("");

      // Simulate typing and expert response
      setIsTyping(true);
      setTimeout(() => {
        const expertMessage = {
          sender: selectedExpert.name,
          text: randomReplies[Math.floor(Math.random() * randomReplies.length)],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, expertMessage]);
        setIsTyping(false);
      }, 1000);
    }
  };

  // Remove or comment out the useEffect for auto-scroll
  // useEffect(() => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  // }, [messages, isTyping]);

  return (
    <div className="flex flex-col md:flex-row h-auto bg-gray-200 p-4">

      {/* Left Section */}
      <div className="w-full md:w-1/4 space-y-4">
        
        {/* Buttons Section */}
        <div className="flex space-x-2">
          <button
            onClick={() => router.push("/expertpanel/chat")}
            className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-200 transition"
          >
            Chat with Users
          </button>
          {/* <button className="px-4 py-2 bg-black text-white rounded-lg">
            Chat with Experts
          </button> */}
        </div>

        {/* Expert List Section */}
        <div className="p-4 overflow-y-auto bg-white shadow-lg rounded-lg h-[400px]">
          {experts.map((expert, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              onClick={() => setSelectedExpert(expert)}
              className={`flex items-center gap-3 p-3 mb-2 rounded-lg cursor-pointer ${
                selectedExpert.name === expert.name ? "border-2 border-blue-500 bg-gray-200" : "bg-gray-100"
              }`}
            >
              <img src={expert.image} alt={expert.name} className="w-10 h-10 rounded-full" />
              <span className="text-sm font-semibold">{expert.name}</span>
            </motion.div>
          ))}
        </div>

      </div>

      {/* Chat Section */}
      <div className="w-full md:w-3/4 p-4">
        <div className="h-[500px] bg-gray-100 rounded-xl shadow-lg p-4 flex flex-col justify-between">
          
          <div className="overflow-y-auto flex-1">
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`flex ${msg.sender === "You" ? "justify-end" : "justify-start"}`}
              >
                <div className={`p-3 max-w-[80%] rounded-lg ${msg.sender === "You" ? "bg-blue-500 text-white" : "bg-white"}`}>
                  <p className="text-sm">{msg.text}</p>
                  <span className="text-xs text-gray-400">{msg.time}</span>
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <div className="text-sm italic text-gray-400">
                {selectedExpert.name} is typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Section */}
          <div className="flex items-center mt-4 border rounded-lg p-2 bg-white shadow">
            <input
              type="text"
              placeholder="Type Something..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1 bg-transparent outline-none p-2 text-sm md:text-base"
            />
            <button
              onClick={handleSendMessage}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <FaRegPaperPlane size={18} />
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};

export default ExpertChat;