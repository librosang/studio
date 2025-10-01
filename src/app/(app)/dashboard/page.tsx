import { getDashboardStats } from '@/lib/actions';
import { PageHeader } from '@/components/page-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { SalesChart } from '@/components/dashboard/sales-chart';


export const dynamic = 'force-dynamic';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="container mx-auto py-10">
      <PageHeader
        title="Dashboard"
        description={`Here's a summary of your activity for today, ${new Date().toLocaleDateString()}.`}
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={currencyFormatter.format(stats.totalRevenue)}
          icon={Icons.sale}
          description={`${stats.itemsSold} items sold`}
        />
        <StatCard
          title="Total Returns"
          value={currencyFormatter.format(stats.totalReturnValue)}
          icon={Icons.return}
          description={`${stats.itemsReturned} items returned`}
          isLoss
        />
        <StatCard
          title="New Stock"
          value={`+${stats.newStockCount}`}
          icon={Icons.create}
          description={`${stats.restockedItems} items restocked`}
        />
         <StatCard
          title="Net Items Change"
          value={`${stats.itemsSold - stats.itemsReturned}`}
          icon={Icons.transaction}
          description="Net inventory movement"
        />
      </div>

       <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products Today</CardTitle>
              <CardDescription>
                Your most popular products based on today's sales.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SalesChart data={stats.topSellingProducts} />
            </CardContent>
          </Card>
        </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  isLoss = false,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  description: string;
  isLoss?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${isLoss ? 'text-destructive' : ''}`}>
          {value}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
