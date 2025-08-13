# Wallet Frontend

A modern, responsive Next.js application for managing wallet and payout operations using the mock Cashfree API.

## Features

- 🎨 **Modern UI** - Clean, responsive design with Tailwind CSS
- 🌓 **Dark/Light Theme** - Automatic theme switching with system preference support
- 🔐 **Authentication** - JWT-based login/register with form validation
- 📱 **Responsive** - Works perfectly on desktop and mobile devices
- 🔔 **Notifications** - Real-time toast notifications for user feedback
- ✨ **TypeScript** - Full type safety throughout the application

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment**
   ```bash
   cp .env.local.example .env.local
   # Update API URL if needed (defaults to http://localhost:3001)
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Frontend: `http://localhost:3000`
   - Make sure the mock API is running on `http://localhost:3001`

## Default Test Credentials

Use these credentials to test the application:
- **Email**: `user@example.com`
- **Password**: `password123`

Or create a new account using the registration form.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── dashboard/         # Main dashboard (protected)
│   └── layout.tsx         # Root layout with providers
├── components/            # Reusable components
│   ├── theme-provider.tsx # Theme provider wrapper
│   └── theme-toggle.tsx   # Dark/light mode toggle
├── contexts/              # React contexts
│   └── AuthContext.tsx    # Authentication context
└── lib/                   # Utilities and configurations
    └── api.ts             # API client and types
```

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Icons**: Lucide React
- **Theme**: next-themes for dark mode

## Key Features Implemented

### ✅ Authentication System
- Login and registration forms with validation
- JWT token management with localStorage
- Automatic token refresh and error handling
- Protected routes with authentication guards

### ✅ Theme System
- Dark and light mode support
- System preference detection
- Smooth theme transitions
- Persistent theme selection

### ✅ User Interface
- Clean, modern design
- Responsive layout for all screen sizes
- Loading states and error handling
- Form validation with real-time feedback

### ✅ API Integration
- Axios-based HTTP client with interceptors
- Automatic token attachment to requests
- Error handling and user feedback
- TypeScript interfaces for API responses

## Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Type checking
npm run type-check   # Check TypeScript types
```

## Environment Variables

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001  # Mock API base URL
```

## Phase 1 Implementation Status

✅ **Project Setup** - Next.js with TypeScript and Tailwind CSS
✅ **Authentication** - Login/register with JWT tokens
✅ **Theme System** - Dark/light mode with system preference
✅ **API Integration** - Axios client with interceptors
✅ **Protected Routes** - Dashboard accessible only when authenticated
✅ **User Interface** - Clean, responsive design
✅ **Form Validation** - Real-time validation with error messages
✅ **Notifications** - Toast notifications for user feedback

## Coming Next (Phase 2)

🔄 **Dashboard Features** - Wallet balance, transaction history
🔄 **Bank Account Management** - Add, verify, delete bank accounts
🔄 **Payout System** - Create withdrawals using Cashfree API
🔄 **Notifications Center** - Real-time notification management
🔄 **Transaction History** - View and filter transaction records

## Development Notes

- The application uses the App Router from Next.js 14+
- All pages are client-side rendered for better interactivity
- Authentication state is managed globally using React Context
- API calls are centralized in `/lib/api.ts` for consistency
- The design system uses CSS custom properties for theming

## Testing

To test the application:

1. Start the mock API server (`npm run dev` in `mock-cashfree-api/`)
2. Start the frontend server (`npm run dev` in `wallet-frontend/`)
3. Navigate to `http://localhost:3000`
4. Use the test credentials or create a new account
5. Test the login/logout flow and theme switching

Perfect for rapid development and testing of wallet-based applications!
