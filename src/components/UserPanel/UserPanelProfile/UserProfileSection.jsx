import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { FaUser, FaCloudUploadAlt, FaComments, FaTrashAlt, FaCheckCircle, FaBars } from "react-icons/fa";
import { LuPencilLine } from "react-icons/lu";
import { FiDollarSign } from "react-icons/fi";
import { BiLogOut } from "react-icons/bi";
import { MdOutlineFeedback } from "react-icons/md";
import { CiSettings } from "react-icons/ci";
import { IoMdClose } from "react-icons/io";
import UserExpertContactUs from "./UserExpertContactUs";
import UserBuyGiftCard from "./UserBuyGiftCard";
import UserDiscountCode from "./UserDiscountCode";
import UserPaymentMethods from "./UserPaymentMethods";
import UserGiftCard from "./UserGiftCard";
import UserPaymentHistory from "./UserPaymentHistory";
import { toast } from "react-toastify";
import useAxiosTokenRefresher from "@/hooks/useAxiosTokenRefresher";

const UserProfileSection = () => {
  useAxiosTokenRefresher()
  const [selectedSection, setSelectedSection] = useState("Profile");
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    photoFile: "",
  });
  const [userId, setUserId] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get userId from the token
  useEffect(() => {
    const userToken = localStorage.getItem("userToken");
    if (userToken) {
      try {
        const decodedToken = JSON.parse(atob(userToken.split(".")[1]));
        const userId = decodedToken._id;
        setUserId(userId);
      } catch (error) {
        console.error("Error Parsing Token", error);
      }
    } else {
      toast.error("User Token not found. Please log in.");
    }
  }, []);

  // Fetch user details after getting userId
  useEffect(() => {
    if (userId) {
      const fetchUserDetails = async () => {
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/userauth/${userId}`
          );
          const { firstName, lastName, phone = " ", email, photoFile } = response.data.data;
          setProfileData({
            firstName,
            lastName,
            phone,
            email,
            photoFile,
          });
        } catch (error) {
          console.error("Error fetching user details:", error);
          toast.error("Error fetching user details.");
        }
      };
      fetchUserDetails();
    }
  }, [userId]);

  // Effect to handle section navigation from URL parameters
  useEffect(() => {
    // Check for both 'section' and 'tab' parameters
    const sectionParam = searchParams.get('section');
    const tabParam = searchParams.get('tab');
    
    if (sectionParam === 'payment') {
      setSelectedSection("Payment Methods");
      const redirectToWallet = localStorage.getItem('redirectToWallet');
      if (redirectToWallet === 'true') {
        localStorage.removeItem('redirectToWallet');
      }
    } else if (tabParam === 'giftcard') {
      // Handle the gift card tab parameter
      setSelectedSection("Gift Card");
    }
    // Add other section/tab parameter handling here if needed in the future
  }, [searchParams]);

  // Handle file input for photo upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      const formData = new FormData();
      formData.append("photoFile", file);

      axios
        .post(`${process.env.NEXT_PUBLIC_PROD_API_URL}/api/userauth/uploadProfileImage/${userId}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          setProfileData({ ...profileData, photoFile: response.data.user.photoFile });
          setSuccessMessage("Profile image updated successfully!");
          setTimeout(() => setSuccessMessage(""), 3000);
        })
        .catch((error) => {
          console.error("Error uploading image:", error);
          toast.error("Error uploading image.");
        });
    }
  };

  const handleInputChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setSuccessMessage("");
  };

  const handleSaveClick = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/userauth/updateuser/${userId}`,
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

  // Handle sign out: remove token and redirect to home page
  const handleSignOut = () => {
    localStorage.removeItem("userToken");
    router.push("/");
  };

  // Handle section selection for mobile
  const handleSectionSelect = (section) => {
    setSelectedSection(section);
    setMobileMenuOpen(false); // Close mobile menu after selection
  };

  // Menu items for sidebar
  const menuItems = [
    { name: "Profile", icon: FaUser },
    { name: "Payment Methods", icon: FiDollarSign },
    // { name: "Do you have code?", icon: FaCloudUploadAlt },
    { name: "Gift Card", icon: FaCloudUploadAlt },
    { name: "Contact Us", icon: FaComments },
    { name: "Payment History", icon: FiDollarSign },
    // { name: "Give us Feedback", icon: MdOutlineFeedback },
    { name: "Sign Out", icon: BiLogOut },
    // { name: "Deactivate account", icon: FaTrashAlt },
  ];

  return (
    <div className="flex flex-col md:flex-row border rounded-xl overflow-hidden bg-white m-4 md:m-8">
      {/* Mobile Header with hamburger menu */}
      <div className="md:hidden flex items-center justify-between p-4 border-b">
        <div className="flex items-center">
          <CiSettings className="text-2xl text-[#7E7E7E] mr-2" />
          <h2 className="text-lg font-semibold">Settings</h2>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-2xl text-[#434966] focus:outline-none"
        >
          {mobileMenuOpen ? <IoMdClose /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-gray-600 bg-opacity-75 z-40" 
             onClick={() => setMobileMenuOpen(false)}>
        </div>
      )}

      {/* Mobile Sidebar */}
      <div className={`md:hidden fixed inset-y-0 right-0 transform ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} transition duration-300 ease-in-out z-50 w-64 bg-white shadow-lg overflow-y-auto`}>
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button onClick={() => setMobileMenuOpen(false)} className="text-2xl text-[#434966]">
            <IoMdClose />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          {menuItems.map((item) =>
            item.name === "Sign Out" ? (
              <button
                key={item.name}
                onClick={handleSignOut}
                className={`flex items-center gap-3 w-full text-left p-2 rounded-lg transition ${
                  selectedSection === item.name
                    ? "bg-black text-white"
                    : "hover:bg-gray-200 text-[#7E7E7E]"
                }`}
              >
                <item.icon
                  className={
                    selectedSection === item.name
                      ? "text-white"
                      : "text-[#7E7E7E]"
                  }
                />
                {item.name}
              </button>
            ) : (
              <button
                key={item.name}
                onClick={() => handleSectionSelect(item.name)}
                className={`flex items-center gap-3 w-full text-left p-2 rounded-lg transition ${
                  selectedSection === item.name
                    ? "bg-black text-white"
                    : "hover:bg-gray-200 text-[#7E7E7E]"
                }`}
              >
                <item.icon
                  className={
                    selectedSection === item.name
                      ? "text-white"
                      : "text-[#7E7E7E]"
                  }
                />
                {item.name}
              </button>
            )
          )}
        </nav>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 bg-white p-6 border-r h-[800px]">
        <h2 className="flex items-center justify-between text-lg font-semibold pb-4 border-b mb-3">
          <span>Settings</span>
          <CiSettings className="text-3xl text-[#7E7E7E]" />
        </h2>

        <nav className="space-y-6">
          {menuItems.map((item) =>
            item.name === "Sign Out" ? (
              <button
                key={item.name}
                onClick={handleSignOut}
                className={`flex items-center gap-3 w-full text-left p-2 rounded-lg transition ${
                  selectedSection === item.name
                    ? "bg-black text-white"
                    : "hover:bg-gray-200 text-[#7E7E7E]"
                }`}
              >
                <item.icon
                  className={
                    selectedSection === item.name
                      ? "text-white"
                      : "text-[#7E7E7E]"
                  }
                />
                {item.name}
              </button>
            ) : (
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
                    selectedSection === item.name
                      ? "text-white"
                      : "text-[#7E7E7E]"
                  }
                />
                {item.name}
              </button>
            )
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8">
        {/* Section Title for Mobile */}
        <div className="md:hidden mb-4">
          <h3 className="text-xl font-semibold text-[#434966]">{selectedSection}</h3>
        </div>

        {/* Profile Section */}
        {selectedSection === "Profile" && (
          <div className="mt-2 md:mt-6">
            <div className="flex flex-col md:flex-row items-center md:items-center md:justify-between w-full space-y-4 md:space-y-0 md:space-x-4 md:w-[90%]">
              <div className="flex flex-col md:flex-row items-center md:items-center md:space-x-4 w-full md:w-auto">
                {/* Image with a cloud upload icon */}
                <div className="w-[100px] h-[100px] rounded-full overflow-hidden relative mb-3 md:mb-0">
                  <Image
                    src={imagePreview || profileData.photoFile || "/default-profile.png"}
                    alt="profile"
                    width={100}
                    height={100}
                    className="w-full h-full object-cover"
                  />
                  <label
                    htmlFor="imageUpload"
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <FaCloudUploadAlt className="w-8 h-8 text-white" />
                  </label>
                  <input id="imageUpload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </div>

                <div className="text-center md:text-left flex-grow md:flex-shrink-0">
                  <h3 className="text-lg font-semibold text-[#434966]">
                    {profileData.firstName} {profileData.lastName}
                  </h3>
                  <p className="text-gray-500">India</p>
                </div>
              </div>

              <button
                className="border border-[#434966] px-4 md:px-5 py-2 text-[#434966] font-semibold rounded-lg flex items-center justify-center gap-2 w-full md:w-auto"
                onClick={handleEditClick}
              >
                Edit <LuPencilLine className="text-black h-5 w-5" />
              </button>
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="mt-4 flex items-center justify-center md:justify-start text-green-600 font-medium">
                <FaCheckCircle className="mr-2" /> {successMessage}
              </div>
            )}

            {/* Profile Form */}
            <form
              className="w-full mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3"
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

        {/* Other Sections */}
        {selectedSection === "Payment Methods" && <UserPaymentMethods />}
        {/* {selectedSection === "Do you have code?" && <UserDiscountCode />} */}
        {selectedSection === "Gift Card" && (
          <UserGiftCard onContinue={() => setSelectedSection("BuyGiftCard")} />
        )}
        {selectedSection === "BuyGiftCard" && <UserBuyGiftCard />}
        {selectedSection === "Contact Us" && <UserExpertContactUs />}
        {selectedSection === "Payment History" && <UserPaymentHistory />}
      </div>
    </div>
  );
};

export default UserProfileSection;