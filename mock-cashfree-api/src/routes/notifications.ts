import express from 'express';
import { database } from '../utils/database';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { ApiResponse } from '../types';

const router = express.Router();

// Get notifications
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const notifications = await database.all(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [req.user!.userId, Number(limit), offset]
    );

    const totalNotifications = await database.get(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ?',
      [req.user!.userId]
    );

    const unreadCount = await database.get(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read = 0',
      [req.user!.userId]
    );

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
    } as ApiResponse);

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR'
    });
  }
});

// Mark notification as read
router.put('/:notificationId/read', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { notificationId } = req.params;

    // Check if notification exists and belongs to user
    const notification = await database.get(
      'SELECT id FROM notifications WHERE id = ? AND user_id = ?',
      [notificationId, req.user!.userId]
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
        error: 'NOTIFICATION_NOT_FOUND'
      });
    }

    // Mark as read
    await database.run(
      'UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?',
      [notificationId, req.user!.userId]
    );

    res.json({
      success: true,
      message: 'Notification marked as read'
    } as ApiResponse);

  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR'
    });
  }
});

// Mark all notifications as read
router.put('/read-all', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    await database.run(
      'UPDATE notifications SET read = 1 WHERE user_id = ?',
      [req.user!.userId]
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    } as ApiResponse);

  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR'
    });
  }
});

// Delete notification
router.delete('/:notificationId', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { notificationId } = req.params;

    // Check if notification exists and belongs to user
    const notification = await database.get(
      'SELECT id FROM notifications WHERE id = ? AND user_id = ?',
      [notificationId, req.user!.userId]
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
        error: 'NOTIFICATION_NOT_FOUND'
      });
    }

    // Delete notification
    await database.run(
      'DELETE FROM notifications WHERE id = ? AND user_id = ?',
      [notificationId, req.user!.userId]
    );

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR'
    });
  }
});

export default router; 