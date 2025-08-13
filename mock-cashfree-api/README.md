# Mock Cashfree Payout API

A complete mock implementation of the Cashfree Payout API for testing wallet-based payout systems. This API provides all the functionality needed to build and test a wallet application with bank account withdrawals.

## Features

- 🔐 **JWT Authentication** - Secure user authentication with Bearer tokens
- 💰 **Wallet Management** - Balance tracking, add money, transaction history
- 🏦 **Bank Account Management** - Add, verify, and manage bank accounts
- 💸 **Payout Processing** - Simulate real bank transfers with realistic delays
- 📱 **Notifications** - Real-time notifications for transactions and balance alerts
- 📊 **Transaction History** - Complete audit trail of all operations
- 🎯 **Cashfree-Compatible** - Matches real Cashfree API response formats

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Access the API**
   - Base URL: `http://localhost:3001`
   - Documentation: `http://localhost:3001`
   - Health Check: `http://localhost:3001/health`

## Default Test User

The API automatically creates a default test user:
- **Email**: `user@example.com`
- **Password**: `password123`
- **Initial Balance**: ₹10,000

## API Endpoints

### Authentication
```bash
POST /api/auth/register    # Register new user
POST /api/auth/login       # Login user  
GET  /api/auth/profile     # Get user profile
PUT  /api/auth/profile     # Update user profile
```

### Wallet Management
```bash
GET  /api/wallet/balance          # Get wallet balance
POST /api/wallet/add-money        # Add money (testing only)
GET  /api/wallet/bank-accounts    # Get bank accounts
POST /api/wallet/bank-accounts    # Add bank account
DEL  /api/wallet/bank-accounts/:id # Delete bank account
GET  /api/wallet/transactions     # Transaction history
```

### Cashfree Payout API (Compatible)
```bash
GET  /api/v1/balance              # Get balance
POST /api/v1/beneficiary          # Add beneficiary
GET  /api/v1/beneficiary          # Get beneficiaries
POST /api/v1/transfer             # Create transfer
GET  /api/v1/transfer/:transferId # Get transfer status
```

### Notifications
```bash
GET  /api/notifications           # Get notifications
PUT  /api/notifications/:id/read  # Mark as read
PUT  /api/notifications/read-all  # Mark all as read
DEL  /api/notifications/:id       # Delete notification
```

## Authentication

Most endpoints require authentication using Bearer tokens:

```bash
Authorization: Bearer <jwt_token>
```

Get a token by logging in:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

## Example Usage

### 1. Login and Get Token
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

### 2. Get Wallet Balance
```bash
curl -X GET http://localhost:3001/api/wallet/balance \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Add Bank Account
```bash
curl -X POST http://localhost:3001/api/wallet/bank-accounts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "account_holder_name": "John Doe",
    "account_number": "1234567890123456",
    "ifsc_code": "HDFC0000123",
    "bank_name": "HDFC Bank",
    "account_type": "savings"
  }'
```

### 4. Create Transfer (Cashfree Style)
```bash
curl -X POST http://localhost:3001/api/v1/transfer \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transferId": "TXN123456789",
    "amount": 1000,
    "transferMode": "banktransfer",
    "remarks": "Test withdrawal",
    "beneDetails": {
      "beneId": "BENE001",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "9876543210",
      "bankAccount": "1234567890123456",
      "ifsc": "HDFC0000123",
      "address1": "123 Main St",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001"
    }
  }'
```

### 5. Check Transfer Status
```bash
curl -X GET http://localhost:3001/api/v1/transfer/TXN123456789 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE"
}
```

### Cashfree Style Response
```json
{
  "status": "SUCCESS",
  "subCode": "200",
  "message": "Operation completed",
  "data": {
    // Response data
  }
}
```

## Transaction Simulation

The mock API simulates real-world banking behavior:

- **Processing Delays**: 2-5 seconds for transaction processing
- **Success Rate**: 90% success rate (configurable)
- **UTR Generation**: Realistic UTR numbers for successful transfers
- **Failure Scenarios**: Various failure reasons like insufficient balance, network issues
- **Auto Refunds**: Failed transactions automatically refund to wallet

## Notifications

The system automatically generates notifications for:

- ⚠️  **Low Balance**: When wallet balance < ₹1,000
- ✅ **Withdrawal Success**: When transfer completes successfully  
- ❌ **Withdrawal Failed**: When transfer fails (with reason)
- 🏦 **Account Added**: When new bank account is added

## Database

Uses SQLite for simplicity with the following tables:
- `users` - User accounts and wallet balances
- `bank_accounts` - User bank account details
- `transactions` - All transfer/withdrawal records
- `beneficiaries` - Cashfree-style beneficiary management
- `notifications` - User notifications

Database file: `./wallet.db` (auto-created)

## Environment Variables

```bash
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-for-mock-api
DB_PATH=./wallet.db
```

## Development

```bash
# Install dependencies
npm install

# Start development server with auto-reload
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Testing with Frontend

The API is configured to work with a Next.js frontend running on `http://localhost:3000`. CORS is pre-configured for local development.

## API Compatibility

This mock API is designed to be compatible with the real Cashfree Payout API structure, making it easy to switch between mock and production environments by simply changing the base URL.

## Features Overview

- ✅ Complete user authentication system
- ✅ Wallet balance management
- ✅ Bank account verification simulation
- ✅ Real-time transaction processing
- ✅ Comprehensive notification system
- ✅ Transaction history and audit trails
- ✅ Cashfree API response format compatibility
- ✅ Realistic banking simulation (delays, failures, UTR)
- ✅ Input validation and error handling
- ✅ Security with JWT tokens
- ✅ Local SQLite database

Perfect for developing and testing wallet-based payout applications without needing real banking credentials! 