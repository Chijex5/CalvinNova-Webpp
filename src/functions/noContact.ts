interface ContactViolation {
  type: 'phone' | 'social' | 'email' | 'payment';
  match: string;
  position: number;
  category: string;
}

export interface CheckResult {
  hasViolation: boolean;
  violations: ContactViolation[];
  message: string;
  riskLevel: 'low' | 'medium' | 'high';
}

class NoContactChecker {
  private readonly phonePatterns: RegExp[] = [
    /\b0[789]\d{8,9}\b/g,  // Nigerian mobile: 070, 080, 081, 090, etc.
    /\b\+234[789]\d{8,9}\b/g,  // Nigerian international format
    /\b234[789]\d{8,9}\b/g,  // Nigerian without +
    /\b\+?\d{10,14}\b/g,  // General international numbers (10-14 digits)
    /\b\d{4}[-.\s]\d{3}[-.\s]\d{4}\b/g,  // Formatted numbers (xxxx-xxx-xxxx)
  ];

  private readonly socialPatterns: RegExp[] = [
    /@[a-zA-Z0-9._]{3,}/gi,  // @username format
    /\bwhatsapp\b/gi,  // WhatsApp mentions
    /\bwa\.me\/\w+/gi,  // WhatsApp links
    /\bt\.me\/\w+/gi,  // Telegram links
    /\big\s*:?\s*@?\w+/gi,  // Instagram mentions
    /\binsta\s*:?\s*@?\w+/gi,  // Instagram variations
    /\binstagram\s*:?\s*@?\w+/gi,  // Full Instagram
    /\bsnap\s*:?\s*@?\w+/gi,  // Snapchat
    /\bsnapchat\s*:?\s*@?\w+/gi,  // Full Snapchat
    /\bfb\s*:?\s*@?\w+/gi,  // Facebook
    /\bfacebook\s*:?\s*@?\w+/gi,  // Full Facebook
    /\btwitter\s*:?\s*@?\w+/gi,  // Twitter
    /\btiktok\s*:?\s*@?\w+/gi,  // TikTok
    /\byoutube\s*:?\s*@?\w+/gi,  // YouTube
  ];

  private readonly emailPatterns: RegExp[] = [
    /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/gi,  // General email
    /\b\w+@gmail\.com\b/gi,  // Gmail specific
    /\b\w+@yahoo\.com\b/gi,  // Yahoo specific
    /\b\w+@hotmail\.com\b/gi,  // Hotmail specific
    /\b\w+@outlook\.com\b/gi,  // Outlook specific
    /\b\w+@\.edu\.ng\b/gi,  // Nigerian educational emails
  ];

  private readonly paymentPatterns: RegExp[] = [
    /\bsend\s+to\b/gi,  // "send to"
    /\btransfer\s+to\b/gi,  // "transfer to"
    /\bmy\s+account\s+is\b/gi,  // "my account is"
    /\baccount\s+number\b/gi,  // "account number"
    /\baccount\s+details\b/gi,  // "account details"
    /\bbank\s*:\s*\w+/gi,  // "bank: GTB" etc.
    /\bgtb\b|\bfirst\s+bank\b|\baccess\s+bank\b|\bzenith\b|\buba\b/gi,  // Nigerian banks
    /\bopay\b|\bpalmpay\b|\bkuda\b|\bmonnify\b/gi,  // Digital payment platforms
    /\baccount\s+name\b/gi,  // "account name"
    /\bsort\s+code\b/gi,  // "sort code"
    /\brouting\s+number\b/gi,  // "routing number"
  ];

  private checkPatterns(text: string, patterns: RegExp[], type: ContactViolation['type'], category: string): ContactViolation[] {
    const violations: ContactViolation[] = [];
    
    patterns.forEach(pattern => {
      const matches = Array.from(text.matchAll(pattern));
      matches.forEach(match => {
        if (match.index !== undefined) {
          violations.push({
            type,
            match: match[0],
            position: match.index,
            category
          });
        }
      });
    });
    
    return violations;
  }

  private calculateRiskLevel(violations: ContactViolation[]): CheckResult['riskLevel'] {
    if (violations.length === 0) return 'low';
    
    const hasPhone = violations.some(v => v.type === 'phone');
    const hasPayment = violations.some(v => v.type === 'payment');
    const multipleSocial = violations.filter(v => v.type === 'social').length > 1;
    
    if (hasPhone && hasPayment) return 'high';
    if (hasPhone || hasPayment || multipleSocial) return 'high';
    if (violations.length > 2) return 'medium';
    
    return 'medium';
  }

  public checkForNoContact(message: string): CheckResult {
    const violations: ContactViolation[] = [];
    
    // Check for phone numbers
    violations.push(...this.checkPatterns(message, this.phonePatterns, 'phone', 'Phone Numbers'));
    
    // Check for social media handles
    violations.push(...this.checkPatterns(message, this.socialPatterns, 'social', 'Social Media'));
    
    // Check for email addresses
    violations.push(...this.checkPatterns(message, this.emailPatterns, 'email', 'Email Addresses'));
    
    // Check for payment mentions
    violations.push(...this.checkPatterns(message, this.paymentPatterns, 'payment', 'Payment Information'));
    
    const hasViolation = violations.length > 0;
    const riskLevel = this.calculateRiskLevel(violations);
    
    let resultMessage = '';
    if (hasViolation) {
      resultMessage = `Contact information detected. Risk level: ${riskLevel.toUpperCase()}. Found ${violations.length} violation(s).`;
    } else {
      resultMessage = 'No contact information detected. Message is safe.';
    }
    
    return {
      hasViolation,
      violations,
      message: resultMessage,
      riskLevel
    };
  }
}

// Usage function
function checkMessage(text: string): CheckResult {
  const checker = new NoContactChecker();
  return checker.checkForNoContact(text);
}

// Export for use
export { NoContactChecker, checkMessage };