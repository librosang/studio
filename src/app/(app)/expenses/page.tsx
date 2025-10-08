
'use client';
import { PageHeader } from '@/components/page-header';
import { useTranslation } from '@/context/language-context';
import { useEffect, useState } from 'react';
import { SerializableExpense } from '@/lib/types';
import { collection, onSnapshot, orderBy, query, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Icons } from '@/components/icons';
import { ExpensesDataTable } from '@/components/expenses/expenses-data-table';
import { columns } from '@/components/expenses/columns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCurrency } from '@/context/language-context';
import { ExpenseBreakdownChart } from '@/components/expenses/expense-breakdown-chart';

type FinancialSummary = {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
}

export default function AccountingPage() {
  const { t } = useTranslation();
  const [expenses, setExpenses] = useState<SerializableExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatCurrency } = useCurrency();
  const [summary, setSummary] = useState<FinancialSummary>({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
  });

  useEffect(() => {
    const expensesRef = collection(db, 'expenses');
    const expensesQuery = query(expensesRef, orderBy('date', 'desc'));

    const unsubscribeExpenses = onSnapshot(expensesQuery, (expensesSnapshot) => {
      const expensesData = expensesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date.toDate().toISOString(),
        } as SerializableExpense;
      });
      setExpenses(expensesData);
      
      const totalExpenses = expensesData.reduce((acc, expense) => acc + expense.amount, 0);
      setSummary(prev => ({
        ...prev,
        totalExpenses,
        netProfit: prev.totalRevenue - totalExpenses,
      }));
      setLoading(false);
    }, (error) => {
        console.error("Error fetching expenses: ", error);
        setLoading(false);
    });

    const logsRef = collection(db, 'logs');
    const transactionsQuery = query(logsRef, where('type', '==', 'TRANSACTION'));

    const unsubscribeLogs = onSnapshot(transactionsQuery, (logsSnapshot) => {
        let totalRevenue = 0;
        logsSnapshot.forEach(doc => {
            const log = doc.data();
            log.items.forEach((item: any) => {
                totalRevenue += (item.quantityChange < 0 ? Math.abs(item.quantityChange) * item.price : -item.quantityChange * item.price);
            });
        });
        setSummary(prev => ({
            ...prev,
            totalRevenue,
            netProfit: totalRevenue - prev.totalExpenses,
        }));
    });

    return () => {
      unsubscribeExpenses();
      unsubscribeLogs();
    };
  }, []);


  if (loading) {
     return <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center"><Icons.spinner className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="container mx-auto py-10">
      <PageHeader
        title={t('expenses.title')}
        description={t('expenses.description')}
      />
      
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <StatCard
          title={t('dashboard.total_revenue')}
          value={formatCurrency(summary.totalRevenue)}
          icon={Icons.sale}
        />
        <StatCard
          title={t('dashboard.total_expenses')}
          value={formatCurrency(summary.totalExpenses)}
          icon={Icons.receipt}
          isLoss
        />
        <StatCard
          title={t('dashboard.net_profit')}
          value={formatCurrency(summary.netProfit)}
          icon={Icons.transaction}
          isLoss={summary.netProfit < 0}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ExpensesDataTable columns={columns} data={expenses} />
        </div>
        <div className="lg:col-span-2">
           <Card>
            <CardHeader>
              <CardTitle>{t('expenses.breakdown_title')}</CardTitle>
              <CardDescription>
                {t('expenses.breakdown_desc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExpenseBreakdownChart expenses={expenses} />
            </CardContent>
          </Card>
        </div>
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
  description?: string;
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
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
}
