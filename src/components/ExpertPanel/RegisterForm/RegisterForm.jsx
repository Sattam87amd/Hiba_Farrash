"use client";

import Image from "next/image";
import { IoIosSearch } from "react-icons/io";
import { LuNotepadText } from "react-icons/lu";
import { Inter } from "next/font/google";
import { useState, useRef, useEffect } from "react";
import { FiLink } from "react-icons/fi";
import { useRouter } from "next/navigation";
import axios from "axios"; // Import axios for making HTTP requests
// const [price, setPrice] = useState('');
import { toast, ToastContainer } from "react-toastify";

import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import "react-toastify/dist/ReactToastify.css";

const interFont = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

function RegisterForm() {
  const router = useRouter();

  const validateLinkedInLink = (link) => {
    const linkedinPattern = /^(https?:\/\/)?(www\.)?linkedin\.com\/.*$/;
    return linkedinPattern.test(link);
  };

  // States for storing form data
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [mobile, setMobile] = useState("");
  const [socialLink, setSocialLink] = useState("");
  const [areaOfExpertise, setAreaOfExpertise] = useState("");
  const [specificArea, setSpecificArea] = useState("");
  const [experience, setExperience] = useState("");
  const [category, setCategory] = useState(""); // Category field
  const [errors, setErrors] = useState({});
  const [certificationFileName, setCertificationFileName] = useState("");
  const [photoFileName, setPhotoFileName] = useState("");
  const [price, setPrice] = useState("");

  const fileInputRefCertifications = useRef(null);
  const fileInputRefPhotos = useRef(null);

  // Fetch data from localStorage
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("registerData")) || {};
    setFirstName(userData.firstName || "");
    setLastName(userData.lastName || "");
    setEmail(userData.email || "");
    setGender(userData.gender || ""); // Ensure gender is set here
  }, []);

  // Validate required fields before submission
  const handleValidation = () => {
    const tempErrors = {};

    if (!firstName) tempErrors.firstName = "First name is required.";
    if (!lastName) tempErrors.lastName = "Last name is required.";
     if (!mobile || !isValidPhoneNumber(mobile)) tempErrors.mobile = "Valid phone number is required.";
    if (!email) tempErrors.email = "Email address is required.";
    // if (!category) tempErrors.category = "Category is required.";

    setErrors(tempErrors);

    if (Object.keys(tempErrors).length !== 0) {
      toast.error(Object.values(tempErrors).join("\n"));
      return false;
    }
    return true;
  };

  const handleFileChangeCertifications = (event) => {
    const file = event.target.files[0];
    if (file) {
      const fileExtension = file.name.split(".").pop().toLowerCase();
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          file: "Max 10 MB files can be uploaded",
        }));
        document.getElementById("file-display-certifications").value = "";
      }
      // Validate file type (only allow PDF, JPG, JPEG, PNG)
      else if (["pdf", "jpg", "jpeg", "png"].includes(fileExtension)) {
        setCertificationFileName(file.name);
        setErrors((prev) => ({ ...prev, file: "" }));
      } else {
        setErrors((prev) => ({
          ...prev,
          file: "Only PDF, JPG, JPEG, PNG files are allowed",
        }));
        document.getElementById("file-display-certifications").value = "";
      }
    }
  };

  const handleFileChangePhotos = (event) => {
    const file = event.target.files[0];
    if (file) {
      const fileExtension = file.name.split(".").pop().toLowerCase();
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          file: "Max 10 MB files can be uploaded",
        }));
        document.getElementById("file-display-photos").value = "";
      }
      // Validate file type (only allow JPG, JPEG, PNG)
      else if (["jpg", "jpeg", "png"].includes(fileExtension)) {
        setPhotoFileName(file.name);
        setErrors((prev) => ({ ...prev, file: "" }));
      } else {
        setErrors((prev) => ({
          ...prev,
          file: "Only JPG, JPEG, PNG files are allowed",
        }));
        document.getElementById("file-display-photos").value = "";
      }
    }
  };

  // Handle form submission and send data to backend
  // Handle form submission and send data to backend
  const handleSubmit = async (e) => {
  e.preventDefault(); // Prevent page reload

  // Check if socialLink is empty before validating LinkedIn link
  if (!socialLink) {
    toast.error("Please enter your LinkedIn link.");
    return; // Prevent form submission if socialLink is empty
  }

  // LinkedIn URL validation
  if (socialLink && !validateLinkedInLink(socialLink)) {
    toast.error("Please enter a valid LinkedIn link.");
    return; // Prevent form submission if the link is not valid
  }

  if (handleValidation()) {
    // Create a new FormData object to hold the form data and files
    const formData = new FormData();

    // Format phone number before sending - REMOVE THE "+" SYMBOL
    const formattedPhone = mobile ? mobile.replace(/^\+/, '') : '';

    // Append form data
    formData.append("email", email);
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("gender", gender);
    formData.append("phone", formattedPhone); // Use the formatted phone number
    formData.append("socialLink", socialLink);
    formData.append("areaOfExpertise", areaOfExpertise);
   
    formData.append("experience", experience);
    formData.append("price", Number(price));

      // Append certification and photo files if selected
      if (fileInputRefCertifications.current.files[0]) {
        formData.append(
          "certificationFile",
          fileInputRefCertifications.current.files[0]
        );
      }
      if (fileInputRefPhotos.current.files[0]) {
        formData.append("photoFile", fileInputRefPhotos.current.files[0]);
      }

      try {
        // API call to register the expert
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/expertauth/register`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data", // Ensure correct content type for file uploads
            },
          }
        );

        console.log("Expert registered successfully:", response.data);
        toast.success("Expert registered successfully");
        localStorage.removeItem("registerData"); // Clear localStorage after successful registration
        router.push("/expertlogin"); // Redirect to login after successful registration
      } catch (error) {
        console.error("Error during registration:", error);
        toast.error("Error during registration. Please try again.");
       
      }
    }
  };

  useEffect(() => {
  // Ensure mobile is initialized as a string
  if (mobile === null || mobile === undefined) {
    setMobile("");
  }
}, [mobile]);

  const handleKeyDown=(e)=>{
    if (e.key==="Enter"){
      handleSubmit(e);
    }
  };

  return (
    <div className={`min-h-screen flex overflow-hidden ${interFont.variable}`}>
      {/* Left Side Section (Hidden on small screens, visible on md+) */}
      <div className="hidden md:flex w-1/2 flex-col relative">
        <div className="relative">
          <Image
            src="/AwabWomen.png"
            alt="Arab Woman"
            height={0}
            width={900}
            className="object-cover"
            style={{ height: "980px" }}
          />
        </div>
      </div>

      {/* Right Side Section with Form */}
      <div className="w-full md:w-1/2 bg-white flex flex-col items-center justify-start relative">
        <div className="w-[93%] py-8">
          <h1 className="text-3xl md:text-[40px] font-bold mt-2 pb-10 text-center">
            Please Enter Your Info
          </h1>

          <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
            {/* First Name */}
            <div className="grid gap-6 mb-6 md:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-500">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    setErrors({ ...errors, firstName: "" });
                  }}
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  placeholder="Basim"
                  required
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.firstName}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-500">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    setErrors({ ...errors, lastName: "" });
                  }}
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  placeholder="Thakur"
                  required
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Mobile Number and Email */}
            <div className="grid gap-6 mb-6 md:grid-cols-2">
           <div>
  <label className="block mb-2 text-sm font-medium text-gray-500">
    Mobile Number
  </label>
  <PhoneInput
  international
  defaultCountry="SA"
  value={mobile || ""}
  onChange={(value) => setMobile(value || "")}
  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
/>
  {errors.mobile && (
    <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>
  )}
</div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-500">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors({ ...errors, email: "" });
                  }}
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  placeholder="basim@gmail.com"
                  required
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Gender Dropdown */}
            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-500">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => {
                  setGender(e.target.value);
                  setErrors({ ...errors, gender: "" });
                }}
                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
              {errors.gender && (
                <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
              )}
            </div>

            {/* Social Media Link */}
            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-500">
                Social Media Link
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={socialLink}
                  onChange={(e) => setSocialLink(e.target.value)}
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-3"
                  placeholder="Enter LinkedIn link" // **Updated Placeholder**
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <FiLink className="text-black" />
                </span>
              </div>
            </div>

            {/* Area of Expertise and Price */}
            {/* Area of Expertise and Price */}
            <div className="mb-6 flex space-x-4">
              <div className="w-1/2">
                <label className="block mb-2 text-sm font-medium text-gray-500">
                  Area of Expertise
                </label>
                <select
                  value={areaOfExpertise}
                  onChange={(e) => {
                    setAreaOfExpertise(e.target.value);
                    if (e.target.value !== "Others") {
                      setSpecificArea("");
                    }
                  }}
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-3"
                >
                  <option value="">Select Area</option>
                  <option value="Home">Home</option>
                  <option value="Career and Business">
                    Career and Business
                  </option>
                  <option value="Style and Beauty">Style and Beauty</option>
                  <option value="Wellness">Wellness</option>
                  {/* <option value="Others">Others</option> */}
                </select>
              </div>

              <div className="w-1/2">
                <label className="block mb-2 text-sm font-medium text-gray-500">
                  Price (in Riyals)
                </label>
                <input
  type="number"
  required={true}
  value={price}
  onChange={(e) => {
    setPrice(e.target.value);
    console.log(price);
  }}
  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-3"
  placeholder="Enter price"
/>
                {price < 100 && price !== "" && (
                  <p className="text-red-500 text-xs mt-1">
                    Price must be greater than 100 Riyals
                  </p>
                )}
              </div>
            </div>

            {/* Conditional Input for 'Others' */}
            {/* {areaOfExpertise === "Others" && (
              <div className="mb-6">
                <label className="block mb-2 text-sm font-medium text-gray-500">
                  Specify Area of Expertise
                </label>
                <input
                  type="text"
                  value={specificArea}
                  onChange={(e) => setSpecificArea(e.target.value)}
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-3"
                />
              </div>
            )} */}
            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-500">
                Professional Certifications
              </label>
              <div className="flex">
                <input
                  type="file"
                  ref={fileInputRefCertifications}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChangeCertifications}
                  required={true}
                />
                <input
                  type="text"
                  id="file-display-certifications"
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-l-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-3"
                  value={certificationFileName}
                  placeholder=""
                  readOnly
                />
                <button
                  type="button"
                  onClick={() => fileInputRefCertifications.current.click()}
                  className="text-white bg-black hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-r-lg text-sm px-4 py-2.5"
                >
                  Upload
                </button>
              </div>
              {errors.file && (
                <p className="text-[#CF1313] text-sm mt-1">{errors.file}</p>
              )}
            </div>

            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-500">
                Professional Photos
              </label>
              <div className="flex">
                <input
                  type="file"
                  ref={fileInputRefPhotos}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChangePhotos}
                  required={true}
                />
                <input
                  type="text"
                  id="file-display-photos"
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-l-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-3"
                  value={photoFileName}
                  placeholder=""
                  readOnly
                />
                <button
                  type="button"
                  onClick={() => fileInputRefPhotos.current.click()}
                  className="text-white bg-black hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-r-lg text-sm px-4 py-2.5"
                >
                  Upload
                </button>
              </div>
              {errors.file && (
                <p className="text-[#CF1313] text-sm mt-1">{errors.file}</p>
              )}
            </div>

            <div className="mb-6 relative">
              <label className="block mb-2 text-sm font-medium text-gray-500">
                Experience
              </label>
              <input
                type="text"
                maxLength={500}
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-3"
              />
              <span className="absolute right-2 top-10 text-xs text-gray-500">
                {500 - experience.length}/500
              </span>
            </div>

            {/* Submit Button */}
           {/* Submit Button */}
<div className="flex justify-center items-center">
  <button
    type="submit"
    disabled={!firstName || !lastName || !email || !isValidPhoneNumber(mobile)}
    className="h-12 w-44 text-md text-white bg-black hover:bg-gray-800 font-medium rounded-xl md:rounded-2xl text-sm flex items-center justify-center"
  >
    Submit
  </button>
  <ToastContainer
    position="top-right"
    autoClose={3000}
    hideProgressBar={false}
  />
</div>
          </form>
          <>
            {/* Your entire form JSX */}

            {/* Add ToastContainer here */}
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </>
        </div>
      </div>
    </div>
  );
}

export default RegisterForm;
