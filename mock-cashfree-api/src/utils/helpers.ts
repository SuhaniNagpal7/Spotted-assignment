import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export const generateId = (): string => {
  return uuidv4();
};

export const generateTransferId = (): string => {
  const prefix = 'TXN';
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

export const generateUTR = (): string => {
  const date = new Date();
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.random().toString().substring(2, 8);
  return `${year}${month}${day}${random}`;
};

export const generateBeneId = (): string => {
  const prefix = 'BENE';
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `${prefix}${random}`;
};

export const maskAccountNumber = (accountNumber: string): string => {
  if (accountNumber.length <= 4) return accountNumber;
  const lastFour = accountNumber.slice(-4);
  const masked = 'X'.repeat(accountNumber.length - 4);
  return masked + lastFour;
};

export const simulateDelay = (ms: number = 1000): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const generateRandomTransactionStatus = (): 'SUCCESS' | 'FAILED' => {
  // 90% success rate for simulation
  return Math.random() < 0.9 ? 'SUCCESS' : 'FAILED';
};

export const validateIFSC = (ifsc: string): boolean => {
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  return ifscRegex.test(ifsc);
};

export const validateAccountNumber = (accountNumber: string): boolean => {
  // Basic validation: 9-18 digits
  const accountRegex = /^\d{9,18}$/;
  return accountRegex.test(accountNumber);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/; // Indian mobile number format
  return phoneRegex.test(phone);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount);
};

export const getTransactionFailureReason = (): string => {
  const reasons = [
    'Insufficient balance in source account',
    'Invalid beneficiary account number',
    'Bank server temporarily unavailable',
    'Transaction limit exceeded',
    'Account temporarily blocked',
    'Network timeout during processing'
  ];
  return reasons[Math.floor(Math.random() * reasons.length)];
};

/**
 * Get current time in IST (Indian Standard Time) as ISO string
 * @returns ISO string with IST timezone offset
 */
export function getISTTimestamp(): string {
  const now = new Date();
  return new Date(now.getTime() + (5.5 * 60 * 60 * 1000)).toISOString(); // Convert to IST (UTC+5:30)
} 