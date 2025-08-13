"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft, 
  ArrowUpRight, 
  Building, 
  Wallet, 
  Shield, 
  CheckCircle,
  IndianRupee,
  CreditCard,
  Plus,
  AlertCircle
} from 'lucide-react';
import { walletApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface BankAccount {
  id: string;
  account_holder_name: string;
  account_number: string;
  ifsc_code: string;
  bank_name: string;
  account_type: string;
  verified: boolean;
}

export default function WithdrawPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }
    fetchBankAccounts();
  }, [isAuthenticated, user, router]);

  const fetchBankAccounts = async () => {
    try {
      setIsLoading(true);
      const response = await walletApi.getBankAccounts();
      if (response.success && response.data) {
        setAccounts(response.data.accounts);
        if (response.data.accounts.length === 1) {
          setSelectedAccount(response.data.accounts[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch bank accounts:', error);
      toast.error('Failed to fetch bank accounts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setAmount(value);
  };

  const handleWithdraw = async () => {
    const amountValue = parseInt(amount);
    
    if (!amountValue || amountValue < 100) {
      toast.error('Minimum withdrawal amount is ₹100');
      return;
    }
    
    if (amountValue > 200000) {
      toast.error('Maximum withdrawal amount is ₹2,00,000');
      return;
    }

    if (!user || amountValue > user.wallet_balance) {
      toast.error('Insufficient wallet balance');
      return;
    }

    if (!selectedAccount) {
      toast.error('Please select a bank account');
      return;
    }

    const selectedBankAccount = accounts.find(acc => acc.id === selectedAccount);
    if (!selectedBankAccount) {
      toast.error('Selected bank account not found');
      return;
    }

    try {
      setIsProcessing(true);
      
      // Create transfer using Cashfree-style API
      const transferId = `TXN${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      const transferData = {
        transferId,
        amount: amountValue,
        transferMode: 'banktransfer',
        remarks: remarks || `Withdrawal of ₹${amountValue.toLocaleString('en-IN')}`,
        beneDetails: {
          beneId: `BENE${selectedAccount.substring(0, 8)}`,
          name: selectedBankAccount.account_holder_name,
          email: user.email,
          phone: user.phone,
          bankAccount: selectedBankAccount.account_number,
          ifsc: selectedBankAccount.ifsc_code,
          address1: 'User Address',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001'
        }
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(transferData)
      });

      const result = await response.json();
      
      if (result.status === 'SUCCESS') {
        toast.success(`Withdrawal of ₹${amountValue.toLocaleString('en-IN')} initiated successfully!`);
        router.push('/dashboard');
      } else {
        toast.error(result.message || 'Withdrawal failed');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Withdrawal failed';
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const maskAccountNumber = (accountNumber: string) => {
    if (accountNumber.length <= 4) return accountNumber;
    const lastFour = accountNumber.slice(-4);
    const masked = 'X'.repeat(accountNumber.length - 4);
    return masked + lastFour;
  };

  if (!isAuthenticated || !user) {
    return null;
  }

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
              <div className="bg-blue-600 rounded-lg p-2">
                <ArrowUpRight className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Withdraw Money</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Transfer to bank account</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Withdrawal Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              {/* Amount Section */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Enter Withdrawal Amount
                </h2>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <IndianRupee className="h-6 w-6 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={amount}
                    onChange={handleAmountChange}
                    className="input pl-12 text-xl py-4"
                    placeholder="Enter amount"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Minimum: ₹100 • Maximum: ₹2,00,000 • Available: ₹{user.wallet_balance.toLocaleString('en-IN')}
                </p>
              </div>

              {/* Bank Account Selection */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Select Bank Account
                  </h3>
                  <button
                    onClick={() => router.push('/bank-accounts')}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Account</span>
                  </button>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : accounts.length > 0 ? (
                  <div className="space-y-3">
                    {accounts.map((account) => (
                      <div
                        key={account.id}
                        onClick={() => setSelectedAccount(account.id)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          selectedAccount === account.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                            <Building className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {account.bank_name}
                              </h4>
                              {account.verified && (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {account.account_holder_name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-500 font-mono">
                              {maskAccountNumber(account.account_number)} • {account.ifsc_code}
                            </p>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            selectedAccount === account.id
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}>
                            {selectedAccount === account.id && (
                              <div className="w-full h-full rounded-full bg-white scale-50"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                    <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No Bank Accounts
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Add a bank account to start withdrawing money
                    </p>
                    <button
                      onClick={() => router.push('/bank-accounts')}
                      className="btn-primary"
                    >
                      Add Bank Account
                    </button>
                  </div>
                )}
              </div>

              {/* Remarks */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Remarks (Optional)
                </label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="input"
                  placeholder="Add a note for this transaction"
                  maxLength={100}
                />
              </div>

              {/* Withdraw Button */}
              <button
                onClick={handleWithdraw}
                disabled={!amount || !selectedAccount || isProcessing || accounts.length === 0}
                className="btn-primary w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing Withdrawal...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <ArrowUpRight className="h-5 w-5" />
                    <span>
                      Withdraw {amount ? `₹${parseInt(amount).toLocaleString('en-IN')}` : 'Money'}
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
                <h3 className="font-semibold text-gray-900 dark:text-white">Available Balance</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ₹{user.wallet_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">In your wallet</p>
            </div>

            {/* Transaction Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Transaction Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Processing Time</span>
                  <span className="text-gray-900 dark:text-white">2-5 minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Transfer Mode</span>
                  <span className="text-gray-900 dark:text-white">IMPS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Transaction Fee</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">FREE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Daily Limit</span>
                  <span className="text-gray-900 dark:text-white">₹2,00,000</span>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                    Secure Transfer
                  </h3>
                  <div className="text-sm text-green-800 dark:text-green-200 space-y-1">
                    <p>• Bank-grade encryption</p>
                    <p>• Real-time processing</p>
                    <p>• Instant notifications</p>
                    <p>• 24/7 support available</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                    Important Notice
                  </h3>
                  <div className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
                    <p>• Withdrawals are processed instantly</p>
                    <p>• Ensure bank account details are correct</p>
                    <p>• Failed transactions are auto-refunded</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 