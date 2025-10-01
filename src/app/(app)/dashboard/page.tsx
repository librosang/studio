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
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartTooltipContent } from '@/components/ui/chart';

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
              {stats.topSellingProducts.length > 0 ? (
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.topSellingProducts}>
                      <XAxis
                        dataKey="productName"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        angle={-45}
                        textAnchor="end"
                      />
                      <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                      />
                      <Tooltip
                        cursor={{ fill: 'hsla(var(--muted))' }}
                        content={<ChartTooltipContent />}
                      />
                      <Bar dataKey="quantity" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-[350px] flex-col items-center justify-center text-center text-muted-foreground">
                   <Icons.shop className="h-12 w-12" />
                  <p className="mt-4">No sales recorded yet today.</p>
                  <p className="text-sm">Come back after you've made some sales!</p>
                </div>
              )}
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
