
'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { SerializableExpense } from '@/lib/types';
import { Icons } from '../icons';
import { useTranslation } from '@/context/language-context';
import { useCurrency } from '@/context/language-context';

type ExpenseBreakdownChartProps = {
  expenses: SerializableExpense[];
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ff4d4d'];

export function ExpenseBreakdownChart({ expenses }: ExpenseBreakdownChartProps) {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrency();

  const data = useMemo(() => {
    const categoryTotals = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value,
    }));
  }, [expenses]);
  
   const chartConfig = data.reduce((acc, item, index) => {
    acc[item.name] = {
      label: item.name,
      color: COLORS[index % COLORS.length],
    };
    return acc;
  }, {} as any);


  if (data.length === 0) {
    return (
      <div className="flex h-[300px] flex-col items-center justify-center text-center text-muted-foreground">
        <Icons.receipt className="h-12 w-12" />
        <p className="mt-4">{t('expenses.no_breakdown_data')}</p>
      </div>
    );
  }

  return (
    <div className="h-[300px]">
       <ChartContainer config={chartConfig} className="mx-auto aspect-square h-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              cursor={{ fill: 'hsla(var(--muted))' }}
              content={<ChartTooltipContent 
                formatter={(value) => formatCurrency(value as number)} 
                nameKey="name"
              />}
            />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
             <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
