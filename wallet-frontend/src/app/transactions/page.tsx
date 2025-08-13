"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft, 
  History, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Filter, 
  Download,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import { walletApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface Transaction {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  description: string;
  bank_name?: string;
  utr?: string;
  created_at: string;
  updated_at: string;
}

const statusConfig = {
  SUCCESS: { color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900', icon: CheckCircle },
  PENDING: { color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900', icon: Clock },
  FAILED: { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900', icon: XCircle }
};

export default function TransactionsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }
    fetchTransactions();
  }, [isAuthenticated, user, router, currentPage, statusFilter, typeFilter]);

  const fetchTransactions = async () => {
    try {
      setIsLoading(currentPage === 1);
      const response = await walletApi.getTransactions(currentPage, 10);
      if (response.success && response.data) {
        setTransactions(response.data.transactions);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      toast.error('Failed to fetch transactions');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setCurrentPage(1);
    await fetchTransactions();
  };

  const filteredTransactions = transactions.filter(transaction => {
    const description = transaction.description || transaction.remarks || '';
    const utr = transaction.utr || '';
    const bankName = transaction.bank_name || '';
    
    const matchesSearch = description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         utr.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bankName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getTransactionIcon = (type: string, status: string) => {
    if (status === 'PENDING') return Clock;
    if (status === 'FAILED') return XCircle;
    return type === 'CREDIT' ? ArrowDownLeft : ArrowUpRight;
  };

  const getTransactionColor = (type: string, status: string) => {
    if (status === 'FAILED') return 'text-red-600 dark:text-red-400';
    if (status === 'PENDING') return 'text-yellow-600 dark:text-yellow-400';
    return type === 'CREDIT' ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400';
  };

  const exportTransactions = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Date,Type,Amount,Status,Description,UTR\n" +
      filteredTransactions.map(t => 
        `${new Date(t.created_at).toLocaleDateString()},${t.type},₹${t.amount.toLocaleString('en-IN')},${t.status},"${t.description}",${t.utr || 'N/A'}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Transactions exported successfully');
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="bg-orange-600 rounded-lg p-2">
                  <History className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">Transaction History</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">View all your transactions</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={exportTransactions}
                className="btn-secondary flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Status</option>
              <option value="SUCCESS">Success</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Types</option>
              <option value="CREDIT">Money Added</option>
              <option value="DEBIT">Withdrawals</option>
            </select>

            {/* Date Range - Placeholder */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Select date range"
                className="input pl-10"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Transactions
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {filteredTransactions.length} transactions
              </span>
            </div>
          </div>

          {/* Transactions */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => {
                const TransactionIcon = getTransactionIcon(transaction.type, transaction.status);
                const StatusIcon = statusConfig[transaction.status].icon;
                
                return (
                  <div key={transaction.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg ${
                          transaction.status === 'FAILED' ? 'bg-red-100 dark:bg-red-900' :
                          transaction.status === 'PENDING' ? 'bg-yellow-100 dark:bg-yellow-900' :
                          transaction.type === 'CREDIT' ? 'bg-green-100 dark:bg-green-900' :
                          'bg-blue-100 dark:bg-blue-900'
                        }`}>
                          <TransactionIcon className={`h-5 w-5 ${getTransactionColor(transaction.type, transaction.status)}`} />
                        </div>
                        
                                                 <div className="flex-1">
                           <div className="flex items-center space-x-3 mb-1">
                             <h3 className="font-medium text-gray-900 dark:text-white">
                               {transaction.description || transaction.remarks || 'Transaction'}
                             </h3>
                            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${statusConfig[transaction.status].bg}`}>
                              <StatusIcon className={`h-3 w-3 ${statusConfig[transaction.status].color}`} />
                              <span className={`text-xs font-medium ${statusConfig[transaction.status].color}`}>
                                {transaction.status}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>{new Date(transaction.created_at).toLocaleDateString('en-IN', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</span>
                            {transaction.bank_name && (
                              <span>• {transaction.bank_name}</span>
                            )}
                            {transaction.utr && (
                              <span>• UTR: {transaction.utr}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className={`text-lg font-semibold ${
                          transaction.type === 'CREDIT' ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'
                        }`}>
                          {transaction.type === 'CREDIT' ? '+' : '-'}₹{transaction.amount.toLocaleString('en-IN')}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {transaction.type === 'CREDIT' ? 'Added' : 'Withdrawn'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Transactions Found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                    ? 'Try adjusting your filters' 
                    : 'Your transaction history will appear here'
                  }
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 rounded-lg text-sm ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 