"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft, 
  Building, 
  Plus, 
  Trash2, 
  Shield, 
  CheckCircle,
  CreditCard,
  Eye,
  EyeOff
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
  created_at: string;
}

export default function BankAccountsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    account_holder_name: '',
    account_number: '',
    ifsc_code: '',
    bank_name: '',
    account_type: 'savings'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAccountNumbers, setShowAccountNumbers] = useState<{[key: string]: boolean}>({});

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
      }
    } catch (error) {
      console.error('Failed to fetch bank accounts:', error);
      toast.error('Failed to fetch bank accounts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.account_holder_name || !formData.account_number || !formData.ifsc_code || !formData.bank_name) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await walletApi.addBankAccount(formData);
      
      if (response.success) {
        toast.success('Bank account added successfully!');
        setShowAddForm(false);
        setFormData({
          account_holder_name: '',
          account_number: '',
          ifsc_code: '',
          bank_name: '',
          account_type: 'savings'
        });
        fetchBankAccounts();
      } else {
        toast.error(response.message || 'Failed to add bank account');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to add bank account';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to delete this bank account?')) {
      return;
    }

    try {
      const response = await walletApi.deleteBankAccount(accountId);
      if (response.success) {
        toast.success('Bank account deleted successfully');
        fetchBankAccounts();
      } else {
        toast.error(response.message || 'Failed to delete bank account');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to delete bank account';
      toast.error(message);
    }
  };

  const toggleAccountNumberVisibility = (accountId: string) => {
    setShowAccountNumbers(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="bg-purple-600 rounded-lg p-2">
                  <Building className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">Bank Accounts</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Manage your bank accounts</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Account</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Account Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Add Bank Account
              </h2>
              
              <form onSubmit={handleAddAccount} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Account Holder Name *
                  </label>
                  <input
                    type="text"
                    value={formData.account_holder_name}
                    onChange={(e) => setFormData({ ...formData, account_holder_name: e.target.value })}
                    className="input"
                    placeholder="Enter account holder name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Account Number *
                  </label>
                  <input
                    type="text"
                    value={formData.account_number}
                    onChange={(e) => setFormData({ ...formData, account_number: e.target.value.replace(/[^0-9]/g, '') })}
                    className="input"
                    placeholder="Enter account number"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    IFSC Code *
                  </label>
                  <input
                    type="text"
                    value={formData.ifsc_code}
                    onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value.toUpperCase() })}
                    className="input"
                    placeholder="e.g., HDFC0000123"
                    maxLength={11}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bank Name *
                  </label>
                  <input
                    type="text"
                    value={formData.bank_name}
                    onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                    className="input"
                    placeholder="Enter bank name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Account Type
                  </label>
                  <select
                    value={formData.account_type}
                    onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
                    className="input"
                  >
                    <option value="savings">Savings</option>
                    <option value="current">Current</option>
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary flex-1"
                  >
                    {isSubmitting ? 'Adding...' : 'Add Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bank Accounts List */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : accounts.length > 0 ? (
            accounts.map((account) => (
              <div
                key={account.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                      <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {account.bank_name}
                        </h3>
                        {account.verified && (
                          <div className="flex items-center space-x-1 bg-green-100 dark:bg-green-900 px-2 py-1 rounded-full">
                            <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                            <span className="text-xs font-medium text-green-700 dark:text-green-300">
                              Verified
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <p>
                          <span className="font-medium">Account Holder:</span> {account.account_holder_name}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Account Number:</span>
                          <span className="font-mono">
                            {showAccountNumbers[account.id] 
                              ? account.account_number 
                              : maskAccountNumber(account.account_number)
                            }
                          </span>
                          <button
                            onClick={() => toggleAccountNumberVisibility(account.id)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            {showAccountNumbers[account.id] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        <p>
                          <span className="font-medium">IFSC:</span> {account.ifsc_code}
                        </p>
                        <p>
                          <span className="font-medium">Type:</span> {account.account_type.charAt(0).toUpperCase() + account.account_type.slice(1)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          Added on {new Date(account.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteAccount(account.id)}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6 w-fit mx-auto mb-4">
                <Building className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Bank Accounts
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Add your bank account to start making withdrawals
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="btn-primary"
              >
                Add Your First Account
              </button>
            </div>
          )}
        </div>

        {/* Security Notice */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Your Bank Account Security
              </h3>
              <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                <p>• All bank account details are encrypted and stored securely</p>
                <p>• We never store your banking passwords or PINs</p>
                <p>• Account verification is done through secure banking protocols</p>
                <p>• You can delete your accounts anytime from this page</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 