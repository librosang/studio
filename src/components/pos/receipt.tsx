
'use client';
import React, { forwardRef } from 'react';
import { format } from 'date-fns';
import { Icons } from '../icons';
import { useCurrency, useTranslation } from '@/context/language-context';

export type CartItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
};

type ReceiptProps = {
  cartItems: CartItem[];
  total: number;
  transactionDate: string;
  cashierName?: string;
};

export const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(({ cartItems, total, transactionDate, cashierName }, ref) => {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrency();
  return (
    <div id="receipt-print" ref={ref} className="bg-white text-black text-xs font-mono p-2" style={{ width: '300px' }}>
      <div className="text-center">
        <Icons.logo className="h-10 w-10 mx-auto" />
        <h2 className="text-lg font-bold">{t('home.title')}</h2>
        <p>123 App Lane, Dev City, 10101</p>
        {transactionDate && <p>{format(new Date(transactionDate), 'PPP p')}</p>}
        {cashierName && <p>{t('receipt.cashier')} {cashierName}</p>}
      </div>

      <hr className="my-2 border-dashed border-black" />

      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left">ITEM</th>
            <th className="text-center">QTY</th>
            <th className="text-right">PRICE</th>
          </tr>
        </thead>
        <tbody>
          {cartItems.map(item => {
            const isReturn = item.quantity < 0;
            return (
                 <tr key={item.id}>
                    <td className="text-left">{item.name}{isReturn ? ' (R)' : ''}</td>
                    <td className="text-center">{Math.abs(item.quantity)}</td>
                    <td className="text-right">{formatCurrency(item.price * item.quantity)}</td>
                </tr>
            )
          })}
        </tbody>
      </table>

      <hr className="my-2 border-dashed border-black" />

      <div className="flex justify-between font-bold">
        <span>TOTAL</span>
        <span>{formatCurrency(total)}</span>
      </div>

       <hr className="my-2 border-dashed border-black" />

       <div className="text-center mt-4">
        <p>{t('receipt.thank_you')}</p>
       </div>
    </div>
  );
});

Receipt.displayName = 'Receipt';
