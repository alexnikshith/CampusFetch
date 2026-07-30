import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

export const getWalletSummary = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthenticated' });

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        walletBalance: true,
        trustScore: true,
      },
    });

    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const totalEarningsResult = await prisma.transaction.aggregate({
      where: { userId: req.user.id, type: 'EARNING' },
      _sum: { amount: true },
    });

    return res.status(200).json({
      success: true,
      walletBalance: user?.walletBalance || 0.0,
      trustScore: user?.trustScore || 85.0,
      totalEarnings: totalEarningsResult._sum.amount || 0.0,
      transactions,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to fetch wallet information' });
  }
};

export const requestWithdrawal = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthenticated' });

    const { amount, upiId } = req.body;
    const withdrawAmt = parseFloat(amount);

    if (!withdrawAmt || withdrawAmt <= 0) {
      return res.status(400).json({ success: false, error: 'Valid positive amount is required' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user || user.walletBalance < withdrawAmt) {
      return res.status(400).json({ success: false, error: 'Insufficient wallet balance for withdrawal' });
    }

    // Deduct balance & create transaction record
    await prisma.user.update({
      where: { id: req.user.id },
      data: { walletBalance: { decrement: withdrawAmt } },
    });

    const tx = await prisma.transaction.create({
      data: {
        userId: req.user.id,
        type: 'WITHDRAWAL',
        amount: withdrawAmt,
        description: `UPI Payout Withdrawal to ${upiId || user.phone + '@upi'}`,
        status: 'COMPLETED',
      },
    });

    return res.status(200).json({
      success: true,
      message: `Withdrawal request of ₹${withdrawAmt} processed to ${upiId || 'registered UPI'}!`,
      transaction: tx,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Withdrawal failed' });
  }
};
