
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { useCurrency, useTranslation } from '@/context/language-context';
import { Icons } from '../icons';

export type FinancialChartData = {
  date: string;
  Revenue: number;
  Expenses: number;
  Profit: number;
};

type FinancialChartProps = {
  data: FinancialChartData[];
};

export function FinancialChart({ data }: FinancialChartProps) {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrency();

  const chartConfig = {
    Revenue: {
      label: t('dashboard.total_revenue'),
      color: 'hsl(var(--chart-2))',
    },
    Expenses: {
      label: t('dashboard.total_expenses'),
      color: 'hsl(var(--chart-5))',
    },
    Profit: {
      label: t('dashboard.net_profit'),
      color: 'hsl(var(--primary))',
    },
  };

  if (data.length === 0) {
    return (
      <div className="flex h-[350px] flex-col items-center justify-center text-center text-muted-foreground">
        <Icons.receipt className="h-12 w-12" />
        <p className="mt-4">{t('dashboard.no_financial_data')}</p>
        <p className="text-sm">{t('dashboard.come_back_later')}</p>
      </div>
    );
  }
  
  return (
    <div className="h-[350px]">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => formatCurrency(value as number, {notation: 'compact'})} />
            <Tooltip content={<ChartTooltipContent formatter={(value, name) => formatCurrency(value as number)} />} />
            <Legend />
            <Bar dataKey="Revenue" fill="var(--color-Revenue)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Expenses" fill="var(--color-Expenses)" radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey="Profit" stroke="var(--color-Profit)" strokeWidth={2} />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}

    