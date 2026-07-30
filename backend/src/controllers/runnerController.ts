import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth';
import { getIO } from '../services/socket';

export const declareRunnerTrip = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthenticated' });

    const { storeId, estimatedArrival, availableDuration, maxOrders = 3 } = req.body;

    if (!storeId || !estimatedArrival) {
      return res.status(400).json({ success: false, error: 'Destination store and estimated arrival time are required' });
    }

    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) return res.status(404).json({ success: false, error: 'Store not found' });

    // Cancel existing active trips for this runner
    await prisma.runnerTrip.updateMany({
      where: { runnerId: req.user.id, status: 'ACTIVE' },
      data: { status: 'CANCELLED' },
    });

    const trip = await prisma.runnerTrip.create({
      data: {
        runnerId: req.user.id,
        storeId,
        estimatedArrival: estimatedArrival || '15 mins',
        availableDuration: availableDuration || '30 mins',
        maxOrders: Number(maxOrders) || 3,
        status: 'ACTIVE',
      },
      include: {
        store: true,
        runner: true,
      },
    });

    // Broadcast trip alert to socket clients
    try {
      const io = getIO();
      io.emit('new_runner_trip', {
        tripId: trip.id,
        runnerName: trip.runner.fullName,
        storeName: store.name,
        estimatedArrival: trip.estimatedArrival,
        availableDuration: trip.availableDuration,
        maxOrders: trip.maxOrders,
      });
    } catch (e) {
      // Socket optional fallback
    }

    // Fetch matching pending orders for this store
    const matchingOrders = await prisma.order.findMany({
      where: {
        storeId,
        status: 'PENDING',
      },
      include: {
        customer: true,
        store: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return res.status(201).json({
      success: true,
      trip,
      matchingOrders,
      message: `Trip to ${store.name} broadcasted! Found ${matchingOrders.length} pending requests.`,
    });
  } catch (err: any) {
    console.error('declareRunnerTrip error:', err);
    return res.status(500).json({ success: false, error: 'Failed to broadcast trip' });
  }
};

export const getMatchingOrdersForRunner = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthenticated' });

    // Find runner's current active trip
    const activeTrip = await prisma.runnerTrip.findFirst({
      where: { runnerId: req.user.id, status: 'ACTIVE' },
      include: { store: true },
    });

    let storeIdFilter = req.query.storeId ? String(req.query.storeId) : undefined;
    if (!storeIdFilter && activeTrip) {
      storeIdFilter = activeTrip.storeId;
    }

    const where: any = { status: 'PENDING' };
    if (storeIdFilter) {
      where.storeId = storeIdFilter;
    }

    const pendingOrders = await prisma.order.findMany({
      where,
      include: {
        customer: true,
        store: true,
      },
      orderBy: [
        { priority: 'desc' }, // URGENT first
        { createdAt: 'asc' },
      ],
    });

    return res.status(200).json({
      success: true,
      activeTrip,
      pendingOrders,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to fetch matching orders' });
  }
};

export const endRunnerTrip = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthenticated' });

    const { tripId } = req.params;

    await prisma.runnerTrip.update({
      where: { id: tripId },
      data: { status: 'COMPLETED' },
    });

    return res.status(200).json({ success: true, message: 'Trip completed' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to end trip' });
  }
};
