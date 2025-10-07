
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
import { ReceiptPreview } from './receipt-preview';
import { type SerializableProduct } from '@/lib/types';
import { useCurrency } from '@/context/language-context';

type TenderCalculatorProps = {
    isOpen: boolean;
    onClose: () => void;
    cartItems: SerializableProduct[];
    totalAmount: number;
    onConfirm: () => void;
}

export function TenderCalculator({
    isOpen,
    onClose,
    cartItems,
    totalAmount,
    onConfirm
}: TenderCalculatorProps) {
    const [tenderedAmount, setTenderedAmount] = useState('0.00');
    const { currency, formatCurrency } = useCurrency();

    const changeDue = useMemo(() => {
        const tendered = parseFloat(tenderedAmount);
        if (isNaN(tendered) || tendered < totalAmount) {
            return 0;
        }
        return tendered - totalAmount;
    }, [tenderedAmount, totalAmount]);
    
    const canConfirm = parseFloat(tenderedAmount) >= totalAmount;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl grid-cols-2 p-0 gap-0">
                {/* Left Side: Numpad and Calculation */}
                <div className="p-6 flex flex-col justify-between">
                    <DialogHeader>
                        <DialogTitle className="text-3xl">Tender</DialogTitle>
                        <DialogDescription>
                            Enter the amount of cash received from the customer.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 text-center my-8">
                        <div className="space-y-1">
                            <p className="text-muted-foreground">Amount Tendered</p>
                            <p className="text-5xl font-bold font-mono tracking-tighter h-14">
                                {formatCurrency(parseFloat(tenderedAmount))}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-muted-foreground">Change Due</p>
                             <p className="text-6xl font-bold font-mono tracking-tighter text-green-400 h-16">
                                {formatCurrency(changeDue)}
                            </p>
                        </div>
                    </div>

                    <Numpad value={tenderedAmount} onChange={setTenderedAmount} />
                </div>
                
                {/* Right Side: Receipt Preview and Actions */}
                <div className="bg-muted/30 p-6 flex flex-col justify-between rounded-r-lg">
                    <div className="flex-1">
                       <h3 className="text-xl font-semibold mb-4">Cart Summary</h3>
                       <ReceiptPreview cartItems={cartItems} total={totalAmount} />
                    </div>
                    <DialogFooter className="gap-2 sm:justify-end mt-6">
                        <Button variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button 
                            onClick={onConfirm}
                            disabled={!canConfirm}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            Confirm Transaction
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    )
}
