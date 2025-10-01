import { getProducts, getUniqueCategoriesAndBrands } from '@/lib/actions';
import { PageHeader } from '@/components/page-header';
import { ShopClient } from '@/components/shop/shop-client';

export const dynamic = 'force-dynamic';

export default async function ShopPage() {
  const products = await getProducts();
  const { categories, brands } = await getUniqueCategoriesAndBrands();

  return (
    <div className="container mx-auto py-10">
      <PageHeader
        title="Shop"
        description="Select products to sell or process returns. Use negative quantities for returns."
      />
      <ShopClient
        initialProducts={products}
        categories={categories}
        brands={brands}
      />
    </div>
  );
}
