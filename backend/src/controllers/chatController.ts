import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

export const getOrderMessages = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthenticated' });

    const { orderId } = req.params;

    const messages = await prisma.chatMessage.findMany({
      where: { orderId },
      include: {
        sender: {
          select: { id: true, fullName: true, role: true, username: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return res.status(200).json({ success: true, messages });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to fetch chat messages' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthenticated' });

    const { orderId, message, type = 'TEXT' } = req.body;

    if (!orderId || !message) {
      return res.status(400).json({ success: false, error: 'orderId and message content are required' });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    const receiverId = order.customerId === req.user.id ? order.runnerId : order.customerId;

    if (!receiverId) {
      return res.status(400).json({ success: false, error: 'No active runner assigned yet for this chat' });
    }

    const newMessage = await prisma.chatMessage.create({
      data: {
        orderId,
        senderId: req.user.id,
        receiverId,
        message: message.trim(),
        type: type.toUpperCase(),
      },
      include: {
        sender: {
          select: { id: true, fullName: true, role: true, username: true },
        },
      },
    });

    return res.status(201).json({ success: true, message: newMessage });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to send message' });
  }
};
