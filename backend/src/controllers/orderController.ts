import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth';
import { calculateDeliveryFee } from '../utils/feeCalculator';
import { updateTrustScore } from '../utils/trustScore';
import { notifyOrderUpdate } from '../services/socket';

const generateDeliveryOtp = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthenticated' });

    const {
      storeId,
      items, // JSON array or array of objects
      notes,
      maxBudget,
      paymentMethod = 'UPI',
      priority = 'NORMAL',
      expectedDeliveryTime = 'Within 30 mins',
    } = req.body;

    if (!storeId || !items || !maxBudget) {
      return res.status(400).json({ success: false, error: 'Store, items list, and maximum budget are required' });
    }

    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) {
      return res.status(404).json({ success: false, error: 'Selected campus store does not exist' });
    }

    const itemsJson = typeof items === 'string' ? items : JSON.stringify(items);
    const parsedItems = typeof items === 'string' ? JSON.parse(items) : items;

    let totalApprox = 0;
    if (Array.isArray(parsedItems)) {
      totalApprox = parsedItems.reduce((acc, item) => acc + (parseFloat(item.approxPrice || 0) * (item.quantity || 1)), 0);
    }
    if (totalApprox === 0) totalApprox = parseFloat(maxBudget) * 0.8;

    const deliveryFee = await calculateDeliveryFee(totalApprox);
    const deliveryOtp = generateDeliveryOtp();

    // Generate global incrementing order number: avv001, avv002, avv003...
    const lastOrder = await prisma.order.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { orderNumber: true },
    });

    let nextSeq = 1;
    if (lastOrder && lastOrder.orderNumber) {
      const match = lastOrder.orderNumber.match(/avv(\d+)/i);
      if (match) {
        nextSeq = parseInt(match[1], 10) + 1;
      } else {
        const count = await prisma.order.count();
        nextSeq = count + 1;
      }
    }
    const orderNumber = `avv${String(nextSeq).padStart(3, '0')}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: req.user.id,
        storeId,
        items: itemsJson,
        maxBudget: parseFloat(maxBudget),
        estimatedCost: Math.round(totalApprox * 100) / 100,
        deliveryFee,
        deliveryOtp,
        paymentMethod: paymentMethod.toUpperCase(),
        priority: priority.toUpperCase(),
        notes,
        expectedDeliveryTime,
        status: 'PENDING',
      },
      include: {
        store: true,
        customer: true,
      },
    });

    // Create Notification
    await prisma.notification.create({
      data: {
        userId: req.user.id,
        title: 'Order Placed Successfully',
        body: `Your order #${order.orderNumber} for ${store.name} has been placed. Waiting for a student runner.`,
        type: 'ORDER',
      },
    });

    notifyOrderUpdate(order.id, order);

    return res.status(201).json({
      success: true,
      order,
      message: 'Order Placed Successfully! Moved to My Orders.',
    });
  } catch (err: any) {
    console.error('createOrder error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to place order' });
  }
};

export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthenticated' });

    const { status, role } = req.query;

    const where: any = {};

    if (role === 'RUNNER') {
      where.runnerId = req.user.id;
    } else if (role === 'CUSTOMER') {
      where.customerId = req.user.id;
    } else if (req.user.role !== 'ADMIN') {
      // Default: show orders where user is either customer or runner
      where.OR = [{ customerId: req.user.id }, { runnerId: req.user.id }];
    }

    if (status) {
      where.status = String(status).toUpperCase();
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        store: true,
        customer: true,
        runner: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ success: true, orders });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        store: true,
        customer: true,
        runner: true,
        messages: {
          orderBy: { createdAt: 'asc' },
          include: { sender: true },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    return res.status(200).json({ success: true, order });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to fetch order details' });
  }
};

export const acceptOrder = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthenticated' });

    const { id } = req.params;
    const order = await prisma.order.findUnique({ where: { id }, include: { customer: true, store: true } });

    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
    if (order.status !== 'PENDING') {
      return res.status(400).json({ success: false, error: `Order cannot be accepted (current status: ${order.status})` });
    }
    if (order.customerId === req.user.id) {
      return res.status(400).json({ success: false, error: 'You cannot accept your own order' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        runnerId: req.user.id,
        status: 'ACCEPTED',
      },
      include: {
        customer: true,
        runner: true,
        store: true,
      },
    });

    // Notify Customer
    await prisma.notification.create({
      data: {
        userId: order.customerId,
        title: 'Order Accepted!',
        body: `${updatedOrder.runner?.fullName || 'A runner'} has accepted your order from ${order.store.name}. In-app chat is now active!`,
        type: 'ORDER_ACCEPTED',
      },
    });

    notifyOrderUpdate(order.id, updatedOrder);

    return res.status(200).json({
      success: true,
      order: updatedOrder,
      message: 'Order accepted successfully. In-app chat is now active.',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to accept order' });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthenticated' });

    const { id } = req.params;
    const { status, receiptUrl } = req.body;

    const order = await prisma.order.findUnique({ where: { id }, include: { store: true, customer: true, runner: true } });
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    const newStatus = String(status).toUpperCase();

    const dataToUpdate: any = { status: newStatus };
    if (receiptUrl) dataToUpdate.receiptUrl = receiptUrl;

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: dataToUpdate,
      include: { customer: true, runner: true, store: true },
    });

    // Send notifications based on step
    if (newStatus === 'SHOPPING') {
      await prisma.notification.create({
        data: {
          userId: order.customerId,
          title: 'Shopping In Progress',
          body: `Runner is currently picking up your items at ${order.store.name}.`,
          type: 'ORDER_UPDATE',
        },
      });
    } else if (newStatus === 'ON_THE_WAY') {
      await prisma.notification.create({
        data: {
          userId: order.customerId,
          title: 'Runner On The Way! 🛵',
          body: `Your order is on the way to ${order.customer.hostel} Room ${order.customer.roomNumber}!`,
          type: 'ORDER_UPDATE',
        },
      });
    }

    notifyOrderUpdate(order.id, updatedOrder);

    return res.status(200).json({ success: true, order: updatedOrder });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to update status' });
  }
};

export const verifyDeliveryOtp = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthenticated' });

    const { id } = req.params;
    const { otp } = req.body;

    if (!otp) return res.status(400).json({ success: false, error: 'Delivery OTP is required' });

    const order = await prisma.order.findUnique({
      where: { id },
      include: { customer: true, runner: true, store: true },
    });

    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    if (order.deliveryOtp !== otp.trim()) {
      return res.status(400).json({ success: false, error: 'Incorrect 4-digit Delivery OTP provided by customer' });
    }

    // Mark as DELIVERED
    const completedOrder = await prisma.order.update({
      where: { id },
      data: { status: 'DELIVERED' },
      include: { customer: true, runner: true, store: true },
    });

    // Credit Runner Wallet
    if (order.runnerId) {
      await prisma.user.update({
        where: { id: order.runnerId },
        data: {
          walletBalance: { increment: order.deliveryFee },
        },
      });

      await prisma.transaction.create({
        data: {
          userId: order.runnerId,
          orderId: order.id,
          type: 'EARNING',
          amount: order.deliveryFee,
          description: `Delivery fee earned for Order #${order.orderNumber} (${order.store.name})`,
          status: 'COMPLETED',
        },
      });

      // Update Trust Scores
      await updateTrustScore(order.runnerId, 2.0, 'Completed delivery on time');
      await updateTrustScore(order.customerId, 1.0, 'Successful order completion');
    }

    // Notify Customer
    await prisma.notification.create({
      data: {
        userId: order.customerId,
        title: 'Order Delivered! 🎉',
        body: `Order #${order.orderNumber} has been delivered. Please rate your runner!`,
        type: 'ORDER_DELIVERED',
      },
    });

    notifyOrderUpdate(order.id, completedOrder);

    return res.status(200).json({
      success: true,
      order: completedOrder,
      message: `Delivery verified! ₹${order.deliveryFee} credited to Runner wallet.`,
    });
  } catch (err: any) {
    console.error('verifyDeliveryOtp error:', err);
    return res.status(500).json({ success: false, error: 'OTP Verification failed' });
  }
};

export const cancelOrder = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthenticated' });

    const { id } = req.params;
    const order = await prisma.order.findUnique({ where: { id } });

    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    if (order.customerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Unauthorized to cancel this order' });
    }

    if (['DELIVERED', 'CANCELLED'].includes(order.status)) {
      return res.status(400).json({ success: false, error: `Cannot cancel order in ${order.status} state` });
    }

    const cancelled = await prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    // If accepted by runner and then cancelled, subtract trust score slightly
    if (order.runnerId) {
      await updateTrustScore(req.user.id, -5.0, 'Cancelled order after runner assignment');
    }

    notifyOrderUpdate(order.id, cancelled);

    return res.status(200).json({ success: true, message: 'Order cancelled successfully', order: cancelled });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to cancel order' });
  }
};
