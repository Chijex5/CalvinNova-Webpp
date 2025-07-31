import { useState } from 'react';
import { Phone, X } from 'lucide-react';
import Button from '../components/Button';
import api from '../utils/apiService';
import { useUserStore } from '../store/userStore';
interface PhoneNumberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  userRole?: 'buyer' | 'seller' | 'both' | 'admin' | 'agent';
}
const PhoneNumberModal = ({
  isOpen,
  onClose,
  onSuccess,
  userRole = 'seller'
}: PhoneNumberModalProps) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const store = useUserStore.getState();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const validateNigerianPhone = (phone: string) => {
    // Remove all spaces and non-digit characters except +
    const cleanPhone = phone.replace(/[^\d+]/g, '');

    // Check if it starts with +234 (should be 14 digits total)
    if (cleanPhone.startsWith('+234')) {
      if (cleanPhone.length !== 14) {
        return 'numbers with +234 should be 14 digits total (e.g., +234 801 234 5678)';
      }
      // Check if the number after +234 starts with valid Nigerian mobile prefixes
      const afterCountryCode = cleanPhone.substring(4);
      const validPrefixes = ['701', '702', '703', '704', '705', '706', '707', '708', '709', '801', '802', '803', '804', '805', '806', '807', '808', '809', '810', '811', '812', '813', '814', '815', '816', '817', '818', '819', '901', '902', '903', '904', '905', '906', '907', '908', '909', '915', '916', '917', '918'];
      const prefix = afterCountryCode.substring(0, 3);
      if (!validPrefixes.includes(prefix)) {
        return 'Please enter a valid mobile number';
      }
      return null;
    }

    // Check if it starts with 0 (should be 11 digits total)
    if (cleanPhone.startsWith('0')) {
      if (cleanPhone.length !== 11) {
        return 'numbers starting with 0 should be 11 digits total (e.g., 08012345678)';
      }
      // Check if it's a valid Nigerian mobile number starting with 0
      const validPrefixes = ['0701', '0702', '0703', '0704', '0705', '0706', '0707', '0708', '0709', '0801', '0802', '0803', '0804', '0805', '0806', '0807', '0808', '0809', '0810', '0811', '0812', '0813', '0814', '0815', '0816', '0817', '0818', '0819', '0901', '0902', '0903', '0904', '0905', '0906', '0907', '0908', '0909', '0915', '0916', '0917', '0918'];
      const prefix = cleanPhone.substring(0, 4);
      if (!validPrefixes.includes(prefix)) {
        return 'Please enter a valid mobile number';
      }
      return null;
    }

    // If it doesn't start with +234 or 0, it might be another country code or format
    if (cleanPhone.startsWith('+')) {
      if (cleanPhone.length < 10 || cleanPhone.length > 15) {
        return 'Please enter a valid international phone number';
      }
      return null;
    }
    return 'Please enter a valid phone number starting with +234 or 0';
  };
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneNumber(value);
    if (value.trim()) {
      const validationError = validateNigerianPhone(value);
      setError(validationError || '');
    } else {
      setError('');
    }
  };
  const handleSubmit = async () => {
    if (!phoneNumber.trim()) return;
    const validationError = validateNigerianPhone(phoneNumber);
    if (validationError) {
      setError(validationError);
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.post('/api/user/add-phone-number', {
        phoneNumber
      });
      if (response.data.success) {
        store.updateUser({
          phoneNumber: phoneNumber
        });
        onSuccess?.();
        onClose();
        setPhoneNumber('');
        setError('');
      }
    } catch (error) {
      console.error('Error updating phone number:', error);
      setError('Failed to save phone number. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  const handleClose = () => {
    if (!isLoading) {
      onClose();
      setPhoneNumber('');
      setError('');
    }
  };
  if (!isOpen) return null;
  const getModalContent = () => {
    if (userRole === 'seller' || userRole === 'both') {
      return {
        title: "Add Your Phone Number",
        description: "Help buyers contact you easily when they purchase your products",
        tip: "💡 Tip: WhatsApp numbers work best for quick communication with buyers!"
      };
    } else {
      return {
        title: "Add Your Phone Number",
        description: "This will help sellers contact you regarding your orders and deliveries",
        tip: "💡 Tip: WhatsApp numbers are preferred by most sellers for quick updates!"
      };
    }
  };
  const content = getModalContent();
  const isValid = phoneNumber.trim() && !error;
  return <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {content.title}
            </h2>
          </div>
          <button onClick={handleClose} disabled={isLoading} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200 disabled:opacity-50">
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <p className="text-gray-600 dark:text-gray-300">
            {content.description}
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              {content.tip}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone Number
            </label>
            <input type="tel" placeholder="e.g., +234 801 234 5678 or 08012345678" value={phoneNumber} onChange={handlePhoneChange} disabled={isLoading} className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${error ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'}`} autoFocus />
            {error ? <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {error}
              </p> : <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Format: +234 801 234 5678 (14 digits) or 08012345678 (11 digits)
              </p>}
          </div>

          {/* Buttons */}
          <div className="flex space-x-3">
            <Button variant="secondary" fullWidth onClick={handleClose} disabled={isLoading}>
              Skip for Now
            </Button>
            <Button variant="primary" fullWidth onClick={handleSubmit} disabled={!isValid || isLoading} loading={isLoading} loadingText="Saving...">
              Save Phone Number
            </Button>
          </div>
        </div>
      </div>
    </div>;
};
export default PhoneNumberModal;