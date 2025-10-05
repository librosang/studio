
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { SerializableProduct } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { DataTableRowActions } from './data-table-row-actions';
import { format } from 'date-fns';
import { useTranslation } from '@/context/language-context';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

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
    accessorKey: 'brand',
    header: 'Brand',
    meta: {
      className: "hidden sm:table-cell"
    }
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => {
      return <Badge variant="secondary">{row.original.category}</Badge>;
    },
    meta: {
        className: "hidden lg:table-cell"
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
      return <div className="text-right font-medium">{currencyFormatter.format(price)}</div>;
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
      const color = quantity < 10 ? 'text-destructive' : 'text-foreground';
      return <div className={`text-right font-medium ${color}`}>{quantity}</div>;
    },
    meta: {
        className: "hidden md:table-cell"
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
      const color = quantity < 10 ? 'text-destructive' : 'text-foreground';
      return <div className={`text-right font-medium ${color}`}>{quantity}</div>;
    },
    meta: {
        className: "hidden md:table-cell"
    }
  },
    {
    accessorKey: 'updatedAt',
    header: 'Last Updated',
     cell: ({ row }) => {
      const date = new Date(row.original.updatedAt);
      return <span className="whitespace-nowrap">{format(date, 'PPP p')}</span>
    },
    meta: {
      className: "hidden lg:table-cell"
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return <DataTableRowActions row={row} />;
    },
     meta: {
      className: "sticky right-0 bg-card/80 backdrop-blur-sm"
    }
  },
];
