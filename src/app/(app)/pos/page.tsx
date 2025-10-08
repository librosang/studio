
'use client';

import { PageHeader } from '@/components/page-header';
import { PosClient } from '@/components/pos/pos-client';
import { useEffect, useState } from 'react';
import { SerializableProduct } from '@/lib/types';
import { Icons } from '@/components/icons';
import { useFullscreen } from '@/hooks/use-fullscreen';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/context/language-context';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function PosPage() {
  const [products, setProducts] = useState<SerializableProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { isFullscreen } = useFullscreen();
  const { t } = useTranslation();

  useEffect(() => {
    setLoading(true);
    
    const productsRef = collection(db, 'products');
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
                expiryDate: data.expiryDate ? data.expiryDate.toDate().toISOString() : null,
            };
        });
        setProducts(productsData);

        // Derive categories and brands from the fetched products
        const uniqueCategories = [...new Set(productsData.map(p => p.category))];
        const uniqueBrands = [...new Set(productsData.map(p => p.brand))];
        setCategories(uniqueCategories);
        setBrands(uniqueBrands);

        setLoading(false);
    }, (error) => {
        console.error("Error fetching POS products: ", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);


  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className={cn(
        "transition-all duration-300 relative",
        isFullscreen 
          ? "h-screen w-full p-4" 
          : "container mx-auto py-10 h-[calc(100vh-theme(spacing.20))]"
    )}>
       {!isFullscreen && (
         <PageHeader
            title={t('pos.title')}
            description={t('pos.description')}
        >
        </PageHeader>
       )}
      <PosClient
        initialProducts={products}
        categories={categories}
        brands={brands}
      />
    </div>
  );
}

    