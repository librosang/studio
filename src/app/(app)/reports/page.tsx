
'use client';
import { PageHeader } from '@/components/page-header';
import { useTranslation } from '@/context/language-context';
import { useEffect, useState } from 'react';
import { SerializableProduct } from '@/lib/types';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Icons } from '@/components/icons';
import { columns } from '@/components/reports/columns';
import { ReportsDataTable } from '@/components/reports/reports-data-table';


export default function ReportsPage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<SerializableProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, orderBy('name', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const productsData = querySnapshot.docs.map(doc => {
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
        } as SerializableProduct;
      });
      setProducts(productsData);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching products for reports: ", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
     return <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center"><Icons.spinner className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="container mx-auto py-10">
      <PageHeader
        title={t('reports.title')}
        description={t('reports.valuation_desc')}
      />
      <ReportsDataTable columns={columns} data={products} />
    </div>
  );
}
