
'use client';

import { getProducts, getUniqueCategoriesAndBrands } from '@/lib/actions';
import { PageHeader } from '@/components/page-header';
import { PosClient } from '@/components/pos/pos-client';
import { useEffect, useState } from 'react';
import { SerializableProduct } from '@/lib/types';
import { Icons } from '@/components/icons';
import { useFullscreen } from '@/app/(app)/layout';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/context/language-context';

export default function PosPage() {
  const [products, setProducts] = useState<SerializableProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { isFullscreen } = useFullscreen();
  const { t } = useTranslation();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [productsData, uniqueData] = await Promise.all([
        getProducts(),
        getUniqueCategoriesAndBrands(),
      ]);
      setProducts(productsData);
      setCategories(uniqueData.categories);
      setBrands(uniqueData.brands);
      setLoading(false);
    }
    loadData();
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
