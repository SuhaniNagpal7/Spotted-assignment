import express from 'express';
import bcrypt from 'bcryptjs';
import { database } from '../utils/database';
import { generateToken, authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { generateId, validateEmail, validatePhone } from '../utils/helpers';
import { User, ApiResponse } from '../types';

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    // Validation
    if (!email || !password || !name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
        error: 'VALIDATION_ERROR'
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
        error: 'VALIDATION_ERROR'
      });
    }

    if (!validatePhone(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format',
        error: 'VALIDATION_ERROR'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
        error: 'VALIDATION_ERROR'
      });
    }

    // Check if user already exists
    const existingUser = await database.get(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
        error: 'USER_EXISTS'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userId = generateId();
    await database.run(
      `INSERT INTO users (id, email, name, phone, password, wallet_balance, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [userId, email, name, phone, hashedPassword, 10000.0]
    );

    // Generate token
    const token = generateToken({ userId, email });

    // Get created user (without password)
    const user = await database.get(
      'SELECT id, email, name, phone, wallet_balance, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token,
        tokenType: 'Bearer'
      }
    } as ApiResponse);

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR'
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
        error: 'VALIDATION_ERROR'
      });
    }

    // Find user
    const user = await database.get(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        error: 'INVALID_CREDENTIALS'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        error: 'INVALID_CREDENTIALS'
      });
    }

    // Generate token
    const token = generateToken({ userId: user.id, email: user.email });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token,
        tokenType: 'Bearer'
      }
    } as ApiResponse);

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR'
    });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await database.get(
      'SELECT id, email, name, phone, wallet_balance, created_at, updated_at FROM users WHERE id = ?',
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
      message: 'Profile retrieved successfully',
      data: { user }
    } as ApiResponse);

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name and phone are required',
        error: 'VALIDATION_ERROR'
      });
    }

    if (!validatePhone(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format',
        error: 'VALIDATION_ERROR'
      });
    }

    await database.run(
      'UPDATE users SET name = ?, phone = ?, updated_at = datetime("now") WHERE id = ?',
      [name, phone, req.user!.userId]
    );

    const updatedUser = await database.get(
      'SELECT id, email, name, phone, wallet_balance, created_at, updated_at FROM users WHERE id = ?',
      [req.user!.userId]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser }
    } as ApiResponse);

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR'
    });
  }
});

export default router; 