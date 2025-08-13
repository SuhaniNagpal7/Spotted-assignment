import express from 'express';
import { database } from '../utils/database';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import {
  generateId,
  generateTransferId,
  generateUTR,
  generateBeneId,
  simulateDelay,
  generateRandomTransactionStatus,
  getTransactionFailureReason,
  validateAccountNumber,
  validateIFSC,
  maskAccountNumber,
  getISTTimestamp
} from '../utils/helpers';
import {
  CreateTransferRequest,
  TransferResponse,
  BeneficiaryRequest,
  BeneficiaryResponse,
  ApiResponse
} from '../types';

const router = express.Router();

// Get account balance (Cashfree style)
router.get('/balance', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await database.get(
      'SELECT wallet_balance FROM users WHERE id = ?',
      [req.user!.userId]
    );

    if (!user) {
      return res.status(404).json({
        status: 'ERROR',
        subCode: '404',
        message: 'Account not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      subCode: '200',
      message: 'Balance fetched successfully',
      data: {
        availableBalance: user.wallet_balance,
        currency: 'INR',
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Balance error:', error);
    res.status(500).json({
      status: 'ERROR',
      subCode: '500',
      message: 'Internal server error'
    });
  }
});

// Add beneficiary
router.post('/beneficiary', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const beneficiaryData: BeneficiaryRequest = req.body;

    // Validation
    if (!beneficiaryData.name || !beneficiaryData.bankAccount || !beneficiaryData.ifsc) {
      return res.status(400).json({
        status: 'ERROR',
        subCode: '400',
        message: 'Missing required fields: name, bankAccount, ifsc'
      });
    }

    if (!validateAccountNumber(beneficiaryData.bankAccount)) {
      return res.status(400).json({
        status: 'ERROR',
        subCode: '400',
        message: 'Invalid bank account number format'
      });
    }

    if (!validateIFSC(beneficiaryData.ifsc)) {
      return res.status(400).json({
        status: 'ERROR',
        subCode: '400',
        message: 'Invalid IFSC code format'
      });
    }

    // Check if beneficiary already exists
    const existingBene = await database.get(
      'SELECT bene_id FROM beneficiaries WHERE user_id = ? AND bank_account = ?',
      [req.user!.userId, beneficiaryData.bankAccount]
    );

    if (existingBene) {
      return res.status(409).json({
        status: 'ERROR',
        subCode: '409',
        message: 'Beneficiary with this account number already exists'
      });
    }

    // Generate beneId if not provided
    const beneId = beneficiaryData.beneId || generateBeneId();

    // Add beneficiary
    const beneficiaryId = generateId();
    await database.run(
      `INSERT INTO beneficiaries (id, user_id, bene_id, name, email, phone, bank_account, ifsc, address1, city, state, pincode, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', datetime('now'))`,
      [
        beneficiaryId,
        req.user!.userId,
        beneId,
        beneficiaryData.name,
        beneficiaryData.email || '',
        beneficiaryData.phone || '',
        beneficiaryData.bankAccount,
        beneficiaryData.ifsc,
        beneficiaryData.address1 || '',
        beneficiaryData.city || '',
        beneficiaryData.state || '',
        beneficiaryData.pincode || ''
      ]
    );

    const response: BeneficiaryResponse = {
      status: 'SUCCESS',
      subCode: '200',
      message: 'Beneficiary added successfully',
      data: {
        beneId,
        name: beneficiaryData.name,
        email: beneficiaryData.email || '',
        phone: beneficiaryData.phone || '',
        bankAccount: beneficiaryData.bankAccount,
        ifsc: beneficiaryData.ifsc,
        maskedCard: maskAccountNumber(beneficiaryData.bankAccount),
        status: 'ACTIVE'
      }
    };

    res.status(201).json(response);

  } catch (error) {
    console.error('Add beneficiary error:', error);
    res.status(500).json({
      status: 'ERROR',
      subCode: '500',
      message: 'Internal server error'
    });
  }
});

// Get beneficiaries
router.get('/beneficiary', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const beneficiaries = await database.all(
      'SELECT * FROM beneficiaries WHERE user_id = ? ORDER BY created_at DESC',
      [req.user!.userId]
    );

    const formattedBeneficiaries = beneficiaries.map(bene => ({
      beneId: bene.bene_id,
      name: bene.name,
      email: bene.email,
      phone: bene.phone,
      bankAccount: bene.bank_account,
      ifsc: bene.ifsc,
      maskedCard: maskAccountNumber(bene.bank_account),
      status: bene.status,
      address1: bene.address1,
      city: bene.city,
      state: bene.state,
      pincode: bene.pincode
    }));

    res.json({
      status: 'SUCCESS',
      subCode: '200',
      message: 'Beneficiaries fetched successfully',
      data: formattedBeneficiaries
    });

  } catch (error) {
    console.error('Get beneficiaries error:', error);
    res.status(500).json({
      status: 'ERROR',
      subCode: '500',
      message: 'Internal server error'
    });
  }
});

// Create transfer
router.post('/transfer', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const transferData: CreateTransferRequest = req.body;

    // Validation
    if (!transferData.transferId || !transferData.amount || !transferData.beneDetails) {
      return res.status(400).json({
        status: 'ERROR',
        subCode: '400',
        message: 'Missing required fields: transferId, amount, beneDetails'
      });
    }

    if (transferData.amount <= 0) {
      return res.status(400).json({
        status: 'ERROR',
        subCode: '400',
        message: 'Amount must be greater than 0'
      });
    }

    if (transferData.amount > 200000) {
      return res.status(400).json({
        status: 'ERROR',
        subCode: '400',
        message: 'Amount exceeds maximum limit of ₹2,00,000'
      });
    }

    // Check user balance
    const user = await database.get(
      'SELECT wallet_balance FROM users WHERE id = ?',
      [req.user!.userId]
    );

    if (!user || user.wallet_balance < transferData.amount) {
      return res.status(400).json({
        status: 'ERROR',
        subCode: '400',
        message: 'Insufficient wallet balance'
      });
    }

    // Check if transfer ID already exists
    const existingTransfer = await database.get(
      'SELECT id FROM transactions WHERE transfer_id = ?',
      [transferData.transferId]
    );

    if (existingTransfer) {
      return res.status(409).json({
        status: 'ERROR',
        subCode: '409',
        message: 'Transfer with this ID already exists'
      });
    }

    // Find or create beneficiary
    let beneficiary = await database.get(
      'SELECT * FROM beneficiaries WHERE user_id = ? AND bene_id = ?',
      [req.user!.userId, transferData.beneDetails.beneId]
    );

    if (!beneficiary) {
      // Create beneficiary if doesn't exist
      const beneficiaryId = generateId();
      await database.run(
        `INSERT INTO beneficiaries (id, user_id, bene_id, name, email, phone, bank_account, ifsc, address1, city, state, pincode, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', datetime('now'))`,
        [
          beneficiaryId,
          req.user!.userId,
          transferData.beneDetails.beneId,
          transferData.beneDetails.name,
          transferData.beneDetails.email,
          transferData.beneDetails.phone,
          transferData.beneDetails.bankAccount,
          transferData.beneDetails.ifsc,
          transferData.beneDetails.address1,
          transferData.beneDetails.city,
          transferData.beneDetails.state,
          transferData.beneDetails.pincode
        ]
      );

      beneficiary = await database.get(
        'SELECT * FROM beneficiaries WHERE id = ?',
        [beneficiaryId]
      );
    }

    // Create transaction with IST timestamp
    const transactionId = generateId();
    const transferMode = transferData.transferMode === 'upi' ? 'UPI' : 'IMPS';

    await database.run(
      `INSERT INTO transactions (id, user_id, transfer_id, amount, status, bank_account_id, transfer_mode, remarks, created_at)
       VALUES (?, ?, ?, ?, 'PENDING', ?, ?, ?, ?)`,
      [
        transactionId,
        req.user!.userId,
        transferData.transferId,
        transferData.amount,
        beneficiary.id,
        transferMode,
        transferData.remarks || '',
        getISTTimestamp()
      ]
    );

    // Deduct amount from wallet immediately
    await database.run(
      'UPDATE users SET wallet_balance = wallet_balance - ?, updated_at = ? WHERE id = ?',
      [transferData.amount, getISTTimestamp(), req.user!.userId]
    );

    // Create low balance notification if balance is below 1000
    const updatedUser = await database.get(
      'SELECT wallet_balance FROM users WHERE id = ?',
      [req.user!.userId]
    );

    if (updatedUser.wallet_balance < 1000) {
      await database.run(
        `INSERT INTO notifications (id, user_id, type, title, message, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          generateId(),
          req.user!.userId,
          'LOW_BALANCE',
          'Low Wallet Balance',
          `Your wallet balance is low (₹${updatedUser.wallet_balance.toFixed(2)}). Please add money to continue transactions.`,
          getISTTimestamp()
        ]
      );
    }

    // Simulate async processing
    processTransactionAsync(transactionId, req.user!.userId);

    const response: TransferResponse = {
      status: 'SUCCESS',
      subCode: '200',
      message: 'Transfer initiated successfully',
      data: {
        referenceId: transferData.transferId,
        acknowledged: 1
      }
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({
      status: 'ERROR',
      subCode: '500',
      message: 'Internal server error'
    });
  }
});

// Get transfer status
router.get('/transfer/:transferId', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { transferId } = req.params;

    const transaction = await database.get(
      `SELECT t.*, ba.account_holder_name, ba.bank_name, ba.account_number
       FROM transactions t
       LEFT JOIN bank_accounts ba ON t.bank_account_id = ba.id
       WHERE t.transfer_id = ? AND t.user_id = ?`,
      [transferId, req.user!.userId]
    );

    if (!transaction) {
      return res.status(404).json({
        status: 'ERROR',
        subCode: '404',
        message: 'Transfer not found'
      });
    }

    const responseData: any = {
      transferId: transaction.transfer_id,
      amount: transaction.amount,
      status: transaction.status,
      transferMode: transaction.transfer_mode,
      remarks: transaction.remarks,
      createdAt: transaction.created_at,
      processedAt: transaction.processed_at
    };

    if (transaction.utr) {
      responseData.utr = transaction.utr;
    }

    if (transaction.failure_reason) {
      responseData.failureReason = transaction.failure_reason;
    }

    res.json({
      status: 'SUCCESS',
      subCode: '200',
      message: 'Transfer status fetched successfully',
      data: responseData
    });

  } catch (error) {
    console.error('Transfer status error:', error);
    res.status(500).json({
      status: 'ERROR',
      subCode: '500',
      message: 'Internal server error'
    });
  }
});

// Process transaction asynchronously (simulates real banking delays)
async function processTransactionAsync(transactionId: string, userId: string) {
  try {
    // Simulate processing delay (2-5 seconds)
    await simulateDelay(Math.random() * 3000 + 2000);

    const finalStatus = generateRandomTransactionStatus();
    const utr = finalStatus === 'SUCCESS' ? generateUTR() : null;
    const failureReason = finalStatus === 'FAILED' ? getTransactionFailureReason() : null;

    // Update transaction status with IST timestamp
    await database.run(
      `UPDATE transactions SET status = ?, utr = ?, failure_reason = ?, processed_at = ? WHERE id = ?`,
      [finalStatus, utr, failureReason, getISTTimestamp(), transactionId]
    );

    // Get transaction details for notification
    const transaction = await database.get(
      'SELECT * FROM transactions WHERE id = ?',
      [transactionId]
    );

    if (finalStatus === 'FAILED') {
      // Refund money on failure
      await database.run(
        'UPDATE users SET wallet_balance = wallet_balance + ?, updated_at = ? WHERE id = ?',
        [transaction.amount, getISTTimestamp(), userId]
      );
    }

    // Create notification with the original transaction timestamp to maintain proper order
    // This ensures withdrawal notifications appear in chronological order relative to when
    // the withdrawal was initiated, not when the async processing completed
    const notificationType = finalStatus === 'SUCCESS' ? 'WITHDRAWAL_SUCCESS' : 'WITHDRAWAL_FAILED';
    const notificationTitle = finalStatus === 'SUCCESS' ? 'Withdrawal Successful' : 'Withdrawal Failed';
    const notificationMessage = finalStatus === 'SUCCESS'
      ? `Your withdrawal of ₹${transaction.amount} has been processed successfully. UTR: ${utr}`
      : `Your withdrawal of ₹${transaction.amount} failed. Reason: ${failureReason}. Amount refunded to wallet.`;

    await database.run(
      `INSERT INTO notifications (id, user_id, type, title, message, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        generateId(),
        userId,
        notificationType,
        notificationTitle,
        notificationMessage,
        transaction.created_at // This is already in IST from transaction creation
      ]
    );

  } catch (error) {
    console.error('Transaction processing error:', error);
  }
}

export default router; 