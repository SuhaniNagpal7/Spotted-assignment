import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  wallet_balance: number;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    tokenType: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Auth API functions
export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },

  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.get('/api/auth/profile');
    return response.data;
  },

  updateProfile: async (userData: { name: string; phone: string }): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.put('/api/auth/profile', userData);
    return response.data;
  },
};

// Wallet API functions
export const walletApi = {
  getBalance: async (): Promise<ApiResponse<{ availableBalance: number; currency: string; lastUpdated: string }>> => {
    const response = await api.get('/api/wallet/balance');
    return response.data;
  },

  addMoney: async (amount: number): Promise<ApiResponse<{ amountAdded: number; newBalance: number; currency: string }>> => {
    const response = await api.post('/api/wallet/add-money', { amount });
    return response.data;
  },

  getTransactions: async (page = 1, limit = 20): Promise<ApiResponse<{ transactions: any[]; pagination: any }>> => {
    const response = await api.get(`/api/wallet/transactions?page=${page}&limit=${limit}`);
    return response.data;
  },

  getBankAccounts: async (): Promise<ApiResponse<{ accounts: any[] }>> => {
    const response = await api.get('/api/wallet/bank-accounts');
    return response.data;
  },

  addBankAccount: async (accountData: {
    account_holder_name: string;
    account_number: string;
    ifsc_code: string;
    bank_name: string;
    account_type: string;
  }): Promise<ApiResponse<{ account: any }>> => {
    const response = await api.post('/api/wallet/bank-accounts', accountData);
    return response.data;
  },

  deleteBankAccount: async (accountId: string): Promise<ApiResponse> => {
    const response = await api.delete(`/api/wallet/bank-accounts/${accountId}`);
    return response.data;
  },

  getNotifications: async (page = 1, limit = 20): Promise<ApiResponse<{ notifications: any[]; unreadCount: number; pagination: any }>> => {
    const response = await api.get(`/api/notifications?page=${page}&limit=${limit}`);
    return response.data;
  },

  markNotificationRead: async (notificationId: string): Promise<ApiResponse> => {
    const response = await api.put(`/api/notifications/${notificationId}/read`);
    return response.data;
  },

  markAllNotificationsRead: async (): Promise<ApiResponse> => {
    const response = await api.put('/api/notifications/read-all');
    return response.data;
  },
};

// Utility functions
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

export const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
};

export const removeAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }
};

export const getStoredUser = (): User | null => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  return null;
};

export const setStoredUser = (user: User): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

export default api; 