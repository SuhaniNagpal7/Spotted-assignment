# 💳 Wallet-Based Payout System

A comprehensive full-stack web application for secure wallet management and bank transfers, featuring a React/Next.js frontend and Node.js backend with mock Cashfree Payout API integration.

<p align="center">
  <img src="https://github.com/user-attachments/assets/235fa0a7-da72-400d-af60-06ae457671b2" width="49%">
  <img src="https://github.com/user-attachments/assets/cbf81e29-d7e2-4fa1-8e79-b312e8a6b293" width="49%">
</p>
<p align="center">
  <img src="https://github.com/user-attachments/assets/16b5989e-2815-41d5-a0e4-8f4323a75a9b" width="49%">
  <img src="https://github.com/user-attachments/assets/7e101fd6-84b8-4ff4-a4b8-1120c36f1066" width="49%">
</p>



## ✨ Features

### 🔐 Authentication & User Management
- **JWT-based Authentication** with secure token handling
- **User Registration & Login** with form validation
- **Password Encryption** using bcryptjs
- **Session Management** with automatic token refresh
- **Protected Routes** with authentication middleware

### 💰 Wallet Operations
- **Real-time Balance Display** with show/hide toggle
- **Add Money to Wallet** with multiple preset amounts
- **Transaction History** with filtering and pagination
- **CSV Export** functionality for transaction records
- **Balance Validation** for withdrawal attempts

### 🏦 Bank Account Management
- **Link Multiple Bank Accounts** with secure storage
- **Account Number Masking** for privacy
- **Account Verification** with validation
- **Delete Bank Accounts** with confirmation

### 💸 Payout System (Mock Cashfree Integration)
- **Withdrawal to Bank Accounts** with real-time processing
- **Transaction Status Tracking** (SUCCESS, PENDING, FAILED)
- **UTR Generation** for successful transfers
- **Beneficiary Management** mimicking Cashfree API structure
- **Transfer Simulation** with realistic processing delays

### 🔔 Smart Notifications
- **Real-time Toast Notifications** for all operations
- **Notification Center** with read/unread status
- **Event-based Alerts** (low balance, successful transfers, etc.)
- **Notification History** with timestamps

### 🎨 Modern UI/UX
- **Dark/Light Theme Toggle** with system preference detection
- **Responsive Design** for all device sizes
- **Clean Material Design** inspired interface
- **Loading States** and error handling
- **Professional Dashboard** with quick actions

## 🛠 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS v3** - Utility-first styling
- **Lucide React** - Modern icon library
- **React Hot Toast** - Elegant notifications
- **Axios** - HTTP client with interceptors
- **next-themes** - Theme management

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type-safe server development
- **SQLite3** - Lightweight database
- **JWT (jsonwebtoken)** - Authentication tokens
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing
- **UUID** - Unique identifier generation

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Nodemon** - Development server
- **ts-node** - TypeScript execution

## 🏗 Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (Express)     │◄──►│   (SQLite)      │
│                 │    │                 │    │                 │
│ • Authentication│    │ • JWT Auth      │    │ • Users         │
│ • Wallet UI     │    │ • Wallet APIs   │    │ • Transactions  │
│ • Notifications │    │ • Payout APIs   │    │ • Bank Accounts │
│ • Theme Support │    │ • Mock Cashfree │    │ • Notifications │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Flow
1. **User Authentication**: JWT tokens for secure API access
2. **Wallet Operations**: Real-time balance updates with transaction logging
3. **Payout Processing**: Mock Cashfree API simulation with realistic delays
4. **Notification System**: Event-driven notifications for user actions

## 🗄 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  password TEXT NOT NULL,
  wallet_balance REAL DEFAULT 10000.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Transactions Table
```sql
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  transfer_id TEXT NOT NULL,
  amount REAL NOT NULL,
  status TEXT NOT NULL,
  transfer_mode TEXT NOT NULL,
  remarks TEXT,
  utr TEXT,
  bank_account_id TEXT,
  bank_name TEXT,
  account_number TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  processed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users (id)
);
```

### Bank Accounts Table
```sql
CREATE TABLE bank_accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  account_holder_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  ifsc_code TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);
```

### Notifications Table
```sql
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);
```

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/auth/register     - User registration
POST /api/auth/login        - User login
GET  /api/auth/profile      - Get user profile
PUT  /api/auth/profile      - Update user profile
```

### Wallet Endpoints
```
GET  /api/wallet/balance         - Get wallet balance
POST /api/wallet/add-money       - Add money to wallet
GET  /api/wallet/transactions    - Get transaction history
GET  /api/wallet/bank-accounts   - Get linked bank accounts
POST /api/wallet/bank-accounts   - Add new bank account
DELETE /api/wallet/bank-accounts/:id - Remove bank account
```

### Payout Endpoints (Mock Cashfree)
```
GET  /api/payouts/balance              - Get payout balance
GET  /api/payouts/beneficiaries        - List beneficiaries
POST /api/payouts/beneficiaries        - Add beneficiary
POST /api/payouts/transfers            - Create transfer
GET  /api/payouts/transfers/:id/status - Get transfer status
```

### Notification Endpoints
```
GET  /api/notifications           - Get user notifications
PUT  /api/notifications/:id/read  - Mark notification as read
PUT  /api/notifications/read-all  - Mark all notifications as read
```

## ⚡ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Git

### 1. Clone Repository
```bash
git clone https://github.com/SuhaniNagpal7/Spotted-assignment.git
cd Spotted-assignment
```

### 2. Setup Mock API (Backend)
```bash
cd mock-cashfree-api
npm install
cp .env.example .env
npm run dev
```

The API will run on `http://localhost:3001`

### 3. Setup Frontend
```bash
cd ../wallet-frontend
npm install
cp .env.local.example .env.local
npm run dev
```

The frontend will run on `http://localhost:3000`

### 4. Environment Variables

**Backend (.env)**
```env
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-for-mock-api
DB_PATH=./wallet.db
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🚀 Usage

### Default Test Account
```
Email: user@example.com
Password: password123
```

### Quick Start Guide
1. **Login** with default credentials
2. **View Dashboard** with current balance (₹10,000 default)
3. **Add Money** using preset amounts or custom amount
4. **Link Bank Account** for withdrawals
5. **Make Withdrawal** to linked bank account
6. **View Transactions** with filtering options
7. **Check Notifications** for operation updates

## 📱 Screenshots

### Dashboard
- Clean, professional interface with wallet balance
- Quick action buttons for common operations
- Recent transaction overview with status indicators

### Transaction History
- Comprehensive transaction list with filters
- Search functionality by description, UTR, bank name
- Export to CSV feature for record keeping

### Bank Account Management
- Secure account linking with validation
- Masked account numbers for privacy
- Easy account removal with confirmation

### Notifications Center
- Real-time operation notifications
- Read/unread status management
- Event-based alerts for all wallet activities

## 🔒 Security Features

### Authentication Security
- **JWT Token Authentication** with secure secret key
- **Password Hashing** using bcryptjs with salt rounds
- **Token Expiration** with automatic logout
- **Protected API Routes** with middleware validation

### Data Security
- **Input Validation** on all forms and API endpoints
- **SQL Injection Prevention** with parameterized queries
- **CORS Configuration** for secure cross-origin requests
- **Account Number Masking** for sensitive data display

### Transaction Security
- **Balance Validation** before withdrawal processing
- **Unique Transaction IDs** for tracking and auditing
- **Status Tracking** for all financial operations
- **Audit Trail** with comprehensive transaction logging

## 🔮 Future Enhancements

### Technical Improvements
- [ ] **Redis Integration** for session management and caching
- [ ] **Rate Limiting** for API endpoints
- [ ] **Database Migration System** for schema updates
- [ ] **API Documentation** with Swagger/OpenAPI
- [ ] **Unit & Integration Tests** with Jest and Supertest
- [ ] **Docker Containerization** for easy deployment

### Feature Additions
- [ ] **Multi-Currency Support** for international transfers
- [ ] **Recurring Transfers** with scheduling
- [ ] **Transaction Categories** and spending analytics
- [ ] **Mobile App** using React Native
- [ ] **Email Notifications** for important events
- [ ] **Two-Factor Authentication** for enhanced security

### Business Features
- [ ] **KYC Integration** for compliance
- [ ] **Transaction Limits** and daily/monthly caps
- [ ] **Merchant API** for business integrations
- [ ] **Webhook Support** for real-time updates
- [ ] **Admin Dashboard** for user and transaction management

## 👨‍💻 Development Details

### Code Quality
- **TypeScript** for type safety across frontend and backend
- **ESLint Configuration** for consistent code style
- **Modular Architecture** with separation of concerns
- **Error Handling** with comprehensive try-catch blocks
- **Responsive Design** with mobile-first approach

### Performance Optimizations
- **Efficient Database Queries** with proper indexing
- **Frontend Optimization** with Next.js built-in features
- **Lazy Loading** for better page load times
- **Caching Strategies** for API responses
- **Bundle Optimization** with code splitting

---
