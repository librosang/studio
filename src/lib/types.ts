
import type { Timestamp } from 'firebase/firestore';
import { z } from 'zod';

export type UserRole = 'manager' | 'cashier';

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['manager', 'cashier']),
});

export type UserProfile = z.infer<typeof UserSchema>;

export const ProductSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  brand: z.string().min(2, 'Brand must be at least 2 characters.'),
  category: z.string().min(2, 'Category must be at least 2 characters.'),
  stockQuantity: z.coerce.number().int(),
  shopQuantity: z.coerce.number().int(),
  price: z.coerce.number().positive('Price must be a positive number.'),
  imageUrl: z.string().url('Must be a valid URL.').optional().or(z.literal('')),
  barcode: z.string().optional().or(z.literal('')),
  expiryDate: z.string().optional().nullable(),
});

export type ProductFormData = z.infer<typeof ProductSchema>;

export type Product = Omit<ProductFormData, 'expiryDate'> & {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  expiryDate?: Timestamp | null;
};

export const ExpenseSchema = z.object({
  date: z.string(),
  category: z.string().min(2, 'Category is required.'),
  description: z.string().optional(),
  amount: z.coerce.number().positive('Amount must be a positive number.'),
});
export type ExpenseFormData = z.infer<typeof ExpenseSchema>;

export type Expense = {
  id: string;
  date: Timestamp;
  category: string;
  description?: string;
  amount: number;
  userId: string;
};
export type SerializableExpense = Omit<Expense, 'date'> & { date: string };


export type LogType = 'CREATE' | 'UPDATE' | 'DELETE' | 'TRANSACTION' | 'TRANSFER' | 'EXPENSE';

export type LogEntry = {
  id: string;
  timestamp: Timestamp;
  type: LogType;
  details: string;
  userId: string;
  userName: string;
  items: { productName: string; quantityChange: number; price: number }[];
};

export type SerializableProduct = Omit<Product, 'createdAt' | 'updatedAt' | 'expiryDate'> & {
  createdAt: string;
  updatedAt: string;
  expiryDate?: string | null;
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
  expiringSoon: { name: string; expiryDate: string; daysLeft: number }[];
  totalExpenses: number;
  netProfit: number;
};

export type Language = 'en' | 'ar';
export type Currency = 'USD' | 'EUR' | 'JPY' | 'GBP' | 'CAD' | 'MAD';

    