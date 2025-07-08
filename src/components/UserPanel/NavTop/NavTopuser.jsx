"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FaBell, FaChevronDown } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import GoogleTranslateButton from "../../GoogleTranslateButton"; // Import the component

const Navtop = ({ activeTab }) => {
  const router = useRouter();

  const [userData, setUserData] = useState({
    name: "",
    profilePic: null,
  });

  const [user, setUser] = useState({
    name: "",
    email: "",
    profilePic: null,
  });

  const [userId, setUserId] = useState("");

  // ✅ Get userId from token in localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userToken = localStorage.getItem("userToken"); // Make sure you store it with this key
      if (userToken) {
        try {
          const decodedToken = JSON.parse(atob(userToken.split(".")[1]));
          setUserId(decodedToken._id);
        } catch (error) {
          console.error("Error decoding userToken:", error);
        }
      } else {
        console.warn("User token not found in localStorage");
        router.push("/"); // redirect if token not found
      }
    }
  }, [router]);

  // ✅ Fetch user data from backend
  useEffect(() => {
    if (userId) {
      const fetchUserData = async () => {
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_PROD_API_URL}/api/userauth/${userId}`);
          setUser(response.data.user);
          const { firstName, lastName, photoFile } = response.data.data;
          setUser(response.data.data);
          setUserData({
            name: `${firstName} ${lastName}`,
            profilePic: photoFile || "/default-profile.png", // replace with actual image URL if available
          });
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };

      fetchUserData();
    }
  }, [userId]);

  return (
    <div className="flex justify-between items-center bg-white py-4 px-6 shadow-sm">
      <div>
        <p className="text-gray-500 text-sm">Hi, {userData.name || "Loading..."}</p>
        <h1 className="text-2xl font-bold">{activeTab}</h1>
      </div>

      <div className="flex items-center space-x-6">
        {/* Replace the language dropdown with GoogleTranslateButton */}
        <GoogleTranslateButton />

        <div className="relative cursor-pointer hover:text-black">
          <FaBell className="text-lg" />
          <span className="absolute top-0 right-0 bg-red-500 w-2 h-2 rounded-full"></span>
        </div>

        <Link href="/userpanel/booksession">
          <div className="flex items-center space-x-2 cursor-pointer">
            {/* Use Next.js Image component for profile picture */}
            {userData.profilePic ? (
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-gray-200">
                <Image
                  src={userData.profilePic}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-300"></div> // Fallback if image is not loaded
            )}
            <p className="text-sm font-semibold">{userData.name || "Loading..."}</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Navtop;