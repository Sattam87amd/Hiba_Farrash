"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Image from "next/image";
import {
  FaUser,
  FaGift,
  FaComments,
  FaTrashAlt,
  FaCheckCircle,
  FaBars, // Hamburger icon
  FaTimes, // Close icon
} from "react-icons/fa";
import { LuPencilLine } from "react-icons/lu";
import { FiDollarSign } from "react-icons/fi";
import { MdOutlineFeedback } from "react-icons/md";
import { CiSettings } from "react-icons/ci";
import { AiOutlineCamera } from "react-icons/ai"; // Add camera icon for upload
import PaymentMethods from "./PaymentMethod";
import DiscountCode from "./DiscountCode";
import GiftCard from "./GiftCard";
import BuyGiftCard from "./BuyGiftCard";
import ExpertContactUs from "./ExpertContactUs";
import PaymentHistory from "./PaymentHistory";
import { toast } from "react-toastify";
import DeactivateAccount from "./Deactivate";

const ProfileSection = () => {
  const [selectedSection, setSelectedSection] = useState("Profile");
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const [profileData, setProfileData] = useState({
    photoFile: "",
    firstName: "",
    lastName: "",
    phone: "",
    email: "thakur@.com",
  });

  const [expertId, setExpertId] = useState("");
  const fileInputRef = useRef(null); // Reference for file input
  const mobileNavRef = useRef(null); // Reference for mobile nav (for click outside)

  // Fetch expertId from localStorage
  useEffect(() => {
    const expertToken = localStorage.getItem("expertToken");

    if (expertToken) {
      try {
        const decodedToken = JSON.parse(atob(expertToken.split(".")[1]));
        const expertId = decodedToken._id;
        setExpertId(expertId);
      } catch (error) {
        console.error("Error parsing expertToken:", error);
      }
    } else {
      toast.error("Expert token not found in localStorage");
    }
  }, []);

  // Fetch expert details by ID on component mount
  useEffect(() => {
    if (expertId) {
      const fetchExpertDetails = async () => {
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/expertauth/${expertId}`
          );
          const {
            photoFile,
            firstName,
            lastName,
            phone = "",
            email,
          } = response.data.data;
          setProfileData({
            firstName,
            lastName,
            phone,
            email,
            photoFile,
          });
        } catch (error) {
          console.error("Error fetching expert details:", error);
          toast.error("Error fetching expert details");
        }
      };

      fetchExpertDetails();
    }
  }, [expertId]);

  // Handle clicks outside mobile nav to close it
  useEffect(() => {
    function handleClickOutside(event) {
      if (mobileNavRef.current && !mobileNavRef.current.contains(event.target) && isMobileNavOpen) {
        setIsMobileNavOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileNavOpen]);

  const handleInputChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setSuccessMessage("");
  };

  const handleSectionSelect = (section) => {
    setSelectedSection(section);
    setIsMobileNavOpen(false); // Close mobile nav after selection
  };

  useEffect(() => {
  // Check if redirected from booking page for wallet top-up
  const redirectToWallet = localStorage.getItem('redirectToWallet');
  
  // Check for query parameter in URL
  const urlParams = new URLSearchParams(window.location.search);
  const sectionParam = urlParams.get('section');
  
  if (redirectToWallet === 'true' || sectionParam === 'payment') {
    // Clear the redirect flag
    localStorage.removeItem('redirectToWallet');
    
    // Set the selected section to Payment Methods
    setSelectedSection("Payment Methods");
    
    // Clean up the URL if needed (optional - removes the query parameter)
    if (sectionParam) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }
}, []); 

  // Handle profile picture upload
  const handleProfilePictureClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("photoFile", file);

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/expertauth/updateexpert/${expertId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        // Update the profile data with the new image URL
        setProfileData({
          ...profileData,
          photoFile: response.data.data.photoFile,
        });
        toast.success("Profile picture updated successfully!");
      } else {
        toast.error(response.data.message || "Failed to update profile picture.");
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      toast.error("Error uploading profile picture. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveClick = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/expertauth/updateexpert/${expertId}`,
        {
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phone: profileData.phone,
          email: profileData.email
        }
      );

      if (response.data.success) {
        setIsEditing(false);
        setSuccessMessage("Changes Saved!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        toast.error(response.data.message || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error updating profile. Please try again.");
    }
  };

  // Navigation Items Array
  const navItems = [
    { name: "Profile", icon: FaUser },
    { name: "Payment Methods", icon: FiDollarSign },
    // { name: "Do you have code?", icon: FaGift },
    { name: "Gift Card", icon: FaGift },
    { name: "Contact Us", icon: FaComments },
    { name: "Payment History", icon: FiDollarSign },
    // { name: "Give us Feedback", icon: MdOutlineFeedback },
    { name: "Deactivate account", icon: FaTrashAlt },
  ];

  return (
    <div className="flex flex-col md:flex-row border rounded-xl overflow-hidden bg-white m-4 md:m-8 relative">
      {/* Mobile Header with Hamburger Icon - Only visible on small screens */}
      <div className="md:hidden flex items-center justify-between p-4 border-b w-full bg-white">
        <h2 className="text-lg font-semibold flex items-center">
          <CiSettings className="mr-2 text-2xl text-[#7E7E7E]" /> Settings
        </h2>
        <button
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          className="text-gray-700 focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          {isMobileNavOpen ? (
            <FaTimes className="h-6 w-6" />
          ) : (
            <FaBars className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation Drawer - Slides in from right */}
      <div
        ref={mobileNavRef}
        className={`fixed top-0 right-0 z-40 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isMobileNavOpen ? "translate-x-0" : "translate-x-full"
        } md:hidden`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center">
            <span>{selectedSection}</span>
          </h2>
          <button
            onClick={() => setIsMobileNavOpen(false)}
            className="text-gray-700 focus:outline-none"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="space-y-1 p-2">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleSectionSelect(item.name)}
              className={`flex items-center gap-3 w-full text-left p-3 rounded-lg transition ${
                selectedSection === item.name
                  ? "bg-black text-white"
                  : "hover:bg-gray-200 text-[#7E7E7E]"
              }`}
            >
              <item.icon
                className={
                  selectedSection === item.name ? "text-white" : "text-[#7E7E7E]"
                }
              />
              {item.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Backdrop for mobile nav - only visible when nav is open */}
      {isMobileNavOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}

      {/* Desktop Sidebar - Hidden on Small Screens, Visible on Medium+ */}
      <aside className="hidden md:block w-64 bg-white p-6 border-r h-[800px]">
        <h2 className="flex items-center justify-between text-lg font-semibold pb-4 border-b mb-3">
          <span>Settings</span>
          <CiSettings className="text-3xl text-[#7E7E7E]" />
        </h2>

        <nav className="space-y-6">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setSelectedSection(item.name)}
              className={`flex items-center gap-3 w-full text-left p-2 rounded-lg transition ${
                selectedSection === item.name
                  ? "bg-black text-white"
                  : "hover:bg-gray-200 text-[#7E7E7E]"
              }`}
            >
              <item.icon
                className={
                  selectedSection === item.name ? "text-white" : "text-[#7E7E7E]"
                }
              />
              {item.name}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8">
        {/* Profile Section */}
        {selectedSection === "Profile" && (
          <div className="mt-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4 md:space-x-6">
                {/* Profile Picture with Upload Functionality */}
                <div className="relative">
                  <div className="rounded-full border-2 border-white">
                    <div className="w-[100px] h-[100px] rounded-full overflow-hidden cursor-pointer relative group" onClick={handleProfilePictureClick}>
                      {profileData.photoFile ? (
                        <Image
                          src={profileData.photoFile}
                          alt="profile"
                          width={100}
                          height={100}
                          className="w-full h-full object-cover object-top"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                          <FaUser className="text-white text-3xl" />
                        </div>
                      )}
                      
                      {/* Upload overlay on hover */}
                      <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <AiOutlineCamera className="text-white text-2xl" />
                      </div>
                      
                      {/* Loading indicator */}
                      {isUploading && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                
                <div className="text-center md:text-left">
                  <h3 className="text-lg font-semibold text-[#434966]">
                    {profileData.firstName} {profileData.lastName}
                  </h3>
                  <p className="text-gray-500">India</p>
                </div>
              </div>
              <button
                className="border border-[#434966] px-4 md:px-5 py-2 text-[#434966] font-semibold rounded-lg flex items-center gap-2"
                onClick={handleEditClick}
              >
                Edit <LuPencilLine className="text-black h-5 w-5" />
              </button>
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="mt-4 flex items-center text-green-600 font-medium">
                <FaCheckCircle className="mr-2" /> {successMessage}
              </div>
            )}

            {/* Profile Form */}
            <form
              className="w-full mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6"
              onSubmit={handleSaveClick}
            >
              <div>
                <label className="block mb-2 text-sm font-medium text-[#7E7E7E]">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`bg-white border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 w-full ${
                    !isEditing ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-[#7E7E7E]">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`bg-white border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 w-full ${
                    !isEditing ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-[#7E7E7E]">
                  Mobile Number
                </label>
                <input
                  type="text"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`bg-white border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 w-full ${
                    !isEditing ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-[#7E7E7E]">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`bg-white border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 w-full ${
                    !isEditing ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                />
              </div>

              {/* Save Button */}
              <div className="col-span-1 md:col-span-2 flex justify-center mt-6 mb-10">
                <button
                  type="submit"
                  disabled={!isEditing}
                  className={`text-white font-medium rounded-2xl text-sm px-6 md:px-16 py-2.5 text-center ${
                    isEditing
                      ? "bg-black hover:bg-gray-900 focus:ring-gray-300"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Payment Methods */}
        {selectedSection === "Payment Methods" && <PaymentMethods />}

        {/* Discount Code */}
        {/* {selectedSection === "Do you have code?" && <DiscountCode />} */}

        {/* Gift Card */}
        {selectedSection === "Gift Card" && (
          <GiftCard onContinue={() => setSelectedSection("BuyGiftCard")} />
        )}

        {/* Buy Gift Card */}
        {selectedSection === "BuyGiftCard" && <BuyGiftCard />}

        {/* Contact Us */}
        {selectedSection === "Contact Us" && <ExpertContactUs />}

        {/* Payment History */}
        {selectedSection === "Payment History" && <PaymentHistory />}

        {/* Give us Feedback */}
        {selectedSection === "Give us Feedback" && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold">Give us Feedback</h2>
            <p>Your feedback matters to us.</p>
          </div>
        )}

        {/* Deactivate account */}
        {selectedSection === "Deactivate account" && (
        <DeactivateAccount />
        )}
      </div>
    </div>
  );
};

export default ProfileSection;