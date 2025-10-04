
'use client';
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
import { useTranslation } from '@/context/language-context';
import { useEffect, useState } from 'react';
import { DashboardStats } from '@/lib/types';


const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export default function DashboardPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    getDashboardStats().then(setStats);
  }, [])

  if (!stats) {
    return <div className="h-screen w-screen flex items-center justify-center"><Icons.spinner className="h-8 w-8 animate-spin"/></div>;
  }

  return (
    <div className="container mx-auto py-10">
      <PageHeader
        title={t('dashboard.title')}
        description={t('dashboard.description', {date: new Date().toLocaleDateString()})}
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('dashboard.total_revenue')}
          value={currencyFormatter.format(stats.totalRevenue)}
          icon={Icons.sale}
          description={t('dashboard.items_sold', {count: stats.itemsSold})}
        />
        <StatCard
          title={t('dashboard.total_returns')}
          value={currencyFormatter.format(stats.totalReturnValue)}
          icon={Icons.return}
          description={t('dashboard.items_returned', {count: stats.itemsReturned})}
          isLoss
        />
        <StatCard
          title={t('dashboard.new_stock')}
          value={`+${stats.newStockCount}`}
          icon={Icons.create}
          description={t('dashboard.restocked_items', {count: stats.restockedItems})}
        />
         <StatCard
          title={t('dashboard.net_items_change')}
          value={`${stats.itemsSold - stats.itemsReturned}`}
          icon={Icons.transaction}
          description={t('dashboard.net_inventory_movement')}
        />
      </div>

       <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.top_selling_today')}</CardTitle>
              <CardDescription>
                {t('dashboard.top_selling_description')}
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
