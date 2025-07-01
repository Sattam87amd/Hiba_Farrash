"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { StarIcon, ArrowLeft, ShoppingBag, UserPlusIcon } from "lucide-react";
import { toast } from "react-toastify";
// import { useRouter } from 'next/navigation'

const UserProfile = () => {


  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    mobileNumber: "",
    email: "",
    bookingType: "individual",
    inviteFriend: "",
    promoCode: "",
    selectedSessions: [],
  });

  const [sessions] = useState([
    {
      day: "Thu",
      date: "27 Feb",
      timeSlots: [
        { id: "thu-1", time: "08:00 AM-08:15 AM", selected: false },
        { id: "thu-2", time: "08:20 AM-08:35 AM", selected: false },
      ],
    },
    {
      day: "Fri",
      date: "28 Feb",
      timeSlots: [
        { id: "fri-1", time: "08:00 AM-08:15 AM", selected: false },
        { id: "fri-2", time: "09:00 AM-09:15 AM", selected: false },
        { id: "fri-3", time: "09:20 AM-09:35 AM", selected: false },
      ],
    },
  ]);

  const [selectedMethod, setSelectedMethod] = useState("wallet");

  useEffect(() => {
    const savedData = localStorage.getItem("bookingData");
    if (savedData) {
      setUserData(JSON.parse(savedData));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("bookingData", JSON.stringify(userData));
  }, [userData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelection = (method) => {
    setSelectedMethod(method);
  };

  const handleBuy = () => {
    toast.error(`You selected ${selectedMethod} for payment.`);
  };
  const router = useRouter()
  return (
    <div className="w-full mx-8 mt-2 px-6 md:px-10 py-[3rem]">
      <div className="flex flex-col md:flex-row gap-10">
        {/* Left Section (Profile & Sessions) */}
        <div className="w-full md:w-1/2 flex flex-col items-center text-center md:text-left">
          {/* Profile Image */}
          <div className="w-32 h-38 md:w-[14rem] md:h-[16rem] rounded-lg overflow-hidden shadow-md">
            <Image
              src="/image.png"
              alt="Darrell Steward"
              width={224}
              height={224}
              className="object-cover"
            />
          </div>

          {/* Expert Info */}
          <div className="mt-4 md:mt-6 bg-[#F8F7F3] px-4 md:p-6 rounded-lg shadow-md w-full">
            <h1 className="text-xl md:text-2xl font-bold">Darrell Steward</h1>
            <p className="text-gray-500 text-sm md:text-base">Tech Entrepreneur + Investor</p>

            {/* Ratings */}
            <div className="flex items-center gap-1 mt-2">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
              <span className="ml-1 text-sm font-semibold">5.0</span>
            </div>

            {/* Sessions */}
            <div className="mt-4">
              <p className="font-medium mb-2 text-gray-700">Sessions -</p>
              {sessions.map((session, idx) => (
                <div key={idx} className="mb-3">
                  <p className="text-sm font-medium text-gray-700">
                    {session.day}, {session.date}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {session.timeSlots.map((slot) => (
                      <button
                        key={slot.id}
                        className="px-4 py-1 text-xs md:text-sm bg-gray-200 hover:bg-gray-300 rounded-md"
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <p className="text-red-500 text-xs md:text-sm mt-2">
                Note: Can add up to 5 sessions at different time slots. Any 1 time slot might get selected.
              </p>
            </div>
          </div>
        </div>

        {/* Horizontal Divider */}
        <span className="hidden md:block border h-auto">
          <hr />
        </span>

        {/* Right Side: Payment Section - Slightly Shifted Left */}
        <div className="w-full md:w-1/2 flex items-start md:items-center justify-center relative md:-ml-10">
          <div className="w-full p-4 md:p-6 md:pl-24">
            {/* Mobile Logo */}
            <div className="flex justify-center mb-6 md:hidden">
              <Image src="/Shourk_logo.png" alt="Shourk Logo" width={250} height={40} />
            </div>

            {/* Back Button */}
            <button
              className="absolute top-2 left-2 z-10 p-2 md:hidden"
              onClick={() => router.push("/buygiftsession")}
            >
              <ArrowLeft className="w-5 h-5 text-black" />
            </button>

            <h2 className="text-2xl font-bold text-black mb-6">Payment method</h2>

            {/* Wallet Section */}
            <div className="w-full md:w-[460px] border border-[#7E7E7E] rounded-xl p-6 mt-4 flex flex-col md:flex-row items-center justify-between bg-white shadow-md ">
              <Image
                src="/paymentimg.png"
                alt="Wallet"
                width={80}
                height={60}
                className="mx-auto md:mx-0"
              />
              <div className="mt-4 md:mt-0 md:mr-16 text-center">
                <p className="text-lg font-normal">Your Wallet Balance is-</p>
                <p className="text-3xl font-bold text-black mt-2">
                  {selectedMethod === "wallet" ? `$1500` : ""}
                </p>
              </div>
            </div>

            {/* Payment Options */}
            <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="checkbox checkbox-neutral"
                  checked={selectedMethod === "wallet"}
                  onChange={() => handleSelection("wallet")}
                />
                <span className="text-sm md:text-lg font-medium">
                  Pay through your Wallet.{" "}
                  <a href="#" className="text-blue-500">Add Money to your Wallet</a>
                </span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="checkbox checkbox-neutral"
                  checked={selectedMethod === "paypal"}
                  onChange={() => handleSelection("paypal")}
                />
                <span className="text-sm md:text-lg font-medium">Paypal</span>
                <Image src="/paypal.png" alt="Paypal" width={30} height={30} />
              </label>

              <label className="flex flex-col space-y-3 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-neutral"
                    checked={selectedMethod === "card"}
                    onChange={() => handleSelection("card")}
                  />
                  <span className="text-sm md:text-lg font-medium">Credit or Debit Card</span>
                </div>
                <Image src="/bankcards.png" alt="Bank Cards" width={550} height={5} />
              </label>

              <label className="flex flex-col space-y-3 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-neutral"
                    checked={selectedMethod === "netbanking"}
                    onChange={() => handleSelection("netbanking")}
                  />
                  <span className="text-sm md:text-lg font-medium">Net Banking</span>
                </div>
                <select className="w-full md:w-48 p-2 border rounded-md bg-gray-100 text-gray-600">
                  <option>Select Bank</option>
                  <option>HDFC</option>
                  <option>ICICI</option>
                  <option>SBI</option>
                  <option>Axis Bank</option>
                </select>
              </label>
            </div>

            {/* Pay Button */}
            <div className="flex justify-center items-center pt-14">
              <button
                
                className="w-40 bg-black text-white py-3 rounded-3xl flex justify-center items-center space-x-2"
                
                type="button" onClick={() => router.push('/userpanel/videocall')}
              >
                <span className="text-center text-lg">Pay</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
