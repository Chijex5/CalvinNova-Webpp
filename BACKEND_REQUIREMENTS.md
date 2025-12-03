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
  "message": "You are not authorized to confirm this transaction. Only the buyer can scan and confirm."
}
```

**HTTP Status Code:** `403 Forbidden`

### 2. Verify Transaction Not Already Confirmed

**Validation:**
- Check if the transaction status is already `completed` or `collected`
- Check if there's a `completedAt` or `collectedOn` timestamp
- If transaction is already confirmed, return an error

**Error Response:**
```json
{
  "success": false,
  "message": "This transaction has already been confirmed. You cannot confirm it again."
}
```

**HTTP Status Code:** `409 Conflict`

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

## Frontend Integration

The frontend handles these errors specifically:
- Checks for error messages containing "not the buyer" or "unauthorized"
- Checks for error messages containing "already confirmed" or "already completed"
- Displays user-friendly error messages based on the backend response

## Testing Scenarios

1. **Happy Path**: Buyer scans QR code and confirms receipt
2. **Wrong User**: Non-buyer attempts to confirm transaction
3. **Duplicate Confirmation**: Buyer attempts to confirm already-completed transaction
4. **Invalid Transaction**: User attempts to confirm non-existent transaction
5. **Seller Attempts Confirmation**: Seller tries to scan their own QR code
