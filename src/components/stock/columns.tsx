
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { SerializableProduct } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { DataTableRowActions } from './data-table-row-actions';
import { format } from 'date-fns';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export const columns: ColumnDef<SerializableProduct>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Product Name
          <Icons.arrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'brand',
    header: 'Brand',
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => {
      return <Badge variant="secondary">{row.original.category}</Badge>;
    }
  },
  {
    accessorKey: 'price',
    header: ({ column }) => {
       return (
        <div className="text-right">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Price
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
       return (
        <div className="text-right">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Stock Qty
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
  },
  {
    accessorKey: 'shopQuantity',
    header: ({ column }) => {
       return (
        <div className="text-right">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Shop Qty
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
  },
    {
    accessorKey: 'updatedAt',
    header: 'Last Updated',
     cell: ({ row }) => {
      const date = new Date(row.original.updatedAt);
      return <span>{format(date, 'PPP p')}</span>
    },
    meta: {
      className: "hidden md:table-cell"
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return <DataTableRowActions row={row} />;
    },
  },
];
