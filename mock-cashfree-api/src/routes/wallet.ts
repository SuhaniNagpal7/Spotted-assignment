import express from 'express';
import { database } from '../utils/database';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { generateId, validateAccountNumber, validateIFSC, maskAccountNumber, getISTTimestamp } from '../utils/helpers';
import { ApiResponse } from '../types';

const router = express.Router();

// Get wallet balance
router.get('/balance', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await database.get(
      'SELECT wallet_balance FROM users WHERE id = ?',
      [req.user!.userId]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      message: 'Balance retrieved successfully',
      data: {
        availableBalance: user.wallet_balance,
        currency: 'INR',
        lastUpdated: new Date().toISOString()
      }
    } as ApiResponse);

  } catch (error) {
    console.error('Balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR'
    });
  }
});

// Add money to wallet (for testing purposes)
router.post('/add-money', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required',
        error: 'VALIDATION_ERROR'
      });
    }

    if (amount > 50000) {
      return res.status(400).json({
        success: false,
        message: 'Amount cannot exceed ₹50,000',
        error: 'AMOUNT_LIMIT_EXCEEDED'
      });
    }

    // Update wallet balance
    await database.run(
      'UPDATE users SET wallet_balance = wallet_balance + ?, updated_at = ? WHERE id = ?',
      [amount, getISTTimestamp(), req.user!.userId]
    );

    // Create transaction record for deposit (using dummy bank account id)
    const transactionId = generateId();
    const transferId = `DEP${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    await database.run(
      'INSERT INTO transactions (id, user_id, transfer_id, amount, status, transfer_mode, remarks, bank_account_id, created_at, processed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [transactionId, req.user!.userId, transferId, amount, 'SUCCESS', 'DEPOSIT', `Money added to wallet`, 'deposit-virtual', getISTTimestamp(), getISTTimestamp()]
    );

    // Create notification with IST timestamp
    const notificationId = generateId();
    await database.run(
      'INSERT INTO notifications (id, user_id, type, title, message, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [notificationId, req.user!.userId, 'DEPOSIT_SUCCESS', 'Money Added Successfully', `₹${amount.toLocaleString('en-IN')} has been added to your wallet successfully.`, getISTTimestamp()]
    );

    // Get updated balance
    const user = await database.get(
      'SELECT wallet_balance FROM users WHERE id = ?',
      [req.user!.userId]
    );

    res.json({
      success: true,
      message: 'Money added to wallet successfully',
      data: {
        amountAdded: amount,
        newBalance: user.wallet_balance,
        currency: 'INR'
      }
    } as ApiResponse);

  } catch (error) {
    console.error('Add money error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR'
    });
  }
});

// Get bank accounts
router.get('/bank-accounts', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const accounts = await database.all(
      'SELECT * FROM bank_accounts WHERE user_id = ? ORDER BY created_at DESC',
      [req.user!.userId]
    );

    // Mask account numbers for security
    const maskedAccounts = accounts.map(account => ({
      ...account,
      account_number: maskAccountNumber(account.account_number)
    }));

    res.json({
      success: true,
      message: 'Bank accounts retrieved successfully',
      data: { accounts: maskedAccounts }
    } as ApiResponse);

  } catch (error) {
    console.error('Bank accounts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR'
    });
  }
});

// Add bank account
router.post('/bank-accounts', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const {
      account_holder_name,
      account_number,
      ifsc_code,
      bank_name,
      account_type = 'savings'
    } = req.body;

    // Validation
    if (!account_holder_name || !account_number || !ifsc_code || !bank_name) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
        error: 'VALIDATION_ERROR'
      });
    }

    if (!validateAccountNumber(account_number)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid account number format',
        error: 'VALIDATION_ERROR'
      });
    }

    if (!validateIFSC(ifsc_code)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid IFSC code format',
        error: 'VALIDATION_ERROR'
      });
    }

    // Check if account already exists
    const existingAccount = await database.get(
      'SELECT id FROM bank_accounts WHERE user_id = ? AND account_number = ?',
      [req.user!.userId, account_number]
    );

    if (existingAccount) {
      return res.status(409).json({
        success: false,
        message: 'This bank account is already added',
        error: 'ACCOUNT_EXISTS'
      });
    }

    // Add bank account
    const accountId = generateId();
    await database.run(
      `INSERT INTO bank_accounts (id, user_id, account_holder_name, account_number, ifsc_code, bank_name, account_type, verified, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, datetime('now'))`,
      [accountId, req.user!.userId, account_holder_name, account_number, ifsc_code, bank_name, account_type]
    );

    // Get created account (with masked account number)
    const newAccount = await database.get(
      'SELECT * FROM bank_accounts WHERE id = ?',
      [accountId]
    );

    const maskedAccount = {
      ...newAccount,
      account_number: maskAccountNumber(newAccount.account_number)
    };

    // Create notification with IST timestamp
    await database.run(
      `INSERT INTO notifications (id, user_id, type, title, message, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        generateId(),
        req.user!.userId,
        'ACCOUNT_ADDED',
        'Bank Account Added',
        `Your ${bank_name} account ending with ${account_number.slice(-4)} has been successfully added.`,
        getISTTimestamp()
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Bank account added successfully',
      data: { account: maskedAccount }
    } as ApiResponse);

  } catch (error) {
    console.error('Add bank account error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR'
    });
  }
});

// Delete bank account
router.delete('/bank-accounts/:accountId', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { accountId } = req.params;

    // Check if account exists and belongs to user
    const account = await database.get(
      'SELECT * FROM bank_accounts WHERE id = ? AND user_id = ?',
      [accountId, req.user!.userId]
    );

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Bank account not found',
        error: 'ACCOUNT_NOT_FOUND'
      });
    }

    // Delete account
    await database.run(
      'DELETE FROM bank_accounts WHERE id = ? AND user_id = ?',
      [accountId, req.user!.userId]
    );

    res.json({
      success: true,
      message: 'Bank account deleted successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Delete bank account error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR'
    });
  }
});

// Get transaction history
router.get('/transactions', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const transactions = await database.all(
      `SELECT t.*, ba.account_holder_name, ba.bank_name, ba.account_number
       FROM transactions t
       LEFT JOIN bank_accounts ba ON t.bank_account_id = ba.id
       WHERE t.user_id = ?
       ORDER BY t.created_at DESC
       LIMIT ? OFFSET ?`,
      [req.user!.userId, Number(limit), offset]
    );

    // Map and mask transactions
    const maskedTransactions = transactions.map(transaction => ({
      ...transaction,
      type: transaction.transfer_mode === 'DEPOSIT' ? 'CREDIT' : 'DEBIT',
      description: transaction.remarks || (transaction.transfer_mode === 'DEPOSIT' ? 'Money added to wallet' : `Withdrawal to ${transaction.bank_name || 'Bank Account'}`),
      account_number: transaction.account_number ? maskAccountNumber(transaction.account_number) : null
    }));

    const totalTransactions = await database.get(
      'SELECT COUNT(*) as count FROM transactions WHERE user_id = ?',
      [req.user!.userId]
    );

    res.json({
      success: true,
      message: 'Transaction history retrieved successfully',
      data: {
        transactions: maskedTransactions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalTransactions.count,
          totalPages: Math.ceil(totalTransactions.count / Number(limit))
        }
      }
    } as ApiResponse);

  } catch (error) {
    console.error('Transaction history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR'
    });
  }
});

export default router; 