
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { SerializableProduct } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useCurrency, useTranslation } from '@/context/language-context';

export const columns: ColumnDef<SerializableProduct>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => {
        const { t } = useTranslation();
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {t('product_form.product_name')}
          <Icons.arrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    meta: {
        className: "min-w-[200px]"
    }
  },
  {
    accessorKey: 'price',
    header: ({ column }) => {
        const { t } = useTranslation();
       return (
        <div className="text-right">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            {t('product_form.price')}
            <Icons.arrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const price = row.original.price;
      const { formatCurrency } = useCurrency();
      return <div className="text-right font-medium">{formatCurrency(price)}</div>;
    },
  },
  {
    accessorKey: 'stockQuantity',
    header: ({ column }) => {
        const { t } = useTranslation();
       return (
        <div className="text-right">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            {t('product_form.stock_quantity')}
            <Icons.arrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const quantity = row.original.stockQuantity;
      return <div className={`text-right font-medium`}>{quantity}</div>;
    },
  },
  {
    id: 'stockValue',
    header: () => <div className="text-right">Stock Value</div>,
    cell: ({ row }) => {
        const { formatCurrency } = useCurrency();
        const value = row.original.price * row.original.stockQuantity;
        return <div className="text-right font-bold">{formatCurrency(value)}</div>;
    }
  },
  {
    accessorKey: 'shopQuantity',
    header: ({ column }) => {
        const { t } = useTranslation();
       return (
        <div className="text-right">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            {t('product_form.shop_quantity')}
            <Icons.arrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const quantity = row.original.shopQuantity;
      return <div className={`text-right font-medium`}>{quantity}</div>;
    },
  },
  {
    id: 'shopValue',
    header: () => <div className="text-right">Shop Value</div>,
    cell: ({ row }) => {
        const { formatCurrency } = useCurrency();
        const value = row.original.price * row.original.shopQuantity;
        return <div className="text-right font-bold">{formatCurrency(value)}</div>;
    }
  },
  {
    id: 'totalValue',
    header: () => <div className="text-right">Total Value</div>,
    cell: ({ row }) => {
        const { formatCurrency } = useCurrency();
        const value = row.original.price * (row.original.stockQuantity + row.original.shopQuantity);
        return <div className="text-right font-bold text-primary">{formatCurrency(value)}</div>;
    }
  },
];
