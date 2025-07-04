import { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import { Wallet, ArrowDownLeft, History, TrendingUp, X, CreditCard, Building, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

const PaymentMethods = () => {
  const [selectedMethod, setSelectedMethod] = useState("wallet");
  const [earningBalance, setEarningBalance] = useState(0);
  const [spendingBalance, setSpendingBalance] = useState(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [topupAmount, setTopupAmount] = useState("");
  
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
  const [withdrawalHistoryError, setWithdrawalHistoryError] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [step, setStep] = useState(1); // 1: Amount, 2: Method, 3: Details, 4: Confirm

  const router = useRouter();
  const [currentExpertToken, setCurrentExpertToken] = useState(null);

  const [spendingHistory, setSpendingHistory] = useState([]);
  const [spendingHistoryError, setSpendingHistoryError] = useState(null);
  const [showSpendingHistory, setShowSpendingHistory] = useState(false);

  const [showEarningHistoryModal, setShowEarningHistoryModal] = useState(false);
  const [showSpendingHistoryModal, setShowSpendingHistoryModal] = useState(false);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin === "http://www.shourk.com" || event.origin === "https://shourk.com" || event.origin === "http://localhost:3000") {
        if (event.data.type === "TOKEN_SYNC") {
          localStorage.setItem("expertToken", event.data.token);
          setCurrentExpertToken(event.data.token);
        }
      }
    };

    window.addEventListener("message", handleMessage);

    let initialToken = localStorage.getItem("expertToken");

    const tempToken = sessionStorage.getItem("tempExpertToken");
    if (tempToken) {
      localStorage.setItem("expertToken", tempToken);
      initialToken = tempToken;
      sessionStorage.removeItem("tempExpertToken"); 
    }

    const prePaymentData = localStorage.getItem("prePaymentAuth");
    if (prePaymentData) {
      try {
        const { token, timestamp } = JSON.parse(prePaymentData);
        if (Date.now() - timestamp < 3600000) { 
          localStorage.setItem("expertToken", token);
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
        const parentToken = window.parent?.localStorage?.getItem("expertToken");
        if (parentToken) {
          localStorage.setItem("expertToken", parentToken);
          tokenToUse = parentToken;
        } else {
          router.push("/expertpanel/expertlogin");
          setCurrentExpertToken(null);
          return;
        }
      }
      
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/expertauth/refresh-token`,
          {},
          { headers: { Authorization: `Bearer ${tokenToUse}` } }
        );
        localStorage.setItem("expertToken", response.data.newToken);
        setCurrentExpertToken(response.data.newToken);
      } catch (error) {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          localStorage.removeItem("expertToken");
          sessionStorage.removeItem("tempExpertToken");
          localStorage.removeItem("prePaymentAuth");
          setCurrentExpertToken(null);
          router.push("/expertpanel/expertlogin");
        } else if (tokenToUse) {
          setCurrentExpertToken(tokenToUse);
        } else {
          setCurrentExpertToken(null);
          router.push("/expertpanel/expertlogin");
        }
      }
    };

    checkAuth();

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [router]);

  useEffect(() => {
    if (currentExpertToken) {
      fetchWalletBalance(currentExpertToken);
      fetchWithdrawalHistory();
    }
  }, [currentExpertToken]);

  const fetchWalletBalance = async (token) => {
    try {
      setIsLoadingBalance(true);
      if (!token) {
        setIsLoadingBalance(false);
        return;
      }
      
      const response = await axios.get(`${process.env.NEXT_PUBLIC_PROD_API_URL}/api/expertwallet/balances`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setEarningBalance(response.data.data.earning);
        setSpendingBalance(response.data.data.spending);
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
      setWithdrawalHistoryError(null);
      const token = localStorage.getItem("expertToken");
      if (!token) return;
      const response = await axios.get(`${process.env.NEXT_PUBLIC_PROD_API_URL}/api/expertwallet/earning/history`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      // Defensive: check for array
      const historyArr = Array.isArray(response.data.history)
        ? response.data.history
        : Array.isArray(response.data.data)
        ? response.data.data
        : [];
      setWithdrawalHistory(historyArr);
    } catch (error) {
      setWithdrawalHistory([]);
      setWithdrawalHistoryError("Unable to load earning history.");
      console.error("Error fetching withdrawal history:", error);
    }
  };

  const storeTokenBeforePayment = () => {
    const expertToken = localStorage.getItem("expertToken");
    if (expertToken) {
      sessionStorage.setItem("tempExpertToken", expertToken);
      
      const prePaymentAuth = {
        token: expertToken,
        timestamp: Date.now()
      };
      localStorage.setItem("prePaymentAuth", JSON.stringify(prePaymentAuth));
    }
  };

  const handleSelection = (method) => {
    setSelectedMethod(method);
  };

  const handleTopupAmountChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setTopupAmount(value);
    }
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

      setIsProcessing(true);
      const token = localStorage.getItem("expertToken");
      
      if (!token) {
        setIsProcessing(false);
        return;
      }

      storeTokenBeforePayment();
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/expertwallet/spending/topup`,
        { amount: Number(topupAmount) },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      console.log("Topup response:", response.data); // Debug log
      
      // Handle different response structures
      if (response.data) {
        console.log("Topup response:", response.data); 
        // Check if it's the success response format with redirectUrl
        
        toast.success("Redirecting to payment page...");
        window.location.href = `https://shourk.com/expertpanel/payment-expert?checkoutId=${response.data.data.checkoutId}`;
      }
     
     else {
      toast.error("Failed to initiate payment - no response data");
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
      if (Number(withdrawAmount) > earningBalance) {
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
    return Number(withdrawAmount) <= earningBalance * 0.2 && Number(withdrawAmount) <= 1000;
  };

  const handleWithdrawalRequest = async () => {
  try {
    setIsWithdrawing(true);
    const token = localStorage.getItem("expertToken");

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
      `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/expertwithdrawal/request`,
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
      fetchWalletBalance(token);
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

  const fetchSpendingHistory = async () => {
    try {
      setSpendingHistoryError(null);
      const token = localStorage.getItem("expertToken");
      if (!token) return;
      const response = await axios.get(`${process.env.NEXT_PUBLIC_PROD_API_URL}/api/expertwallet/spending/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Defensive: check for array
      const historyArr = Array.isArray(response.data.history)
        ? response.data.history
        : Array.isArray(response.data.data)
        ? response.data.data
        : [];
      setSpendingHistory(historyArr);
    } catch (error) {
      setSpendingHistory([]);
      setSpendingHistoryError("Unable to load spending history.");
      console.error("Error fetching spending history:", error);
    }
  };

  // Add to useEffect to fetch spending history if toggled
  useEffect(() => {
    if (showSpendingHistory) fetchSpendingHistory();
  }, [showSpendingHistory]);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={5000} theme="light" />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Dashboard</h1>
        <p className="text-gray-600">Manage your wallet, payments and withdrawals</p>
      </div>

      {/* Earning Wallet Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all hover:shadow-md mb-8">
        <div className="p-6 bg-gradient-to-r from-green-50 to-teal-50">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-white p-3 rounded-full shadow-sm mr-4">
                <Wallet className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-gray-600 font-medium text-sm md:text-base">Earning Wallet Balance</h2>
                <div className="flex items-baseline">
                  {isLoadingBalance ? (
                    <div className="flex items-center mt-1">
                      <div className="animate-pulse bg-gray-200 h-8 w-28 rounded"></div>
                    </div>
                  ) : (
                    <>
                      <span className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                        {earningBalance.toLocaleString()}
                      </span>
                      <span className="ml-2 font-medium text-gray-600">SAR</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setShowWithdrawModal(true);
                  setStep(1);
                }}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                disabled={earningBalance <= 0}
              >
                <ArrowDownLeft className="h-4 w-4 mr-1" />
                Withdraw
              </button>
              <button
                onClick={() => setShowEarningHistoryModal(true)}
                className={`inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2`}
              >
                <History className="h-4 w-4 mr-1" />
                View History
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Earning Wallet History Modal */}
      {showEarningHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="relative bg-white rounded-xl shadow-2xl max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Earning Wallet History</h3>
              <button onClick={() => setShowEarningHistoryModal(false)} className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors" aria-label="Close history modal">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="overflow-x-auto">
              {withdrawalHistoryError ? (
                <div className="p-6 text-center text-red-600">{withdrawalHistoryError}</div>
              ) : (Array.isArray(withdrawalHistory) && withdrawalHistory.length === 0) ? (
                <div className="p-6 text-center">
                  <div className="mx-auto h-12 w-12 text-gray-400 rounded-full bg-gray-100 flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions found</h3>
                  <p className="mt-1 text-sm text-gray-500">No earning wallet transactions yet.</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Refund</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(Array.isArray(withdrawalHistory) ? withdrawalHistory : []).map((item, idx) => (
                      <tr key={item._id || idx}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.dateTime ? new Date(item.dateTime).toLocaleString() : "-"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.sessionTitle || item.sessionId || "-"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.userName || "-"}</td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${item.amountEarned > 0 ? "text-green-600" : "text-gray-500"}`}>{item.amountEarned ? `+${item.amountEarned} SAR` : "-"}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${item.status === "completed" ? "bg-green-100 text-green-800 border-green-200" : item.status === "refunded" ? "bg-yellow-100 text-yellow-800 border-yellow-200" : "bg-gray-100 text-gray-800 border-gray-200"}`}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.refundDetails ? (
                            <span title={item.refundDetails}>View</span>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Spending Wallet Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-white p-3 rounded-full shadow-sm mr-4">
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-gray-600 font-medium text-sm md:text-base">Spending Wallet Balance</h2>
                <div className="flex items-baseline">
                  {isLoadingBalance ? (
                    <div className="flex items-center mt-1">
                      <div className="animate-pulse bg-gray-200 h-8 w-28 rounded"></div>
                    </div>
                  ) : (
                    <>
                      <span className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                        {spendingBalance.toLocaleString()}
                      </span>
                      <span className="ml-2 font-medium text-gray-600">SAR</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setShowSpendingHistoryModal(true)}
                className={`inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2`}
              >
                <History className="h-4 w-4 mr-1" />
                View History
              </button>
            </div>
          </div>
        </div>

        {/* Top-up Form */}
        <div className="p-6 border-t border-gray-100">
          <div className="max-w-lg mx-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Money to Spending Wallet</h3>
            <div className="flex flex-col space-y-4">
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
                    disabled={isProcessing || !topupAmount}
                    className={`w-full md:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                      isProcessing || !topupAmount ? "opacity-50 cursor-not-allowed" : ""
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

      {/* Spending Wallet History Modal */}
      {showSpendingHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="relative bg-white rounded-xl shadow-2xl max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Spending Wallet History</h3>
              <button onClick={() => setShowSpendingHistoryModal(false)} className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors" aria-label="Close history modal">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="overflow-x-auto">
              {spendingHistoryError ? (
                <div className="p-6 text-center text-red-600">{spendingHistoryError}</div>
              ) : (Array.isArray(spendingHistory) && spendingHistory.length === 0) ? (
                <div className="p-6 text-center">
                  <div className="mx-auto h-12 w-12 text-gray-400 rounded-full bg-gray-100 flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions found</h3>
                  <p className="mt-1 text-sm text-gray-500">No spending wallet transactions yet.</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expert</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Refund</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(Array.isArray(spendingHistory) ? spendingHistory : []).map((item, idx) => (
                      <tr key={item._id || idx}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.dateTime ? new Date(item.dateTime).toLocaleString() : "-"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.expertName || "-"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.sessionId || "-"}</td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${item.amountPaid > 0 ? "text-red-600" : "text-gray-500"}`}>{item.amountPaid ? `-${item.amountPaid} SAR` : "-"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.paymentMethod || "-"}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${item.status === "completed" ? "bg-green-100 text-green-800 border-green-200" : item.status === "refunded" ? "bg-yellow-100 text-yellow-800 border-yellow-200" : "bg-gray-100 text-gray-800 border-gray-200"}`}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.refundDetails ? (
                            <span title={item.refundDetails}>View</span>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
            {/* Header */}
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Withdraw Funds
                </h3>
                <button
                  onClick={() => {
                    setShowWithdrawModal(false);
                    setStep(1);
                  }}
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <span className="sr-only">Close</span>
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Progress Steps */}
              <div className="mt-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`flex items-center justify-center h-6 w-6 rounded-full ${
                      step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
                    }`}>
                      <span className="text-xs font-medium">1</span>
                    </div>
                    <div className={`ml-2 text-xs ${
                      step >= 1 ? "text-blue-600 font-medium" : "text-gray-500"
                    }`}>
                      Amount
                    </div>
                  </div>
                  <div className={`flex-1 mx-2 h-0.5 ${
                    step >= 2 ? "bg-blue-600" : "bg-gray-200"
                  }`}></div>
                  <div className="flex items-center">
                    <div className={`flex items-center justify-center h-6 w-6 rounded-full ${
                      step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
                    }`}>
                      <span className="text-xs font-medium">2</span>
                    </div>
                    <div className={`ml-2 text-xs ${
                      step >= 2 ? "text-blue-600 font-medium" : "text-gray-500"
                    }`}>
                      Method
                    </div>
                  </div>
                  <div className={`flex-1 mx-2 h-0.5 ${
                    step >= 3 ? "bg-blue-600" : "bg-gray-200"
                  }`}></div>
                  <div className="flex items-center">
                    <div className={`flex items-center justify-center h-6 w-6 rounded-full ${
                      step >= 3 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
                    }`}>
                      <span className="text-xs font-medium">3</span>
                    </div>
                    <div className={`ml-2 text-xs ${
                      step >= 3 ? "text-blue-600 font-medium" : "text-gray-500"
                    }`}>
                      Details
                    </div>
                  </div>
                  <div className={`flex-1 mx-2 h-0.5 ${
                    step >= 4 ? "bg-blue-600" : "bg-gray-200"
                  }`}></div>
                  <div className="flex items-center">
                    <div className={`flex items-center justify-center h-6 w-6 rounded-full ${
                      step >= 4 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
                    }`}>
                      <span className="text-xs font-medium">4</span>
                    </div>
                    <div className={`ml-2 text-xs ${
                      step >= 4 ? "text-blue-600 font-medium" : "text-gray-500"
                    }`}>
                      Confirm
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Withdrawal Amount</h3>
                  <div className="relative mt-1 rounded-md shadow-sm">
                    <input
                      type="text"
                      value={withdrawAmount}
                      onChange={handleWithdrawAmountChange}
                      placeholder="Enter amount"
                      className="block w-full rounded-md border-gray-300 pl-3 pr-16 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      disabled={isWithdrawing}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center">
                      <span className="h-full inline-flex items-center px-3 rounded-r-md border-l border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                        SAR
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Available: {earningBalance.toLocaleString()} SAR</span>
                    <span>Minimum: 10 SAR</span>
                  </div>
                  {/* <div className="bg-blue-50 p-3 rounded-lg flex items-start space-x-2"> */}
                    {/* <AlertTriangle className="h-5 w-5 text-blue-500 flex-shrink-0" />
                    <p className="text-sm text-blue-700">
                      Withdrawals up to 20% of your balance may qualify for automatic approval.
                    </p> */}
                  {/* </div> */}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Select Withdrawal Method</h3>
                  <div className="space-y-3 mt-2">
                    <label className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        value="bank"
                        checked={withdrawMethod === "bank"}
                        onChange={(e) => setWithdrawMethod(e.target.value)}
                        name="withdrawMethod"
                        className="h-5 w-5 text-blue-600 mt-1"
                      />
                      <div className="ml-3">
                        <span className="flex items-center text-sm font-medium text-gray-900">
                          <Building className="h-4 w-4 mr-1 text-gray-500" />
                          Bank Transfer
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          Transfer directly to your bank account. Processing time: 5-7 business days.
                        </p>
                      </div>
                    </label>
                    
                    {/* <label className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        value="tap"
                        checked={withdrawMethod === "tap"}
                        onChange={(e) => setWithdrawMethod(e.target.value)}
                        name="withdrawMethod"
                        className="h-5 w-5 text-blue-600 mt-1"
                      />
                      <div className="ml-3">
                        <span className="flex items-center text-sm font-medium text-gray-900">
                          <CreditCard className="h-4 w-4 mr-1 text-gray-500" />
                          Original Payment Method (TAP)
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          Refund to the card or account you used for deposits. Processing time: 2-5 business days.
                        </p>
                      </div>
                    </label> */}
                  </div>
                </div>
              )}

              {step === 3 && withdrawMethod === "bank" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Bank Account Details</h3>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="accountHolderName" className="block text-sm font-medium text-gray-700 mb-1">
                        Account Holder Name
                      </label>
                      <input
                        id="accountHolderName"
                        type="text"
                        value={bankDetails.accountHolderName}
                        onChange={(e) => handleBankDetailsChange("accountHolderName", e.target.value)}
                        className="block  w-full rounded-md border border-black py-2 px-3 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        disabled={isWithdrawing}
                      />
                    </div>
                    <div>
                      <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        Account Number
                      </label>
                      <input
                        id="accountNumber"
                        type="text"
                        value={bankDetails.accountNumber}
                        onChange={(e) => handleBankDetailsChange("accountNumber", e.target.value)}
                        className="block w-full rounded-md border border-black py-2 px-3 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        disabled={isWithdrawing}
                      />
                    </div>
                    <div>
                      <label htmlFor="routingNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        IBAN / Routing Number
                      </label>
                      <input
                        id="routingNumber"
                        type="text"
                        value={bankDetails.routingNumber}
                        onChange={(e) => handleBankDetailsChange("routingNumber", e.target.value)}
                        className="block w-full rounded-md border border-black py-2 px-3 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        disabled={isWithdrawing}
                      />
                    </div>
                    <div>
                      <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-1">
                        Bank Name
                      </label>
                      <input
                        id="bankName"
                        type="text"
                        value={bankDetails.bankName}
                        onChange={(e) => handleBankDetailsChange("bankName", e.target.value)}
                        className="block w-full rounded-md border border-black py-2 px-3 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        disabled={isWithdrawing}
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && withdrawMethod === "tap" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">TAP Refund Details</h3>
                  <p className="text-sm text-gray-600">
                    Funds will be returned to the payment method you used for your most recent deposit.
                  </p>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">Important Note</h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>
                            The card used for your deposit must still be active and valid for this refund method to work.
                            If your card has expired or been canceled, please use the bank transfer option instead.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Confirm Withdrawal</h3>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-500">Amount:</span>
                      <span className="text-sm font-medium text-gray-900">{withdrawAmount} SAR</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-500">Method:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {withdrawMethod === "bank" ? "Bank Transfer" : "Original Payment Method (TAP)"}
                      </span>
                    </div>
                    
                    {withdrawMethod === "bank" && (
                      <>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-gray-500">Account:</span>
                          <span className="text-sm font-medium text-gray-900">{bankDetails.accountHolderName}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-gray-500">Bank:</span>
                          <span className="text-sm font-medium text-gray-900">{bankDetails.bankName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Account Number:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {bankDetails.accountNumber.slice(0, 4)}••••{bankDetails.accountNumber.slice(-4)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {isAutoApproval() && (
                    <div className="bg-green-50 p-3 rounded-lg flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <p className="text-sm text-green-700">
                        This withdrawal amount qualifies for automatic approval. Funds should be processed within 5-7 buisness days.
                      </p>
                    </div>
                  )}
                  
                  {!isAutoApproval() && (
                    <div className="bg-blue-50 p-3 rounded-lg flex items-start space-x-2">
                      <AlertTriangle className="h-5 w-5 text-blue-500 flex-shrink-0" />
                      <p className="text-sm text-blue-700">
                        This withdrawal requires manual approval. The process may take 1-3 business days.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 sm:px-6 border-t border-gray-200">
              <div className="flex justify-between">
                <button
                  onClick={() => {
                    setShowWithdrawModal(false);
                    setStep(1);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <div className="flex space-x-2">
                  {step > 1 && (
                    <button
                      onClick={prevStep}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Back
                    </button>
                  )}
                  {step < 4 ? (
                    <button
                      onClick={nextStep}
                      disabled={step === 1 && (!withdrawAmount || Number(withdrawAmount) < 10 || Number(withdrawAmount) > earningBalance)}
                      className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                        (step === 1 && (!withdrawAmount || Number(withdrawAmount) < 10 || Number(withdrawAmount) > earningBalance)) 
                          ? "opacity-50 cursor-not-allowed" 
                          : ""
                      }`}
                    >
                      {step === 3 ? "Review" : "Continue"}
                    </button>
                  ) : (
                    <button
                      onClick={handleWithdrawalRequest}
                      disabled={isWithdrawing}
                      className={`px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                        isWithdrawing ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {isWithdrawing ? (
                        <>
                          <RefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4 inline" />
                          Processing...
                        </>
                      ) : (
                        "Submit Withdrawal"
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethods;