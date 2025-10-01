import type { Timestamp } from 'firebase/firestore';

export type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  quantity: number;
  price: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type LogType = 'CREATE' | 'UPDATE' | 'DELETE' | 'TRANSACTION';

export type LogEntry = {
  id: string;
  timestamp: Timestamp;
  type: LogType;
  details: string;
  items: { productName: string; quantityChange: number }[];
};

export type SerializableProduct = Omit<Product, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

export type SerializableLogEntry = Omit<LogEntry, 'timestamp'> & {
  timestamp: string;
};
