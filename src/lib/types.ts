import type { Timestamp } from 'firebase/firestore';

export type UserRole = 'manager' | 'cashier';

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type Product = {
  id:string;
  name: string;
  brand: string;
  category: string;
  stockQuantity: number;
  shopQuantity: number;
  price: number;
  imageUrl?: string;
  barcode?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type LogType = 'CREATE' | 'UPDATE' | 'DELETE' | 'TRANSACTION' | 'TRANSFER';

export type LogEntry = {
  id: string;
  timestamp: Timestamp;
  type: LogType;
  details: string;
  userId: string;
  userName: string;
  items: { productName: string; quantityChange: number; price: number }[];
};

export type SerializableProduct = Omit<Product, 'createdAt' | 'updatedAt' | 'quantity'> & {
  stockQuantity: number;
  shopQuantity: number;
  createdAt: string;
  updatedAt: string;
};

export type SerializableLogEntry = Omit<LogEntry, 'timestamp'> & {
  timestamp: string;
};

export type DashboardStats = {
  itemsSold: number;
  totalRevenue: number;
  itemsReturned: number;
  totalReturnValue: number;
  newStockCount: number;
  restockedItems: number;
  topSellingProducts: { productName: string; quantity: number }[];
};
