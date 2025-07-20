import { useState } from 'react';
import { AlertTriangle, X, Shield, TriangleAlertIcon } from 'lucide-react';

export default function ContactWarningBanner({ type = 'phone' }: { type: string }) {
  const [isVisible, setIsVisible] = useState(true);

  const getWarningHeader = () => {
    if (type === 'phone') {
      return 'Phone Number Detected';
    } else if (type === 'email') {
      return 'Email Address Detected';
    } else if (type === 'social') {
      return 'Social Media Handle Detected';
    } else if (type === 'payment') {
      return 'Payment Information Detected';
    } else {
      return 'Contact Information Detected';
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Mobile-first backdrop overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden" onClick={() => setIsVisible(false)} />
      
      {/* Warning container - mobile-first responsive */}
      <div className="fixed inset-x-0 top-0 z-50 p-4 sm:top-4 sm:left-1/2 sm:transform sm:-translate-x-1/2 sm:max-w-lg sm:p-0">
        <div className="bg-gradient-to-br from-red-50 to-orange-50 border-l-4 border-red-500 rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-top duration-500 ease-out">
          
          {/* Header section */}
          <div className="relative bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-white bg-opacity-20 rounded-full p-2">
                  <TriangleAlertIcon className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm sm:text-base">
                     Security Alert
                  </h3>
                  <p className="text-red-100 text-xs sm:text-sm">
                    {getWarningHeader()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsVisible(false)}
                className="text-white hover:text-red-100 transition-colors p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Main warning content */}
          <div className="p-4 sm:p-6">
            <div className="space-y-4">
              {/* Primary warning */}
              <div className="flex items-start space-x-3">
                <Shield className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h4 className="font-semibold text-red-800 text-sm sm:text-base mb-2">
                    🛡️ Scam Protection Active
                  </h4>
                  <p className="text-red-700 text-sm leading-relaxed">
                    Sharing personal contacts (phone, email, social handles, or payment info) 
                    is <strong>strictly prohibited</strong> in chat to protect you from scams.
                  </p>
                </div>
              </div>
              
              {/* Liability warning */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-orange-800 text-sm mb-1">
                      ⚖️ Important Legal Notice
                    </h4>
                    <p className="text-orange-700 text-xs sm:text-sm leading-relaxed">
                      <strong>If you get scammed outside our platform</strong> (via phone calls, 
                      external apps, or direct transfers), <strong>we cannot be held liable</strong> 
                      and cannot provide refunds or assistance.
                    </p>
                  </div>
                </div>
              </div>

              {/* Safe usage guidance */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                <div className="text-center">
                  <p className="text-green-800 text-sm font-medium">
                    ✅ <strong>Stay Safe:</strong> Complete all transactions through our secure chat system only
                  </p>
                </div>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => setIsVisible(false)}
                className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg text-sm font-semibold hover:bg-red-700 active:bg-red-800 transition-all duration-200 transform active:scale-98"
              >
                🔒 I Understand - Keep Me Safe
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="sm:w-auto px-4 py-2 text-red-600 border border-red-300 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}