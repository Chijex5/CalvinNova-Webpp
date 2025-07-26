import { AlertTriangle, X, Shield, Phone, Mail, MessageSquare, CreditCard } from 'lucide-react';

interface ContactViolation {
  type: 'phone' | 'social' | 'email' | 'payment';
  match: string;
  position: number;
  category: string;
}

interface CheckResult {
  hasViolation: boolean;
  violations: ContactViolation[];
  message: string;
  riskLevel: 'low' | 'medium' | 'high';
}

interface ContactWarningBannerProps {
  checkResult: CheckResult;
  onDismiss?: () => void;
}

export default function ContactWarningBanner({ checkResult, onDismiss }: ContactWarningBannerProps) {

  const handleDismiss = () => {
    onDismiss?.();
  };

  const getViolationIcon = (type: string) => {
    switch (type) {
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'social': return <MessageSquare className="h-4 w-4" />;
      case 'payment': return <CreditCard className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'yellow';
      default: return 'red';
    }
  };

  const getRiskBadgeClasses = (riskLevel: string) => {
    const baseClasses = "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium";
    switch (riskLevel) {
      case 'high': return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300`;
      case 'medium': return `${baseClasses} bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300`;
      case 'low': return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300`;
      default: return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300`;
    }
  };

  const riskColor = getRiskColor(checkResult.riskLevel);

  return (
    <>
      {/* Full screen overlay with highest z-index */}
      <div 
        className="fixed inset-0 bg-black/60 dark:bg-black/80 z-[9999]" 
        onClick={handleDismiss}
        style={{ height: '100vh', width: '100vw' }}
      />
      
      {/* Warning modal - centered on screen */}
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6" style={{ height: '100vh' }}>
        <div className={`w-full max-w-sm sm:max-w-md bg-gradient-to-br from-${riskColor}-50 to-${riskColor === 'red' ? 'orange' : riskColor}-50 dark:from-${riskColor}-950/50 dark:to-${riskColor === 'red' ? 'orange' : riskColor}-950/50 border-l-4 border-${riskColor}-500 dark:border-${riskColor}-400 rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-top duration-300 ease-out max-h-[90vh] overflow-y-auto`}>
          
          {/* Compact header */}
          <div className={`relative bg-gradient-to-r from-${riskColor}-500 to-${riskColor}-600 dark:from-${riskColor}-600 dark:to-${riskColor}-700 px-3 py-2.5 sm:px-4 sm:py-3`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="bg-white bg-opacity-20 dark:bg-white dark:bg-opacity-30 rounded-full p-1.5">
                  <AlertTriangle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">
                    Security Alert
                  </h3>
                  <div className="flex items-center space-x-2">
                    <p className={`text-${riskColor}-100 dark:text-${riskColor}-200 text-xs`}>
                      Contact Info Detected
                    </p>
                    <span className={getRiskBadgeClasses(checkResult.riskLevel)}>
                      {checkResult.riskLevel.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-white hover:text-opacity-80 transition-colors p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Compact main content */}
          <div className="p-3 sm:p-4 bg-white dark:bg-gray-900">
            <div className="space-y-3">
              
              {/* Violations - more compact */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-xs mb-2 flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1.5 text-orange-500" />
                  Violations ({checkResult.violations.length})
                </h4>
                <div className="space-y-1.5">
                  {checkResult.violations.slice(0, 2).map((violation, index) => (
                    <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-700 rounded-md p-2 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center space-x-2">
                        <div className={`text-${riskColor}-500 dark:text-${riskColor}-400`}>
                          {getViolationIcon(violation.type)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100 text-xs">
                            {violation.category}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400 text-xs truncate max-w-[120px]">
                            "{violation.match}"
                          </p>
                        </div>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium bg-${riskColor}-100 text-${riskColor}-800 dark:bg-${riskColor}-900/30 dark:text-${riskColor}-300`}>
                        {violation.type.toUpperCase()}
                      </span>
                    </div>
                  ))}
                  {checkResult.violations.length > 2 && (
                    <p className="text-center text-gray-500 text-xs">
                      +{checkResult.violations.length - 2} more violations
                    </p>
                  )}
                </div>
              </div>

              {/* Primary warning - compact */}
              <div className="flex items-start space-x-2">
                <Shield className={`h-4 w-4 text-${riskColor}-500 dark:text-${riskColor}-400 flex-shrink-0 mt-0.5`} />
                <div className="flex-1">
                  <h4 className={`font-semibold text-${riskColor}-800 dark:text-${riskColor}-300 text-sm mb-1`}>
                    Scam Protection Active
                  </h4>
                  <p className={`text-${riskColor}-700 dark:text-${riskColor}-200 text-xs leading-relaxed`}>
                    Sharing contacts is <strong>prohibited</strong> to protect you from scams.
                  </p>
                </div>
              </div>
              
              {/* Liability warning - compact */}
              <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg p-2.5">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-orange-800 dark:text-orange-300 text-xs mb-1">
                      Legal Notice
                    </h4>
                    <p className="text-orange-700 dark:text-orange-200 text-xs leading-relaxed">
                      <strong>External scams = no refunds.</strong> We're not liable for off-platform transactions.
                    </p>
                  </div>
                </div>
              </div>

              {/* Safe usage - compact */}
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-2.5">
                <p className="text-green-800 dark:text-green-300 text-xs font-medium text-center">
                  <strong>Stay Safe:</strong> Use our secure chat only
                </p>
              </div>
            </div>
            
            {/* Compact action buttons */}
            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleDismiss}
                className={`flex-1 bg-${riskColor}-600 dark:bg-${riskColor}-700 text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-${riskColor}-700 dark:hover:bg-${riskColor}-800 transition-colors`}
              >
                I Understand
              </button>
              <button
                onClick={handleDismiss}
                className={`sm:w-auto px-3 py-2 text-${riskColor}-600 dark:text-${riskColor}-400 border border-${riskColor}-300 dark:border-${riskColor}-700 rounded-lg text-xs font-medium hover:bg-${riskColor}-50 dark:hover:bg-${riskColor}-950/30 transition-colors`}
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