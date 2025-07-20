// EmailSentNotification.jsx
import { Mail, CheckCircle, ExternalLink, X } from 'lucide-react';

interface EmailSentNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onGoToLogin: () => void;
}

const EmailSentNotification = ({ 
  isOpen, 
  onClose, 
  email,
  onGoToLogin 
}: EmailSentNotificationProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full p-8 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Success Animation */}
        <div className="text-center mb-6">
          <div className="relative mx-auto w-20 h-20 mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
            <div className="relative w-full h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Account Created Successfully! 🎉
          </h2>
          <p className="text-gray-600">
            We're almost done setting up your NovaPlus account.
          </p>
        </div>

        {/* Email Verification Instructions */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 mb-6">
          <div className="flex items-start">
            <div className="bg-blue-100 p-2 rounded-lg mr-4">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">
                Please Check Your Email
              </h3>
              <p className="text-sm text-gray-700 mb-3">
                We've sent a verification link to:
              </p>
              <div className="bg-white px-3 py-2 rounded-lg border border-blue-200 mb-3">
                <p className="font-medium text-blue-700 text-sm break-all">
                  {email}
                </p>
              </div>
              <p className="text-sm text-gray-600">
                Click the verification link in your email to activate your account and start trading on campus.
              </p>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="space-y-3 mb-6">
          <div className="flex items-start text-sm">
            <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <p className="text-gray-600">
              <span className="font-medium">Check your spam folder</span> if you don't see the email in your inbox
            </p>
          </div>
          <div className="flex items-start text-sm">
            <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <p className="text-gray-600">
              The verification link will expire in <span className="font-medium">24 hours</span>
            </p>
          </div>
          <div className="flex items-start text-sm">
            <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <p className="text-gray-600">
              You can close this window and return when you're ready to sign in
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
          >
            I'll Check Later
          </button>
          <button
            onClick={onGoToLogin}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 flex items-center justify-center"
          >
            Go to Login
            <ExternalLink className="ml-2" size={16} />
          </button>
        </div>

        {/* Footer Note */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Having trouble? Contact our support team at{' '}
            <span className="text-indigo-600 font-medium">support@novaplus.com</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailSentNotification;