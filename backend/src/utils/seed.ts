import { prisma } from '../config/prisma';

export const seedDatabase = async () => {
  console.log('[Seed] Seeding CampusFetch database for Amrita Vishwa Vidyapeetham...');

  // 1. Create Amrita University
  let amrita = await prisma.university.findFirst({ where: { code: 'AMRITA_CB' } });
  if (!amrita) {
    amrita = await prisma.university.create({
      data: {
        name: 'Amrita Vishwa Vidyapeetham',
        code: 'AMRITA_CB',
        domain: 'amrita.edu',
        active: true,
      },
    });
  }

  // 2. Create Dynamic Stores
  const storeDefs = [
    {
      name: 'Main Canteen',
      category: 'CANTEEN',
      location: 'Near Academic Block 1',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500',
      operatingHours: '07:30 AM - 09:30 PM',
      deliveryFeeBase: 10.0,
      rating: 4.8,
    },
    {
      name: 'IT Canteen',
      category: 'CANTEEN',
      location: 'IT Building Ground Floor',
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500',
      operatingHours: '08:00 AM - 08:00 PM',
      deliveryFeeBase: 8.0,
      rating: 4.7,
    },
    {
      name: 'MBA Canteen',
      category: 'CANTEEN',
      location: 'Amrita School of Business',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500',
      operatingHours: '08:30 AM - 07:00 PM',
      deliveryFeeBase: 12.0,
      rating: 4.6,
    },
    {
      name: 'Night Canteen',
      category: 'CANTEEN',
      location: 'Hostel Complex Quad',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500',
      operatingHours: '08:00 PM - 02:00 AM',
      deliveryFeeBase: 15.0,
      rating: 4.9,
    },
    {
      name: 'Pool Canteen',
      category: 'CANTEEN',
      location: 'Sports Complex & Swimming Pool',
      image: 'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=500',
      operatingHours: '04:00 PM - 09:00 PM',
      deliveryFeeBase: 10.0,
      rating: 4.5,
    },
    {
      name: 'General Store',
      category: 'GENERAL',
      location: 'Central Student Amenities Center',
      image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=500',
      operatingHours: '08:00 AM - 09:00 PM',
      deliveryFeeBase: 10.0,
      rating: 4.8,
    },
    {
      name: 'Stationery',
      category: 'STATIONERY',
      location: 'Behind Library Block',
      image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=500',
      operatingHours: '09:00 AM - 06:00 PM',
      deliveryFeeBase: 7.0,
      rating: 4.6,
    },
    {
      name: 'Xerox Center',
      category: 'STATIONERY',
      location: 'Academic Block 2 Basement',
      image: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=500',
      operatingHours: '08:30 AM - 08:30 PM',
      deliveryFeeBase: 5.0,
      rating: 4.7,
    },
    {
      name: 'Pharmacy',
      category: 'PHARMACY',
      location: 'Campus Health Center',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500',
      operatingHours: '08:00 AM - 10:00 PM',
      deliveryFeeBase: 10.0,
      rating: 4.9,
    },
  ];

  for (const s of storeDefs) {
    const existing = await prisma.store.findFirst({ where: { name: s.name } });
    if (!existing) {
      await prisma.store.create({
        data: {
          ...s,
          universityId: amrita.id,
        },
      });
    }
  }

  // 3. Create Pre-seeded Users
  const users = [
    {
      username: 'admin',
      fullName: 'Campus Admin',
      email: 'admin@amrita.edu',
      phone: '9876543210',
      gender: 'Male',
      department: 'Administration',
      year: 'Faculty/Admin',
      hostel: 'Admin Block',
      roomNumber: 'A-101',
      role: 'ADMIN',
      trustScore: 100.0,
      walletBalance: 1000.0,
    },
    {
      username: 'nikshith',
      fullName: 'Nikshith Gurram',
      email: 'nikshith@cb.amrita.edu',
      phone: '9988776655',
      gender: 'Male',
      department: 'Computer Science & Eng',
      year: '3rd Year',
      hostel: 'Vashishta Hostel',
      roomNumber: '304',
      role: 'CUSTOMER',
      trustScore: 92.0,
      walletBalance: 280.0,
    },
    {
      username: 'rahul_runner',
      fullName: 'Rahul Sharma',
      email: 'rahul@cb.amrita.edu',
      phone: '9876501234',
      gender: 'Male',
      department: 'AI & Data Science',
      year: '4th Year',
      hostel: 'Agastya Hostel',
      roomNumber: '212',
      role: 'RUNNER',
      trustScore: 96.5,
      walletBalance: 450.0,
    },
  ];

  for (const u of users) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (!existing) {
      await prisma.user.create({
        data: {
          ...u,
          universityId: amrita.id,
          isVerified: true,
        },
      });
    }
  }

  console.log('[Seed] Database seeding completed successfully.');
};

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed error:', err);
      process.exit(1);
    });
}
