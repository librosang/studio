
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Receipt, type CartItem } from './receipt';
import { useRef } from 'react';
import { Icons } from '../icons';
import { useTranslation } from '@/context/language-context';

type ReceiptDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  transaction: {
    cartItems: CartItem[];
    total: number;
    transactionDate: string;
    cashierName?: string;
  };
};

export function ReceiptDialog({ isOpen, onClose, transaction }: ReceiptDialogProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{t('receipt.title')}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
            <div className="mx-auto w-[300px] border rounded-sm">
                <Receipt ref={receiptRef} {...transaction} />
            </div>
        </div>
        <DialogFooter className="sm:justify-between gap-2">
           <DialogClose asChild>
            <Button type="button" variant="secondary">
                {t('receipt.close')}
            </Button>
          </DialogClose>
          <Button onClick={handlePrint}>
            <Icons.sale className="mr-2 h-4 w-4" />
            {t('receipt.print')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
