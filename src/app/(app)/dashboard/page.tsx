
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
import { useCurrency, useTranslation } from '@/context/language-context';
import { useEffect, useState } from 'react';
import { DashboardStats, SerializableExpense } from '@/lib/types';
import { onSnapshot, collection, query, where, Timestamp, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { startOfDay, endOfDay, differenceInDays, subDays } from 'date-fns';
import { AlertCircle } from 'lucide-react';
import { FinancialChart, FinancialChartData } from '@/components/dashboard/financial-chart';


export default function DashboardPage() {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrency();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [financialData, setFinancialData] = useState<FinancialChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);

    // Listener for logs
    const logsRef = collection(db, 'logs');
    const expensesRef = collection(db, 'expenses');
    
    const logsQuery = query(logsRef, where('timestamp', '>=', todayStart), where('timestamp', '<=', todayEnd));
    const expensesQuery = query(expensesRef, where('date', '>=', todayStart), where('date', '<=', todayEnd));

    const unsubscribeLogs = onSnapshot(logsQuery, (logsSnapshot) => {
        const unsubscribeExpenses = onSnapshot(expensesQuery, async (expensesSnapshot) => {
            const logs = logsSnapshot.docs.map(doc => doc.data());
            const expenses = expensesSnapshot.docs.map(doc => doc.data());

            let itemsSold = 0;
            let totalRevenue = 0;
            let itemsReturned = 0;
            let totalReturnValue = 0;
            let newStockCount = 0;
            let restockedItems = 0;
            const productSales: Record<string, number> = {};

            logs.forEach(log => {
                log.items.forEach((item: any) => {
                if (log.type === 'TRANSACTION') {
                    if (item.quantityChange < 0) { // Sale
                    const quantitySold = Math.abs(item.quantityChange);
                    itemsSold += quantitySold;
                    totalRevenue += quantitySold * item.price;
                    productSales[item.productName] = (productSales[item.productName] || 0) + quantitySold;
                    } else if (item.quantityChange > 0) { // Return
                    itemsReturned += item.quantityChange;
                    totalReturnValue += item.quantityChange * item.price;
                    }
                }
                if (log.type === 'CREATE') {
                    newStockCount++;
                    restockedItems += item.quantityChange;
                }
                if (log.type === 'UPDATE' && item.quantityChange > 0) {
                    restockedItems += item.quantityChange;
                }
                });
            });
            
            const totalExpenses = expenses.reduce((acc, expense) => acc + expense.amount, 0);
            const netProfit = totalRevenue - totalReturnValue - totalExpenses;


            const topSellingProducts = Object.entries(productSales)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([productName, quantity]) => ({ productName, quantity }));
            
            const productsRef = collection(db, 'products');
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(today.getDate() + 30);
            
            const expiringQuery = query(productsRef, 
                where('expiryDate', '!=', null),
                where('expiryDate', '<=', Timestamp.fromDate(thirtyDaysFromNow))
            );

            const expiringSnapshot = await getDocs(expiringQuery);
            const expiringSoon = expiringSnapshot.docs.map(doc => {
                const product = doc.data();
                const expiry = (product.expiryDate as Timestamp).toDate();
                return {
                    name: product.name,
                    expiryDate: expiry.toLocaleDateString(),
                    daysLeft: differenceInDays(expiry, today)
                };
            }).filter(p => p.daysLeft >= 0).sort((a,b) => a.daysLeft - b.daysLeft);
            
            setStats({
                itemsSold,
                totalRevenue,
                itemsReturned,
                totalReturnValue,
                newStockCount,
                restockedItems,
                topSellingProducts,
                expiringSoon,
                totalExpenses,
                netProfit
            });
            setLoading(false);
        });
        return () => unsubscribeExpenses();
    });

    const sevenDaysAgo = startOfDay(subDays(new Date(), 6));
    const weeklyLogsQuery = query(logsRef, where('timestamp', '>=', sevenDaysAgo), orderBy('timestamp', 'asc'));
    const weeklyExpensesQuery = query(expensesRef, where('date', '>=', sevenDaysAgo), orderBy('date', 'asc'));

    const unsubscribeWeekly = onSnapshot(weeklyLogsQuery, (logsSnapshot) => {
        onSnapshot(weeklyExpensesQuery, (expensesSnapshot) => {
            const dailyData: { [key: string]: { revenue: number; expenses: number } } = {};

            for (let i = 0; i < 7; i++) {
                const date = subDays(today, i);
                const dateString = date.toISOString().split('T')[0];
                dailyData[dateString] = { revenue: 0, expenses: 0 };
            }

            logsSnapshot.docs.forEach(doc => {
                const log = doc.data();
                const date = (log.timestamp as Timestamp).toDate();
                const dateString = date.toISOString().split('T')[0];
                if (log.type === 'TRANSACTION') {
                    log.items.forEach((item: any) => {
                        dailyData[dateString].revenue += (item.quantityChange < 0 ? Math.abs(item.quantityChange) * item.price : -item.quantityChange * item.price);
                    });
                }
            });

            expensesSnapshot.docs.forEach(doc => {
                const expense = doc.data();
                const date = (expense.date as Timestamp).toDate();
                const dateString = date.toISOString().split('T')[0];
                if(dailyData[dateString]) {
                    dailyData[dateString].expenses += expense.amount;
                }
            });
            
            const chartData = Object.keys(dailyData).map(dateString => {
                const data = dailyData[dateString];
                const profit = data.revenue - data.expenses;
                return {
                    date: new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    Revenue: data.revenue,
                    Expenses: data.expenses,
                    Profit: profit,
                };
            }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            
            setFinancialData(chartData);

        });
    });


    return () => {
        unsubscribeLogs();
        unsubscribeWeekly();
    };
  }, [])

  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center"><Icons.spinner className="h-8 w-8 animate-spin"/></div>;
  }

  return (
    <div className="container mx-auto py-10">
      <PageHeader
        title={t('dashboard.title')}
        description={t('dashboard.description', {date: new Date().toLocaleDateString()})}
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          title={t('dashboard.total_revenue')}
          value={formatCurrency(stats?.totalRevenue ?? 0)}
          icon={Icons.sale}
          description={t('dashboard.items_sold', {count: stats?.itemsSold ?? 0})}
        />
        <StatCard
          title={t('dashboard.total_expenses')}
          value={formatCurrency(stats?.totalExpenses ?? 0)}
          icon={Icons.receipt}
          description={t('dashboard.expenses_today_desc')}
           isLoss
        />
        <StatCard
          title={t('dashboard.total_returns')}
          value={formatCurrency(stats?.totalReturnValue ?? 0)}
          icon={Icons.return}
          description={t('dashboard.items_returned', {count: stats?.itemsReturned ?? 0})}
          isLoss
        />
        <StatCard
          title={t('dashboard.net_profit')}
          value={formatCurrency(stats?.netProfit ?? 0)}
          icon={Icons.transaction}
          description={t('dashboard.profit_today_desc')}
          isLoss={(stats?.netProfit ?? 0) < 0}
        />
        <StatCard
          title={t('dashboard.new_stock')}
          value={`+${stats?.newStockCount ?? 0}`}
          icon={Icons.create}
          description={t('dashboard.restocked_items', {count: stats?.restockedItems ?? 0})}
        />
      </div>

       <div className="mt-8 grid gap-8 lg:grid-cols-5">
          <Card className="lg:col-span-3">
             <CardHeader>
              <CardTitle>{t('dashboard.weekly_financial_overview')}</CardTitle>
              <CardDescription>
                {t('dashboard.weekly_financial_desc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
                <FinancialChart data={financialData} />
            </CardContent>
          </Card>
          
           <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{t('dashboard.top_selling_today')}</CardTitle>
              <CardDescription>
                {t('dashboard.top_selling_description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SalesChart data={stats?.topSellingProducts ?? []} />
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                {t('dashboard.expiring_soon')}
              </CardTitle>
              <CardDescription>
                {t('dashboard.expiring_soon_desc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
                {(stats?.expiringSoon?.length ?? 0) > 0 ? (
                    <ul className="space-y-3">
                        {stats?.expiringSoon?.slice(0, 5).map(item => (
                            <li key={item.name} className="flex justify-between items-center text-sm">
                                <span>{item.name}</span>
                                <span className={`font-bold ${item.daysLeft < 7 ? 'text-destructive' : 'text-amber-500'}`}>
                                    {item.daysLeft} {t('dashboard.days_left')}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground">{t('dashboard.no_expiring_products')}</p>
                )}
            </CardContent>
          </Card>
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
