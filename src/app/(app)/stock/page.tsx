import { getProducts } from '@/lib/actions';
import { PageHeader } from '@/components/page-header';
import { ProductsDataTable } from '@/components/stock/products-data-table';
import { columns } from '@/components/stock/columns';

export const dynamic = 'force-dynamic';

export default async function StockPage() {
  const products = await getProducts();

  return (
    <div className="container mx-auto py-10">
      <PageHeader
        title="Stockage"
        description="Manage your products here. Add, edit, or delete items."
      />
      <ProductsDataTable columns={columns} data={products} />
    </div>
  );
}
