
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { SerializableExpense } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { DataTableRowActions } from './data-table-row-actions';
import { format } from 'date-fns';
import { useCurrency, useTranslation } from '@/context/language-context';

export const columns: ColumnDef<SerializableExpense>[] = [
  {
    accessorKey: 'date',
    header: ({ column }) => {
        const { t } = useTranslation();
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {t('expenses.date')}
          <Icons.arrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.original.date);
      return <span className="whitespace-nowrap">{format(date, 'PPP')}</span>
    },
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => {
      return <Badge variant="secondary">{row.original.category}</Badge>;
    },
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => {
      return <span className="text-muted-foreground">{row.original.description}</span>;
    },
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => {
        const { t } = useTranslation();
       return (
        <div className="text-right">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            {t('expenses.amount')}
            <Icons.arrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const amount = row.original.amount;
      const { formatCurrency } = useCurrency();
      return <div className="text-right font-medium">{formatCurrency(amount)}</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return <DataTableRowActions row={row} />;
    },
     meta: {
      className: "sticky right-0 bg-card/80 backdrop-blur-sm z-10"
    }
  },
];
