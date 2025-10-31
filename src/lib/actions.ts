
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
import { db } from './firebase';
import type { Product, LogEntry, SerializableProduct, SerializableLogEntry, DashboardStats, UserProfile, ProductFormData, ExpenseFormData } from './types';
import { ProductSchema, UserSchema, ExpenseSchema } from './types';
import { sampleProducts } from './sample-data';
import { startOfDay, endOfDay, differenceInDays } from 'date-fns';

// --- Log Helper ---
async function addLog(
  type: LogEntry['type'],
  details: string,
  items: { productName: string; quantityChange: number; price: number }[],
  user: UserProfile,
) {
  try {
    addDoc(collection(db, 'logs'), {
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
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt.toDate().toISOString(),
      updatedAt: data.updatedAt.toDate().toISOString(),
      expiryDate: data.expiryDate ? data.expiryDate.toDate().toISOString() : null,
    }
  }) as SerializableProduct[];
  return productList;
}

export async function addProduct(formData: ProductFormData, user: UserProfile) {
  if (user.role !== 'manager') return { error: 'Permission denied.' };
  const result = ProductSchema.safeParse(formData);
  if (!result.success) {
    return { error: result.error.flatten().fieldErrors };
  }
  const { name, brand, category, stockQuantity, price, imageUrl, barcode, shopQuantity, expiryDate } = result.data;

  const newProductData = {
      name,
      brand,
      category,
      stockQuantity,
      shopQuantity,
      price,
      imageUrl,
      barcode,
      expiryDate: expiryDate ? Timestamp.fromDate(new Date(expiryDate)) : null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
  };

  try {
    const docRef = await addDoc(collection(db, 'products'), newProductData);
    console.log("Product added with ID: ", docRef.id);
    addLog(
        'CREATE',
        `Created: ${name}`,
        [{ productName: name, quantityChange: stockQuantity, price }],
        user
    );
  } catch (error) {
      console.error("Error adding product: ", error);
      return { error: 'Failed to add product.' };
  }

  revalidatePath('/stock');
  revalidatePath('/dashboard');
  return { data: { id: 'temp-id', ...result.data } };
}


export async function updateProduct(id: string, formData: ProductFormData, user: UserProfile) {
    if (user.role !== 'manager') return { error: 'Permission denied.' };
    const result = ProductSchema.safeParse(formData);
    if (!result.success) {
        return { error: result.error.flatten().fieldErrors };
    }

    const productRef = doc(db, 'products', id);
    const { name, brand, category, stockQuantity, shopQuantity, price, imageUrl, barcode, expiryDate } = result.data;
    const updatedData = {
        name,
        brand,
        category,
        stockQuantity,
        shopQuantity,
        price,
        imageUrl,
        barcode,
        expiryDate: expiryDate ? Timestamp.fromDate(new Date(expiryDate)) : null,
        updatedAt: Timestamp.now(),
    };

    try {
        const productSnap = await getDoc(productRef);
        if (productSnap.exists()) {
            const oldData = productSnap.data() as Product;
            const quantityChange = stockQuantity - oldData.stockQuantity;

            await updateDoc(productRef, updatedData);
            console.log("Product updated");
            addLog(
                'UPDATE',
                `Updated: ${name}`,
                [{ productName: name, quantityChange: quantityChange, price }],
                user
            );
        }
    } catch (error) {
        console.error("Error updating product: ", error);
        return { error: 'Failed to update product.' };
    }

    revalidatePath('/stock');
    revalidatePath('/shop');
    revalidatePath('/pos');
    revalidatePath('/dashboard');
    return { data: { id, ...result.data } };
}

export async function deleteProduct(id: string, user: UserProfile) {
    if (user.role !== 'manager') return { error: 'Permission denied.' };
    
    const productRef = doc(db, 'products', id);

    try {
        const productSnap = await getDoc(productRef);
        if (productSnap.exists()) {
            const { name, stockQuantity, shopQuantity, price } = productSnap.data() as Product;
            const totalQuantity = stockQuantity + shopQuantity;

            await deleteDoc(productRef);
            console.log("Product deleted");
            addLog(
                'DELETE',
                `Deleted: ${name}`,
                [{ productName: name, quantityChange: -totalQuantity, price }],
                user
            );
        }
    } catch(error) {
        console.error("Error deleting product: ", error);
        return { error: 'Failed to delete product.' };
    }

    revalidatePath('/stock');
    revalidatePath('/shop');
    revalidatePath('/pos');
    revalidatePath('/dashboard');
    return { data: 'Product deletion initiated.' };
}


export async function transferStockToShop(id: string, quantityToTransfer: number, user: UserProfile) {
  if (user.role !== 'manager') return { error: 'Permission denied.' };
  if (quantityToTransfer <= 0) return { error: 'Transfer quantity must be positive.' };

  const productRef = doc(db, 'products', id);

  try {
    const productSnap = await getDoc(productRef);
    if (!productSnap.exists()) {
      throw new Error('Product not found.');
    }
    
    const product = productSnap.data() as Product;

    if (product.stockQuantity < quantityToTransfer) {
      throw new Error('Not enough stock to transfer.');
    }

    const newStockQuantity = product.stockQuantity - quantityToTransfer;
    const newShopQuantity = product.shopQuantity + quantityToTransfer;

    await updateDoc(productRef, {
      stockQuantity: newStockQuantity,
      shopQuantity: newShopQuantity,
      updatedAt: Timestamp.now(),
    });
    
    addLog(
        'TRANSFER',
        'Stock -> Shop',
        [{ productName: product.name, quantityChange: quantityToTransfer, price: product.price }],
        user
    );

  } catch (error) {
      console.error("Error transferring stock: ", error);
      return { error: 'Failed to transfer stock.' };
  }
  
  revalidatePath('/stock');
  revalidatePath('/shop');
  revalidatePath('/pos');
  revalidatePath('/log');
  return { success: true };
}

// --- Shop Actions ---

export async function getUniqueCategoriesAndBrands() {
  const productsCol = collection(db, 'products');
  const productSnapshot = await getDocs(productsCol);
  const products = productSnapshot.docs.map(doc => doc.data());
  const categories = [...new Set(products.map(p => p.category))];
  const brands = [...new Set(products.map(p => p.brand))];
  return { categories, brands };
}

export async function processTransaction(cart: { [id: string]: number }, user: UserProfile) {
  const batch = writeBatch(db);
  const productIds = Object.keys(cart);
  const logItems: { productName: string; quantityChange: number; price: number }[] = [];
  
  try {
    const productRefs = productIds.map(id => doc(db, 'products', id));
    const productSnaps = await Promise.all(productRefs.map(ref => getDoc(ref)));

    for (const productSnap of productSnaps) {
        if (productSnap.exists()) {
            const productId = productSnap.id;
            const quantityChangeInCart = cart[productId];
            
            if (quantityChangeInCart === 0) continue;

            const product = productSnap.data() as Product;
            const newShopQuantity = product.shopQuantity - quantityChangeInCart;

            // For sales, ensure we don't sell more than what's available
            if (quantityChangeInCart > 0 && newShopQuantity < 0) {
                throw new Error(`Not enough stock for ${product.name} in the shop.`);
            }
            
            const productRef = doc(db, 'products', productId);
            batch.update(productRef, { shopQuantity: newShopQuantity, updatedAt: Timestamp.now() });
            
            logItems.push({ productName: product.name, quantityChange: -quantityChangeInCart, price: product.price });
        }
    }

    if (logItems.length > 0) {
      addLog('TRANSACTION', 'Shop Transaction', logItems, user);
    }

    await batch.commit();

  } catch (error) {
    console.error("Error processing transaction: ", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { error: errorMessage };
  }

  revalidatePath('/stock');
  revalidatePath('/shop');
  revalidatePath('/pos');
  revalidatePath('/log');
  revalidatePath('/dashboard');
  
  return { data: 'Transaction processing initiated.' };
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

  // Get logs for today
  const logsRef = collection(db, 'logs');
  const logsQuery = query(logsRef, where('timestamp', '>=', todayStart), where('timestamp', '<=', todayEnd));
  const logsSnapshot = await getDocs(logsQuery);
  const logs = logsSnapshot.docs.map(doc => doc.data() as LogEntry);

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
    
  // Get products expiring soon
  const productsRef = collection(db, 'products');
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);
  
  const expiringQuery = query(productsRef, 
    where('expiryDate', '!=', null),
    where('expiryDate', '<=', Timestamp.fromDate(thirtyDaysFromNow))
  );

  const expiringSnapshot = await getDocs(expiringQuery);
  const expiringSoon = expiringSnapshot.docs.map(doc => {
      const product = doc.data() as Product;
      const expiry = (product.expiryDate as Timestamp).toDate();
      return {
          name: product.name,
          expiryDate: expiry.toLocaleDateString(),
          daysLeft: differenceInDays(expiry, today)
      };
  }).filter(p => p.daysLeft >= 0).sort((a,b) => a.daysLeft - b.daysLeft);

  const expensesRef = collection(db, 'expenses');
  const expensesQuery = query(expensesRef, where('date', '>=', todayStart), where('date', '<=', todayEnd));
  const expensesSnapshot = await getDocs(expensesQuery);
  const totalExpenses = expensesSnapshot.docs.reduce((acc, doc) => acc + doc.data().amount, 0);

  const netProfit = totalRevenue - totalReturnValue - totalExpenses;

  return {
    itemsSold,
    totalRevenue,
    itemsReturned,
    totalReturnValue,
    newStockCount,
    restockedItems,
    topSellingProducts,
    expiringSoon,
    totalExpenses,
    netProfit
  };
}


// --- Open Food Facts API ---
export async function getProductDataFromBarcode(barcode: string): Promise<{ name: string; imageUrl: string } | { error: string }> {
  if (!barcode) {
    return { error: 'Barcode is required.' };
  }
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
    if (!response.ok) {
      return { error: 'Failed to fetch product data from Open Food Facts.' };
    }
    const data = await response.json();
    if (data.status === 0 || !data.product) {
      return { error: `Product with barcode ${barcode} not found.` };
    }

    const name = data.product.product_name || data.product.product_name_en || '';
    const imageUrl = data.product.image_front_url || data.product.image_url || '';

    if (!name) {
      return { error: 'Product name not found in API response.' };
    }

    return { name, imageUrl };
  } catch (error) {
    console.error('Open Food Facts API error:', error);
    return { error: 'An unexpected error occurred while fetching product data.' };
  }
}

// --- Account Management Actions ---
export async function getAccounts(user: UserProfile): Promise<UserProfile[]> {
    if (user.role !== 'manager') return [];
    // This is a mock implementation. In a real app, you would fetch from Firestore users collection.
    const mockUsers: UserProfile[] = [
        { id: '1', name: 'Admin Manager', email: 'manager@test.com', role: 'manager' },
        { id: '2', name: 'John Cashier', email: 'john@test.com', role: 'cashier' },
        { id: '3', name: 'Jane Cashier', email: 'jane@test.com', role: 'cashier' },
    ];
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockUsers;
}

export async function addAccount(formData: Pick<UserProfile, 'name' | 'email' | 'role'>, user: UserProfile): Promise<{data?: string, error?: string | any }> {
    if (user.role !== 'manager') return { error: 'Permission denied.' };
    
    const NewAccountSchema = UserSchema.pick({ name: true, email: true, role: true });
    
    const result = NewAccountSchema.safeParse(formData);
    if (!result.success) {
        return { error: result.error.flatten().fieldErrors };
    }

    console.log("MOCK: Creating new user:", result.data);
    revalidatePath('/accounts');
    return { data: `User ${result.data.name} created.` };
}

export async function updateAccount(id: string, formData: Pick<UserProfile, 'name' | 'email' | 'role'>, user: UserProfile): Promise<{data?: string, error?: string | any }> {
    if (user.role !== 'manager') return { error: 'Permission denied.' };

    const UpdateAccountSchema = UserSchema.pick({ name: true, email: true, role: true });

    const result = UpdateAccountSchema.safeParse(formData);
    if (!result.success) {
        return { error: result.error.flatten().fieldErrors };
    }
    
    console.log(`MOCK: Updating user ${id}:`, result.data);
    revalidatePath('/accounts');
    return { data: `User ${result.data.name} updated.` };
}

export async function deleteAccount(id: string, user: UserProfile): Promise<{data?: string, error?: string}> {
    if (user.role !== 'manager') return { error: 'Permission denied.' };
    
    if (id === user.id) {
        return { error: "You cannot delete your own account." };
    }

    if (id === '1') {
        return { error: "accounts.delete_primary_manager_error" };
    }
    
    console.log(`MOCK: Deleting user ${id}`);
    revalidatePath('/accounts');
    return { data: 'User deleted successfully.' };
}


// --- Expense Actions ---

export async function addExpense(formData: ExpenseFormData, user: UserProfile) {
    if (user.role !== 'manager') return { error: 'Permission denied.' };
    const result = ExpenseSchema.safeParse(formData);
    if (!result.success) {
        return { error: result.error.flatten().fieldErrors };
    }

    const { date, category, description, amount } = result.data;
    const newExpense = {
        date: Timestamp.fromDate(new Date(date)),
        category,
        description: description || '',
        amount,
        userId: user.id,
    };

    try {
        const docRef = await addDoc(collection(db, 'expenses'), newExpense);
        await addLog('EXPENSE', `Expense: ${category}`, [{ productName: description || category, quantityChange: 1, price: -amount }], user);
        revalidatePath('/expenses');
        revalidatePath('/dashboard');
        return { data: { id: docRef.id, ...result.data } };
    } catch (e) {
        console.error("Error adding expense: ", e);
        return { error: "Failed to add expense." };
    }
}

export async function updateExpense(id: string, formData: ExpenseFormData, user: UserProfile) {
    if (user.role !== 'manager') return { error: 'Permission denied.' };
    const result = ExpenseSchema.safeParse(formData);
    if (!result.success) {
        return { error: result.error.flatten().fieldErrors };
    }

    const { date, category, description, amount } = result.data;
    const expenseRef = doc(db, 'expenses', id);
    const updatedData = {
        date: Timestamp.fromDate(new Date(date)),
        category,
        description: description || '',
        amount,
    };

    try {
        await updateDoc(expenseRef, updatedData);
        revalidatePath('/expenses');
        return { data: { id, ...result.data } };
    } catch (e) {
        console.error("Error updating expense: ", e);
        return { error: "Failed to update expense." };
    }
}


export async function deleteExpense(id: string, user: UserProfile) {
    if (user.role !== 'manager') return { error: 'Permission denied.' };
    const expenseRef = doc(db, 'expenses', id);
    try {
        await deleteDoc(expenseRef);
        revalidatePath('/expenses');
        return { data: 'Expense deleted successfully.' };
    } catch (e) {
        console.error("Error deleting expense: ", e);
        return { error: "Failed to delete expense." };
    }
}
