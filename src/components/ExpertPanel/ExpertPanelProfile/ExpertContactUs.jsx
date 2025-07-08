import { FaInstagram, FaTwitter } from "react-icons/fa";
import { MdAlternateEmail } from "react-icons/md";

function ExpertContactUs() {
  return (
    <div className="flex justify-center md:justify-start">
      <div className="mt-10 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10 pb-8">
        {/* Card 1: Social Media */}
        <div className="bg-white p-6 rounded-xl border border-[#A6A6A6] text-start w-full max-w-md">
          <div className="flex justify-start mb-4">
            <img
              src="/socialmediaicon.png"
              alt="Social Media Icon"
              className="w-10 h-10"
            />
          </div>

          <h2 className="text-xl font-semibold text-black">Our Social Media</h2>
          <p className="text-gray-700 mt-2">We'd love to hear from you.</p>

          <div className="flex justify-start items-center mt-4">
            <FaInstagram className="text-black text-3xl mx-2" />
            <FaTwitter className="text-black text-3xl mx-2" />
          </div>
        </div>

        {/* Card 2: Chat Support */}
        <div className="bg-white p-6 rounded-xl border border-[#A6A6A6] text-left w-full max-w-md">
          <div className="flex justify-start mb-4">
            <img
              src="/chaticon.png"
              alt="Chat Icon"
              className="w-8 h-8 md:w-10 md:h-10"
            />
          </div>

         

           <button 
            onClick={()=>router.push('https://wa.me/+966552029500')}
            className="mt-3 px-4 py-2 bg-white text-black border border-black rounded-xl">
              Chat to Support
            </button>
        </div>

        {/* Card 3: Email */}
        <div className="bg-white p-6 rounded-xl border border-[#A6A6A6] text-left w-full max-w-md">
          <div className="flex justify-start mb-4">
            <MdAlternateEmail className="text-black text-4xl" />
          </div>

          <h2 className="text-xl font-semibold text-black">Leave us a Mail</h2>
          <p className="text-gray-700 text-sm mt-2">
            If not available, you can send us an email at
          </p>
          <p className="mt-2 font-semibold text-black">shourk@gmail.com</p>
        </div>
      </div>
    </div>
  );
}

export default ExpertContactUs;
