export type UserRole = 'STUDENT' | 'ADMIN';

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  department: string;
  year: string;
  hostel: string;
  roomNumber: string;
  role: UserRole;
  trustScore: number;
  walletBalance: number;
  profilePic?: string;
  isVerified: boolean;
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
}

export interface Store {
  id: string;
  name: string;
  category: 'CANTEEN' | 'GENERAL' | 'STATIONERY' | 'PHARMACY';
  location: string;
  image?: string;
  operatingHours: string;
  isOpen: boolean;
  deliveryFeeBase: number;
  rating: number;
}

export interface OrderItem {
  name: string;
  quantity: number;
  approxPrice: number;
}

export type OrderStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'SHOPPING'
  | 'ON_THE_WAY'
  | 'DELIVERED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'EXPIRED';

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customer: User;
  storeId: string;
  store: Store;
  runnerId?: string;
  runner?: User;
  status: OrderStatus;
  paymentMethod: 'UPI' | 'CASH';
  priority: 'NORMAL' | 'URGENT';
  items: string; // JSON string or parsed array
  maxBudget: number;
  estimatedCost: number;
  deliveryFee: number;
  deliveryOtp: string;
  receiptUrl?: string;
  notes?: string;
  expectedDeliveryTime: string;
  createdAt: string;
  updatedAt: string;
  messages?: ChatMessage[];
}

export interface RunnerTrip {
  id: string;
  runnerId: string;
  runner?: User;
  storeId: string;
  store: Store;
  estimatedArrival: string;
  availableDuration: string;
  maxOrders: number;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  orderId: string;
  senderId: string;
  sender?: Partial<User>;
  receiverId: string;
  message: string;
  type: 'TEXT' | 'UPDATE' | 'IMAGE';
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  orderId?: string;
  type: 'EARNING' | 'SPEND' | 'CASHBACK' | 'WITHDRAWAL' | 'REFERRAL';
  amount: number;
  description: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  createdAt: string;
}

export interface PlatformAnalytics {
  totalUsers: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  activeRunners: number;
  totalRevenue: number;
  totalGMV: number;
  storeAnalytics: Array<{
    id: string;
    name: string;
    category: string;
    orderCount: number;
    isOpen: boolean;
  }>;
  averageDeliveryTimeMinutes: number;
  peakHours: string;
}
