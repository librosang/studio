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
} from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from './firebase';
import type { Product, LogEntry } from './types';
import { suggestCategory as suggestCategoryFlow } from '@/ai/flows/suggest-category';

const ProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  brand: z.string().min(1, 'Brand is required'),
  category: z.string().min(1, 'Category is required'),
  quantity: z.coerce.number().int('Quantity must be an integer'),
});

// --- Log Helper ---
async function addLog(
  type: LogEntry['type'],
  productName: string,
  details: string,
  quantityChange?: number
) {
  try {
    await addDoc(collection(db, 'logs'), {
      type,
      productName,
      details,
      quantityChange: quantityChange || 0,
      timestamp: Timestamp.now(),
    });
  } catch (error) {
    console.error('Failed to add log:', error);
  }
}

// --- Product Actions ---

export async function getProducts(): Promise<Product[]> {
  const productsCol = collection(db, 'products');
  const q = query(productsCol, orderBy('updatedAt', 'desc'));
  const productSnapshot = await getDocs(q);
  const productList = productSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[];
  return productList;
}

export async function addProduct(formData: unknown) {
  const result = ProductSchema.safeParse(formData);
  if (!result.success) {
    return { error: result.error.flatten().fieldErrors };
  }
  const { name, brand, category, quantity } = result.data;

  try {
    const docRef = await addDoc(collection(db, 'products'), {
      name,
      brand,
      category,
      quantity,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    await addLog(
      'CREATE',
      name,
      `Added new product with quantity ${quantity}.`,
      quantity
    );

    revalidatePath('/stock');
    return { data: { id: docRef.id, ...result.data } };
  } catch (error) {
    return { error: 'Failed to add product.' };
  }
}

export async function updateProduct(id: string, formData: unknown) {
  const result = ProductSchema.safeParse(formData);
  if (!result.success) {
    return { error: result.error.flatten().fieldErrors };
  }
  
  const productRef = doc(db, 'products', id);
  const productSnap = await getDoc(productRef);
  if (!productSnap.exists()) {
    return { error: 'Product not found.' };
  }
  const oldQuantity = productSnap.data().quantity;
  const { name, brand, category, quantity } = result.data;
  const quantityChange = quantity - oldQuantity;


  try {
    await updateDoc(productRef, {
      name,
      brand,
      category,
      quantity,
      updatedAt: Timestamp.now(),
    });
    
    await addLog(
      'UPDATE',
      name,
      `Updated product. Quantity changed by ${quantityChange}.`,
      quantityChange
    );

    revalidatePath('/stock');
    revalidatePath('/shop');
    return { data: { id, ...result.data } };
  } catch (error) {
    return { error: 'Failed to update product.' };
  }
}

export async function deleteProduct(id: string) {
  const productRef = doc(db, 'products', id);
  const productSnap = await getDoc(productRef);
  if (!productSnap.exists()) {
    return { error: 'Product not found.' };
  }
  const { name, quantity } = productSnap.data();

  try {
    await deleteDoc(productRef);
    await addLog(
      'DELETE',
      name,
      'Deleted product from inventory.',
      -quantity
    );
    
    revalidatePath('/stock');
    revalidatePath('/shop');
    return { data: 'Product deleted successfully.' };
  } catch (error) {
    return { error: 'Failed to delete product.' };
  }
}

// --- Shop Actions ---

export async function getUniqueCategoriesAndBrands() {
  const products = await getProducts();
  const categories = [...new Set(products.map(p => p.category))];
  const brands = [...new Set(products.map(p => p.brand))];
  return { categories, brands };
}

export async function processTransaction(cart: { [id: string]: number }) {
  const batch = writeBatch(db);
  const productIds = Object.keys(cart);

  try {
    for (const productId of productIds) {
      const quantityChange = cart[productId];
      if (quantityChange === 0) continue;

      const productRef = doc(db, 'products', productId);
      const productSnap = await getDoc(productRef);

      if (productSnap.exists()) {
        const product = productSnap.data() as Omit<Product, 'id'>;
        const newQuantity = product.quantity - quantityChange;

        if (newQuantity < 0) {
          throw new Error(`Not enough stock for ${product.name}.`);
        }
        
        batch.update(productRef, { quantity: newQuantity, updatedAt: Timestamp.now() });
        
        const logType = quantityChange > 0 ? 'SALE' : 'RETURN';
        const logDetails =
          logType === 'SALE'
            ? `Sold ${quantityChange} unit(s).`
            : `Returned ${-quantityChange} unit(s).`;
        
        await addLog(logType, product.name, logDetails, -quantityChange);
      }
    }

    await batch.commit();
    revalidatePath('/stock');
    revalidatePath('/shop');
    return { data: 'Transaction successful.' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Transaction failed.';
    return { error: errorMessage };
  }
}


// --- Log Actions ---
export async function getLogs(): Promise<LogEntry[]> {
  const logsCol = collection(db, 'logs');
  const q = query(logsCol, orderBy('timestamp', 'desc'), limit(100));
  const logSnapshot = await getDocs(q);
  const logList = logSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as LogEntry[];
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
    return { error: 'Failed to get AI suggestion.' };
  }
}
