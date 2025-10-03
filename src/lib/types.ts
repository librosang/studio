import type { Timestamp } from 'firebase/firestore';

export type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  quantity: number;
  price: number;
  imageUrl?: string;
  barcode?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type LogType = 'CREATE' | 'UPDATE' | 'DELETE' | 'TRANSACTION';

export type LogEntry = {
  id: string;
  timestamp: Timestamp;
  type: LogType;
  details: string;
  items: { productName: string; quantityChange: number; price: number }[];
};

export type SerializableProduct = Omit<Product, 'createdAt' | 'updatedAt'> & {
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
