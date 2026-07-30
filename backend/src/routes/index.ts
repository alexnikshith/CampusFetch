import { Router } from 'express';
import * as authController from '../controllers/authController';
import * as storeController from '../controllers/storeController';
import * as orderController from '../controllers/orderController';
import * as runnerController from '../controllers/runnerController';
import * as walletController from '../controllers/walletController';
import * as chatController from '../controllers/chatController';
import * as adminController from '../controllers/adminController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Authentication Routes
router.post('/auth/request-otp', authController.requestOtp);
router.post('/auth/verify-otp', authController.verifyOtpAndRegister);
router.post('/auth/login', authController.loginWithOtp);
router.get('/auth/me', authenticateToken, authController.getMe);
router.put('/auth/profile', authenticateToken, authController.updateProfile);

// Store Routes
router.get('/stores', storeController.getStores);
router.get('/stores/:id', storeController.getStoreById);
router.post('/stores', authenticateToken, requireRole(['ADMIN']), storeController.createStore);
router.put('/stores/:id', authenticateToken, requireRole(['ADMIN']), storeController.updateStore);
router.delete('/stores/:id', authenticateToken, requireRole(['ADMIN']), storeController.deleteStore);

// Order Routes
router.post('/orders', authenticateToken, orderController.createOrder);
router.get('/orders', authenticateToken, orderController.getOrders);
router.get('/orders/:id', authenticateToken, orderController.getOrderById);
router.post('/orders/:id/accept', authenticateToken, orderController.acceptOrder);
router.patch('/orders/:id/status', authenticateToken, orderController.updateOrderStatus);
router.post('/orders/:id/verify-otp', authenticateToken, orderController.verifyDeliveryOtp);
router.post('/orders/:id/cancel', authenticateToken, orderController.cancelOrder);

// Runner Flow Routes ("I'm Going To...")
router.post('/runner/trip', authenticateToken, runnerController.declareRunnerTrip);
router.get('/runner/available-orders', authenticateToken, runnerController.getMatchingOrdersForRunner);
router.post('/runner/trip/:tripId/end', authenticateToken, runnerController.endRunnerTrip);

// Wallet & Earnings Routes
router.get('/wallet', authenticateToken, walletController.getWalletSummary);
router.post('/wallet/withdraw', authenticateToken, walletController.requestWithdrawal);

// In-App Chat Routes
router.get('/chat/:orderId', authenticateToken, chatController.getOrderMessages);
router.post('/chat', authenticateToken, chatController.sendMessage);

// Admin & Platform Analytics Routes
router.get('/admin/users', authenticateToken, requireRole(['ADMIN']), adminController.getAdminUsers);
router.patch('/admin/users/:userId', authenticateToken, requireRole(['ADMIN']), adminController.updateUserStatus);
router.get('/admin/analytics', authenticateToken, adminController.getPlatformAnalytics);
router.get('/admin/export', authenticateToken, requireRole(['ADMIN']), adminController.exportReport);
router.get('/leaderboard', adminController.getLeaderboard);

export default router;
