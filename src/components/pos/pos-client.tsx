
'use client';

import { useState, useMemo, useRef } from 'react';
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
import { useFullscreen } from '@/app/(app)/layout';
import { cn } from '@/lib/utils';

type PosClientProps = {
  initialProducts: SerializableProduct[];
  categories: string[];
  brands: string[];
};

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export function PosClient({
  initialProducts,
}: PosClientProps) {
  const [products, setProducts] = useState<SerializableProduct[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<Map<string, number>>(new Map());
  const [isProcessing, setIsProcessing] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const { toast } = useToast();
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  const [lastTransaction, setLastTransaction] = useState<{
    cartItems: ReceiptCartItem[];
    total: number;
    transactionDate: string;
  } | null>(null);

  const receiptRef = useRef<HTMLDivElement>(null);


  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    const lowercasedTerm = searchTerm.toLowerCase();
    return products.filter((product) =>
      product.name.toLowerCase().includes(lowercasedTerm) ||
      product.brand.toLowerCase().includes(lowercasedTerm) ||
      product.barcode?.toLowerCase().includes(lowercasedTerm)
    );
  }, [products, searchTerm]);

  const handleQuantityChange = (productId: string, change: number) => {
    setCart((prevCart) => {
      const newCart = new Map(prevCart);
      const currentQty = newCart.get(productId) || 0;
      const newQuantity = currentQty + change;
      
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
  }

  const handleValidate = async () => {
    if (cart.size === 0) {
      toast({ title: "Cart is empty", description: "Add items to the cart to proceed.", variant: "destructive"});
      return;
    }
    
    setIsProcessing(true);
    const cartObject = Object.fromEntries(cart);
    
    const result = await processTransaction(cartObject);

    if (result.error) {
      toast({ title: 'Transaction Failed', description: result.error, variant: 'destructive' });
    } else {
      toast({ title: 'Success!', description: 'Transaction completed successfully.', className: 'bg-green-600 text-white' });
      
      const completedCartItems: ReceiptCartItem[] = Array.from(cart.keys()).map(id => {
        const product = initialProducts.find(p => p.id === id);
        return {
            id: id,
            name: product?.name || 'Unknown',
            quantity: cart.get(id) || 0,
            price: product?.price || 0
        }
      }).filter(Boolean);

      setLastTransaction({
        cartItems: completedCartItems,
        total: totalAmount,
        transactionDate: new Date().toISOString()
      });

      const updatedProducts = products.map(p => {
        if(cart.has(p.id)){
          return {...p, quantity: p.quantity - (cart.get(p.id) || 0)}
        }
        return p;
      })
      setProducts(updatedProducts);
      setCart(new Map());
    }
    setIsProcessing(false);
  };
  
  const cartItems = Array.from(cart.keys()).map(id => initialProducts.find(p => p.id === id)).filter(Boolean) as SerializableProduct[];
  
  const totalAmount = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const quantity = cart.get(item.id) || 0;
      return acc + (item.price * quantity);
    }, 0);
  }, [cart, cartItems]);


  const onBarcodeScanned = (barcode: string) => {
    const product = initialProducts.find(p => p.barcode === barcode);
    if (product) {
      handleQuantityChange(product.id, 1);
      toast({
        title: 'Product Added',
        description: `${product.name} has been added to the cart.`,
      });
    } else {
      toast({
        title: 'Product not found',
        description: `No product with barcode "${barcode}" was found.`,
        variant: 'destructive',
      })
    }
    setIsScannerOpen(false);
  }

  const closeReceiptDialog = () => {
    setLastTransaction(null);
  }

  return (
    <>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-full">
      <div className="md:col-span-2 h-full flex flex-col">
        <div className="mb-6 flex gap-2">
            <Input 
                placeholder='Search products by name, brand, or barcode...'
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
                  <DialogTitle>Scan Barcode</DialogTitle>
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
                onAddToCart={() => handleQuantityChange(product.id, 1)}
              />
            ))}
             {filteredProducts.length === 0 && (
              <div className="col-span-full text-center py-16 text-muted-foreground">
                <Icons.stock className="mx-auto h-12 w-12" />
                <p className="mt-4">No products found.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <Card className="md:col-span-1 h-screen flex flex-col sticky top-0">
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
                <Icons.shoppingCart className="h-7 w-7" />
                <span className="text-2xl">Transaction</span>
            </div>
             <Button variant="ghost" size="icon" onClick={handleClearCart} disabled={cart.size === 0}>
                <Icons.trash className='h-5 w-5 text-destructive'/>
             </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow p-0 flex flex-col">
            <div className="h-full p-6">
                 <ScrollArea className="h-full pr-3 -mr-3">
                    {cartItems.length > 0 ? (
                    <ul className="space-y-4">
                        {cartItems.map(item => {
                            const quantity = cart.get(item.id) || 0;
                            return (
                                <li key={item.id} className="flex justify-between items-center text-sm">
                                    <div>
                                    <p className="font-semibold">{item.name}</p>
                                    <p className="text-muted-foreground">{currencyFormatter.format(item.price)}</p>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleQuantityChange(item.id, -1)}>
                                            <Icons.minus className="h-3 w-3" />
                                        </Button>
                                        <Badge variant={ quantity > 0 ? "secondary" : "destructive"} className="w-10 justify-center text-base">
                                            {quantity}
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
                        <p>Click on a product to start.</p>
                    </div>
                    )}
                </ScrollArea>
            </div>
        </CardContent>
        <Separator/>
        <CardFooter className="flex flex-col gap-4 p-4 mt-auto">
             <div className='w-full text-2xl font-bold flex justify-between items-center'>
                <span>Total:</span>
                <span>{currencyFormatter.format(totalAmount)}</span>
            </div>
          <Button onClick={handleValidate} disabled={isProcessing || cart.size === 0} size="lg" className="w-full text-lg bg-primary hover:bg-primary/90 text-primary-foreground mt-2">
            {isProcessing ? <Icons.spinner className="animate-spin mr-2" /> : <Icons.checkCircle className="mr-2" />}
            Validate Transaction
          </Button>
        </CardFooter>
      </Card>
    </div>
    
    {lastTransaction && (
      <ReceiptDialog
        isOpen={!!lastTransaction}
        onClose={closeReceiptDialog}
        transaction={lastTransaction}
      />
    )}
    
    <div className="hidden">
        {/* This is kept for print styling purposes, the actual visible receipt is in the dialog */}
        <Receipt ref={receiptRef} cartItems={lastTransaction?.cartItems || []} total={lastTransaction?.total || 0} transactionDate={lastTransaction?.transactionDate || ''} />
    </div>
    </>
  );
}
