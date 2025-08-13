"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./utils/database");
// Import routes
const auth_1 = __importDefault(require("./routes/auth"));
const wallet_1 = __importDefault(require("./routes/wallet"));
const payouts_1 = __importDefault(require("./routes/payouts"));
const notifications_1 = __importDefault(require("./routes/notifications"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Mock Cashfree API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});
// API Documentation endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Mock Cashfree Payout API',
        version: '1.0.0',
        endpoints: {
            auth: {
                'POST /api/auth/register': 'Register new user',
                'POST /api/auth/login': 'Login user',
                'GET /api/auth/profile': 'Get user profile',
                'PUT /api/auth/profile': 'Update user profile'
            },
            wallet: {
                'GET /api/wallet/balance': 'Get wallet balance',
                'POST /api/wallet/add-money': 'Add money to wallet (testing)',
                'GET /api/wallet/bank-accounts': 'Get bank accounts',
                'POST /api/wallet/bank-accounts': 'Add bank account',
                'DELETE /api/wallet/bank-accounts/:id': 'Delete bank account',
                'GET /api/wallet/transactions': 'Get transaction history'
            },
            payouts: {
                'GET /api/v1/balance': 'Get balance (Cashfree style)',
                'POST /api/v1/beneficiary': 'Add beneficiary',
                'GET /api/v1/beneficiary': 'Get beneficiaries',
                'POST /api/v1/transfer': 'Create transfer',
                'GET /api/v1/transfer/:transferId': 'Get transfer status'
            },
            notifications: {
                'GET /api/notifications': 'Get notifications',
                'PUT /api/notifications/:id/read': 'Mark notification as read',
                'PUT /api/notifications/read-all': 'Mark all notifications as read',
                'DELETE /api/notifications/:id': 'Delete notification'
            }
        },
        authentication: {
            type: 'Bearer Token',
            header: 'Authorization: Bearer <token>',
            note: 'Most endpoints require authentication except registration, login, and health check'
        }
    });
});
// Mount routes
app.use('/api/auth', auth_1.default);
app.use('/api/wallet', wallet_1.default);
app.use('/api/v1', payouts_1.default); // Cashfree-style endpoints
app.use('/api/notifications', notifications_1.default);
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        error: 'NOT_FOUND'
    });
});
// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.stack : 'SERVER_ERROR'
    });
});
// Initialize database and start server
async function startServer() {
    try {
        console.log('🔄 Initializing database...');
        await database_1.database.init();
        console.log('✅ Database initialized successfully');
        app.listen(PORT, () => {
            console.log('🚀 Mock Cashfree API Server running on:');
            console.log(`   ➜ Local:   http://localhost:${PORT}`);
            console.log('   ➜ Documentation: http://localhost:' + PORT);
            console.log('   ➜ Health Check: http://localhost:' + PORT + '/health');
            console.log('');
            console.log('📚 Available API endpoints:');
            console.log('   ➜ Authentication: /api/auth/*');
            console.log('   ➜ Wallet Management: /api/wallet/*');
            console.log('   ➜ Payouts (Cashfree): /api/v1/*');
            console.log('   ➜ Notifications: /api/notifications/*');
            console.log('');
            console.log('💡 Default test user will be created with:');
            console.log('   ➜ Email: user@example.com');
            console.log('   ➜ Password: password123');
            console.log('   ➜ Wallet Balance: ₹10,000');
        });
        // Create default test user if doesn't exist
        createDefaultTestUser();
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}
// Create default test user for easy testing
async function createDefaultTestUser() {
    try {
        const existingUser = await database_1.database.get('SELECT id FROM users WHERE email = ?', ['user@example.com']);
        if (!existingUser) {
            const bcrypt = require('bcryptjs');
            const { generateId } = require('./utils/helpers');
            const userId = generateId();
            const hashedPassword = await bcrypt.hash('password123', 10);
            await database_1.database.run(`INSERT INTO users (id, email, name, phone, password, wallet_balance, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`, [userId, 'user@example.com', 'Test User', '9876543210', hashedPassword, 10000.0]);
            console.log('✅ Default test user created successfully');
        }
    }
    catch (error) {
        console.error('⚠️  Failed to create default test user:', error);
    }
}
// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down server...');
    try {
        await database_1.database.close();
        console.log('✅ Database connection closed');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
});
process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    try {
        await database_1.database.close();
        console.log('✅ Database connection closed');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
});
// Start the server
startServer();
//# sourceMappingURL=index.js.map