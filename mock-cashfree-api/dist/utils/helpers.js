"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactionFailureReason = exports.formatCurrency = exports.validatePhone = exports.validateEmail = exports.validateAccountNumber = exports.validateIFSC = exports.generateRandomTransactionStatus = exports.simulateDelay = exports.maskAccountNumber = exports.generateBeneId = exports.generateUTR = exports.generateTransferId = exports.generateId = void 0;
const uuid_1 = require("uuid");
const generateId = () => {
    return (0, uuid_1.v4)();
};
exports.generateId = generateId;
const generateTransferId = () => {
    const prefix = 'TXN';
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}${timestamp}${random}`;
};
exports.generateTransferId = generateTransferId;
const generateUTR = () => {
    const date = new Date();
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.random().toString().substring(2, 8);
    return `${year}${month}${day}${random}`;
};
exports.generateUTR = generateUTR;
const generateBeneId = () => {
    const prefix = 'BENE';
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `${prefix}${random}`;
};
exports.generateBeneId = generateBeneId;
const maskAccountNumber = (accountNumber) => {
    if (accountNumber.length <= 4)
        return accountNumber;
    const lastFour = accountNumber.slice(-4);
    const masked = 'X'.repeat(accountNumber.length - 4);
    return masked + lastFour;
};
exports.maskAccountNumber = maskAccountNumber;
const simulateDelay = (ms = 1000) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
exports.simulateDelay = simulateDelay;
const generateRandomTransactionStatus = () => {
    // 90% success rate for simulation
    return Math.random() < 0.9 ? 'SUCCESS' : 'FAILED';
};
exports.generateRandomTransactionStatus = generateRandomTransactionStatus;
const validateIFSC = (ifsc) => {
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return ifscRegex.test(ifsc);
};
exports.validateIFSC = validateIFSC;
const validateAccountNumber = (accountNumber) => {
    // Basic validation: 9-18 digits
    const accountRegex = /^\d{9,18}$/;
    return accountRegex.test(accountNumber);
};
exports.validateAccountNumber = validateAccountNumber;
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.validateEmail = validateEmail;
const validatePhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/; // Indian mobile number format
    return phoneRegex.test(phone);
};
exports.validatePhone = validatePhone;
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
    }).format(amount);
};
exports.formatCurrency = formatCurrency;
const getTransactionFailureReason = () => {
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
exports.getTransactionFailureReason = getTransactionFailureReason;
//# sourceMappingURL=helpers.js.map