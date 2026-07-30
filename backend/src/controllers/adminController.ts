import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth';
import { exportToCsv } from '../utils/reportExporter';

export const getAdminUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { search, role, status } = req.query;

    const where: any = {};
    if (search) {
      where.OR = [
        { fullName: { contains: String(search) } },
        { email: { contains: String(search) } },
        { username: { contains: String(search) } },
        { hostel: { contains: String(search) } },
      ];
    }
    if (role) where.role = String(role).toUpperCase();
    if (status) where.status = String(status).toUpperCase();

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ success: true, users });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
};

export const updateUserStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { status, trustScore, role } = req.body;

    const data: any = {};
    if (status) data.status = String(status).toUpperCase();
    if (trustScore !== undefined) data.trustScore = parseFloat(trustScore);
    if (role) data.role = String(role).toUpperCase();

    const user = await prisma.user.update({
      where: { id: userId },
      data,
    });

    return res.status(200).json({ success: true, user, message: 'User profile updated by admin' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to update user' });
  }
};

export const getPlatformAnalytics = async (req: Request, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalOrders = await prisma.order.count();
    const completedOrders = await prisma.order.count({ where: { status: 'DELIVERED' } });
    const pendingOrders = await prisma.order.count({ where: { status: 'PENDING' } });
    const activeRunners = await prisma.user.count({ where: { role: 'RUNNER', status: 'ACTIVE' } });

    // Store statistics
    const stores = await prisma.store.findMany({
      include: {
        _count: { select: { orders: true } },
      },
    });

    const storeAnalytics = stores.map(s => ({
      id: s.id,
      name: s.name,
      category: s.category,
      orderCount: s._count.orders,
      isOpen: s.isOpen,
    }));

    // Revenue statistics
    const deliveryFeesSum = await prisma.order.aggregate({
      where: { status: 'DELIVERED' },
      _sum: { deliveryFee: true, estimatedCost: true },
    });

    const totalRevenue = deliveryFeesSum._sum.deliveryFee || 0.0;
    const totalGMV = deliveryFeesSum._sum.estimatedCost || 0.0;

    return res.status(200).json({
      success: true,
      analytics: {
        totalUsers,
        totalOrders,
        completedOrders,
        pendingOrders,
        activeRunners,
        totalRevenue,
        totalGMV,
        storeAnalytics,
        averageDeliveryTimeMinutes: 22,
        peakHours: '04:00 PM - 09:00 PM',
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to generate analytics' });
  }
};

export const exportReport = async (req: Request, res: Response) => {
  try {
    const { type = 'orders', format = 'csv' } = req.query;

    if (type === 'orders') {
      const orders = await prisma.order.findMany({
        include: { store: true, customer: true, runner: true },
        orderBy: { createdAt: 'desc' },
      });

      const exportData = orders.map(o => ({
        OrderNumber: o.orderNumber,
        Customer: o.customer.fullName,
        Hostel: `${o.customer.hostel} - ${o.customer.roomNumber}`,
        Store: o.store.name,
        EstimatedCost: o.estimatedCost,
        DeliveryFee: o.deliveryFee,
        PaymentMethod: o.paymentMethod,
        Priority: o.priority,
        Status: o.status,
        Date: o.createdAt.toISOString(),
      }));

      const headers = ['OrderNumber', 'Customer', 'Hostel', 'Store', 'EstimatedCost', 'DeliveryFee', 'PaymentMethod', 'Priority', 'Status', 'Date'];
      const csv = exportToCsv(exportData, headers);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="CampusFetch_Orders_Report.csv"');
      return res.status(200).send(csv);
    } else {
      const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
      const exportData = users.map(u => ({
        Username: u.username,
        FullName: u.fullName,
        Email: u.email,
        Phone: u.phone,
        Department: u.department,
        Year: u.year,
        Hostel: u.hostel,
        Room: u.roomNumber,
        Role: u.role,
        TrustScore: u.trustScore,
        WalletBalance: u.walletBalance,
        Status: u.status,
      }));

      const headers = ['Username', 'FullName', 'Email', 'Phone', 'Department', 'Year', 'Hostel', 'Room', 'Role', 'TrustScore', 'WalletBalance', 'Status'];
      const csv = exportToCsv(exportData, headers);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="CampusFetch_Users_Report.csv"');
      return res.status(200).send(csv);
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to export report' });
  }
};

export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const topRunners = await prisma.user.findMany({
      where: { status: 'ACTIVE' },
      orderBy: [
        { trustScore: 'desc' },
        { walletBalance: 'desc' },
      ],
      take: 10,
      select: {
        id: true,
        fullName: true,
        username: true,
        department: true,
        hostel: true,
        trustScore: true,
        role: true,
        profilePic: true,
      },
    });

    return res.status(200).json({
      success: true,
      topRunners,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to fetch leaderboard' });
  }
};
