
'use server';

import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
  query,
  orderBy,
  writeBatch,
  getDoc,
  where,
  limit,
  getCountFromServer,
} from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from './firebase';
import type { Product, LogEntry, SerializableProduct, SerializableLogEntry, DashboardStats, UserProfile } from './types';
import { suggestCategory as suggestCategoryFlow } from '@/ai/flows/suggest-category';
import { sampleProducts } from './sample-data';
import { startOfDay, endOfDay } from 'date-fns';

const ProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  brand: z.string().min(1, 'Brand is required'),
  category: z.string().min(1, 'Category is required'),
  stockQuantity: z.coerce.number().int('Stock Quantity must be an integer'),
  shopQuantity: z.coerce.number().int('Shop Quantity must be an integer'),
  price: z.coerce.number().positive('Price must be a positive number'),
  imageUrl: z.string().url('Image URL must be a valid URL.').optional().or(z.literal('')),
  barcode: z.string().optional().or(z.literal('')),
});

const UserSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    role: z.enum(['manager', 'cashier']),
});

// --- Log Helper ---
async function addLog(
  type: LogEntry['type'],
  details: string,
  items: { productName: string; quantityChange: number; price: number }[],
  user: UserProfile,
) {
  try {
    await addDoc(collection(db, 'logs'), {
      type,
      details,
      items,
      timestamp: Timestamp.now(),
      userId: user.id,
      userName: user.name,
    });
  } catch (error) {
    console.error('Failed to add log:', error);
  }
}

// --- Product Actions ---

export async function getProducts(): Promise<SerializableProduct[]> {
  const productsCol = collection(db, 'products');
  const q = query(productsCol, orderBy('updatedAt', 'desc'));
  const productSnapshot = await getDocs(q);
  const productList = productSnapshot.docs.map(doc => {
    const data = doc.data() as Product;
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt.toDate().toISOString(),
      updatedAt: data.updatedAt.toDate().toISOString(),
    }
  }) as SerializableProduct[];
  return productList;
}

export async function addProduct(formData: unknown, user: UserProfile) {
  if (user.role !== 'manager') return { error: 'Permission denied.' };
  const result = ProductSchema.safeParse(formData);
  if (!result.success) {
    return { error: result.error.flatten().fieldErrors };
  }
  const { name, brand, category, stockQuantity, price, imageUrl, barcode } = result.data;

  try {
    const docRef = await addDoc(collection(db, 'products'), {
      name,
      brand,
      category,
      stockQuantity,
      shopQuantity: 0, // New products start with 0 in shop
      price,
      imageUrl,
      barcode,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    await addLog(
      'CREATE',
      `Added new product to stock: ${name}.`,
      [{ productName: name, quantityChange: stockQuantity, price }],
      user
    );

    revalidatePath('/stock');
    revalidatePath('/dashboard');
    return { data: { id: docRef.id, ...result.data } };
  } catch (error) {
    return { error: 'Failed to add product.' };
  }
}

export async function updateProduct(id: string, formData: unknown, user: UserProfile) {
    if (user.role !== 'manager') return { error: 'Permission denied.' };
  const result = ProductSchema.safeParse(formData);
  if (!result.success) {
    return { error: result.error.flatten().fieldErrors };
  }
  
  const productRef = doc(db, 'products', id);
  const productSnap = await getDoc(productRef);
  if (!productSnap.exists()) {
    return { error: 'Product not found.' };
  }
  const oldData = productSnap.data() as Product;
  const { name, brand, category, stockQuantity, shopQuantity, price, imageUrl, barcode } = result.data;
  const quantityChange = (stockQuantity - oldData.stockQuantity) + (shopQuantity - oldData.shopQuantity);

  try {
    await updateDoc(productRef, {
      name,
      brand,
      category,
      stockQuantity,
      shopQuantity,
      price,
      imageUrl,
      barcode,
      updatedAt: Timestamp.now(),
    });
    
    await addLog(
      'UPDATE',
      `Updated product: ${name}.`,
      [{ productName: name, quantityChange: quantityChange, price }],
      user
    );

    revalidatePath('/stock');
    revalidatePath('/shop');
    revalidatePath('/pos');
    revalidatePath('/dashboard');
    return { data: { id, ...result.data } };
  } catch (error) {
    return { error: 'Failed to update product.' };
  }
}

export async function deleteProduct(id: string, user: UserProfile) {
    if (user.role !== 'manager') return { error: 'Permission denied.' };
  const productRef = doc(db, 'products', id);
  const productSnap = await getDoc(productRef);
  if (!productSnap.exists()) {
    return { error: 'Product not found.' };
  }
  const { name, stockQuantity, shopQuantity, price } = productSnap.data() as Product;
  const totalQuantity = stockQuantity + shopQuantity;

  try {
    await deleteDoc(productRef);
    await addLog(
      'DELETE',
      `Deleted product: ${name}.`,
      [{ productName: name, quantityChange: -totalQuantity, price }],
      user
    );
    
    revalidatePath('/stock');
    revalidatePath('/shop');
    revalidatePath('/pos');
    revalidatePath('/dashboard');
    return { data: 'Product deleted successfully.' };
  } catch (error) {
    return { error: 'Failed to delete product.' };
  }
}

export async function transferStockToShop(id: string, quantityToTransfer: number, user: UserProfile) {
  if (user.role !== 'manager') return { error: 'Permission denied.' };
  if (quantityToTransfer <= 0) return { error: 'Transfer quantity must be positive.' };

  const productRef = doc(db, 'products', id);
  const productSnap = await getDoc(productRef);

  if (!productSnap.exists()) {
    return { error: 'Product not found.' };
  }

  const product = productSnap.data() as Product;

  if (product.stockQuantity < quantityToTransfer) {
    return { error: 'Not enough stock to transfer.' };
  }

  const newStockQuantity = product.stockQuantity - quantityToTransfer;
  const newShopQuantity = product.shopQuantity + quantityToTransfer;

  try {
    await updateDoc(productRef, {
      stockQuantity: newStockQuantity,
      shopQuantity: newShopQuantity,
      updatedAt: Timestamp.now(),
    });

    await addLog(
      'TRANSFER',
      `Transferred ${quantityToTransfer} unit(s) of ${product.name} to shop.`,
      [{ productName: product.name, quantityChange: quantityToTransfer, price: product.price }],
      user
    );

    revalidatePath('/stock');
    revalidatePath('/shop');
    revalidatePath('/pos');
    revalidatePath('/log');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to transfer stock.' };
  }
}

// --- Shop Actions ---

export async function getUniqueCategoriesAndBrands() {
  const products = await getProducts();
  const categories = [...new Set(products.map(p => p.category))];
  const brands = [...new Set(products.map(p => p.brand))];
  return { categories, brands };
}

export async function processTransaction(cart: { [id: string]: number }, user: UserProfile) {
  const batch = writeBatch(db);
  const productIds = Object.keys(cart);
  const logItems: { productName: string; quantityChange: number; price: number }[] = [];
  let salesCount = 0;
  let returnsCount = 0;

  try {
    for (const productId of productIds) {
      const quantityChangeInCart = cart[productId];
      if (quantityChangeInCart === 0) continue;

      const productRef = doc(db, 'products', productId);
      const productSnap = await getDoc(productRef);

      if (productSnap.exists()) {
        const product = productSnap.data() as Product;
        const newShopQuantity = product.shopQuantity - quantityChangeInCart;

        if (quantityChangeInCart > 0 && newShopQuantity < 0) {
          throw new Error(`Not enough stock for ${product.name} in the shop.`);
        }
        
        batch.update(productRef, { shopQuantity: newShopQuantity, updatedAt: Timestamp.now() });
        
        logItems.push({ productName: product.name, quantityChange: -quantityChangeInCart, price: product.price });
        
        if (quantityChangeInCart > 0) {
          salesCount += quantityChangeInCart;
        } else {
          returnsCount += Math.abs(quantityChangeInCart);
        }
      }
    }

    const logDetails = `${salesCount} sale(s) - ${returnsCount} return(s)`;
    if(logItems.length > 0) {
      await addLog('TRANSACTION', logDetails, logItems, user);
    }
    
    await batch.commit();

    revalidatePath('/stock');
    revalidatePath('/shop');
    revalidatePath('/pos');
    revalidatePath('/log');
    revalidatePath('/dashboard');
    return { data: 'Transaction successful.' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Transaction failed.';
    return { error: errorMessage };
  }
}


// --- Log Actions ---
export async function getLogs(): Promise<SerializableLogEntry[]> {
  const logsCol = collection(db, 'logs');
  const q = query(logsCol, orderBy('timestamp', 'desc'), limit(100));
  const logSnapshot = await getDocs(q);
  const logList = logSnapshot.docs.map(doc => {
    const data = doc.data() as LogEntry;
    return {
    id: doc.id,
    ...data,
    timestamp: data.timestamp.toDate().toISOString(),
  }}) as SerializableLogEntry[];
  return logList;
}

// --- GenAI Action ---
export async function getCategorySuggestion(productName: string): Promise<{ category: string } | { error: string }> {
  if (!productName.trim()) {
    return { error: "Product name is empty." };
  }
  try {
    const result = await suggestCategoryFlow({ productName });
    return { category: result.category };
  } catch (error) {
    console.error('AI suggestion failed:', error);
    if (error instanceof Error && (error.message.includes('permission') || error.message.includes('billing'))) {
        return { error: 'AI suggestion failed. This may be due to billing settings on your Firebase project. Please ensure you are on the Blaze plan.' };
    }
    return { error: 'An unexpected error occurred while getting an AI suggestion.' };
  }
}

// --- Database Seeding ---
export async function seedDatabase() {
    const productsCollection = collection(db, 'products');
    const snapshot = await getCountFromServer(productsCollection);
    
    if (snapshot.data().count > 0) {
        return { error: 'Database is not empty. Seeding aborted.' };
    }

    const batch = writeBatch(db);

    for (const product of sampleProducts) {
        const docRef = doc(productsCollection);
        batch.set(docRef, {
            ...product,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        });
    }

    try {
        await batch.commit();
        revalidatePath('/stock');
        revalidatePath('/shop');
        revalidatePath('/pos');
        revalidatePath('/dashboard');
        return { data: `${sampleProducts.length} products have been added.` };
    } catch (error) {
        console.log(error);
        return { error: 'Failed to seed database.' };
    }
}


// --- Dashboard Actions ---
export async function getDashboardStats(): Promise<DashboardStats> {
  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);

  const logsRef = collection(db, 'logs');
  const q = query(logsRef, where('timestamp', '>=', todayStart), where('timestamp', '<=', todayEnd));
  
  const querySnapshot = await getDocs(q);
  const logs = querySnapshot.docs.map(doc => doc.data() as LogEntry);

  let itemsSold = 0;
  let totalRevenue = 0;
  let itemsReturned = 0;
  let totalReturnValue = 0;
  let newStockCount = 0;
  let restockedItems = 0;
  const productSales: Record<string, number> = {};

  logs.forEach(log => {
    log.items.forEach(item => {
      if (log.type === 'TRANSACTION') {
        if (item.quantityChange < 0) { // Sale
          const quantitySold = Math.abs(item.quantityChange);
          itemsSold += quantitySold;
          totalRevenue += quantitySold * item.price;
          productSales[item.productName] = (productSales[item.productName] || 0) + quantitySold;
        } else if (item.quantityChange > 0) { // Return
          itemsReturned += item.quantityChange;
          totalReturnValue += item.quantityChange * item.price;
        }
      }
      if (log.type === 'CREATE') {
        newStockCount++;
        restockedItems += item.quantityChange;
      }
      if (log.type === 'UPDATE' && item.quantityChange > 0) {
         restockedItems += item.quantityChange;
      }
    });
  });

  const topSellingProducts = Object.entries(productSales)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([productName, quantity]) => ({ productName, quantity }));


  return {
    itemsSold,
    totalRevenue,
    itemsReturned,
    totalReturnValue,
    newStockCount,
    restockedItems,
    topSellingProducts
  };
}


// --- Account Management Actions ---
export async function getAccounts(user: UserProfile): Promise<UserProfile[]> {
    if (user.role !== 'manager') return [];
    // This is a mock implementation. In a real app, you would fetch from Firestore.
    return [
        { id: '1', name: 'Admin Manager', email: 'manager@test.com', role: 'manager' },
        { id: '2', name: 'John Cashier', email: 'john@test.com', role: 'cashier' },
        { id: '3', name: 'Jane Cashier', email: 'jane@test.com', role: 'cashier' },
    ];
}

export async function addAccount(formData: unknown, user: UserProfile) {
    if (user.role !== 'manager') return { error: 'Permission denied.' };

    const NewAccountSchema = z.object({
        name: z.string().min(2, 'Name is required'),
        email: z.string().email('Invalid email address'),
        role: z.enum(['cashier']), // Managers can only create cashiers
    });
    
    const result = NewAccountSchema.safeParse(formData);
    if (!result.success) {
        return { error: result.error.flatten().fieldErrors };
    }

    // This is a mock implementation. In a real app, you would use Firebase Admin SDK to create a user.
    console.log("Creating new user:", result.data);
    revalidatePath('/accounts');
    return { data: `User ${result.data.name} created.` };
}

export async function updateAccount(id: string, formData: unknown, user: UserProfile) {
    if (user.role !== 'manager') return { error: 'Permission denied.' };

    const UpdateAccountSchema = z.object({
        name: z.string().min(2, 'Name is required'),
        email: z.string().email('Invalid email address'),
        role: z.enum(['cashier', 'manager']),
    });

    const result = UpdateAccountSchema.safeParse(formData);
    if (!result.success) {
        return { error: result.error.flatten().fieldErrors };
    }
    
    // This is a mock implementation.
    console.log(`Updating user ${id}:`, result.data);
    revalidatePath('/accounts');
    return { data: `User ${result.data.name} updated.` };
}

export async function deleteAccount(id: string, user: UserProfile) {
    if (user.role !== 'manager') return { error: 'Permission denied.' };
    
    // You cannot delete the main manager account
    if (id === '1') {
        return { error: "Cannot delete the primary manager account." };
    }
    
    // This is a mock implementation.
    console.log(`Deleting user ${id}`);
    revalidatePath('/accounts');
    return { data: 'User deleted successfully.' };
}
