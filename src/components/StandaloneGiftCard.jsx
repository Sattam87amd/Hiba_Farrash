import { useState, useEffect } from "react";
import { Gift, Mail, Phone, MessageSquare, UserCheck, Send } from "lucide-react";

function StandaloneGiftCard() {
  const amounts = [200, 500, 750, 1000];
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState("");
  const [token, setToken] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [personalMessage, setPersonalMessage] = useState("");
  const [sendAnonymously, setSendAnonymously] = useState(false);

  useEffect(() => {
    // Immediately initialize without any checks
    try {
      const storedToken = localStorage.getItem("userToken");
      setToken(storedToken);
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      setToken(null);
    }
    setIsLoading(false);
  }, []);

  const handleLoginRedirect = () => {
    // You can replace this with your actual login URL
    window.location.href = "/userpanel/userlogin";
  };

  const handlePurchaseAttempt = async () => {
    // Check if user is logged in before proceeding with purchase
    const currentToken = localStorage.getItem("userToken");
    if (!currentToken) {
      alert("Please log in to complete your purchase.");
      handleLoginRedirect();
      return;
    }

    if (!selectedAmount && !customAmount) {
      alert("Please select or enter a gift card amount.");
      return;
    }

    const amountToPurchase = selectedAmount || parseFloat(customAmount);
    if (isNaN(amountToPurchase) || amountToPurchase <= 0) {
      alert("Invalid gift card amount.");
      return;
    }

    if (!recipientEmail.trim()) {
      alert("Recipient email is required.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(recipientEmail)) {
      alert("Invalid recipient email format.");
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

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_PROD_API_URL || 'https://your-api-url.com'}/api/giftcard/purchase`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${currentToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload)
        }
      );

      const data = await response.json();

      if (data.paymentUrl) {
        alert("Gift card purchase initiated. Redirecting to payment.");
        window.location.href = data.paymentUrl;
      } else {
        alert(data.message || "Failed to initiate gift card purchase. Payment URL not found.");
      }
    } catch (error) {
      console.error("Gift card purchase error:", error);
      
      // Check if error is due to authentication
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert("Your session has expired. Please log in again.");
        localStorage.removeItem("userToken");
        handleLoginRedirect();
        return;
      }

      alert("An error occurred during purchase. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8 px-4">
        <div className="w-full max-w-2xl bg-white p-6 md:p-8 rounded-xl border shadow-lg">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center py-8 px-4">
      <div className="w-full max-w-2xl bg-white p-6 md:p-8 rounded-xl border shadow-lg">
        {/* Show login prompt if no token */}
        {!token && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-5 w-5 text-yellow-600" />
              <p className="text-yellow-800 text-sm">
                You'll need to{" "}
                <button
                  onClick={handleLoginRedirect}
                  className="underline font-medium hover:text-yellow-900"
                >
                  log in
                </button>
                {" "}to complete your gift card purchase.
              </p>
            </div>
          </div>
        )}

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
            className={`w-full md:w-auto py-3 px-12 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors shadow-md hover:shadow-lg text-base md:text-lg ${
              !token 
                ? 'bg-gray-400 text-white cursor-not-allowed' 
                : 'bg-black hover:bg-gray-800 text-white disabled:opacity-60 disabled:cursor-not-allowed'
            }`}
            disabled={isSubmitting || (!selectedAmount && !customAmount) || !recipientEmail.trim() || !token}
            onClick={handlePurchaseAttempt} 
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </>
            ) : !token ? (
              <>
                <UserCheck className="h-5 w-5" />
                Login Required
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
    </div>
  );
}

export default StandaloneGiftCard;
