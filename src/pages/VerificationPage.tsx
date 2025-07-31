import { useState, useEffect } from 'react';
import api from '../utils/apiService';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUserStore } from '../store/userStore';
import { CheckCircle, XCircleIcon, Loader, AlertCircle, CheckCircleIcon, ChevronDown, Phone } from 'lucide-react';
import Button from '../components/Button';

// Skeleton Components
const SkeletonPulse = ({
  className
}: {
  className: string;
}) => <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>;
const BankListSkeleton = () => <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
    {[...Array(5)].map((_, index) => <div key={index} className="w-full px-4 py-3 border-b border-gray-100 last:border-b-0">
        <SkeletonPulse className="h-5 w-3/4 mb-2" />
        <SkeletonPulse className="h-4 w-1/4" />
      </div>)}
  </div>;
const VerificationSkeleton = () => <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center px-4">
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
      <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
        <div className="w-10 h-10 bg-gray-300 rounded-full animate-spin"></div>
      </div>
      <SkeletonPulse className="h-8 w-3/4 mx-auto mb-4" />
      <SkeletonPulse className="h-4 w-full mb-2" />
      <SkeletonPulse className="h-4 w-5/6 mx-auto mb-8" />
    </div>
  </div>;
const AccountVerificationSkeleton = () => <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center px-4">
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
      <div className="text-center mb-8">
        <SkeletonPulse className="w-16 h-16 rounded-full mx-auto mb-4" />
        <SkeletonPulse className="h-8 w-3/4 mx-auto mb-2" />
        <SkeletonPulse className="h-4 w-5/6 mx-auto" />
      </div>
      <div className="space-y-6">
        <div className="bg-gray-50 rounded-lg p-4 animate-pulse">
          <SkeletonPulse className="h-5 w-32 mb-2" />
          <SkeletonPulse className="h-6 w-full" />
        </div>
        <div className="bg-gray-50 rounded-lg p-4 animate-pulse">
          <SkeletonPulse className="h-5 w-40 mb-2" />
          <SkeletonPulse className="h-6 w-full" />
        </div>
        <div className="bg-gray-100 rounded-lg p-4 animate-pulse">
          <SkeletonPulse className="h-4 w-full mb-2" />
          <SkeletonPulse className="h-4 w-3/4" />
        </div>
        <div className="flex space-x-4">
          <SkeletonPulse className="h-12 flex-1" />
          <SkeletonPulse className="h-12 flex-1" />
        </div>
      </div>
    </div>
  </div>;
interface Bank {
  id: string;
  name: string;
  code: string;
}
const EmailVerification = () => {
  const {
    token
  } = useParams();
  const navigate = useNavigate();
  const {
    verifcation
  } = useAuth();

  // Verification states
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [verificationMessage, setVerificationMessage] = useState('');
  const store = useUserStore.getState();

  // Phone number states
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  // Bank verification states
  const [showBankVerification, setShowBankVerification] = useState(false);
  const [accountNumber, setAccountNumber] = useState('');
  const {
    setBankDetails,
    user,
    updateUser
  } = useUserStore.getState();
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [bankSearchQuery, setBankSearchQuery] = useState('');
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [verifyingAccount, setVerifyingAccount] = useState(false);
  const [accountName, setAccountName] = useState('');
  const [showNameComparison, setShowNameComparison] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [nameMatchWarning, setNameMatchWarning] = useState(false);
  const secret = import.meta.env.VITE_PAYSTACK_LIVE_SECRET_KEY;

  // Verify email token on component mount
  useEffect(() => {
    verifyEmailToken();
  }, [token]);

  // Load banks when bank verification is shown
  useEffect(() => {
    if (showBankVerification) {
      loadBanks();
    }
  }, [showBankVerification]);
  const verifyEmailToken = async () => {
    try {
      const response = await verifcation(token as string);
      console.log('Verification response:', response);
      if (response.status) {
        console.log('Token verified successfully:', response);
        setUserData(response.user);
        setVerificationStatus('success');
        setVerificationMessage('Email verified successfully!');

        // Check if user is a seller and needs additional verification
        if (response.user?.role === 'seller' || response.user?.role === 'both') {
          setTimeout(() => {
            setShowPhoneInput(true);
          }, 2000);
        } else {
          // For buyers, complete verification after a short delay
          setTimeout(() => {
            setVerificationComplete(true);
          }, 2000);
        }
      } else {
        setVerificationStatus('error');
        setVerificationMessage('Invalid or expired verification link.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationStatus('error');
      setVerificationMessage('An error occurred during verification. Please try again.');
    }
  };
  const handlePhoneSubmit = () => {
    if (phoneNumber.trim()) {
      setShowPhoneInput(false);
      setShowBankVerification(true);
    }
  };
  const loadBanks = async () => {
    setLoadingBanks(true);
    try {
      const response = await fetch('https://api.paystack.co/bank?country=nigeria&perPage=100', {
        headers: {
          'Authorization': `Bearer ${secret}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.status) {
        setBanks(data.data);
      }
    } catch (error) {
      console.error('Error loading banks:', error);
    } finally {
      setLoadingBanks(false);
    }
  };
  const filteredBanks = banks.filter(bank => bank.name.toLowerCase().includes(bankSearchQuery.toLowerCase()));

  // Intelligent name matching function
  const checkNameMatch = (accountName: string, registeredName: string): boolean => {
    if (!accountName || !registeredName) return false;

    // Normalize names - remove extra spaces, convert to lowercase
    const normalizeString = (str: string) => str.toLowerCase().replace(/[^a-zA-Z\s]/g, '') // Remove non-alphabetic characters except spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
    const normalizedAccountName = normalizeString(accountName);
    const normalizedRegisteredName = normalizeString(registeredName);

    // Split names into words
    const accountWords = normalizedAccountName.split(' ').filter(word => word.length > 1);
    const registeredWords = normalizedRegisteredName.split(' ').filter(word => word.length > 1);

    // If either name has less than 2 words, do exact match
    if (accountWords.length < 2 || registeredWords.length < 2) {
      return normalizedAccountName === normalizedRegisteredName;
    }

    // Count matching words
    let matchingWords = 0;
    const minWordsToMatch = Math.min(2, Math.min(accountWords.length, registeredWords.length));
    for (const accountWord of accountWords) {
      for (const registeredWord of registeredWords) {
        // Check for exact match or if one word contains the other (for shortened names)
        if (accountWord === registeredWord || accountWord.length > 3 && registeredWord.includes(accountWord) || registeredWord.length > 3 && accountWord.includes(registeredWord)) {
          matchingWords++;
          break; // Don't count the same word multiple times
        }
      }
    }

    // Return true if at least the minimum required words match
    return matchingWords >= minWordsToMatch;
  };
  const verifyAccountDetails = async () => {
    if (!accountNumber || !selectedBank) return;
    setVerifyingAccount(true);
    try {
      const response = await fetch(`https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${selectedBank.code}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${secret}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.status) {
        const retrievedAccountName = data.data.account_name;
        setAccountName(retrievedAccountName);

        // Small delay to show the skeleton effect
        await new Promise(resolve => setTimeout(resolve, 800));

        // Check if names match intelligently
        const namesMatch = checkNameMatch(retrievedAccountName, userData?.name || '');
        if (namesMatch) {
          // Names match, proceed directly to completion
          setShowNameComparison(true);
          setNameMatchWarning(false);
        } else {
          // Names don't match, show comparison with warning
          setShowNameComparison(true);
          setNameMatchWarning(true);
        }
      }
    } catch (error) {
      console.error('Account verification error:', error);
    } finally {
      setVerifyingAccount(false);
    }
  };
  const completeVerification = async () => {
    try {
      setIsLoading(true);
      await api.post('/api/users/additional-info', {
        phoneNumber,
        accountNumber,
        bankCode: selectedBank?.code,
        accountName,
        bankName: selectedBank?.name
      });
      setBankDetails({
        accountName,
        accountNumber,
        bankName: selectedBank?.name || ''
      });
      updateUser({
        phoneNumber: phoneNumber
      });
      setVerificationComplete(true);
    } catch (error) {
      console.error('Error completing verification:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleBankSelect = (bank: Bank) => {
    setSelectedBank(bank);
    setBankSearchQuery(bank.name);
    setShowBankDropdown(false);
  };

  // Show skeleton while verifying account details
  if (verifyingAccount) {
    return <AccountVerificationSkeleton />;
  }
  if (verificationComplete) {
    return <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Verification Complete!
          </h1>
          <p className="text-gray-600 mb-8">
            Your account has been successfully verified. You can now access all features.
          </p>
          <Button variant="primary" fullWidth onClick={() => navigate('/')}>
            Go to Dashboard
          </Button>
        </div>
      </div>;
  }
  if (showNameComparison) {
    return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
          <div className="text-center mb-8">
            <div className={`w-16 h-16 ${nameMatchWarning ? 'bg-yellow-100' : 'bg-green-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
              {nameMatchWarning ? <AlertCircle className="w-8 h-8 text-yellow-600" /> : <CheckCircleIcon className="w-8 h-8 text-green-600" />}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {nameMatchWarning ? 'Name Mismatch Detected' : 'Confirm Account Details'}
            </h1>
            <p className="text-gray-600">
              {nameMatchWarning ? 'Please verify these details carefully' : 'Please confirm that these details are correct'}
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Bank Account Name</h3>
              <p className="text-lg text-gray-800">{accountName}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Your Registered Name</h3>
              <p className="text-lg text-gray-800">{userData?.name}</p>
            </div>

            {nameMatchWarning && <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> The names don't appear to match exactly. Please ensure 
                  this is your correct bank account. You can still proceed if you're confident 
                  these details are correct, or contact support if you need assistance.
                </p>
              </div>}

            {!nameMatchWarning && <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  <strong>Great!</strong> Your names match our records. You can proceed with confidence.
                </p>
              </div>}

            <div className="flex space-x-4">
              <Button variant="secondary" fullWidth onClick={() => setShowNameComparison(false)}>
                Back
              </Button>
              <Button variant="primary" loading={isLoading} loadingText='Completing...' fullWidth onClick={completeVerification}>
                {nameMatchWarning ? 'Proceed Anyway' : 'Confirm & Complete'}
              </Button>
            </div>
          </div>
        </div>
      </div>;
  }
  if (showPhoneInput) {
    return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Phone Number Required
            </h1>
            <p className="text-gray-600">
              Please provide your phone number so buyers can easily contact you when they purchase your products
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>💡 Tip:</strong> WhatsApp numbers work best for quick communication with buyers!
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input type="tel" placeholder="e.g., +234 801 234 5678" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              <p className="mt-2 text-sm text-gray-500">
                Include country code (e.g., +234 for Nigeria). This helps buyers reach you quickly after purchase.
              </p>
            </div>

            <Button variant="primary" fullWidth onClick={handlePhoneSubmit} disabled={!phoneNumber.trim()}>
              Continue to Bank Verification
            </Button>
          </div>
        </div>
      </div>;
  }
  if (showBankVerification) {
    return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Bank Account Verification
            </h1>
            <p className="text-gray-600">
              As a seller, we need to verify your bank account details
            </p>
          </div>

          <div className="space-y-6">
            {/* Bank Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Bank
              </label>
              <div className="relative">
                <div className="relative">
                  <input type="text" placeholder="Search for your bank..." value={bankSearchQuery} onChange={e => {
                  setBankSearchQuery(e.target.value);
                  setShowBankDropdown(true);
                }} onFocus={() => setShowBankDropdown(true)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10" />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    {loadingBanks ? <div className="w-5 h-5">
                        <SkeletonPulse className="w-full h-full rounded-full" />
                      </div> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </div>
                </div>
                
                {showBankDropdown && <>
                    {loadingBanks ? <BankListSkeleton /> : filteredBanks.length > 0 && <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {filteredBanks.map(bank => <button key={bank.id} onClick={() => handleBankSelect(bank)} className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors duration-150">
                              <div className="font-medium text-gray-900">{bank.name}</div>
                              <div className="text-sm text-gray-500">{bank.code}</div>
                            </button>)}
                        </div>}
                  </>}
              </div>
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Number
              </label>
              <input type="text" placeholder="Enter your 10-digit account number" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} maxLength={10} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>

            <Button variant="primary" fullWidth onClick={verifyAccountDetails} disabled={!accountNumber || !selectedBank}>
              Verify Account Details
            </Button>
          </div>
        </div>
      </div>;
  }
  return <>
      {verificationStatus === 'verifying' ? <VerificationSkeleton /> : <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            {verificationStatus === 'success' && <>
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircleIcon className="w-10 h-10 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  Email Verified Successfully!
                </h1>
                <p className="text-gray-600 mb-8">
                  {userData?.role === 'seller' || userData?.role === 'both' ? 'As a seller, we need a few more details to complete your verification...' : 'Your account is now fully verified and ready to use!'}
                </p>
              </>}

            {verificationStatus === 'error' && <>
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <XCircleIcon className="w-10 h-10 text-red-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  Verification Failed
                </h1>
                <p className="text-gray-600 mb-8">
                  {verificationMessage}
                </p>
                <div className="flex space-x-4">
                  <Button variant="secondary" fullWidth onClick={() => navigate('/login')}>
                    Back to Login
                  </Button>
                  <Button variant="primary" fullWidth onClick={() => window.location.reload()}>
                    Try Again
                  </Button>
                </div>
              </>}
          </div>
        </div>}
    </>;
};
export default EmailVerification;