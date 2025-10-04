
'use client';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Icons } from '../icons';
import { useTranslation } from '@/context/language-context';

type SalesChartProps = {
  data: { productName: string; quantity: number }[];
};

export function SalesChart({ data }: SalesChartProps) {
  const { t } = useTranslation();

  const chartConfig = {
    quantity: {
      label: t('product_form.stock_quantity'),
      color: 'hsl(var(--primary))',
    },
  };

  if (data.length === 0) {
    return (
      <div className="flex h-[350px] flex-col items-center justify-center text-center text-muted-foreground">
        <Icons.shop className="h-12 w-12" />
        <p className="mt-4">{t('dashboard.no_sales_yet')}</p>
        <p className="text-sm">{t('dashboard.come_back_later')}</p>
      </div>
    );
  }

  return (
    <div className="h-[350px]">
       <ChartContainer config={chartConfig} className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} accessibilityLayer>
            <XAxis
              dataKey="productName"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              angle={-45}
              textAnchor="end"
              height={70}
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
            <Bar dataKey="quantity" fill="var(--color-quantity)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
