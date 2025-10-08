
'use client';
import { getUniqueCategoriesAndBrands } from '@/lib/actions';
import { PageHeader } from '@/components/page-header';
import { ShopClient } from '@/components/shop/shop-client';
import { useTranslation } from '@/context/language-context';
import { useEffect, useState } from 'react';
import { SerializableProduct } from '@/lib/types';
import { Icons } from '@/components/icons';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function ShopPage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<SerializableProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const productsRef = collection(db, 'products');
    // We only want products that have items in the shop
    const q = query(productsRef, where('shopQuantity', '>', 0));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData: SerializableProduct[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          brand: data.brand,
          category: data.category,
          stockQuantity: data.stockQuantity,
          shopQuantity: data.shopQuantity,
          price: data.price,
          imageUrl: data.imageUrl,
          barcode: data.barcode,
          createdAt: data.createdAt.toDate().toISOString(),
          updatedAt: data.updatedAt.toDate().toISOString(),
          expiryDate: data.expiryDate ? data.expiryDate.toDate().toISOString() : null
        };
      });
      setProducts(productsData);

      // We still get the full list for filters
      getUniqueCategoriesAndBrands().then(({ categories, brands }) => {
        setCategories(categories);
        setBrands(brands);
      });
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center"><Icons.spinner className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="container mx-auto py-10">
      <PageHeader
        title={t('shop.title')}
        description={t('shop.description')}
      />
      <ShopClient
        initialProducts={products}
        categories={categories}
        brands={brands}
      />
    </div>
  );
}

    