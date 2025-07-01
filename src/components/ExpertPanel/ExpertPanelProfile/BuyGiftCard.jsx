import { useState } from "react";
import { Gift } from "lucide-react";
import { ShoppingBag } from "lucide-react";

function BuyGiftCard() {
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    cardNumber: "",
    expiryDate: "",
    cardHolder: "",
    message: "",
    anonymous: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  return (
    <div className="w-full bg-white p-6">
      {/* Icon and Heading */}
      <div className="flex flex-col items-center space-y-2 mb-12">
        <Gift
          strokeWidth={0.9}
          className="w-10 h-10 md:w-14 md:h-14 text-black"
        />
        <h2 className="text-lg font-normal">Send a gift card</h2>
      </div>

      {/* Form */}
      <form className="space-y-4">
        <input
          type="email"
          name="email"
          placeholder="Recipient Email"
          className="w-full p-3 border border-gray-300 rounded-lg"
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="phone"
          placeholder="Recipient Phone Number"
          className="w-full p-3 border border-gray-300 rounded-lg"
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="cardNumber"
          placeholder="Card Number"
          className="w-full p-3 border border-gray-300 rounded-lg"
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="expiryDate"
          placeholder="Expiry Date (MM/YY)"
          className="w-full p-3 border border-gray-300 rounded-lg"
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="cardHolder"
          placeholder="Card Holder Name"
          className="w-full p-3 border border-gray-300 rounded-lg"
          onChange={handleChange}
          required
        />
        <textarea
          name="message"
          placeholder="Personalized Message (Optional)"
          className="w-full p-3 border border-gray-300 rounded-lg"
          onChange={handleChange}
        ></textarea>

        {/* Send Anonymously Checkbox */}
        <div className="flex justify-end items-center space-x-2">
          <input
            type="checkbox"
            id="anonymous"
            name="anonymous"
            className="w-4 h-4 accent-black"
            onChange={handleChange}
          />
          <label
            htmlFor="anonymous"
            className="text-sm font-medium text-gray-900"
          >
            Send Anonymously
          </label>
        </div>

        {/* Buy Button */}
        <div className="flex justify-center items-center">
          <button className="w-52 bg-black text-white py-3 rounded-2xl flex justify-center items-center space-x-2">
            <span>Buy</span>
            <ShoppingBag size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}

export default BuyGiftCard;
