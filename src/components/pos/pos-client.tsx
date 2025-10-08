
'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { SerializableProduct } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { processTransaction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Icons } from '../icons';
import { Separator } from '../ui/separator';
import { Input } from '../ui/input';
import { ProductGridItem } from './product-grid-item';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { BarcodeScanner } from './barcode-scanner';
import { ScanBarcode } from 'lucide-react';
import { Receipt, type CartItem as ReceiptCartItem } from './receipt';
import { ReceiptDialog } from './receipt-dialog';
import { useFullscreen } from '@/hooks/use-fullscreen';
import { useUser } from '@/context/user-context';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { useCurrency, useTranslation } from '@/context/language-context';
import { TenderCalculator } from './tender-calculator';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { DrawerManager, DrawerState, EndOfDayDialog } from './drawer-manager';

function TransactionPanel({
    cartItems,
    subtotal,
    tax,
    setTax,
    discount,
    setDiscount,
    totalAmount,
    handleValidate,
    isProcessing,
    cart,
    handleQuantityChange,
    handleClearCart,
    isReturnMode,
    setIsReturnMode,
}: {
    cartItems: SerializableProduct[];
    subtotal: number;
    tax: number;
    setTax: (tax: number) => void;
    discount: number;
    setDiscount: (discount: number) => void;
    totalAmount: number;
    handleValidate: () => void;
    isProcessing: boolean;
    cart: Map<string, number>;
    handleQuantityChange: (productId: string, change: number) => void;
    handleClearCart: () => void;
    isReturnMode: boolean;
    setIsReturnMode: (isReturn: boolean) => void;
}) {
    const { t } = useTranslation();
    const { formatCurrency } = useCurrency();

    return (
        <>
            <CardHeader>
                <CardTitle className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Icons.shoppingCart className="h-7 w-7" />
                        <span className="text-2xl">{t('transaction.title')}</span>
                    </div>
                     <div className="flex items-center space-x-2">
                        <Label htmlFor="return-mode" className={`text-sm font-medium ${isReturnMode ? 'text-destructive' : 'text-muted-foreground'}`}>{t('transaction.returns')}</Label>
                        <Switch id="return-mode" checked={isReturnMode} onCheckedChange={setIsReturnMode} />
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow p-0 flex flex-col">
                <ScrollArea className="flex-1 p-6">
                        {cartItems.length > 0 ? (
                            <ul className="space-y-4">
                                {cartItems.map(item => {
                                    const quantity = cart.get(item.id) || 0;
                                    const isReturn = quantity < 0;
                                    return (
                                        <li key={item.id} className="flex justify-between items-center text-sm">
                                            <div>
                                                <p className="font-semibold">{item.name}</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-muted-foreground">{formatCurrency(item.price)}</p>
                                                    {isReturn && <Badge variant="destructive" className="h-5">{t('transaction.returns')}</Badge>}
                                                </div>
                                            </div>
                                            <div className='flex items-center gap-2'>
                                                <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleQuantityChange(item.id, -1)}>
                                                    <Icons.minus className="h-3 w-3" />
                                                </Button>
                                                <Badge variant={quantity > 0 ? "secondary" : "destructive"} className="w-10 justify-center text-base">
                                                    {Math.abs(quantity)}
                                                </Badge>
                                                <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleQuantityChange(item.id, 1)}>
                                                    <Icons.plus className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </li>
                                    )
                                })}
                            </ul>
                        ) : (
                            <div className="text-muted-foreground text-center h-full flex flex-col justify-center items-center">
                                <Icons.shop className="h-12 w-12 mb-4" />
                                <p>{t('transaction.pos_start_prompt')}</p>
                            </div>
                        )}
                </ScrollArea>
            </CardContent>
            <Separator />
            <CardFooter className="flex flex-col gap-4 p-4 mt-auto">
                 <div className="w-full flex flex-col gap-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{formatCurrency(subtotal)}</span>
                    </div>
                     <div className="flex items-center justify-between">
                        <Label htmlFor="tax-input" className="text-muted-foreground">Tax (%)</Label>
                        <Input
                            id="tax-input"
                            type="number"
                            value={tax}
                            onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                            className="h-8 w-20 text-right"
                            placeholder="0"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="discount-input" className="text-muted-foreground">Discount</Label>
                        <Input
                            id="discount-input"
                            type="number"
                            value={discount}
                            onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                            className="h-8 w-20 text-right"
                            placeholder="0.00"
                        />
                    </div>
                </div>
                <Separator />
                <div className='w-full text-2xl font-bold flex justify-between items-center'>
                    <span>{t('transaction.total')}</span>
                    <span>{formatCurrency(totalAmount)}</span>
                </div>
                 <Button variant="ghost" size="sm" onClick={handleClearCart} disabled={cart.size === 0} className="w-full text-destructive hover:text-destructive">
                    <Icons.trash className='h-4 w-4 mr-2' />
                    Clear Cart
                </Button>
                <Button onClick={handleValidate} disabled={isProcessing || cart.size === 0} size="lg" className="w-full text-primary hover:bg-primary/90 text-primary-foreground">
                    {isProcessing ? <Icons.spinner className="animate-spin mr-2" /> : <Icons.checkCircle className="mr-2" />}
                    {t('transaction.validate')}
                </Button>
            </CardFooter>
        </>
    );
}

type PosClientProps = {
    initialProducts: SerializableProduct[];
    categories: string[];
    brands: string[];
}

export function PosClient({
  initialProducts,
}: PosClientProps) {
  const [products, setProducts] = useState<SerializableProduct[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<Map<string, number>>(new Map());
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isTenderOpen, setIsTenderOpen] = useState(false);
  const { toast } = useToast();
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const { user } = useUser();
  const { t } = useTranslation();
  const [isReturnMode, setIsReturnMode] = useState(false);
  
  const [drawerState, setDrawerState] = useState<DrawerState>(() => {
      if (typeof window !== 'undefined') {
        const savedState = sessionStorage.getItem('drawerState');
        if (savedState) {
            return JSON.parse(savedState);
        }
      }
      return { status: 'inactive', startingCash: 0, cashSales: 0 };
  });

  const [isEndOfDayOpen, setIsEndOfDayOpen] = useState(false);


  const [lastTransaction, setLastTransaction] = useState<{
    cartItems: ReceiptCartItem[];
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    total: number;
    transactionDate: string;
    cashierName?: string;
  } | null>(null);

  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        sessionStorage.setItem('drawerState', JSON.stringify(drawerState));
    }
  }, [drawerState]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    const lowercasedTerm = searchTerm.toLowerCase();
    return products.filter((product) =>
      product.name.toLowerCase().includes(lowercasedTerm) ||
      product.brand.toLowerCase().includes(lowercasedTerm) ||
      product.barcode?.toLowerCase().includes(lowercasedTerm)
    );
  }, [products, searchTerm]);

  const handleAddToCart = (productId: string) => {
    const change = isReturnMode ? -1 : 1;
    handleQuantityChange(productId, change);
  };

  const handleQuantityChange = (productId: string, change: number) => {
    setCart((prevCart) => {
      const newCart = new Map(prevCart);
      const currentQty = newCart.get(productId) || 0;
      let newQuantity = currentQty + change;
      
      const product = initialProducts.find(p => p.id === productId);
      if (!product) return newCart;

      // When not in return mode, prevent selling more than available in shop
      if (change > 0 && !isReturnMode && newQuantity > product.shopQuantity) {
        toast({
          title: "Not enough stock",
          description: `Only ${product.shopQuantity} units of ${product.name} available in shop.`,
          variant: "destructive",
        });
        return newCart;
      }
      
      if (newQuantity === 0) {
        newCart.delete(productId);
      } else {
        newCart.set(productId, newQuantity);
      }
      return newCart;
    });
  };

  const handleClearCart = () => {
    setCart(new Map());
    setTax(0);
    setDiscount(0);
  }

  const handleValidate = () => {
    if (cart.size === 0) {
      toast({ title: t('transaction.cart_is_empty'), description: t('transaction.add_items_to_proceed'), variant: "destructive"});
      return;
    }
    if (!user) {
        toast({ title: t('general.not_authenticated'), description: t('general.must_be_logged_in'), variant: "destructive"});
        return;
    }
    setIsTenderOpen(true);
  };
  
  const handleProcessTransaction = (tenderedAmount: number) => {
    setIsProcessing(true);
    setIsTenderOpen(false);
    const cartObject = Object.fromEntries(cart);

    processTransaction(cartObject, user!).then(result => {
        if (result.error) {
            toast({ title: t('transaction.failed'), description: result.error, variant: 'destructive' });
        } else {
            toast({ title: t('general.success'), description: t('transaction.success'), className: 'bg-green-600 text-white' });
            
            // For a sale, cash change is totalAmount.
            // For a return, cash change is totalAmount (which is negative).
            const cashChange = totalAmount;

            setDrawerState(prev => ({
                ...prev,
                cashSales: prev.cashSales + cashChange,
            }));

            const completedCartItems: ReceiptCartItem[] = Array.from(cart.keys()).map(id => {
                const product = initialProducts.find(p => p.id === id);
                return {
                    id: id,
                    name: product?.name || 'Unknown',
                    quantity: cart.get(id) || 0,
                    price: product?.price || 0
                }
            }).filter(Boolean) as ReceiptCartItem[];

            setLastTransaction({
                cartItems: completedCartItems,
                subtotal: subtotal,
                taxAmount: taxAmount,
                discountAmount: discountAmount,
                total: totalAmount,
                transactionDate: new Date().toISOString(),
                cashierName: user.name,
            });

            handleClearCart();
            setIsReturnMode(false);
        }
    }).finally(() => {
        setIsProcessing(false);
    });
  }

  const cartItems = Array.from(cart.keys()).map(id => initialProducts.find(p => p.id === id)).filter(Boolean) as SerializableProduct[];
  
  const { subtotal, taxAmount, discountAmount, totalAmount } = useMemo(() => {
    const subtotal = cartItems.reduce((acc, item) => {
      const quantity = cart.get(item.id) || 0;
      return acc + (item.price * quantity);
    }, 0);

    const taxAmount = (subtotal * tax) / 100;
    const discountAmount = discount;
    const totalAmount = subtotal + taxAmount - discountAmount;

    return { subtotal, taxAmount, discountAmount, totalAmount };
  }, [cart, cartItems, tax, discount]);

  const totalItemsInCart = useMemo(() => {
    return Array.from(cart.values()).reduce((sum, qty) => sum + Math.abs(qty), 0);
  }, [cart]);


  const onBarcodeScanned = (barcode: string) => {
    const product = initialProducts.find(p => p.barcode === barcode);
    if (product) {
      handleAddToCart(product.id);
      toast({
        title: t('pos.product_added'),
        description: t('pos.product_added_desc', {name: product.name}),
      });
    } else {
      toast({
        title: t('pos.product_not_found'),
        description: t('pos.product_not_found_desc', {barcode}),
        variant: 'destructive',
      })
    }
    setIsScannerOpen(false);
  }

  const closeReceiptDialog = () => {
    setLastTransaction(null);
  }

  const transactionPanelProps = {
    cartItems,
    subtotal,
    tax,
    setTax,
    discount,
    setDiscount,
    totalAmount,
    handleValidate,
    isProcessing,
    cart,
    handleQuantityChange,
    handleClearCart,
    isReturnMode,
    setIsReturnMode
  };

  const handleStartDrawer = (startingCash: number) => {
    setDrawerState({
        status: 'active',
        startingCash,
        cashSales: 0,
    });
  };

  const handleEndDay = () => {
    setIsEndOfDayOpen(true);
  };
  
  const handleConfirmEndDay = () => {
    setDrawerState({
        status: 'inactive',
        startingCash: 0,
        cashSales: 0,
    });
    sessionStorage.removeItem('drawerState');
    setIsEndOfDayOpen(false);
  };

  return (
    <>
    <DrawerManager
        drawerState={drawerState}
        onStartDrawer={handleStartDrawer}
        onEndDay={handleEndDay}
    >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-full">
        <div className="md:col-span-2 h-full flex flex-col">
            <div className="mb-6 flex gap-2">
                <Input 
                    placeholder={t('pos.search_placeholder')}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="text-base flex-1"
                />
                <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                    <ScanBarcode className="h-6 w-6" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                    <DialogTitle>{t('product_form.scan_barcode')}</DialogTitle>
                    </DialogHeader>
                    <BarcodeScanner
                    onScan={onBarcodeScanned}
                    onClose={() => setIsScannerOpen(false)}
                    />
                </DialogContent>
                </Dialog>
                <Button 
                    onClick={toggleFullscreen} 
                    variant="outline" 
                    size="icon" 
                >
                    <Icons.fullscreen className="h-5 w-5" />
                </Button>
            </div>
            <ScrollArea className="flex-grow pr-4 -mr-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredProducts.map((product) => (
                <ProductGridItem
                    key={product.id}
                    product={product}
                    onAddToCart={() => handleAddToCart(product.id)}
                />
                ))}
                {filteredProducts.length === 0 && (
                <div className="col-span-full text-center py-16 text-muted-foreground">
                    <Icons.stock className="mx-auto h-12 w-12" />
                    <p className="mt-4">{t('pos.no_products_found')}</p>
                </div>
                )}
            </div>
            </ScrollArea>
        </div>

        <Card className="rounded-lg border bg-card text-card-foreground shadow-sm lg:col-span-1 h-fit sticky top-8 hidden lg:flex lg:flex-col">
            <TransactionPanel {...transactionPanelProps} />
        </Card>
        </div>
    </DrawerManager>
    
    {/* Mobile Floating Cart Button & Sheet */}
    <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <Sheet>
            <SheetTrigger asChild>
                <Button size="icon" className="relative h-16 w-16 rounded-full shadow-lg">
                    <Icons.shoppingCart className="h-8 w-8" />
                    {totalItemsInCart > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-6 w-6 justify-center rounded-full text-base">
                            {totalItemsInCart}
                        </Badge>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="flex flex-col h-[90vh]">
                 <TransactionPanel {...transactionPanelProps} />
            </SheetContent>
        </Sheet>
    </div>
    
    {lastTransaction && (
      <ReceiptDialog
        isOpen={!!lastTransaction}
        onClose={closeReceiptDialog}
        transaction={lastTransaction}
      />
    )}

    {isTenderOpen && (
      <TenderCalculator 
        isOpen={isTenderOpen}
        onClose={() => setIsTenderOpen(false)}
        subtotal={subtotal}
        taxAmount={taxAmount}
        discountAmount={discountAmount}
        totalAmount={totalAmount}
        onConfirm={handleProcessTransaction}
      />
    )}

    <EndOfDayDialog
        isOpen={isEndOfDayOpen}
        onClose={() => setIsEndOfDayOpen(false)}
        onConfirm={handleConfirmEndDay}
        drawerState={drawerState}
    />
    
    <div className="hidden">
        {/* This is kept for print styling purposes, the actual visible receipt is in the dialog */}
        {lastTransaction && <Receipt ref={receiptRef} {...lastTransaction} />}
    </div>
    </>
  );
}
