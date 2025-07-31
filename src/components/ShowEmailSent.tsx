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
  return <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl max-w-md w-full sm:max-w-lg p-4 sm:p-6 md:p-8 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors">
          <X size={20} />
        </button>

        {/* Success Animation */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20 mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
            <div className="relative w-full h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
            Account Created! 🎉
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            You're almost done setting up your CalvinNova account.
          </p>
        </div>

        {/* Email Instructions */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-5 border border-blue-200 mb-4 sm:mb-6">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <div className="flex-1 text-sm sm:text-base">
              <h3 className="font-semibold text-gray-900 mb-1">Check Your Email</h3>
              <p className="text-gray-700 mb-2">
                We've sent a verification link to:
              </p>
              <div className="bg-white px-3 py-2 rounded-lg border border-blue-200 mb-2 break-all">
                <p className="font-medium text-blue-700">{email}</p>
              </div>
              <p className="text-gray-600">
                Click the link to activate your account and start trading on campus.
              </p>
            </div>
          </div>
        </div>

        {/* Notes */}
        <ul className="space-y-2 mb-4 sm:mb-6 text-sm sm:text-base text-gray-600">
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-gray-400 rounded-full mt-1.5 shrink-0"></span>
            <span><strong>Check your spam folder</strong> if the email isn't in your inbox.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-gray-400 rounded-full mt-1.5 shrink-0"></span>
            <span>The link will expire in <strong>24 hours</strong>.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-gray-400 rounded-full mt-1.5 shrink-0"></span>
            <span>You can close this window and return later to sign in.</span>
          </li>
        </ul>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 sm:py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            I’ll Check Later
          </button>
          <button onClick={onGoToLogin} className="flex-1 px-4 py-2 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition flex items-center justify-center">
            Go to Login
            <ExternalLink className="ml-2" size={16} />
          </button>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            Need help? Contact us at <span className="text-indigo-600 font-medium">support@calvinnova.com</span>
          </p>
        </div>
      </div>
    </div>;
};
export default EmailSentNotification;