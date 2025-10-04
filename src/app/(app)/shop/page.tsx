
'use client';
import { getProducts, getUniqueCategoriesAndBrands } from '@/lib/actions';
import { PageHeader } from '@/components/page-header';
import { ShopClient } from '@/components/shop/shop-client';
import { useTranslation } from '@/context/language-context';
import { useEffect, useState } from 'react';
import { SerializableProduct } from '@/lib/types';
import { Icons } from '@/components/icons';

export default function ShopPage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<SerializableProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getProducts(),
      getUniqueCategoriesAndBrands()
    ]).then(([productsData, { categories, brands }]) => {
      setProducts(productsData);
      setCategories(categories);
      setBrands(brands);
      setLoading(false);
    });
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
