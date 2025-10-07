
'use client';
import React from 'react';
import { type SerializableProduct } from '@/lib/types';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { useCurrency } from '@/context/language-context';

type ReceiptPreviewProps = {
  cartItems: SerializableProduct[];
  total: number;
};

export const ReceiptPreview = ({ cartItems, total }: ReceiptPreviewProps) => {
    const { formatCurrency } = useCurrency();
  return (
    <div className="bg-background text-sm rounded-lg p-4 border h-full flex flex-col">
       <ScrollArea className="flex-1 pr-4 -mr-4">
        <table className="w-full">
            <thead>
            <tr className="border-b">
                <th className="text-left font-semibold pb-2">ITEM</th>
                <th className="text-right font-semibold pb-2">PRICE</th>
            </tr>
            </thead>
            <tbody>
            {cartItems.map(item => (
                <tr key={item.id}>
                <td className="text-left py-1">{item.name}</td>
                <td className="text-right py-1">{formatCurrency(item.price)}</td>
                </tr>
            ))}
            </tbody>
        </table>
       </ScrollArea>
      
       <Separator className="my-4" />

      <div className="flex justify-between font-bold text-lg">
        <span>TOTAL</span>
        <span>{formatCurrency(total)}</span>
      </div>
    </div>
  );
};
