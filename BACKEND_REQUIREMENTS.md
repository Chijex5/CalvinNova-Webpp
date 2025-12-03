# Backend Requirements for Transaction Verification Flow

## Overview
This document outlines the backend changes required to support the seller/buyer verification flow for transaction completion.

## API Endpoint to Modify

### POST `/api/transactions/complete/:transactionId`

This endpoint is called when a buyer scans the seller's QR code and confirms receipt of the item.

## Required Backend Validations

### 1. Verify Current User is the Buyer

**Validation:**
- Extract the current user's ID from the authentication token
- Compare it with the `buyerId` associated with the transaction
- If they don't match, return an error

**Error Response:**
```json
{
  "success": false,
  "code": "UNAUTHORIZED_USER",
  "message": "You are not authorized to confirm this transaction. Only the buyer can scan and confirm."
}
```

**HTTP Status Code:** `403 Forbidden`

**Note**: The `code` field is optional but recommended for robust error handling. The frontend will match on both the error code and message content.

### 2. Verify Transaction Not Already Confirmed

**Validation:**
- Check if the transaction status is already `completed` or `collected`
- Check if there's a `completedAt` or `collectedOn` timestamp
- If transaction is already confirmed, return an error

**Error Response:**
```json
{
  "success": false,
  "code": "DUPLICATE_CONFIRMATION",
  "message": "This transaction has already been confirmed. You cannot confirm it again."
}
```

**HTTP Status Code:** `409 Conflict`

**Note**: The `code` field is optional but recommended for robust error handling. The frontend will match on both the error code and message content.

### 3. Verify Transaction Data

**Validation:**
- Verify the transaction exists
- Verify the seller ID matches the one in the QR code
- Verify the verification code matches (if using one)

**Error Response (if transaction not found):**
```json
{
  "success": false,
  "message": "Transaction not found."
}
```

**HTTP Status Code:** `404 Not Found`

## Success Response

When all validations pass and the transaction is successfully completed:

```json
{
  "success": true,
  "message": "Transaction completed successfully.",
  "transaction": {
    "transactionId": "...",
    "status": "collected",
    "completedAt": "2024-12-03T04:46:21.763Z",
    // ... other transaction details
  }
}
```

**HTTP Status Code:** `200 OK`

## Implementation Notes

1. **Security**: Ensure the authentication middleware properly validates the JWT token before processing the request.

2. **Atomic Operations**: Use database transactions to ensure the transaction state update is atomic and prevents race conditions.

3. **Payout Triggering**: After successfully confirming the transaction, trigger the payout process for the seller as per the existing flow.

4. **Notifications**: Consider sending notifications to both buyer and seller when the transaction is completed.

## Error Code Standards (Recommended)

For robust error handling, it's recommended to include a `code` field in error responses:

### Recommended Error Codes:
- `UNAUTHORIZED_USER` - User is not the buyer
- `DUPLICATE_CONFIRMATION` - Transaction already confirmed
- `TRANSACTION_NOT_FOUND` - Transaction doesn't exist
- `INVALID_VERIFICATION_CODE` - QR code verification failed

### Example Error Response Format:
```json
{
  "success": false,
  "code": "UNAUTHORIZED_USER",
  "message": "Human-readable error message"
}
```

## Frontend Integration

The frontend handles errors using multiple strategies for robustness:

### Primary Strategy (Preferred):
- Checks for error `code` field (e.g., `UNAUTHORIZED_USER`, `DUPLICATE_CONFIRMATION`)
- Checks HTTP status codes (403, 409, etc.)

### Fallback Strategy:
- Checks error messages for specific keywords (case-insensitive):
  - Unauthorized: "not the buyer", "not authorized", "unauthorized"
  - Duplicate: "already confirmed", "already completed"

### Error Display:
- Displays user-friendly error messages based on error type
- Errors shown within modal (modal stays open)
- User can retry or cancel after seeing error

## Testing Scenarios

1. **Happy Path**: Buyer scans QR code and confirms receipt
2. **Wrong User**: Non-buyer attempts to confirm transaction
3. **Duplicate Confirmation**: Buyer attempts to confirm already-completed transaction
4. **Invalid Transaction**: User attempts to confirm non-existent transaction
5. **Seller Attempts Confirmation**: Seller tries to scan their own QR code
