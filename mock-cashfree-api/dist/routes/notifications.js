"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = require("../utils/database");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get notifications
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const notifications = await database_1.database.all('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?', [req.user.userId, Number(limit), offset]);
        const totalNotifications = await database_1.database.get('SELECT COUNT(*) as count FROM notifications WHERE user_id = ?', [req.user.userId]);
        const unreadCount = await database_1.database.get('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read = 0', [req.user.userId]);
        res.json({
            success: true,
            message: 'Notifications retrieved successfully',
            data: {
                notifications,
                unreadCount: unreadCount.count,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total: totalNotifications.count,
                    totalPages: Math.ceil(totalNotifications.count / Number(limit))
                }
            }
        });
    }
    catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: 'SERVER_ERROR'
        });
    }
});
// Mark notification as read
router.put('/:notificationId/read', auth_1.authenticateToken, async (req, res) => {
    try {
        const { notificationId } = req.params;
        // Check if notification exists and belongs to user
        const notification = await database_1.database.get('SELECT id FROM notifications WHERE id = ? AND user_id = ?', [notificationId, req.user.userId]);
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found',
                error: 'NOTIFICATION_NOT_FOUND'
            });
        }
        // Mark as read
        await database_1.database.run('UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?', [notificationId, req.user.userId]);
        res.json({
            success: true,
            message: 'Notification marked as read'
        });
    }
    catch (error) {
        console.error('Mark notification read error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: 'SERVER_ERROR'
        });
    }
});
// Mark all notifications as read
router.put('/read-all', auth_1.authenticateToken, async (req, res) => {
    try {
        await database_1.database.run('UPDATE notifications SET read = 1 WHERE user_id = ?', [req.user.userId]);
        res.json({
            success: true,
            message: 'All notifications marked as read'
        });
    }
    catch (error) {
        console.error('Mark all notifications read error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: 'SERVER_ERROR'
        });
    }
});
// Delete notification
router.delete('/:notificationId', auth_1.authenticateToken, async (req, res) => {
    try {
        const { notificationId } = req.params;
        // Check if notification exists and belongs to user
        const notification = await database_1.database.get('SELECT id FROM notifications WHERE id = ? AND user_id = ?', [notificationId, req.user.userId]);
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found',
                error: 'NOTIFICATION_NOT_FOUND'
            });
        }
        // Delete notification
        await database_1.database.run('DELETE FROM notifications WHERE id = ? AND user_id = ?', [notificationId, req.user.userId]);
        res.json({
            success: true,
            message: 'Notification deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: 'SERVER_ERROR'
        });
    }
});
exports.default = router;
//# sourceMappingURL=notifications.js.map