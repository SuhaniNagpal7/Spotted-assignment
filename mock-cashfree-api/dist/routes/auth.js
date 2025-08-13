"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = require("../utils/database");
const auth_1 = require("../middleware/auth");
const helpers_1 = require("../utils/helpers");
const router = express_1.default.Router();
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
        if (!(0, helpers_1.validateEmail)(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format',
                error: 'VALIDATION_ERROR'
            });
        }
        if (!(0, helpers_1.validatePhone)(phone)) {
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
        const existingUser = await database_1.database.get('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists',
                error: 'USER_EXISTS'
            });
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // Create user
        const userId = (0, helpers_1.generateId)();
        await database_1.database.run(`INSERT INTO users (id, email, name, phone, password, wallet_balance, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`, [userId, email, name, phone, hashedPassword, 10000.0]);
        // Generate token
        const token = (0, auth_1.generateToken)({ userId, email });
        // Get created user (without password)
        const user = await database_1.database.get('SELECT id, email, name, phone, wallet_balance, created_at, updated_at FROM users WHERE id = ?', [userId]);
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user,
                token,
                tokenType: 'Bearer'
            }
        });
    }
    catch (error) {
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
        const user = await database_1.database.get('SELECT * FROM users WHERE email = ?', [email]);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
                error: 'INVALID_CREDENTIALS'
            });
        }
        // Verify password
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
                error: 'INVALID_CREDENTIALS'
            });
        }
        // Generate token
        const token = (0, auth_1.generateToken)({ userId: user.id, email: user.email });
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
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: 'SERVER_ERROR'
        });
    }
});
// Get current user profile
router.get('/profile', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = await database_1.database.get('SELECT id, email, name, phone, wallet_balance, created_at, updated_at FROM users WHERE id = ?', [req.user.userId]);
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
        });
    }
    catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: 'SERVER_ERROR'
        });
    }
});
// Update user profile
router.put('/profile', auth_1.authenticateToken, async (req, res) => {
    try {
        const { name, phone } = req.body;
        if (!name || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Name and phone are required',
                error: 'VALIDATION_ERROR'
            });
        }
        if (!(0, helpers_1.validatePhone)(phone)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid phone number format',
                error: 'VALIDATION_ERROR'
            });
        }
        await database_1.database.run('UPDATE users SET name = ?, phone = ?, updated_at = datetime("now") WHERE id = ?', [name, phone, req.user.userId]);
        const updatedUser = await database_1.database.get('SELECT id, email, name, phone, wallet_balance, created_at, updated_at FROM users WHERE id = ?', [req.user.userId]);
        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: { user: updatedUser }
        });
    }
    catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: 'SERVER_ERROR'
        });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map