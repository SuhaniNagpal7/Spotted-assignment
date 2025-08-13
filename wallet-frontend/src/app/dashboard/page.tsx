"use client";

import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/theme-toggle';
import { 
  Wallet, 
  LogOut, 
  User, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  Building, 
  History, 
  Bell,
  Eye,
  EyeOff,
  TrendingUp,
  IndianRupee
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { walletApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const router = useRouter();
  const [balance, setBalance] = useState<number>(0);
  const [showBalance, setShowBalance] = useState(true);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (user) {
      fetchWalletBalance();
      fetchRecentTransactions();
      fetchNotifications();
    }
  }, [user]);

  const fetchWalletBalance = async () => {
    try {
      setLoadingBalance(true);
      const response = await walletApi.getBalance();
      if (response.success && response.data) {
        setBalance(response.data.availableBalance);
      }
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    } finally {
      setLoadingBalance(false);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const response = await walletApi.getTransactions(1, 5);
      if (response.success && response.data) {
        setTransactions(response.data.transactions);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await walletApi.getNotifications(1, 5);
      if (response.success && response.data) {
        setUnreadNotifications(response.data.unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleAddMoney = () => {
    router.push('/add-money');
  };

  const handleWithdraw = () => {
    router.push('/withdraw');
  };

  const handleViewTransactions = () => {
    router.push('/transactions');
  };

  const handleManageBanks = () => {
    router.push('/bank-accounts');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 rounded-lg p-2">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Wallet</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Financial Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push('/notifications')}
                className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Bell className="h-5 w-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </button>
              <ThemeToggle />
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user.name.split(' ')[0]}! 👋
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your wallet, make payouts, and track your transactions
          </p>
        </div>

        {/* Wallet Balance Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 mb-8 text-white shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Wallet Balance</p>
              <div className="flex items-center space-x-3 mt-2">
                {showBalance ? (
                  <span className="text-3xl font-bold">
                    ₹{loadingBalance ? '••••' : balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                ) : (
                  <span className="text-3xl font-bold">₹••••••</span>
                )}
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="text-blue-200 hover:text-white transition-colors"
                >
                  {showBalance ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center text-green-300 text-sm">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>Active</span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-4 mt-6">
            <button
              onClick={handleAddMoney}
              className="flex-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg py-3 px-4 text-center transition-colors"
            >
              <Plus className="h-5 w-5 mx-auto mb-1" />
              <span className="text-sm font-medium">Add Money</span>
            </button>
            <button
              onClick={handleWithdraw}
              className="flex-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg py-3 px-4 text-center transition-colors"
            >
              <ArrowUpRight className="h-5 w-5 mx-auto mb-1" />
              <span className="text-sm font-medium">Withdraw</span>
            </button>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div 
            onClick={handleAddMoney}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg group-hover:scale-110 transition-transform">
                <Plus className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Add Money</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Top up wallet</p>
              </div>
            </div>
          </div>

          <div 
            onClick={handleWithdraw}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg group-hover:scale-110 transition-transform">
                <ArrowUpRight className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Withdraw</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Send to bank</p>
              </div>
            </div>
          </div>

          <div 
            onClick={handleManageBanks}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg group-hover:scale-110 transition-transform">
                <Building className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Bank Accounts</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage accounts</p>
              </div>
            </div>
          </div>

          <div 
            onClick={handleViewTransactions}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-lg group-hover:scale-110 transition-transform">
                <History className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Transactions</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">View history</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
              <button 
                onClick={handleViewTransactions}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
              >
                View All
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between py-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        transaction.status === 'SUCCESS' ? 
                          (transaction.type === 'CREDIT' ? 'bg-green-100 dark:bg-green-900' : 'bg-blue-100 dark:bg-blue-900') :
                        transaction.status === 'PENDING' ? 'bg-yellow-100 dark:bg-yellow-900' :
                        'bg-red-100 dark:bg-red-900'
                      }`}>
                        {transaction.type === 'CREDIT' ? (
                          <ArrowDownLeft className={`h-4 w-4 ${
                            transaction.status === 'SUCCESS' ? 'text-green-600 dark:text-green-400' :
                            transaction.status === 'PENDING' ? 'text-yellow-600 dark:text-yellow-400' :
                            'text-red-600 dark:text-red-400'
                          }`} />
                        ) : (
                          <ArrowUpRight className={`h-4 w-4 ${
                            transaction.status === 'SUCCESS' ? 'text-blue-600 dark:text-blue-400' :
                            transaction.status === 'PENDING' ? 'text-yellow-600 dark:text-yellow-400' :
                            'text-red-600 dark:text-red-400'
                          }`} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {transaction.description || transaction.remarks || 
                           (transaction.type === 'CREDIT' ? 'Money Added' : `Withdrawal to ${transaction.bank_name || 'Bank Account'}`)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === 'CREDIT' ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'
                      }`}>
                        {transaction.type === 'CREDIT' ? '+' : '-'}₹{transaction.amount.toLocaleString('en-IN')}
                      </p>
                      <p className={`text-sm ${
                        transaction.status === 'SUCCESS' ? 'text-green-600 dark:text-green-400' :
                        transaction.status === 'PENDING' ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-red-600 dark:text-red-400'
                      }`}>
                        {transaction.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No transactions yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Your transaction history will appear here</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 