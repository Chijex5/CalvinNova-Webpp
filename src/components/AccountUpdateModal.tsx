import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown, AlertCircle, CheckCircleIcon, Loader } from 'lucide-react';
import api from '../utils/apiService';

// Skeleton Components
const SkeletonPulse = ({ className }: { className: string }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-600 rounded ${className}`}></div>
);

const BankListSkeleton = () => (
  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
    {[...Array(5)].map((_, index) => (
      <div key={index} className="w-full px-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
        <SkeletonPulse className="h-5 w-3/4 mb-2" />
        <SkeletonPulse className="h-4 w-1/4" />
      </div>
    ))}
  </div>
);

const AccountVerificationSkeleton = () => (
  <div className="space-y-6">
    <div className="text-center">
      <SkeletonPulse className="w-16 h-16 rounded-full mx-auto mb-4" />
      <SkeletonPulse className="h-8 w-3/4 mx-auto mb-2" />
      <SkeletonPulse className="h-4 w-5/6 mx-auto" />
    </div>
    <div className="space-y-4">
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 animate-pulse">
        <SkeletonPulse className="h-5 w-32 mb-2" />
        <SkeletonPulse className="h-6 w-full" />
      </div>
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 animate-pulse">
        <SkeletonPulse className="h-5 w-40 mb-2" />
        <SkeletonPulse className="h-6 w-full" />
      </div>
    </div>
  </div>
);

interface Bank {
  id: string;
  name: string;
  code: string;
}

interface BankVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (bankDetails: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    bankCode: string;
  }) => void;
  userName: string;
}

const BankVerificationModal: React.FC<BankVerificationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userName
}) => {
  // Bank verification states
  const [accountNumber, setAccountNumber] = useState('');
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [bankSearchQuery, setBankSearchQuery] = useState('');
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [verifyingAccount, setVerifyingAccount] = useState(false);
  const [accountName, setAccountName] = useState('');
  const [showNameComparison, setShowNameComparison] = useState(false);
  const [nameMatchWarning, setNameMatchWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load banks when modal opens
  useEffect(() => {
    if (isOpen) {
      loadBanks();
    }
  }, [isOpen]);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowBankDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Reset modal state when opening/closing
  useEffect(() => {
    if (isOpen) {
      resetModalState();
    }
  }, [isOpen]);

  const resetModalState = () => {
    setAccountNumber('');
    setSelectedBank(null);
    setBankSearchQuery('');
    setShowBankDropdown(false);
    setVerifyingAccount(false);
    setAccountName('');
    setShowNameComparison(false);
    setNameMatchWarning(false);
    setIsSubmitting(false);
  };

  const loadBanks = async () => {
    setLoadingBanks(true);
    try {
      const response = await api.get('/api/banks');
      const data = response.data;
      if (data.success) {
        setBanks(data.banks);
      }
    } catch (error) {
      console.error('Error loading banks:', error);
    } finally {
      setLoadingBanks(false);
    }
  };

  const filteredBanks = banks.filter(bank => 
    bank.name.toLowerCase().includes(bankSearchQuery.toLowerCase())
  );

  // Intelligent name matching function
  const checkNameMatch = (accountName: string, registeredName: string): boolean => {
    if (!accountName || !registeredName) return false;

    // Normalize names - remove extra spaces, convert to lowercase
    const normalizeString = (str: string) => 
      str.toLowerCase()
        .replace(/[^a-zA-Z\s]/g, '') // Remove non-alphabetic characters except spaces
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
        if (
          accountWord === registeredWord ||
          (accountWord.length > 3 && registeredWord.includes(accountWord)) ||
          (registeredWord.length > 3 && accountWord.includes(registeredWord))
        ) {
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
      const response = await api.post('api/verify', {
        accountNumber,
        bankCode: selectedBank.code
      });
      
      const data = response.data;
      if (data.success) {
        const retrievedAccountName = data.data;
        setAccountName(retrievedAccountName);

        // Small delay to show the skeleton effect
        await new Promise(resolve => setTimeout(resolve, 800));

        // Check if names match intelligently
        const namesMatch = checkNameMatch(retrievedAccountName, userName);
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

  const handleSubmit = async () => {
    if (!selectedBank || !accountNumber || !accountName) return;
    
    setIsSubmitting(true);
    try {
      const bankDetails = {
        accountName,
        accountNumber,
        bankName: selectedBank.name,
        bankCode: selectedBank.code
      };
      
      onSuccess(bankDetails);
      onClose();
    } catch (error) {
      console.error('Error submitting bank details:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBankSelect = (bank: Bank) => {
    setSelectedBank(bank);
    setBankSearchQuery(bank.name);
    setShowBankDropdown(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Bank Account Verification
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {verifyingAccount ? (
            <AccountVerificationSkeleton />
          ) : showNameComparison ? (
            <div className="space-y-6">
              <div className="text-center">
                <div className={`w-16 h-16 ${nameMatchWarning ? 'bg-yellow-100 dark:bg-yellow-900' : 'bg-green-100 dark:bg-green-900'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  {nameMatchWarning ? (
                    <AlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                  ) : (
                    <CheckCircleIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {nameMatchWarning ? 'Name Mismatch Detected' : 'Confirm Account Details'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {nameMatchWarning ? 'Please verify these details carefully' : 'Please confirm that these details are correct'}
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Bank Account Name</h4>
                  <p className="text-lg text-gray-800 dark:text-gray-200">{accountName}</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Your Registered Name</h4>
                  <p className="text-lg text-gray-800 dark:text-gray-200">{userName}</p>
                </div>

                {nameMatchWarning ? (
                  <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Warning:</strong> The names don't appear to match exactly. Please ensure 
                      this is your correct bank account. You can still proceed if you're confident 
                      these details are correct.
                    </p>
                  </div>
                ) : (
                  <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      <strong>Great!</strong> Your names match our records. You can proceed with confidence.
                    </p>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowNameComparison(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={`flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                      isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <Loader className="w-4 h-4 animate-spin mr-2" />
                        Submitting...
                      </div>
                    ) : nameMatchWarning ? 'Proceed Anyway' : 'Confirm & Submit'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <p className="text-gray-600 dark:text-gray-300">
                  Please provide your bank account details for verification
                </p>
              </div>

              <div className="space-y-4">
                {/* Bank Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Bank
                  </label>
                  <div className="relative" ref={dropdownRef}>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search for your bank..."
                        value={bankSearchQuery}
                        onChange={(e) => {
                          setBankSearchQuery(e.target.value);
                          setShowBankDropdown(true);
                        }}
                        onFocus={() => setShowBankDropdown(true)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        {loadingBanks ? (
                          <div className="w-5 h-5">
                            <SkeletonPulse className="w-full h-full rounded-full" />
                          </div>
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                    
                    {showBankDropdown && (
                      <>
                        {loadingBanks ? (
                          <BankListSkeleton />
                        ) : (
                          filteredBanks.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                              {filteredBanks.map(bank => (
                                <button
                                  key={bank.id}
                                  onClick={() => handleBankSelect(bank)}
                                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors duration-150"
                                >
                                  <div className="font-medium text-gray-900 dark:text-white">{bank.name}</div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">{bank.code}</div>
                                </button>
                              ))}
                            </div>
                          )
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Account Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Account Number
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your 10-digit account number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    maxLength={10}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={verifyAccountDetails}
                    disabled={!accountNumber || !selectedBank}
                    className={`flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                      !accountNumber || !selectedBank ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    Verify Account Details
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BankVerificationModal;