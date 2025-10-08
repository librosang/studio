
'use client';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
  } from '@/components/ui/dialog';
import { Button } from '../ui/button';
import { useState, useMemo } from 'react';
import { Numpad } from './numpad';
import { useCurrency, useTranslation } from '@/context/language-context';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';

type TenderCalculatorProps = {
    isOpen: boolean;
    onClose: () => void;
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    onConfirm: (tenderedAmount: number) => void;
}

export function TenderCalculator({
    isOpen,
    onClose,
    subtotal,
    taxAmount,
    discountAmount,
    totalAmount,
    onConfirm
}: TenderCalculatorProps) {
    const [tenderedString, setTenderedString] = useState('0');
    const { formatCurrency } = useCurrency();
    const { t } = useTranslation();

    const tenderedValue = parseFloat(tenderedString) || 0;

    const changeDue = useMemo(() => {
        if (tenderedValue < totalAmount) {
            return 0;
        }
        return tenderedValue - totalAmount;
    }, [tenderedValue, totalAmount]);
    
    const canConfirm = tenderedValue >= totalAmount;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl p-0 gap-0" onInteractOutside={(e) => e.preventDefault()}>
              <ScrollArea className="max-h-[90vh]">
                <div className="grid grid-cols-1 md:grid-cols-2">
                    {/* Left Side: Numpad and Calculation */}
                    <div className="p-6 flex flex-col justify-between">
                        <DialogHeader>
                            <DialogTitle className="text-3xl">{t('transaction.validate')}</DialogTitle>
                            <DialogDescription>
                                Enter the amount of cash received from the customer.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-2 text-center my-6">
                            <div className="text-lg">
                                <div className="flex justify-between text-muted-foreground">
                                    <span>{t('transaction.sales')}</span>
                                    <span>{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>{t('product_form.tax')}</span>
                                    <span>{formatCurrency(taxAmount)}</span>
                                </div>
                                {discountAmount > 0 && <div className="flex justify-between text-muted-foreground">
                                    <span>{t('product_form.discount')}</span>
                                    <span>-{formatCurrency(discountAmount)}</span>
                                </div>}
                            </div>
                            <Separator />
                            <div className="space-y-1 pt-2">
                                <p className="text-muted-foreground">{t('transaction.total')}</p>
                                <p className="text-4xl font-bold font-mono tracking-tighter h-12">
                                    {formatCurrency(totalAmount)}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-muted-foreground">Amount Tendered</p>
                                <p className="text-5xl font-bold font-mono tracking-tighter h-14">
                                    {formatCurrency(tenderedValue)}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-muted-foreground">Change Due</p>
                                <p className="text-6xl font-bold font-mono tracking-tighter text-green-400 h-16">
                                    {formatCurrency(changeDue)}
                                </p>
                            </div>
                        </div>

                    </div>
                    
                    {/* Right Side: Actions */}
                    <div className="bg-muted/30 p-6 flex flex-col justify-between md:rounded-r-lg">
                        <Numpad value={tenderedString} onChange={setTenderedString} />
                        <DialogFooter className="gap-2 flex-col sm:justify-end mt-8">
                            <Button 
                                onClick={() => onConfirm(tenderedValue)}
                                disabled={!canConfirm}
                                className="bg-green-600 hover:bg-green-700 h-16 text-lg"
                            >
                                {t('transaction.validate')}
                            </Button>
                            <Button variant="ghost" onClick={onClose} className="h-12">{t('data_table.cancel')}</Button>
                        </DialogFooter>
                    </div>
                </div>
              </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
