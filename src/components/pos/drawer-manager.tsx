
'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useCurrency } from "@/context/language-context";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";

export type DrawerState = {
    status: 'active' | 'inactive';
    startingCash: number;
    cashSales: number;
}

type DrawerManagerProps = {
    drawerState: DrawerState;
    onStartDrawer: (startingCash: number) => void;
    onEndDay: () => void;
    children: React.ReactNode;
}

export function DrawerManager({ drawerState, onStartDrawer, onEndDay, children }: DrawerManagerProps) {
    const [floatAmount, setFloatAmount] = useState('');
    const { formatCurrency } = useCurrency();

    const handleStart = () => {
        const amount = parseFloat(floatAmount);
        if (!isNaN(amount) && amount >= 0) {
            onStartDrawer(amount);
        }
    }

    if (drawerState.status === 'inactive') {
        return (
             <Dialog open={true} onOpenChange={() => {}}>
                <DialogContent className="sm:max-w-md" onInteractOutside={e => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>Start of Day</DialogTitle>
                        <DialogDescription>
                            Enter the starting cash amount in your drawer to begin your session.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="float-amount">Starting Cash (Float)</Label>
                            <Input
                                id="float-amount"
                                type="number"
                                placeholder="e.g. 100.00"
                                value={floatAmount}
                                onChange={(e) => setFloatAmount(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleStart} className="w-full">
                            Start Session
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <div className="h-full">
            {children}
            <div className="fixed bottom-4 left-4 z-50">
                <Card className="bg-card/80 backdrop-blur-sm">
                    <CardHeader className="p-3">
                        <CardTitle className="text-sm font-medium flex items-center justify-between">
                            <span>Cash Drawer</span>
                            <span className="text-green-500 font-mono">{formatCurrency(drawerState.startingCash + drawerState.cashSales)}</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                         <Button variant="destructive" size="sm" onClick={onEndDay} className="w-full">
                            End Day
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}


type EndOfDayDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    drawerState: DrawerState;
}

export function EndOfDayDialog({ isOpen, onClose, onConfirm, drawerState }: EndOfDayDialogProps) {
    const { formatCurrency } = useCurrency();
    const expectedCash = drawerState.startingCash + drawerState.cashSales;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>End of Day Summary</DialogTitle>
                    <DialogDescription>Review your cash drawer summary before closing the session.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <SummaryRow label="Starting Cash" value={formatCurrency(drawerState.startingCash)} />
                    <SummaryRow label="Total Cash Sales" value={formatCurrency(drawerState.cashSales)} />
                    <Separator />
                    <SummaryRow label="Expected in Drawer" value={formatCurrency(expectedCash)} isTotal />
                </div>
                <DialogFooter className="gap-2">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button variant="destructive" onClick={onConfirm}>Confirm & End Session</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function SummaryRow({ label, value, isTotal = false }: { label: string, value: string, isTotal?: boolean }) {
    return (
        <div className={`flex justify-between items-center ${isTotal ? 'text-lg font-bold' : 'text-sm'}`}>
            <span className={isTotal ? '' : 'text-muted-foreground'}>{label}</span>
            <span className={isTotal ? 'font-mono' : ''}>{value}</span>
        </div>
    )
}

    