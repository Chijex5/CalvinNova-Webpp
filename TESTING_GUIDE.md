# Testing Guide for Transaction Verification Flow

## Overview
This document provides a comprehensive testing guide for the seller/buyer transaction verification flow implemented in this PR.

## Pre-requisites

### Test Accounts Required
1. **Seller Account**: User with seller role or both roles
2. **Buyer Account**: Different user account (buyer role)
3. **Test Transaction**: A completed payment transaction between these two users

### Test Environment Setup
1. Backend server running on `http://localhost:5000`
2. Frontend dev server running on `http://localhost:3000`
3. Camera-enabled device for QR scanning tests (or test images)

## Manual Test Cases

### Test Suite 1: Seller Flow

#### TC1.1 - Seller Instruction Modal Display
**Objective**: Verify the instruction modal appears for sellers

**Steps**:
1. Log in as the seller account
2. Navigate to `/transaction/verify/:transactionId` (use actual transaction ID)
3. Wait for page to load

**Expected Results**:
- [ ] Instruction modal appears immediately
- [ ] Modal title: "Show QR Code to Buyer"
- [ ] Modal contains clear instructions
- [ ] Modal has informational tip with 💡 icon
- [ ] Button text: "I understand, Show QR Code"
- [ ] Close (X) button is visible
- [ ] Modal supports dark mode

**Pass/Fail**: _______

---

#### TC1.2 - QR Code Display After Modal Dismissal
**Objective**: Verify QR code displays correctly after closing instruction modal

**Steps**:
1. Complete TC1.1
2. Click "I understand, Show QR Code" button
3. Observe the page content

**Expected Results**:
- [ ] Modal closes smoothly
- [ ] QR code is displayed prominently
- [ ] Transaction ID is shown below QR code
- [ ] Security notice card is displayed (green)
- [ ] Warning card is displayed (yellow)
- [ ] All icons render correctly
- [ ] QR code is scannable (use phone to test)
- [ ] Page is responsive on mobile devices

**Pass/Fail**: _______

---

#### TC1.3 - Seller Modal Close Button
**Objective**: Verify the X button closes the instruction modal

**Steps**:
1. Refresh the page to see the modal again
2. Click the X button in the top-right corner

**Expected Results**:
- [ ] Modal closes
- [ ] QR code is revealed
- [ ] No errors in console

**Pass/Fail**: _______

---

### Test Suite 2: Buyer Flow - QR Scanning

#### TC2.1 - Camera Permission Handling
**Objective**: Verify proper handling of camera permissions

**Steps**:
1. Log in as the buyer account
2. Navigate to `/transaction/verify/:transactionId`
3. Click "Use Camera" button
4. When browser prompts, deny camera access

**Expected Results**:
- [ ] Error message displays: "Camera access failed. Please allow camera access..."
- [ ] "Try Again" button appears
- [ ] Alternative "Upload Image" option is visible
- [ ] No app crash

**Pass/Fail**: _______

---

#### TC2.2 - Successful Camera Access
**Objective**: Verify camera starts correctly when permission granted

**Steps**:
1. Complete TC2.1
2. Click "Try Again"
3. Allow camera access
4. Observe the camera feed

**Expected Results**:
- [ ] Camera feed displays in the designated area
- [ ] Scanning overlay appears with animated corners
- [ ] "Actively Scanning" or "Scanning..." status displays
- [ ] Scan count updates (visible in UI)
- [ ] "Stop Scanning" button is visible
- [ ] Camera preview has good quality

**Pass/Fail**: _______

---

#### TC2.3 - QR Code Scanning Success
**Objective**: Verify successful QR code scanning and confirmation flow

**Steps**:
1. Have seller display their QR code (from TC1.2)
2. Complete TC2.2 (buyer with camera active)
3. Point camera at seller's QR code
4. Wait for automatic detection
5. Review the confirmation modal

**Expected Results**:
- [ ] QR code is detected automatically
- [ ] Camera stops immediately after detection
- [ ] Confirmation modal appears
- [ ] Modal header: "QR Code Verified!"
- [ ] Transaction info displays correctly
- [ ] Warning section is prominent (amber background)
- [ ] Text reads: "Please ensure the product you are receiving from [SellerName]..."
- [ ] Button text: "I Want to Proceed"
- [ ] Cancel button is available
- [ ] No error messages display

**Pass/Fail**: _______

---

#### TC2.4 - Image Upload Alternative
**Objective**: Verify QR code can be scanned from uploaded image

**Steps**:
1. Take a screenshot of the seller's QR code
2. As buyer, click "Upload Image" button
3. Select the QR code screenshot
4. Wait for processing

**Expected Results**:
- [ ] File picker opens
- [ ] Image uploads successfully
- [ ] QR code is detected from image
- [ ] Confirmation modal appears
- [ ] Same validation as camera scanning applies

**Pass/Fail**: _______

---

#### TC2.5 - Invalid QR Code Handling
**Objective**: Verify error handling for wrong QR codes

**Steps**:
1. Generate a random QR code (not from this transaction)
2. Attempt to scan it with camera or upload as image

**Expected Results**:
- [ ] Error message displays: "QR code does not match this transaction..."
- [ ] Modal does NOT open
- [ ] Scanner automatically restarts after 3 seconds
- [ ] User can retry with correct QR code

**Pass/Fail**: _______

---

### Test Suite 3: Confirmation Flow

#### TC3.1 - Successful Transaction Confirmation
**Objective**: Verify complete transaction confirmation flow

**Prerequisites**: Backend must be running and properly configured

**Steps**:
1. Complete TC2.3 (QR scanned successfully)
2. Review product condition information in modal
3. Click "I Want to Proceed" button
4. Wait for processing

**Expected Results**:
- [ ] Button text changes to "Processing..."
- [ ] Button is disabled during processing
- [ ] No errors occur
- [ ] Success page displays after processing
- [ ] Transaction status updates to "completed"
- [ ] Payout process initiates (check backend logs)

**Pass/Fail**: _______

---

#### TC3.2 - Cancel Confirmation
**Objective**: Verify user can cancel the confirmation

**Steps**:
1. Complete TC2.3 (QR scanned successfully)
2. Click "Cancel" button in confirmation modal

**Expected Results**:
- [ ] Modal closes
- [ ] Returns to scanning interface
- [ ] No transaction is completed
- [ ] User can scan again
- [ ] No errors in console

**Pass/Fail**: _______

---

### Test Suite 4: Error Handling (Requires Backend Implementation)

#### TC4.1 - Unauthorized User Error
**Objective**: Verify proper error when non-buyer tries to confirm

**Prerequisites**: Backend implements buyer verification

**Steps**:
1. Log in as seller or different user (NOT the buyer)
2. Navigate to buyer's verification URL
3. Scan the QR code
4. Click "I Want to Proceed"

**Expected Results**:
- [ ] Error message displays in modal (red background)
- [ ] Error text: "You are not authorized to confirm this transaction..."
- [ ] Modal stays open
- [ ] User can see and read the error
- [ ] Cancel button remains functional
- [ ] Transaction is NOT completed

**Pass/Fail**: _______

---

#### TC4.2 - Duplicate Confirmation Error
**Objective**: Verify proper error when transaction already confirmed

**Prerequisites**: 
- Backend implements duplicate check
- Have one completed transaction

**Steps**:
1. Use a transaction that was already confirmed
2. Attempt to scan QR code again
3. Click "I Want to Proceed"

**Expected Results**:
- [ ] Error message displays in modal (red background)
- [ ] Error text: "This transaction has already been confirmed..."
- [ ] Modal stays open
- [ ] Cancel button remains functional
- [ ] Backend prevents duplicate completion

**Pass/Fail**: _______

---

#### TC4.3 - Error Retry Functionality
**Objective**: Verify user can retry after error

**Steps**:
1. Trigger any error (TC4.1 or TC4.2)
2. Read the error message
3. Click "Cancel" to close modal
4. Fix the issue (use correct account)
5. Scan QR code again

**Expected Results**:
- [ ] Error clears when modal closes
- [ ] User can scan QR code again
- [ ] Fresh confirmation modal appears
- [ ] No residual error state

**Pass/Fail**: _______

---

### Test Suite 5: UI/UX Testing

#### TC5.1 - Dark Mode Support
**Objective**: Verify all components support dark mode

**Steps**:
1. Toggle system dark mode ON
2. Go through TC1.1, TC1.2, TC2.3

**Expected Results**:
- [ ] All modals render correctly in dark mode
- [ ] Text is readable (sufficient contrast)
- [ ] Icons are visible
- [ ] Colors are appropriate
- [ ] No white flashes or jarring transitions

**Pass/Fail**: _______

---

#### TC5.2 - Mobile Responsiveness
**Objective**: Verify interface works on mobile devices

**Steps**:
1. Test on mobile device or use browser dev tools (mobile view)
2. Test seller flow (TC1.1, TC1.2)
3. Test buyer flow (TC2.2, TC2.3)

**Expected Results**:
- [ ] All modals fit on screen
- [ ] QR code is appropriately sized
- [ ] Camera preview fills available space
- [ ] Buttons are easily tappable
- [ ] Text is readable without zooming
- [ ] Scanning overlay is properly sized

**Pass/Fail**: _______

---

#### TC5.3 - Loading States
**Objective**: Verify loading indicators display correctly

**Steps**:
1. Test initial page load
2. Test camera initialization
3. Test transaction confirmation

**Expected Results**:
- [ ] Loading spinner shows during QR generation
- [ ] "Initializing Camera" message shows during camera setup
- [ ] "Processing..." shows during confirmation
- [ ] Loading states are visually clear
- [ ] User knows something is happening

**Pass/Fail**: _______

---

## Backend Testing Checklist

### API Endpoint Tests

#### Test: POST `/api/transactions/complete/:transactionId`

##### Scenario 1: Valid Buyer Confirmation
**Request**:
```json
Headers: { Authorization: "Bearer <buyer_token>" }
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "message": "Transaction completed successfully.",
  "transaction": { ... }
}
```

**Validation**:
- [ ] Transaction status updates to "collected"
- [ ] completedAt timestamp is set
- [ ] Payout process initiates
- [ ] Buyer receives confirmation notification
- [ ] Seller receives notification

---

##### Scenario 2: Unauthorized User (Not Buyer)
**Request**:
```json
Headers: { Authorization: "Bearer <non_buyer_token>" }
```

**Expected Response** (403 Forbidden):
```json
{
  "success": false,
  "message": "You are not authorized to confirm this transaction. Only the buyer can scan and confirm."
}
```

**Validation**:
- [ ] Transaction status does NOT change
- [ ] No payout initiated
- [ ] Error logged for monitoring

---

##### Scenario 3: Already Confirmed Transaction
**Request**:
```json
Headers: { Authorization: "Bearer <buyer_token>" }
```

**Expected Response** (409 Conflict):
```json
{
  "success": false,
  "message": "This transaction has already been confirmed. You cannot confirm it again."
}
```

**Validation**:
- [ ] Transaction status remains unchanged
- [ ] No duplicate payout
- [ ] Event logged

---

##### Scenario 4: Transaction Not Found
**Request**:
```json
Headers: { Authorization: "Bearer <buyer_token>" }
```

**Expected Response** (404 Not Found):
```json
{
  "success": false,
  "message": "Transaction not found."
}
```

---

## Performance Testing

### Load Test Scenarios

1. **Concurrent QR Generation**: 100 sellers generating QR codes simultaneously
2. **Concurrent Scanning**: 50 buyers scanning QR codes simultaneously
3. **Camera Stream Handling**: Verify no memory leaks with extended scanning sessions

### Metrics to Monitor
- [ ] Page load time < 2 seconds
- [ ] QR code generation < 1 second
- [ ] Camera initialization < 3 seconds
- [ ] API response time < 500ms
- [ ] No memory leaks during extended scanning

## Security Testing

### Security Checklist

- [ ] QR code data is encrypted/signed
- [ ] Transaction IDs cannot be guessed
- [ ] JWT tokens are validated on backend
- [ ] HTTPS is enforced in production
- [ ] No sensitive data in QR code (encrypted verification code)
- [ ] Rate limiting on API endpoints
- [ ] CSRF protection on state-changing operations
- [ ] XSS protection (no eval of QR data)

## Accessibility Testing

### WCAG Compliance Checklist

- [ ] All modals can be closed with Escape key
- [ ] Focus management in modals
- [ ] Color contrast meets WCAG AA standards
- [ ] Icons have text alternatives
- [ ] Error messages are announced to screen readers
- [ ] Camera permissions clearly explained
- [ ] Alternative text scanning method available

## Browser Compatibility

### Browsers to Test

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Camera API Compatibility
Note: `@zxing/browser` requires:
- Modern browser with camera API support
- HTTPS in production (required for camera access)

## Bug Reporting Template

```markdown
**Bug Title**: [Short description]

**Test Case**: TC[X.Y]

**Severity**: [Critical / High / Medium / Low]

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Result**:
[What should happen]

**Actual Result**:
[What actually happened]

**Screenshots/Videos**:
[Attach if applicable]

**Environment**:
- Browser: 
- OS: 
- Device: 
- Account Type: [Seller/Buyer]

**Console Errors**:
```
[Paste any console errors]
```

**Additional Notes**:
[Any other relevant information]
```

## Test Coverage Summary

After completing all tests, fill out this summary:

| Test Suite | Total Tests | Passed | Failed | Skipped | Coverage % |
|------------|-------------|--------|--------|---------|------------|
| Seller Flow | 3 | ___ | ___ | ___ | ___% |
| Buyer Scanning | 5 | ___ | ___ | ___ | ___% |
| Confirmation | 2 | ___ | ___ | ___ | ___% |
| Error Handling | 3 | ___ | ___ | ___ | ___% |
| UI/UX | 3 | ___ | ___ | ___ | ___% |
| **Total** | **16** | ___ | ___ | ___ | ___% |

## Sign-off

**Tester Name**: _______________
**Date**: _______________
**Overall Status**: [ ] Pass [ ] Fail [ ] Blocked

**Notes**:
_______________________________________
_______________________________________
_______________________________________
