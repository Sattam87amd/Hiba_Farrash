"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import { Wallet, History, TrendingUp, X, CheckCircle, AlertTriangle, RefreshCw, CreditCard } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

const UserPaymentMethods = () => {
  const [walletBalance, setWalletBalance] = useState(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [topupAmount, setTopupAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("VISA"); // New state for payment method
  
  // Withdrawal states
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("bank");
  const [bankDetails, setBankDetails] = useState({
    accountNumber: "",
    routingNumber: "",
    bankName: "",
    accountHolderName: ""
  });
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [step, setStep] = useState(1); // 1: Amount, 2: Method, 3: Details, 4: Confirm

  const router = useRouter();
  const [currentUserToken, setCurrentUserToken] = useState(null);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin === "http://www.hibafarrash.shourk.com" || event.origin === "https://hibafarrash.shourk.com" || event.origin === "http://localhost:3000") {
        if (event.data.type === "TOKEN_SYNC") {
          localStorage.setItem("userToken", event.data.token);
          setCurrentUserToken(event.data.token);
        }
      }
    };

    window.addEventListener("message", handleMessage);

    let initialToken = localStorage.getItem("userToken");

    const tempToken = sessionStorage.getItem("tempUserToken");
    if (tempToken) {
      localStorage.setItem("userToken", tempToken);
      initialToken = tempToken;
      sessionStorage.removeItem("tempUserToken"); 
    }

    const prePaymentData = localStorage.getItem("prePaymentAuth");
    if (prePaymentData) {
      try {
        const { token, timestamp } = JSON.parse(prePaymentData);
        if (Date.now() - timestamp < 3600000) { 
          localStorage.setItem("userToken", token);
          initialToken = token;
          localStorage.removeItem("prePaymentAuth"); 
        }
      } catch (error) {
        console.error("Error parsing prePaymentAuth:", error);
      }
    }

    const checkAuth = async () => {
      let tokenToUse = initialToken;
      if (!tokenToUse) {
        const parentToken = window.parent?.localStorage?.getItem("userToken");
        if (parentToken) {
          localStorage.setItem("userToken", parentToken);
          tokenToUse = parentToken;
        } else {
          router.push("/userpanel/userlogin");
          setCurrentUserToken(null);
          return;
        }
      }
      
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/userauth/refresh-token`,
          {},
          { headers: { Authorization: `Bearer ${tokenToUse}` } }
        );
        localStorage.setItem("userToken", response.data.newToken);
        setCurrentUserToken(response.data.newToken);
      } catch (error) {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          localStorage.removeItem("userToken");
          sessionStorage.removeItem("tempUserToken");
          localStorage.removeItem("prePaymentAuth");
          setCurrentUserToken(null);
          router.push("/userpanel/userlogin");
        } else if (tokenToUse) {
          setCurrentUserToken(tokenToUse);
        } else {
          setCurrentUserToken(null);
          router.push("/userpanel/userlogin");
        }
      }
    };

    checkAuth();

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [router]);

  useEffect(() => {
    if (currentUserToken) {
      fetchWalletBalance(currentUserToken);
      fetchWithdrawalHistory();
    }
  }, [currentUserToken]);

  const fetchWalletBalance = async (token) => {
    try {
      setIsLoadingBalance(true);
      if (!token) {
        setIsLoadingBalance(false);
        return;
      }
      
      const response = await axios.get(`${process.env.NEXT_PUBLIC_PROD_API_URL}/api/userwallet/balance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setWalletBalance(response.data.data.balance);
      } else {
        toast.error("Failed to fetch wallet balance");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Authentication failed. Please log in again.");
      } else {
        toast.error("Error loading wallet balance");
      }
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const fetchWithdrawalHistory = async () => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) return;

      const response = await axios.get(`${process.env.NEXT_PUBLIC_PROD_API_URL}/api/userwithdrawal/history`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setWithdrawalHistory(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching withdrawal history:", error);
    }
  };

  const storeTokenBeforePayment = () => {
    const userToken = localStorage.getItem("userToken");
    if (userToken) {
      sessionStorage.setItem("tempUserToken", userToken);
      
      const prePaymentAuth = {
        token: userToken,
        timestamp: Date.now()
      };
      localStorage.setItem("prePaymentAuth", JSON.stringify(prePaymentAuth));
    }
  };

  const handleTopupAmountChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setTopupAmount(value);
    }
  };

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handleWithdrawAmountChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setWithdrawAmount(value);
    }
  };

  const handleBankDetailsChange = (field, value) => {
    setBankDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTopupWallet = async () => {
    try {
      if (!topupAmount || Number(topupAmount) < 10) {
        toast.error("Please enter a valid amount (minimum 10 SAR)");
        return;
      }

      if (!paymentMethod) {
        toast.error("Please select a payment method");
        return;
      }

      setIsProcessing(true);
      const token = localStorage.getItem("userToken");
      
      if (!token) {
        setIsProcessing(false);
        return;
      }

      storeTokenBeforePayment();
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/userwallet/topup`,
        { 
          amount: Number(topupAmount),
          paymentMethod: paymentMethod,
          walletType: "TOP-UP" // Send the selected payment method
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      
      if (response.data && response.data.data && response.data.data.checkoutId) {
        toast.success("Redirecting to payment page...");
        window.location.href = `https://hibafarrash.shourk.com/userpanel/payment-user?checkoutId=${response.data.data.checkoutId}`;
      } else {
        toast.error("Failed to initiate payment - no checkout ID received");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error.response?.data?.message || "Payment initiation failed");
      setIsProcessing(false);
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (!withdrawAmount || Number(withdrawAmount) < 10) {
        toast.error("Please enter a valid amount (minimum 10 SAR)");
        return;
      }
      if (Number(withdrawAmount) > walletBalance) {
        toast.error("Insufficient wallet balance");
        return;
      }
    }
    
    if (step === 3 && withdrawMethod === "bank") {
      if (!bankDetails.accountNumber || !bankDetails.routingNumber || 
          !bankDetails.bankName || !bankDetails.accountHolderName) {
        toast.error("Please fill all bank details");
        return;
      }
    }
    
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  const isAutoApproval = () => {
    return Number(withdrawAmount) <= walletBalance * 0.2 && Number(withdrawAmount) <= 1000;
  };

  const handleWithdrawalRequest = async () => {
    try {
      setIsWithdrawing(true);
      const token = localStorage.getItem("userToken");
      
      if (!token) {
        setIsWithdrawing(false);
        return;
      }

      const withdrawalData = {
        amount: Number(withdrawAmount),
        method: withdrawMethod,
        ...(withdrawMethod === "bank" && { bankDetails })
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/userwithdrawal/request`,
        withdrawalData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        toast.success(response.data.message || "Withdrawal request submitted successfully!");
        setShowWithdrawModal(false);
        setWithdrawAmount("");
        setBankDetails({
          accountNumber: "",
          routingNumber: "",
          bankName: "",
          accountHolderName: ""
        });
        setStep(1);
        fetchWithdrawalHistory();
        fetchWalletBalance();
      } else {
        toast.error("Failed to submit withdrawal request");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      if (errorMessage) {
        toast.error(errorMessage);
      } else {
        toast.error("Withdrawal request failed");
      }
    } finally {
      setIsWithdrawing(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <RefreshCw className="h-4 w-4 text-yellow-500" />;
      case 'approved':
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={5000} theme="light" />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Dashboard</h1>
        <p className="text-gray-600">Manage your wallet, payments and withdrawals</p>
      </div>

      {/* Main Wallet Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-white p-3 rounded-full shadow-sm mr-4">
                <Wallet className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-gray-600 font-medium text-sm md:text-base">Your Wallet Balance</h2>
                <div className="flex items-baseline">
                  {isLoadingBalance ? (
                    <div className="flex items-center mt-1">
                      <div className="animate-pulse bg-gray-200 h-8 w-28 rounded"></div>
                    </div>
                  ) : (
                    <>
                      <span className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                        {walletBalance.toLocaleString()}
                      </span>
                      <span className="ml-2 font-medium text-gray-600">SAR</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`inline-flex items-center px-4 py-2 ${
                  showHistory ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-700"
                } text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2`}
              >
                <History className="h-4 w-4 mr-1" />
                {showHistory ? "Hide History" : "View History"}
              </button>
            </div>
          </div>
        </div>

        {/* Top-up Form */}
        <div className="p-6 border-t border-gray-100">
          <div className="max-w-lg mx-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Money to Wallet</h3>
            
            <div className="flex flex-col space-y-4">
              {/* Payment Method Selection */}
              <div>
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="relative">
                  <select
                    id="paymentMethod"
                    value={paymentMethod}
                    onChange={handlePaymentMethodChange}
                    className="block w-full rounded-md border-gray-300 py-3 pl-3 pr-10 text-gray-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm appearance-none bg-white"
                    disabled={isProcessing}
                  >
                    <option value="VISA">Visa / Mastercard</option>
                    <option value="MADA">Mada</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <CreditCard className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {paymentMethod === "VISA" 
                    ? "International cards accepted (Visa, Mastercard)" 
                    : "Local Saudi payment method"}
                </p>
              </div>

              {/* Amount Input */}
              <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
                <div className="flex-1">
                  <label htmlFor="topupAmount" className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (Minimum 10 SAR)
                  </label>
                  <div className="relative mt-1 rounded-md shadow-sm">
                    <input
                      id="topupAmount"
                      type="text"
                      value={topupAmount}
                      onChange={handleTopupAmountChange}
                      placeholder="Enter amount"
                      className="block w-full rounded-md border-gray-300 pl-3 pr-16 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      disabled={isProcessing}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center">
                      <span className="h-full inline-flex items-center px-3 rounded-r-md border-l border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                        SAR
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 md:mt-7">
                  <button
                    onClick={handleTopupWallet}
                    disabled={isProcessing || !topupAmount || !paymentMethod}
                    className={`w-full md:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                      isProcessing || !topupAmount || !paymentMethod ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Add Money
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg flex items-start">
                <AlertTriangle className="h-4 w-4 text-blue-500 mr-1 mt-0.5 flex-shrink-0" />
                <span>
                  Funds will be available immediately after successful payment. You can use your wallet balance for all services on the platform.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      {showHistory && (
        <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <h3 className="text-lg font-semibold text-gray-900">Withdrawal History</h3>
              
              <button 
                onClick={fetchWithdrawalHistory}
                className="mt-2 sm:mt-0 p-1 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                aria-label="Refresh history"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {withdrawalHistory.length === 0 ? (
              <div className="p-6 text-center">
                <div className="mx-auto h-12 w-12 text-gray-400 rounded-full bg-gray-100 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  You haven't made any withdrawal requests yet.
                </p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {withdrawalHistory.map((transaction) => (
                    <tr key={transaction._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(transaction.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {transaction.amount.toLocaleString()} SAR
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                        {transaction.method === 'bank' ? 'Bank Transfer' : 'Original Payment Method'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeColor(transaction.status)}`}>
                          {getStatusIcon(transaction.status)}
                          <span className="ml-1 capitalize">{transaction.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.adminComments ? (
                          <div className="group relative">
                            <span className="underline decoration-dotted cursor-help">View comment</span>
                            <div className="invisible group-hover:visible absolute z-10 w-48 bg-gray-900 text-white text-xs rounded py-2 px-3 right-0 bottom-full mb-1">
                              {transaction.adminComments}
                            </div>
                          </div>
                        ) : transaction.method === 'bank' ? (
                          <span className="text-gray-400">Bank: {transaction.bankDetails?.bankName}</span>
                        ) : (
                          <span className="text-gray-400">Via TAP</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPaymentMethods;