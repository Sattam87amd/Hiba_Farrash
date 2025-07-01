"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { LuPencilLine } from "react-icons/lu";
import { FiAtSign } from "react-icons/fi";
import { FiChevronRight } from "react-icons/fi";
import axios from "axios";

// Importing the EnableCharity and WhatToExpect components for dynamic rendering
import EnableCharity from "./EnableCharity";
import WhatToExpect from "./WhatToExpect";
import EditExampleQuestions from "./EditExampleQuestions";
import ConnectMyCalendar from "./ConnectMyCalendar";
import PreferredAvailability from "./PreferedAvailiblity";
import GroupSession from "./GroupSession";
import AvailableSessionLength from "./AvailableSessionLength";
import VideoSessionPrices from "./VideoSessionPrices";
import { toast } from "react-toastify";
import EnableFreeSession from "./EnableFreeSession";

const EditExpertProfile = ({ expertData, setExpertData, setShowProfile }) => {
  // State for mobile view
  const [isMobile, setIsMobile] = useState(false);
  const [showContent, setShowContent] = useState(false); // For mobile view
  const [expertId, setExpertId] = useState(""); // Used to store expertId if needed
  // const [isEditingProfile, setIsEditingProfile] = useState(false);
  // const [showSavedProfile, setShowSavedProfile] = useState(false);

  // Initialize with safe default values to prevent undefined errors
  const [localExpertData, setLocalExpertData] = useState({
    firstName: "",
    lastName: "",
    areaOfExpertise: "",
    email: "",
    phone: "",
    experience: "",
    country: "",
    photoFile: "/default-profile.png"
  });

  // Update localExpertData whenever expertData changes
  useEffect(() => {
    if (expertData && Object.keys(expertData).length > 0) {
      setLocalExpertData({
        firstName: expertData.firstName || "",
        lastName: expertData.lastName || "",
        areaOfExpertise: expertData.areaOfExpertise || "",
        email: expertData.email || "",
        phone: expertData.phone || "",
        experience: expertData.experience || "",
        country: expertData.country || "",
        photoFile: expertData.photoFile || "/default-profile.png"
      });

      // Update other state objects that depend on expertData


      setPersonalInfo({
        name: expertData.firstName || "",
        dateOfBirth: expertData.dateOfBirth || "",
        age: expertData.age || "",
        phoneNumber: expertData.phone || "",
        email: expertData.email || "",
        bio: expertData.areaOfExpertise || "",
      });

      setAboutMe({
        description: expertData.experience || "",
        advice: Array.isArray(expertData.advice) && expertData.advice.length > 0
          ? expertData.advice
          : ["", "", "", "", ""],
      });
    }
  }, [expertData]);

  useEffect(() => {
    const expertToken = localStorage.getItem("expertToken");

    if (expertToken) {
      try {
        // Assuming the expertToken contains the _id directly (if it's JWT)
        const decodedToken = JSON.parse(atob(expertToken.split(".")[1])); // Decode JWT token
        const expertId = decodedToken._id;
        setExpertId(expertId); // Set the expertId to state
      } catch (error) {
        console.error("Error parsing expertToken:", error);
      }
    } else {
      console.log("Expert token not found in localStorage");
    }
  }, []); // Runs once when the component mounts

  useEffect(() => {
    if (expertId) {
      const fetchExpertData = async () => {
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_PROD_API_URL}/api/expertauth/${expertId}`);
          if (response.data && response.data.data) {
            // Update both the parent component state and our local state
            setExpertData(response.data.data);
          }
        } catch (error) {
          console.error("Error fetching expert data:", error);
        }
      };

      fetchExpertData();
    }
  }, [expertId]); // Runs when expertId changes


  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize(); // initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // -------------------------------------------------------------------
  // 2) States for editing & saving in various sections
  // -------------------------------------------------------------------
  const [selectedSection, setSelectedSection] = useState("Edit Profile");

  // For "Profile" card (now using props expertData)
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showSavedProfile, setShowSavedProfile] = useState(false);

  // For "Personal Information" card
  const [personalInfo, setPersonalInfo] = useState({
    name: expertData.firstName || "",
    dateOfBirth: expertData.dateOfBirth || "",
    age: expertData.age || "",
    phoneNumber: expertData.phone || "",
    email: expertData.email || "",
    bio: expertData.areaOfExpertise || "",
  });

  const formatDateToISO = (dateStr) => {
    const [day, month, year] = dateStr.split("/");
    return `${year}-${month}-${day}`;
  };

  const formatDateToDisplay = (isoDate) => {
    const [year, month, day] = isoDate.split("T")[0].split("-");
    return `${day}/${month}/${year}`;
  };
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [showSavedPersonal, setShowSavedPersonal] = useState(false);

  // For "About Me" card

  const [aboutMe, setAboutMe] = useState({
    description: "",
    advice: [
      "Startup Struggles",
      "Customer Retention/Service",
      "The Beauty Industry",
      "Product Development",
      "Branding & PR",
    ],
  });

  const [isEditingAboutMe, setIsEditingAboutMe] = useState(false);
  const [showSavedAboutMe, setShowSavedAboutMe] = useState(false);

  // Notifications toggle
  const [isEnabled, setIsEnabled] = useState(false);

  // -------------------------------------------------------------------
  // Social Media
  // -------------------------------------------------------------------
  const [socialMedia, setSocialMedia] = useState({
    instagram: "",
    twitter: "",
    linkedin: "",
    youtube: "",
    tiktok: "",
  });
  const handleSocialMediaChange = (e) => {
    setSocialMedia({ ...socialMedia, [e.target.name]: e.target.value });
  };

  // -------------------------------------------------------------------
  // Payout toggles
  // -------------------------------------------------------------------
  const [requestTimeEnabled, setRequestTimeEnabled] = useState(false);
  const [videoCallExtensionEnabled, setVideoCallExtensionEnabled] =
    useState(false);

  // -------------------------------------------------------------------
  // 3) Sidebar Items (Secondary Sidebar)
  // -------------------------------------------------------------------
  const menuItems = [
    { name: "Edit Profile" },
    { name: "Enable Charity" },
    { name: "Enable Free Session for New Users" },
    { name: "Edit what to Expect" },
    { name: "Edit example questions" },
    { name: "Availability", isHeader: true },
    { name: "Set my preferred availability" },
    { name: "Connect my calendar" },
    // { name: "Group Sessions" },
    { name: "Offerings", isHeader: true },
    { name: "1:1 Video session prices" },
    { name: "Available session lengths" },
  ];

  // -------------------------------------------------------------------
  // 4) Handle sidebar clicks
  // -------------------------------------------------------------------
  const handleMenuClick = (itemName) => {
    setSelectedSection(itemName);
    if (isMobile) {
      setShowContent(true);
      setShowProfile(false); // Hide ExpertProfile on mobile when editing
    }
  };

  // Function to save profile changes
  const saveProfileChanges = async () => {
    try {
      // Save changes to API
      await axios.put(`${process.env.NEXT_PUBLIC_PROD_API_URL}/api/expertauth/${expertId}`, localExpertData);

      // Update parent component's state
      setExpertData(localExpertData);

      // Show saved confirmation
      setIsEditingProfile(false);
      setShowSavedProfile(true);
      setTimeout(() => setShowSavedProfile(false), 2000);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile changes. Please try again.");
    }
  };

  // -------------------------------------------------------------------
  // 5) Render: Sidebar (Secondary)
  // -------------------------------------------------------------------
  const renderSidebar = () => (
    <aside className="w-full md:w-64 bg-white p-6 border-r min-h-screen">
      <h2 className="text-lg font-semibold pb-4 border-b mb-3 text-black">
        Settings
      </h2>
      <nav className="space-y-6">
        {menuItems.map((item) =>
          item.isHeader ? (
            <h3
              key={item.name}
              className="text-black mt-4 font-semibold text-lg"
            >
              {item.name}
            </h3>
          ) : (
            <button
              key={item.name}
              onClick={() => handleMenuClick(item.name)}
              className={`flex items-center justify-between w-full text-left p-2 rounded-lg transition md:gap-3 ${selectedSection === item.name
                ? "bg-black text-white"
                : "hover:bg-gray-200 text-[#7A7D84]"
                }`}
            >
              <span className="flex items-center gap-3">{item.name}</span>
              <FiChevronRight className="md:hidden text-gray-500" />
            </button>
          )
        )}
      </nav>
    </aside>
  );

  // -------------------------------------------------------------------
  // 6) Render: Mobile-Only Back Header
  // -------------------------------------------------------------------
  const renderMobileHeader = () => (
    <div className="flex items-center justify-between p-4 bg-gray-100">
      <button
        onClick={() => {
          setShowContent(false);
          setShowProfile(true); // Show ExpertProfile when going back
        }}
        className="text-sm font-semibold text-blue-600"
      >
        &larr; Back
      </button>
      <h2 className="text-lg font-semibold text-black">{selectedSection}</h2>
      <div />
    </div>
  );

  // -------------------------------------------------------------------
  // 7) Render: Profile Card (Editable)
  // -------------------------------------------------------------------
  const renderProfileCard = () => (
    <div className="bg-white rounded-2xl p-6 border border-gray-300">
      <div className="flex flex-row items-center justify-between">
        <div className="flex items-center space-x-4 md:space-x-6">
          <Image
            src={localExpertData.photoFile || "/default-profile.png"}
            alt="Expert Profile"
            width={80}
            height={80}
            className="w-16 h-16 md:w-20 md:h-20 rounded-full"
          />
          <div className="text-left">
            {isEditingProfile ? (
              <>
                <input
                  type="text"
                  value={localExpertData.firstName}
                  onChange={(e) =>
                    setLocalExpertData({ ...localExpertData, firstName: e.target.value })
                  }
                  className="text-lg font-semibold text-[#434966] border-b border-gray-300 focus:outline-none"
                />
                <input
                  type="text"
                  value={localExpertData.lastName}
                  onChange={(e) =>
                    setLocalExpertData({ ...localExpertData, lastName: e.target.value })
                  }
                  className="text-lg font-semibold text-[#434966] border-b border-gray-300 focus:outline-none"
                />
                <input
                  type="text"
                  value={localExpertData.areaOfExpertise}
                  onChange={(e) =>
                    setLocalExpertData({ ...localExpertData, areaOfExpertise: e.target.value })
                  }
                  className="text-sm text-gray-500 border-b border-gray-300 focus:outline-none"
                />
                <input
                  type="text"
                  value={localExpertData.country}
                  onChange={(e) =>
                    setLocalExpertData({ ...localExpertData, country: e.target.value })
                  }
                  className="text-sm text-gray-500 border-b border-gray-300 focus:outline-none"
                />
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-[#434966]">
                  {localExpertData.firstName} {localExpertData.lastName}
                </h3>
                <p className="text-gray-500">{localExpertData.areaOfExpertise}</p>
                <p className="text-gray-500">{localExpertData.country || "India"}</p>
              </>
            )}
          </div>
        </div>
        {isEditingProfile ? (
          <button
            className="border border-[#434966] px-4 py-2 text-white font-medium bg-black rounded-lg flex items-center gap-2"
            onClick={saveProfileChanges}
          >
            Save
          </button>
        ) : (
          <button
            className="border border-[#434966] px-4 py-2 text-[#434966] font-medium rounded-lg flex items-center gap-2"
            onClick={() => setIsEditingProfile(true)}
          >
            Edit <LuPencilLine className="text-black h-5 w-5" />
          </button>
        )}
      </div>
      {showSavedProfile && (
        <p className="text-green-500 mt-2 animate-pulse">Changes Saved!</p>
      )}
    </div>
  );

  const savePersonalChanges = async () => {
    try {
      const payload = {
        firstName: personalInfo.name.split(" ")[0] || "",
        lastName: personalInfo.name.split(" ")[1] || "",
        dateOfBirth: formatDateToISO(personalInfo.dateOfBirth), // Ensure correct format for backend
        phone: personalInfo.phoneNumber,
        email: personalInfo.email,
        areaOfExpertise: personalInfo.bio,
      }
  
      const { data } = await axios.put(`${process.env.NEXT_PUBLIC_PROD_API_URL}/api/expertauth/${expertId}`, payload)
  
      // Update both expertData and localExpertData to ensure UI consistency
      setExpertData((prevData) => ({
        ...prevData,
        firstName: personalInfo.name.split(" ")[0] || "",
        lastName: personalInfo.name.split(" ")[1] || "",
        dateOfBirth: formatDateToISO(personalInfo.dateOfBirth),
        phone: personalInfo.phoneNumber,
        email: personalInfo.email,
        areaOfExpertise: personalInfo.bio,
        age: data.age?.toString() || prevData.age,
      }))
  
      setLocalExpertData((prevData) => ({
        ...prevData,
        firstName: personalInfo.name.split(" ")[0] || "",
        lastName: personalInfo.name.split(" ")[1] || "",
        dateOfBirth: formatDateToISO(personalInfo.dateOfBirth),
        phone: personalInfo.phoneNumber,
        email: personalInfo.email,
        areaOfExpertise: personalInfo.bio,
        age: data.age?.toString() || prevData.age, // <-- add this line
      }))
      
  
      // Update personalInfo state to reflect changes
      setPersonalInfo((prev) => ({
        ...prev,
        name: `${data.firstName || ""} ${data.lastName || ""}`,
        phoneNumber: data.phone || prev.phoneNumber,
        email: data.email || prev.email,
        bio: data.areaOfExpertise || prev.bio,
        age: data.age?.toString() || prev.age,
        dateOfBirth: data.dateOfBirth ? formatDateToDisplay(data.dateOfBirth) : prev.dateOfBirth,
      }))
      
  
      setShowSavedPersonal(true)
      setIsEditingPersonal(false)
      setTimeout(() => setShowSavedPersonal(false), 2000)
  
      toast.success("Personal information updated successfully!")
      window.location.reload()
    } catch (error) {
      console.error("Error updating personal info:", error)
      toast.error("Failed to save changes. " + (error.response?.data?.message || error.message))
    }
  }
  // -------------------------------------------------------------------
  // 8) Render: Personal Info Card (Editable)
  // -------------------------------------------------------------------
  // const savePersonalChanges = async () => {
  //   try {
  //     const payload = {
  //       firstName: personalInfo.name.split(" ")[0] || "",
  //       lastName: personalInfo.name.split(" ")[1] || "",
  //       dateOfBirth: formatDateToISO(personalInfo.dateOfBirth), // Ensure correct format for backend
  //       phone: personalInfo.phoneNumber,
  //       email: personalInfo.email,
  //       areaOfExpertise: personalInfo.bio,
  //     };

  //     const { data } = await axios.put(
  //       `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/expertauth/${expertId}`,
  //       payload
  //     );

  //     // Update frontend state
  //     setExpertData(data);
  //     setPersonalInfo((prev) => ({
  //       ...prev,
  //       age: data.age?.toString() || prev.age, // Ensure age is updated
  //       dateOfBirth: data.dateOfBirth ? formatDateToDisplay(data.dateOfBirth) : prev.dateOfBirth,
  //     }));

  //     setShowSavedPersonal(true);
  //     setIsEditingPersonal(false);
  //     setTimeout(() => setShowSavedPersonal(false), 2000);
  //   } catch (error) {
  //     console.error("Error updating personal info:", error);
  //     toast.error("Failed to save changes. " + (error.response?.data?.message || error.message));
  //   }
  // };

  const saveAboutMeChanges = async () => {
    try {
      const filteredAdvice = aboutMe.advice.filter(item => item.trim() !== "");

      const payload = {
        aboutMe: aboutMe.description,
        advice: filteredAdvice,
      };
      const { data } = await axios.put(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/expertauth/${expertId}/experience`,
        payload
      );
      if (data.success) {
        // flip out of “editing” mode, show your “Saved!” message
        setIsEditingAboutMe(false);
        setShowSavedAboutMe(true);

        // push the new values back into both parent and local state:
        setExpertData((prev) => ({
          ...prev,
          experience: data.data.experience,
          advice: data.data.advice,
        }));
        setLocalExpertData((prev) => ({
          ...prev,
          experience: data.data.experience,
          advice: data.data.advice,
        }));

        // hide the “Saved!” after 2s
        setTimeout(() => setShowSavedAboutMe(false), 2000);
      }
    } catch (err) {
      console.error("Error updating About Me:", err);
      toast.error("Failed to save your About Me. Please try again.");
    }
  };


  const renderPersonalInfoCard = () => (
    <div className="bg-white rounded-2xl p-6 border border-gray-300">
      <div className="flex flex-row items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#434966]">
          Personal Information
        </h3>
        {isEditingPersonal ? (
          <button
            className="border border-[#434966] px-4 py-2 text-white font-medium bg-black rounded-lg flex items-center gap-2"
            onClick={savePersonalChanges}
          >
            Save
          </button>
        ) : (
          <button
            className="border border-[#434966] px-4 py-2 text-[#434966] font-medium rounded-lg flex items-center gap-2"
            onClick={() => setIsEditingPersonal(true)}
          >
            Edit <LuPencilLine className="text-black h-5 w-5" />
          </button>
        )}
      </div>

      {showSavedPersonal && (
        <p className="text-green-500 mt-2 animate-pulse">Changes Saved!</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(personalInfo).map(([key, value]) => {
          const label = key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase());

          // Custom handling for date input
          if (key === "dateOfBirth") {
            return (
              <div key={key}>
                <label className="block text-[#7A7D84] text-sm font-medium mb-1">
                  {label}
                </label>
                {isEditingPersonal ? (
                  <input
                    type="date"
                    value={formatDateToISO(value)} // input expects yyyy-mm-dd
                    onChange={(e) =>
                      setPersonalInfo({
                        ...personalInfo,
                        [key]: formatDateToDisplay(e.target.value), // store as dd/mm/yyyy
                      })
                    }
                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-black focus:border-black block w-full p-2.5"
                  />
                ) : (
                  <p className="text-[#434966] font-semibold">{value.slice(0, 10) || ""}</p>
                )}
              </div>
            );
          }

          return (
            <div key={key}>
              <label className="block text-[#7A7D84] text-sm font-medium mb-1">
                {label}
              </label>
              {isEditingPersonal ? (
                <input
                  type="text"
                  value={value || ""}
                  onChange={(e) =>
                    setPersonalInfo({ ...personalInfo, [key]: e.target.value })
                  }
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-black focus:border-black block w-full p-2.5"
                />
              ) : (
                <p className="text-[#434966] font-semibold">{value || ""}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );


  // -------------------------------------------------------------------
  // 9) Render: About Me Card (Editable)
  // -------------------------------------------------------------------




  const renderAboutMeCard = () => (
    <div className="bg-white rounded-2xl p-6 border border-gray-300">
      <div className="flex flex-row items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-black">About Me</h3>
        <div className="flex items-center gap-2">
          {isEditingAboutMe ? (
            <button
              className="border border-[#434966] px-4 py-2 text-white font-medium bg-black rounded-lg flex items-center gap-2"
              onClick={saveAboutMeChanges}
            >
              Save
            </button>
          ) : (
            <button
              className="border border-[#434966] px-4 py-2 text-[#434966] font-medium rounded-lg flex items-center gap-2"
              onClick={() => setIsEditingAboutMe(true)}
            >
              Edit <LuPencilLine className="text-black h-5 w-5" />
            </button>
          )}
        </div>
      </div>
      {showSavedAboutMe && (
        <p className="text-green-500 mt-2 animate-pulse">Changes Saved!</p>
      )}
      {isEditingAboutMe ? (
        <>
          <textarea
            value={aboutMe.description || ""}
            onChange={(e) =>
              setAboutMe({ ...aboutMe, description: e.target.value })
            }
            className="w-full border border-gray-300 rounded-xl p-2.5 text-gray-900 focus:ring-black focus:border-black"
          />
          <h3 className="mt-4 text-md font-semibold text-black">
            Things I Can Advise On:
          </h3>
          {aboutMe.advice.map((item, index) => (
            <div key={index} className="flex items-center gap-2 mt-2">
              <input
                type="text"
                value={item || ""}
                onChange={(e) => {
                  const newAdvice = [...aboutMe.advice];
                  newAdvice[index] = e.target.value;
                  setAboutMe({ ...aboutMe, advice: newAdvice });
                }}
                className="w-full border border-gray-300 rounded-xl p-2.5 text-gray-900 focus:ring-black focus:border-black"
              />
              <button 
                className="text-red-500"
                onClick={() => {
                  const newAdvice = [...aboutMe.advice];
                  newAdvice.splice(index, 1);
                  setAboutMe({ ...aboutMe, advice: newAdvice });
                }}
              >
                ✕
              </button>
            </div>
          ))}
          <button
            className="mt-3 text-blue-600 flex items-center gap-1"
            onClick={() => setAboutMe({ ...aboutMe, advice: [...aboutMe.advice, ""] })}
          >
            <span className="text-lg">+</span> Add another advice item
          </button>
        </>
      ) : (
        <>
          <p className="text-[#434966]">{aboutMe.description || ""}</p>
          <h3 className="mt-4 text-md font-semibold text-black">
            Things I Can Advise On:
          </h3>
          <ul className="text-[#434966]">
            {aboutMe.advice.filter(item => item.trim() !== "").map((item, index) => (
              <li key={index}>- {item}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
  // -------------------------------------------------------------------
  // 10) Combined "Edit Profile" Content
  // -------------------------------------------------------------------
  const renderEditProfileContent = () => (
    <>
      {renderProfileCard()}
      {renderPersonalInfoCard()}
      {renderAboutMeCard()}

      {/* ---------------- GENERAL NOTIFICATIONS ---------------- */}
      <div className="bg-white rounded-2xl p-6 border border-gray-300">
        <h3 className="text-lg font-semibold text-[#232323] mb-4">General</h3>
        <div className="flex items-center justify-between">
          <span className="text-black font-medium">Notifications</span>
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isEnabled}
              onChange={() => setIsEnabled(!isEnabled)}
            />
            <div
              className={`relative w-11 h-6 rounded-full transition ${isEnabled ? "bg-black" : "bg-gray-200"
                } peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-black`}
            >
              <div
                className={`absolute top-[2px] left-[2px] bg-white border-gray-300 border w-5 h-5 rounded-full transition-all ${isEnabled ? "translate-x-full border-white" : ""
                  }`}
              ></div>
            </div>
          </label>
        </div>
      </div>

      {/* ---------------- SOCIAL MEDIA LINKS ---------------- */}
      <div className="bg-white p-6 rounded-2xl border border-gray-300">
        <h3 className="text-lg font-semibold text-black mb-4">
          Social Media Links
        </h3>
        {[
          { label: "Instagram", name: "instagram" },
          { label: "Twitter", name: "twitter" },
          { label: "LinkedIn", name: "linkedin" },
          { label: "YouTube", name: "youtube" },
          { label: "TikTok", name: "tiktok" },
        ].map((social) => (
          <div key={social.name} className="mb-4 py-1">
            <label className="block mb-2 text-sm font-semibold text-black">
              {social.label} Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FiAtSign className="text-gray-500" />
              </div>
              <input
                type="text"
                name={social.name}
                value={socialMedia[social.name]}
                onChange={handleSocialMediaChange}
                placeholder="username (optional)"
                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-black focus:border-black block w-full pl-10 p-2.5 py-3"
              />
            </div>
          </div>
        ))}
        <div className="flex justify-center items-center">
          <button className="w-44 bg-black text-white text-sm font-semibold py-2.5 rounded-2xl mt-4">
            Save
          </button>
        </div>
      </div>
    </>
  );

  // -------------------------------------------------------------------
  // 11) Render: Content Container (Includes dynamic "Enable Charity", "WhatToExpect")
  // -------------------------------------------------------------------
  const renderContent = () => (
    <div className="flex-1 p-6 md:p-8 bg-white space-y-6">
      {selectedSection === "Edit Profile" && renderEditProfileContent()}
      {selectedSection === "Enable Charity" && <EnableCharity />}
      {selectedSection === "Enable Free Session for New Users" && <EnableFreeSession />}
      {selectedSection === "Edit what to Expect" && <WhatToExpect />}
      {selectedSection === "Edit example questions" && <EditExampleQuestions />}
      {selectedSection === "Connect my calendar" && <ConnectMyCalendar />}
      {selectedSection === "Set my preferred availability" && <PreferredAvailability />}
      {selectedSection === "Group Sessions" && <GroupSession />}
      {selectedSection === "Available session lengths" && <AvailableSessionLength />}
      {selectedSection === "1:1 Video session prices" && <VideoSessionPrices />}
    </div>
  );

  // -------------------------------------------------------------------
  // 12) Main Container (Side-by-side layout)
  // -------------------------------------------------------------------
  const renderMainContainer = () => (
    <div className="flex flex-col md:flex-row border rounded-xl overflow-hidden bg-white min-h-screen">
      {renderSidebar()}
      {renderContent()}
    </div>
  );

  // -------------------------------------------------------------------
  // 13) Payout Section (Outside the Border)
  // -------------------------------------------------------------------
  // const renderPayoutSection = () =>
  //   selectedSection === "Edit Profile" &&
  //   (!isMobile || showContent) && (
  //     <section className="mx-auto w-full p-6">
  //       <div className="w-full bg-white p-6 space-y-12">
  //         {/* Current Balance */}
  //         <div className="flex justify-between items-center">
  //           <h2 className="text-lg font-semibold text-black">
  //             Current Balance
  //           </h2>
  //           <div className="border border-gray-300 rounded-lg md:px-36 px-10 py-2 text-lg font-medium">
  //             $0
  //           </div>
  //         </div>

  //         {/* Payout Reports */}
  //         <div>
  //           <h3 className="text-lg font-semibold text-black">Payout reports</h3>
  //         </div>

  //         {/* Payout Methods */}
  //         <div className="md:flex justify-between items-center">
  //           <h3 className="text-lg font-semibold text-black">Payout methods</h3>
  //           <img
  //             src="/bankcards.png"
  //             alt="Payout Methods"
  //             className="mt-2 md:mt-0 h-6 object-contain"
  //           />
  //         </div>

  //         {/* Allow "Request a Time" */}
  //         <div className="flex flex-col gap-2">
  //           <div className="flex justify-between items-center">
  //             <h3 className="text-lg font-semibold text-black">
  //               Allow "request a time"{" "}
  //               <span className="text-gray-500">(Recommended)</span>
  //             </h3>
  //             <label className="inline-flex items-center cursor-pointer">
  //               <input
  //                 type="checkbox"
  //                 className="sr-only peer"
  //                 checked={requestTimeEnabled}
  //                 onChange={() => setRequestTimeEnabled(!requestTimeEnabled)}
  //               />
  //               <div
  //                 className={`relative w-11 h-6 rounded-full transition ${requestTimeEnabled ? "bg-black" : "bg-gray-300"
  //                   }`}
  //               >
  //                 <div
  //                   className={`absolute top-[2px] left-[2px] bg-white border-gray-300 border w-5 h-5 rounded-full transition-all ${requestTimeEnabled ? "translate-x-full border-white" : ""
  //                     }`}
  //                 ></div>
  //               </div>
  //             </label>
  //           </div>
  //           <p className="text-sm text-gray-500">
  //             When your availability is low or sold out, this feature allows
  //             users to request dates/times (at least seven days out). You can
  //             always accept or decline these requests.
  //           </p>
  //         </div>

  //         {/* Allow Video Call Extensions */}
  //         <div className="flex flex-col gap-2">
  //           <div className="flex justify-between items-center">
  //             <h3 className="text-lg font-semibold text-black">
  //               Allow video call extensions
  //             </h3>
  //             <label className="inline-flex items-center cursor-pointer">
  //               <input
  //                 type="checkbox"
  //                 className="sr-only peer"
  //                 checked={videoCallExtensionEnabled}
  //                 onChange={() =>
  //                   setVideoCallExtensionEnabled(!videoCallExtensionEnabled)
  //                 }
  //               />
  //               <div
  //                 className={`relative w-11 h-6 rounded-full transition ${videoCallExtensionEnabled ? "bg-black" : "bg-gray-300"
  //                   }`}
  //               >
  //                 <div
  //                   className={`absolute top-[2px] left-[2px] bg-white border-gray-300 border w-5 h-5 rounded-full transition-all ${videoCallExtensionEnabled
  //                     ? "translate-x-full border-white"
  //                     : ""
  //                     }`}
  //                 ></div>
  //               </div>
  //             </label>
  //           </div>
  //           <p className="text-sm text-gray-500">
  //             During a session, users can pay & request a video call extension.
  //             You can always accept or decline these requests.
  //           </p>
  //         </div>
  //       </div>
  //     </section>
  //   );

  // -------------------------------------------------------------------
  // 14) Final Return
  // -------------------------------------------------------------------
  return (
    <div className="bg-white min-h-screen">
      {/* DESKTOP (>= md) => side-by-side; MOBILE (< md) => show either sidebar or content */}
      {!isMobile ? (
        <>
          {renderMainContainer()}
        </>
      ) : (
        <>
          {!showContent ? (
            <div className="border rounded-xl overflow-hidden bg-white min-h-screen">
              {renderSidebar()}
            </div>
          ) : (
            <div className="border rounded-xl overflow-hidden bg-white min-h-screen">
              {renderMobileHeader()}
              {renderContent()}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EditExpertProfile;