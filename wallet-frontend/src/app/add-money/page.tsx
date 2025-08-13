"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft, 
  Plus, 
  CreditCard, 
  Wallet, 
  Shield, 
  CheckCircle,
  IndianRupee
} from 'lucide-react';
import { walletApi } from '@/lib/api';
import toast from 'react-hot-toast';

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000];

export default function AddMoneyPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [customAmount, setCustomAmount] = useState('');

  if (!isAuthenticated || !user) {
    router.push('/login');
    return null;
  }

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
    setCustomAmount(value.toString());
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmount(value);
    setAmount(value);
  };

  const handleAddMoney = async () => {
    const amountValue = parseInt(amount);
    
    if (!amountValue || amountValue < 100) {
      toast.error('Minimum amount is ₹100');
      return;
    }
    
    if (amountValue > 50000) {
      toast.error('Maximum amount is ₹50,000');
      return;
    }

    try {
      setIsLoading(true);
      const response = await walletApi.addMoney(amountValue);
      
      if (response.success) {
        toast.success(`₹${amountValue.toLocaleString('en-IN')} added to your wallet!`);
        // Refresh user data to get updated balance
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } else {
        toast.error(response.message || 'Failed to add money');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to add money';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="bg-green-600 rounded-lg p-2">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Add Money</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Top up your wallet</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Money Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Enter Amount
              </h2>

              {/* Quick Amount Buttons */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Quick Select</p>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {QUICK_AMOUNTS.map((value) => (
                    <button
                      key={value}
                      onClick={() => handleQuickAmount(value)}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        amount === value.toString()
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className="text-sm font-medium">₹{value.toLocaleString('en-IN')}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Amount Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Or enter custom amount
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <IndianRupee className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    className="input pl-12 text-lg"
                    placeholder="Enter amount"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Minimum: ₹100 • Maximum: ₹50,000
                </p>
              </div>

              {/* Add Money Button */}
              <button
                onClick={handleAddMoney}
                disabled={!amount || isLoading}
                className="btn-primary w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Plus className="h-5 w-5" />
                    <span>
                      Add {amount ? `₹${parseInt(amount).toLocaleString('en-IN')}` : 'Money'}
                    </span>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Current Balance */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                  <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Current Balance</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ₹{user.wallet_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Available in wallet</p>
            </div>

            {/* Security Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg">
                  <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">100% Secure</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Bank-grade encryption
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Instant money addition
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    24/7 customer support
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Payment Methods</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <CreditCard className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Credit/Debit Card</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-blue-500 rounded"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">UPI</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="w-5 h-5 bg-green-500 rounded"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Net Banking</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 