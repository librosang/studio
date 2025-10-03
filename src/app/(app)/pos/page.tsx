
'use client';

import { getProducts, getUniqueCategoriesAndBrands } from '@/lib/actions';
import { PageHeader } from '@/components/page-header';
import { PosClient } from '@/components/pos/pos-client';
import { useEffect, useState } from 'react';
import { SerializableProduct } from '@/lib/types';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';

export default function PosPage() {
  const [products, setProducts] = useState<SerializableProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 h-[calc(100vh-theme(spacing.20))]">
      <PageHeader
        title="POS Mode"
        description="Quickly process sales and returns in a cashier-friendly interface."
      >
        <Button onClick={handleFullscreen} variant="outline" size="icon">
            <Icons.fullscreen className="h-5 w-5" />
        </Button>
      </PageHeader>
      <PosClient
        initialProducts={products}
        categories={categories}
        brands={brands}
      />
    </div>
  );
}
