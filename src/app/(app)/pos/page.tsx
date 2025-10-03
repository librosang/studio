
'use client';

import { getProducts, getUniqueCategoriesAndBrands } from '@/lib/actions';
import { PageHeader } from '@/components/page-header';
import { PosClient } from '@/components/pos/pos-client';
import { useEffect, useState } from 'react';
import { SerializableProduct } from '@/lib/types';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { useFullscreen } from '@/app/(app)/layout';
import { cn } from '@/lib/utils';

export default function PosPage() {
  const [products, setProducts] = useState<SerializableProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { isFullscreen, toggleFullscreen } = useFullscreen();

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
        "container mx-auto py-10 transition-all duration-300 relative",
        isFullscreen ? "h-screen w-screen max-w-full !p-4" : "h-[calc(100vh-theme(spacing.20))]"
    )}>
       <Button onClick={toggleFullscreen} variant="outline" size="icon" className="absolute top-4 right-4 z-10">
          <Icons.fullscreen className="h-5 w-5" />
      </Button>

       {!isFullscreen && (
         <PageHeader
            title="POS Mode"
            description="Quickly process sales and returns in a cashier-friendly interface."
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
