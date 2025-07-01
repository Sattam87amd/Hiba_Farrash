'use client';
import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import { Gift } from 'lucide-react'; // Gift Icon from lucide-react
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { FaInstagram } from "react-icons/fa";

const ExpertAboutMeUser = () => {
  const [selectedConsultation, setSelectedConsultation] = useState("1:1");
  const [selectedTime, setSelectedTime] = useState(null); // Track selected time slot
  const [price, setPrice] = useState(350); // Dynamic Price for 1:1 consultation
  const [isExpanded, setIsExpanded] = useState(false); // Track if "See More" is clicked
  const [showTimeSelection, setShowTimeSelection] = useState(false); // Track if time selection should be shown
  const [selectedTimeSlots, setSelectedTimeSlots] = useState({
    today: [],
    tomorrow: [],
    nextDate: []
  }); // Track selected time slots for each day

  const profile = {
    name: "Darrell Steward",
    designation: "Tech Entrepreneur + Investor",
    image: "/guyhawkins.png",
    rating: 5.0,
    about: {
      first: `Co-founder of Reddit. First batch of Y Combinator (Summer 2005) and led the company to a sale to Condé Nast in 2006. Returned as Exec Chair in 2014 to help lead the turnaround, then left in 2018 to do venture capital full-time.`,
      second: `I’m an investor in startups —almost always at the earliest possible stage— first as an angel investor, then co-founder of Initialized, before splitting the firm in half to found Seven Seven Six.`,
      third: `I’m an investor in startups —almost always at the earliest possible stage— first as an angel investor, then co-founder of Initialized, before splitting the firm in half to found Seven Seven Six.`,
    },
    strengths: [
      "Startups",
      "Investing",
      "Company Culture",
      "Early Stage Marketing",
      "Growth Tactics",
      "Operations",
      "Fundraising",
      "Hiring & Managing",
    ],
  };

  const router = useRouter();

  const handleConsultationChange = (type) => {
    setSelectedConsultation(type);
    if (type === "1:4") {
      setPrice(150); // Update price dynamically for 1:4 consultation
    } else {
      setPrice(350); // Update price dynamically for 1:1 consultation
    }
  };

  const navigateToTimeSelection = () => {
    // Assuming the next page is for time selection, navigate accordingly
    router.push('/time-selection');
  };

  const handleSeeMore = () => {
    setIsExpanded(!isExpanded); // Toggle between showing and hiding full content
  };

  const handleSeeTimeClick = () => {
    setShowTimeSelection(true); // Show time slots form when the button is clicked
  };

  const handleBackClick = () => {
    setShowTimeSelection(false); // Reset to show the consultation section
  };

  // Handle Time Slot Selection (only one slot can be selected)
  const handleTime = (time) => {
    // If the time slot is already selected, deselect it, else select the new slot
    setSelectedTime(selectedTime === time ? null : time);
  };

  // Handle Time Slot Selection (only select up to 5 slots per day)
  const handleTimeSelection = (day, time) => {
    // Get the current selected slots for the day
    const currentSelectedSlots = selectedTimeSlots[day];

    // If the slot is already selected, deselect it
    if (currentSelectedSlots.includes(time)) {
      setSelectedTimeSlots({
        ...selectedTimeSlots,
        [day]: currentSelectedSlots.filter(selectedTime => selectedTime !== time)
      });
    } else {
      // If less than 5 slots are selected, add this slot to the selection
      if (currentSelectedSlots.length < 5) {
        setSelectedTimeSlots({
          ...selectedTimeSlots,
          [day]: [...currentSelectedSlots, time]
        });
      }
    }
  };

  // Helper function to format the current date, tomorrow, and upcoming dates
  const getFormattedDate = (date) => {
    const options = { weekday: 'long', day: 'numeric', month: 'short' };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  // Get today, tomorrow, and the next date
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const nextDate = new Date(today);
  nextDate.setDate(today.getDate() + 2);

  // Get the formatted strings for today, tomorrow, and the next date
  const todayStr = getFormattedDate(today); // Today (e.g., "Sat, Apr 7")
  const tomorrowStr = getFormattedDate(tomorrow); // Tomorrow (e.g., "Sun, Apr 8")
  const nextDateStr = getFormattedDate(nextDate); // Next upcoming date (e.g., "Mon, Apr 9")

  return (
    <div className="min-h-screen bg-white py-10 px-4 md:px-10">
      <div className="w-full mx-auto flex flex-col md:flex-row items-center md:items-start gap-8">
        {/* Left Side: Profile & About */}
        <div>
          

        <div className="bg-[#F8F7F3] rounded-3xl p-4 sm:p-6 md:p-12 shadow w-[95vw] sm:w-[90vw] md:w-[44rem] mx-auto">
          <img
            src={profile.image}
            alt={profile.name}
            className="w-[520px] h-[530px] rounded-xl"
            />
          <div className="mt-6">
            <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
            <p className="text-[#9C9C9C] mt-1">{profile.designation}</p>
            <div className="flex items-center mt-2 text-[#FFA629]">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} />
              ))}
              <span className="ml-2 font-semibold text-sm">{profile.rating}</span>
            </div>
          </div>

          <div className="mt-6">
          <h3 className="text-lg md:text-3xl font-semibold flex items-center gap-[27rem]">
  About Me
  <FaInstagram  className="text-4xl"/>
</h3>

            
            {/* Display the first paragraph initially */}
            <p className="text-sm md:text-xl text-black mt-3">{profile.about.first}</p>

            {/* Display second and third paragraphs only when expanded */}
            {isExpanded && (
              <>
                <p className="text-sm md:text-xl text-black mt-3">{profile.about.second}</p>
                <p className="text-sm md:text-xl text-black mt-3">{profile.about.third}</p>
              </>
            )}

            {/* Toggle button */}
            <button
              className="mt-6 bg-black text-white px-6 py-2 rounded-md hover:bg-gray-900 transition"
              onClick={handleSeeMore}
            >
              {isExpanded ? 'Show Less' : 'See More'}
            </button>
          </div>
        </div>
         {/* Book a Video Call Button Aligned Left */}
         <div className=" w-[90%] flex justify-start mt-10 pl-10">
                  <button type="button" onClick={handleSeeTimeClick}//onClick={() => router.push('/userpanel/userbooking')}
                    className="bg-[#EDECE8] text-black font-semibold py-4 px-10 rounded-lg hover:bg-gray-300 transition">
                    Book a Video Call
                  </button>
                </div>
        </div>
     
        {/* Vertical Line Divider */}
        <div className="hidden md:block border-l-2 border-black h-[145vh] mx-8"></div>

        {/* Right Side: Time Slot or Consultancy Cards */}
        <div className="rounded-3xl p-6 flex-1 space-y-8">
          {showTimeSelection ? (
            // Show time selection form when the button is clicked
            <>
              <button
                className="py-2 px-4 bg-black text-white rounded-md shadow"
                onClick={handleBackClick} // This is the Back button's functionality
              >
                Back
              </button>
              <div className="bg-white p-6 rounded-xl">
                <h3 className="text-4xl font-semibold mb-4">Book a video call</h3>
                <p className="mb-4 font-semibold text-xl">Select one of the available time slots below:</p>

                {/* Time Slots for Today */}
               
                <div className="grid grid-cols-2 gap-4 mb-4 justify-center items-center">
                  <button
                    className={`py-2 px-4 ${selectedTime === "Quick - 15min" ? 'bg-black text-white' : 'bg-[#F8F7F3] text-black'} rounded-md shadow`}
                    onClick={() => handleTime("Quick - 15min")}
                  >
                    Quick - 15min
                  </button>
                  <button
                    className={`py-2 px-4 ${selectedTime === "Regular - 30min" ? 'bg-black text-white' : 'bg-[#F8F7F3] text-black'} rounded-md shadow`}
                    onClick={() => handleTime("Regular - 30min")}
                  >
                    Regular - 30min
                  </button>
                  <button
                    className={`py-2 px-4 ${selectedTime === "Extra - 45min" ? 'bg-black text-white' : 'bg-[#F8F7F3] text-black'} rounded-md shadow`}
                    onClick={() => handleTime("Extra - 45min")}
                  >
                    Extra - 45min
                  </button>
                  <button
                    className={`py-2 px-4 ${selectedTime === "All Access - 60min" ? 'bg-black text-white' : 'bg-[#F8F7F3] text-black'} rounded-md shadow`}
                    onClick={() => handleTime("All Access - 60min")}
                  >
                    All Access - 60min
                  </button>
                </div>

                <div>
                  <h4 className="font-semibold py-8">{`Today (${todayStr})`}</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {['07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'].map((time) => (
                      <button
                        key={time}
                        className={`py-2 px-4 ${selectedTimeSlots.today.includes(time) ? 'bg-black text-white' : 'bg-white text-black'} rounded-xl border`}
                        onClick={() => handleTimeSelection('today', time)}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Slots for Tomorrow */}
                <div>
                  <h4 className="font-semibold py-8">{`Tomorrow (${tomorrowStr})`}</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {['07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'].map((time) => (
                      <button
                        key={time}
                        className={`py-2 px-4 ${selectedTimeSlots.tomorrow.includes(time) ? 'bg-black text-white' : 'bg-white text-black'} rounded-xl border`}
                        onClick={() => handleTimeSelection('tomorrow', time)}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Slots for Next Date */}
                <div>
                  <h4 className="font-semibold py-8">{`Next Date (${nextDateStr})`}</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {['07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'].map((time) => (
                      <button
                        key={time}
                        className={`py-2 px-4 ${selectedTimeSlots.nextDate.includes(time) ? 'bg-black text-white' : 'bg-white text-black'} rounded-xl border`}
                        onClick={() => handleTimeSelection('nextDate', time)}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Section */}
                <div className="flex gap-10 py-10">
                  <div className="gap-4">
                    <p className="text-xl font-semibold">$550 • Session</p>
                    <div className="flex items-center mt-2 gap-2 text-[#FFA629]">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} />
                      ))}
                      <span className="ml-2 font-semibold text-sm">{profile.rating}</span>
                    </div>
                  </div>
                  <Link href='/userpanel/userbooking'>
                    <button className="py-2 px-6 w-full bg-black text-white rounded-md">Request</button>
                  </Link>
                </div>
              </div>
            </>
          ) : (
            // Show the regular consultancy cards when not in time selection mode
            <>
              <div className="bg-[#F8F7F3] p-6 rounded-xl">
                <div className="bg-black text-white p-2 rounded-t-xl w-max">
                  <h3 className="text-2xl font-semibold">Book A Video Call</h3>
                </div>
                <div className="text-2xl py-4">
                  <h2 className="font-semibold">1:1 Video Consultation</h2>
                </div>
                <p className="text-2xl font-semibold">Book a 1:1 Video consultation & get personalized advice</p>

                <div className="mt-4">
                  <p className="text-xl font-semibold">Starting at ${price}</p>
                  <div className="flex items-center justify-start">
                    <p className="text-[#7E7E7E] text-base font-semibold">Next available - <span className="text-[#0D70E5]">4:30am on 3/25</span></p>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className="text-[#FFA629] ml-3" />
                      ))}
                      <span className="ml-2 text-[#FFA629] font-semibold text-sm ">{profile.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center mt-4 gap-8">
                  <Gift className="h-8 w-8" />
                  <button className="bg-[#0D70E5] text-white py-3 px-24 rounded-md hover:bg-[#0A58C2]" onClick={handleSeeTimeClick}>
                    See Time
                  </button>
                </div>
              </div>

              {/* 1:4 Video Consultation */}
              <div className="bg-[#F8F7F3] p-6 rounded-xl">
                <div className="bg-black text-white p-2 rounded-t-xl w-max">
                  <h3 className="text-2xl font-semibold">Book A Video Call</h3>
                </div>
                <div className="text-2xl py-4">
                  <h2 className="font-semibold">1:4 Video Consultation</h2>
                </div>
                <p className="text-2xl font-semibold">Book a 1:4 Video consultation & get personalized advice</p>

                <div className="mt-4">
                  <p className="text-xl font-semibold">Starting at ${price}</p>
                  <div className="flex items-center justify-start">
                    <p className="text-[#7E7E7E] text-base font-semibold">Next available - <span className="text-[#0D70E5]">5:00pm on 3/25</span></p>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className="text-[#FFA629] ml-3" />
                      ))}
                      <span className="ml-2 text-[#FFA629] font-semibold text-sm ">{profile.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center mt-4 gap-8">
                  <Gift className="h-8 w-8" />
                  <button className="bg-[#0D70E5] text-white py-3 px-24 rounded-md hover:bg-[#0A58C2]" onClick={handleSeeTimeClick}>
                    See Time
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpertAboutMeUser;