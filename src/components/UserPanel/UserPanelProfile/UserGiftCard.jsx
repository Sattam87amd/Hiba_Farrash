import { useState, useEffect } from "react";
import { Gift, Mail, Phone, MessageSquare, UserCheck, Send } from "lucide-react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";

function UserGiftCard() {
  const amounts = [200, 500, 750, 1000];
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState("");
  const [token, setToken] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [personalMessage, setPersonalMessage] = useState("");
  const [sendAnonymously, setSendAnonymously] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("userToken");
    if (storedToken) {
      setToken(storedToken);
    } else {
      toast.error("You must be logged in to access this page.");
      router.push("/userlogin");
    }
  }, [router]);

  const handlePurchaseAttempt = async () => {
    if (!selectedAmount && !customAmount) {
      toast.error("Please select or enter a gift card amount.");
      return;
    }

    const amountToPurchase = selectedAmount || parseFloat(customAmount);
    if (isNaN(amountToPurchase) || amountToPurchase <= 0) {
      toast.error("Invalid gift card amount.");
      return;
    }

    if (!recipientEmail.trim()) {
      toast.error("Recipient email is required.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(recipientEmail)) {
        toast.error("Invalid recipient email format.");
        return;
    }
    
    if (!token) {
      toast.error("Authentication error. Please log in again.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        amount: amountToPurchase,
        recipientEmail: recipientEmail.trim(),
        ...(recipientPhone.trim() && { recipientPhone: recipientPhone.trim() }),
        ...(personalMessage.trim() && { recipientMessage: personalMessage.trim() }),
        sendAnonymously: sendAnonymously,
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/giftcard/purchase`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.paymentUrl) {
        toast.success("Gift card purchase initiated. Redirecting to payment.");
        window.location.href = response.data.paymentUrl;
      } else {
        toast.error(response.data.message || "Failed to initiate gift card purchase. Payment URL not found.");
      }
    } catch (error) {
      console.error("Gift card purchase error:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || "An error occurred during purchase. Please try again.";
      if (error.response?.data?.errors) {
          const specificErrors = error.response.data.errors.map(err => err.msg).join(' ');
          toast.error(`Purchase failed: ${specificErrors}`);
      } else {
          toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-8 px-4">
      <div className="w-full max-w-2xl bg-white p-6 md:p-8 rounded-xl border shadow-lg">
        <div className="flex flex-col items-center space-y-2 mb-8">
          <Gift
            strokeWidth={1.5}
            className="w-12 h-12 md:w-16 md:h-16 text-black"
          />
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">Send a Gift Card</h2>
          <p className="text-gray-600 text-sm md:text-base text-center">
            Gift a thoughtful session to a friend, family member, or colleague.
          </p>
        </div>

        <div className="mb-8">
          <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-1">Choose Amount</h3>
          <p className="text-gray-500 text-sm mb-4">
            Select a predefined amount or enter a custom value.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:grid-cols-5 mt-4 mb-6">
            {amounts.map((amount) => (
              <button
                key={amount}
                className={`py-3 px-2 text-center font-semibold rounded-lg transition-all text-sm md:text-base ${
                  selectedAmount === amount
                    ? "bg-black text-white shadow-md ring-2 ring-offset-2 ring-black"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
                }`}
                onClick={() => {
                  setSelectedAmount(amount);
                  setCustomAmount("");
                }}
              >
                SAR {amount}
              </button>
            ))}

            <input
              type="number"
              className="py-3 px-2 border border-gray-300 rounded-lg text-center w-full focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm md:text-base col-span-2 sm:col-span-1 md:col-span-2"
              placeholder="Custom Amount"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setSelectedAmount(null);
              }}
              min="1"
            />
          </div>
        </div>
        
        <div className="space-y-6 mb-8">
            <div>
                <label htmlFor="recipientEmail" className="block text-sm font-medium text-gray-700 mb-1">Recipient Email*</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input 
                        type="email" 
                        id="recipientEmail"
                        name="recipientEmail"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        placeholder="recipient@example.com"
                        className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-black focus:border-transparent transition text-sm md:text-base"
                        required 
                    />
                </div>
            </div>

            <div>
                <label htmlFor="recipientPhone" className="block text-sm font-medium text-gray-700 mb-1">Recipient Phone Number (Optional)</label>
                 <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input 
                        type="tel" 
                        id="recipientPhone"
                        name="recipientPhone"
                        value={recipientPhone}
                        onChange={(e) => setRecipientPhone(e.target.value)}
                        placeholder="+1234567890"
                        className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-black focus:border-transparent transition text-sm md:text-base"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="personalMessage" className="block text-sm font-medium text-gray-700 mb-1">Personalized Message (Optional)</label>
                <div className="relative">
                    <div className="absolute top-3 left-3">
                         <MessageSquare className="h-5 w-5 text-gray-400" />
                    </div>
                    <textarea 
                        id="personalMessage"
                        name="personalMessage"
                        value={personalMessage}
                        onChange={(e) => setPersonalMessage(e.target.value)}
                        placeholder="Write a short message to the recipient..."
                        rows="3"
                        className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-black focus:border-transparent transition resize-none text-sm md:text-base"
                    />
                </div>
            </div>

            <div className="flex items-center">
                <input 
                    type="checkbox" 
                    id="sendAnonymously"
                    name="sendAnonymously"
                    checked={sendAnonymously}
                    onChange={(e) => setSendAnonymously(e.target.checked)}
                    className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black accent-black"
                />
                <label htmlFor="sendAnonymously" className="ml-2 block text-sm text-gray-700">
                    Send Anonymously
                </label>
                 <UserCheck className="h-4 w-4 text-gray-400 ml-1" />
            </div>
        </div>

        <div className="mt-10 flex justify-center">
          <button
            className="w-full md:w-auto bg-black hover:bg-gray-800 text-white py-3 px-12 rounded-lg font-semibold disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors shadow-md hover:shadow-lg text-base md:text-lg"
            disabled={isSubmitting || (!selectedAmount && !customAmount) || !recipientEmail.trim()}
            onClick={handlePurchaseAttempt} 
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Proceed to Payment
              </>
            )}
          </button>
        </div>
      </div>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
}

export default UserGiftCard;
