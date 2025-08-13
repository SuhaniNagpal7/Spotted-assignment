"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft, 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Trash2,
  MarkAsUnreadIcon,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { walletApi } from '@/lib/api';

interface Notification {
  id: string;
  type: 'SUCCESS' | 'WARNING' | 'INFO' | 'ERROR';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

const notificationIcons = {
  SUCCESS: CheckCircle,
  WARNING: AlertCircle,
  INFO: Info,
  ERROR: AlertCircle,
  WITHDRAWAL_SUCCESS: CheckCircle,
  WITHDRAWAL_FAILED: AlertCircle,
  DEPOSIT_SUCCESS: CheckCircle,
  ACCOUNT_ADDED: Info,
  LOW_BALANCE: AlertCircle
};

const notificationColors = {
  SUCCESS: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900',
  WARNING: 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900',
  INFO: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900',
  ERROR: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900',
  WITHDRAWAL_SUCCESS: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900',
  WITHDRAWAL_FAILED: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900',
  DEPOSIT_SUCCESS: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900',
  ACCOUNT_ADDED: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900',
  LOW_BALANCE: 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900'
};

export default function NotificationsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }
    fetchNotifications();
  }, [isAuthenticated, user, router]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await walletApi.getNotifications(1, 50);
      if (response.success && response.data) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast.error('Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort notifications by creation date (newest first)
  // This ensures withdrawal notifications appear in correct chronological order
  const filteredNotifications = notifications
    .filter(notification => filter === 'all' || !notification.read)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    try {
      await walletApi.markNotificationRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      toast.success('Notification marked as read');
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await walletApi.markAllNotificationsRead();
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all notifications as read');
    }
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success('Notification deleted');
  };

  const getTimeAgo = (dateString: string) => {
    // Parse the IST timestamp (stored in ISO format with IST offset)
    const now = new Date();
    const date = new Date(dateString);
    
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="bg-purple-600 rounded-lg p-2 relative">
                  <Bell className="h-6 w-6 text-white" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Stay updated with your activity</p>
                </div>
              </div>
            </div>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="btn-secondary flex items-center space-x-2"
              >
                <Check className="h-4 w-4" />
                <span>Mark All Read</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setFilter('all')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === 'all'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                All Notifications ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === 'unread'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </nav>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredNotifications.length > 0 ? (
                         filteredNotifications.map((notification) => {
               const Icon = notificationIcons[notification.type] || Info;
               const colorClass = notificationColors[notification.type] || notificationColors.INFO;
              
              return (
                <div
                  key={notification.id}
                  className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 ${
                    !notification.read ? 'ring-2 ring-blue-500 ring-opacity-20' : ''
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-lg ${colorClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-medium ${
                          !notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {getTimeAgo(notification.created_at)}
                          </span>
                          {!notification.read && (
                            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center space-x-3">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                          >
                            Mark as read
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 text-sm font-medium flex items-center space-x-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {filter === 'unread' ? 'No Unread Notifications' : 'No Notifications'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {filter === 'unread' 
                  ? 'All caught up! You have no unread notifications.'
                  : 'You\'ll receive notifications here for transactions and account updates.'
                }
              </p>
            </div>
          )}
        </div>

        {/* Notification Settings Info */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Notification Settings
              </h3>
              <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <p>• Get notified instantly for all transactions</p>
                <p>• Receive alerts for low wallet balance</p>
                <p>• Bank account verification updates</p>
                <p>• Security and account related notifications</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 