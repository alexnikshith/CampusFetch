import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export const getStores = async (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;

    const where: any = {};
    if (category) {
      where.category = String(category).toUpperCase();
    }
    if (search) {
      where.name = { contains: String(search) };
    }

    const stores = await prisma.store.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return res.status(200).json({ success: true, stores });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to fetch stores' });
  }
};

export const getStoreById = async (req: Request, res: Response) => {
  try {
    const store = await prisma.store.findUnique({
      where: { id: req.params.id },
    });
    if (!store) {
      return res.status(404).json({ success: false, error: 'Store not found' });
    }
    return res.status(200).json({ success: true, store });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to fetch store details' });
  }
};

export const createStore = async (req: Request, res: Response) => {
  try {
    const { name, category, location, image, operatingHours, deliveryFeeBase } = req.body;

    if (!name || !category || !location) {
      return res.status(400).json({ success: false, error: 'Name, category, and location are required' });
    }

    const university = await prisma.university.findFirst();

    const store = await prisma.store.create({
      data: {
        name,
        category: category.toUpperCase(),
        location,
        image: image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500',
        operatingHours: operatingHours || '08:00 AM - 10:00 PM',
        deliveryFeeBase: deliveryFeeBase ? parseFloat(deliveryFeeBase) : 10.0,
        universityId: university?.id,
      },
    });

    return res.status(201).json({ success: true, store, message: 'Store created successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to create store' });
  }
};

export const updateStore = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, category, location, image, operatingHours, isOpen, deliveryFeeBase } = req.body;

    const store = await prisma.store.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        category: category !== undefined ? category.toUpperCase() : undefined,
        location: location !== undefined ? location : undefined,
        image: image !== undefined ? image : undefined,
        operatingHours: operatingHours !== undefined ? operatingHours : undefined,
        isOpen: isOpen !== undefined ? Boolean(isOpen) : undefined,
        deliveryFeeBase: deliveryFeeBase !== undefined ? parseFloat(deliveryFeeBase) : undefined,
      },
    });

    return res.status(200).json({ success: true, store, message: 'Store updated successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to update store' });
  }
};

export const deleteStore = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.store.delete({ where: { id } });
    return res.status(200).json({ success: true, message: 'Store removed successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to delete store' });
  }
};
