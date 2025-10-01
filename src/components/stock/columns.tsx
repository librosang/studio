'use client';

import { ColumnDef } from '@tanstack/react-table';
import { SerializableProduct } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { DataTableRowActions } from './data-table-row-actions';
import { format } from 'date-fns';

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
    accessorKey: 'quantity',
    header: ({ column }) => {
       return (
        <div className="text-right">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Quantity
            <Icons.arrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const quantity = row.original.quantity;
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
