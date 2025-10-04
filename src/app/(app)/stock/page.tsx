
'use client';
import { getProducts } from '@/lib/actions';
import { PageHeader } from '@/components/page-header';
import { ProductsDataTable } from '@/components/stock/products-data-table';
import { columns } from '@/components/stock/columns';
import { SerializableProduct } from '@/lib/types';
import { useTranslation } from '@/context/language-context';
import { useEffect, useState } from 'react';

export default function StockPage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<SerializableProduct[]>([]);

  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  return (
    <div className="container mx-auto py-10">
      <PageHeader
        title={t('stock.title')}
        description={t('stock.description')}
      />
      <ProductsDataTable columns={columns} data={products} />
    </div>
  );
}
