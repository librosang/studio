
'use client';
import React, { forwardRef } from 'react';
import { format } from 'date-fns';
import { Icons } from '../icons';

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

const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

export const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(({ cartItems, total, transactionDate, cashierName }, ref) => {
  return (
    <div id="receipt-print" ref={ref} className="bg-white text-black text-xs font-mono p-2" style={{ width: '300px' }}>
      <div className="text-center">
        <Icons.logo className="h-10 w-10 mx-auto" />
        <h2 className="text-lg font-bold">StockFlow</h2>
        <p>123 App Lane, Dev City, 10101</p>
        {transactionDate && <p>{format(new Date(transactionDate), 'PPP p')}</p>}
        {cashierName && <p>Cashier: {cashierName}</p>}
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
          {cartItems.map(item => (
            <tr key={item.id}>
              <td className="text-left">{item.name}</td>
              <td className="text-center">{item.quantity}</td>
              <td className="text-right">{currencyFormatter.format(item.price * item.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr className="my-2 border-dashed border-black" />

      <div className="flex justify-between font-bold">
        <span>TOTAL</span>
        <span>{currencyFormatter.format(total)}</span>
      </div>

       <hr className="my-2 border-dashed border-black" />

       <div className="text-center mt-4">
        <p>Thank you for your purchase!</p>
       </div>
    </div>
  );
});

Receipt.displayName = 'Receipt';
