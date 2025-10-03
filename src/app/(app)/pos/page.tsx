
import { getProducts, getUniqueCategoriesAndBrands } from '@/lib/actions';
import { PageHeader } from '@/components/page-header';
import { PosClient } from '@/components/pos/pos-client';

export const dynamic = 'force-dynamic';

export default async function PosPage() {
  const products = await getProducts();
  const { categories, brands } = await getUniqueCategoriesAndBrands();

  return (
    <div className="container mx-auto py-10 h-[calc(100vh-theme(spacing.20))]">
      <PageHeader
        title="POS Mode"
        description="Quickly process sales and returns in a cashier-friendly interface."
      />
      <PosClient
        initialProducts={products}
        categories={categories}
        brands={brands}
      />
    </div>
  );
}
