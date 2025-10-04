
'use client';

import { useState, useMemo } from 'react';
import { SerializableProduct } from '@/lib/types';
import { ProductCard } from './product-card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { processTransaction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Icons } from '../icons';
import { Separator } from '../ui/separator';
import { useUser } from '@/context/user-context';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { useTranslation } from '@/context/language-context';

type ShopClientProps = {
  initialProducts: SerializableProduct[];
  categories: string[];
  brands: string[];
};

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

function TransactionPanel({
    cartItems,
    totalAmount,
    salesCount,
    returnsCount,
    handleValidate,
    isProcessing,
    cart,
}: {
    cartItems: SerializableProduct[];
    totalAmount: number;
    salesCount: number;
    returnsCount: number;
    handleValidate: () => void;
    isProcessing: boolean;
    cart: Map<string, number>;
}) {
    const { t } = useTranslation();
    return (
        <>
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <Icons.shoppingCart className="h-7 w-7" />
                    <span className="text-2xl">{t('transaction.title')}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
                <ScrollArea className="h-full pr-3 -mr-3">
                    {cartItems.length > 0 ? (
                        <ul className="space-y-4">
                            {cartItems.map(item => (
                                <li key={item.id} className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">{item.name}</p>
                                        <p className="text-sm text-muted-foreground">{currencyFormatter.format(item.price)}</p>
                                    </div>
                                    <Badge variant={(cart.get(item.id) || 0) > 0 ? "secondary" : "destructive"}>
                                        Qty: {cart.get(item.id)}
                                    </Badge>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-muted-foreground text-center h-full flex flex-col justify-center items-center">
                            <Icons.shop className="h-12 w-12 mb-4" />
                            <p>{t('transaction.cart_empty')}</p>
                            <p className="text-sm">{t('transaction.add_products_prompt')}</p>
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
            <Separator />
            <CardFooter className="flex flex-col gap-4 text-sm p-4">
                <div className='w-full flex justify-between items-center'>
                    <span className="text-muted-foreground">{t('transaction.sales')}</span>
                    <span className="font-semibold">{salesCount} {t('transaction.items')}</span>
                </div>
                <div className='w-full flex justify-between items-center'>
                    <span className="text-muted-foreground">{t('transaction.returns')}</span>
                    <span className="font-semibold">{Math.abs(returnsCount)} {t('transaction.items')}</span>
                </div>
                <Separator />
                <div className='w-full text-lg font-bold flex justify-between items-center mt-2'>
                    <span>{t('transaction.total')}</span>
                    <span>{currencyFormatter.format(totalAmount)}</span>
                </div>
                <Button onClick={handleValidate} disabled={isProcessing || cart.size === 0} size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-4">
                    {isProcessing ? <Icons.spinner className="animate-spin mr-2" /> : <Icons.checkCircle className="mr-2" />}
                    {t('transaction.validate')}
                </Button>
            </CardFooter>
        </>
    );
}

export function ShopClient({
  initialProducts,
  categories,
  brands,
}: ShopClientProps) {
  const [products, setProducts] = useState<SerializableProduct[]>(initialProducts);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [cart, setCart] = useState<Map<string, number>>(new Map());
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const { t } = useTranslation();

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const categoryMatch =
        categoryFilter === 'all' || product.category === categoryFilter;
      const brandMatch = brandFilter === 'all' || product.brand === brandFilter;
      return categoryMatch && brandMatch;
    });
  }, [products, categoryFilter, brandFilter]);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Prevent selling more than available in shop
    if (newQuantity > 0 && newQuantity > product.shopQuantity) {
        toast({
            title: "Not enough stock",
            description: `Only ${product.shopQuantity} units of ${product.name} available in shop.`,
            variant: "destructive",
        });
        return;
    }

    setCart((prevCart) => {
      const newCart = new Map(prevCart);
      if (newQuantity === 0) {
        newCart.delete(productId);
      } else {
        newCart.set(productId, newQuantity);
      }
      return newCart;
    });
  };

  const handleValidate = () => {
    if (cart.size === 0) {
      toast({ title: t('transaction.cart_is_empty'), description: t('transaction.add_items_to_proceed'), variant: "destructive"});
      return;
    }
    if (!user) {
      toast({ title: t('general.not_authenticated'), description: t('general.must_be_logged_in'), variant: "destructive"});
      return;
    }
    
    setIsProcessing(true);
    const cartObject = Object.fromEntries(cart);
    
    processTransaction(cartObject, user).then(result => {
        if (result.error) {
            toast({ title: t('transaction.failed'), description: result.error, variant: 'destructive' });
        } else {
            toast({ title: t('general.success'), description: t('transaction.success'), className: 'bg-green-600 text-white' });
            setCart(new Map());
            // Data will be updated by the realtime listener, no need to manually update state
        }
    }).finally(() => {
        setIsProcessing(false);
    });
  };
  
  const cartItems = Array.from(cart.keys()).map(id => initialProducts.find(p => p.id === id)).filter(Boolean) as SerializableProduct[];
  const totalItems = Array.from(cart.values()).reduce((sum, qty) => sum + Math.abs(qty), 0);
  const salesCount = Array.from(cart.values()).filter(q => q > 0).reduce((sum, q) => sum + q, 0);
  const returnsCount = Array.from(cart.values()).filter(q => q < 0).reduce((sum, q) => sum + q, 0);

  const totalAmount = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const quantity = cart.get(item.id) || 0;
      return acc + (item.price * quantity);
    }, 0);
  }, [cart, cartItems]);

  const transactionPanelProps = {
    cartItems,
    totalAmount,
    salesCount,
    returnsCount,
    handleValidate,
    isProcessing,
    cart,
  };


  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[200px] bg-card">
                <SelectValue placeholder={t('shop.filter_category')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('shop.all_categories')}</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={brandFilter} onValueChange={setBrandFilter}>
              <SelectTrigger className="w-full sm:w-[200px] bg-card">
                <SelectValue placeholder={t('shop.filter_brand')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('shop.all_brands')}</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <ScrollArea className="h-[70vh] pr-4 -mr-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  cartQuantity={cart.get(product.id) || 0}
                  onQuantityChange={handleQuantityChange}
                />
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-full text-center py-16 text-muted-foreground">
                  <Icons.stock className="mx-auto h-12 w-12" />
                  <p className="mt-4">{t('shop.no_products_match')}</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Desktop Transaction Panel */}
        <Card className="lg:col-span-1 h-fit sticky top-8 hidden lg:flex lg:flex-col">
            <TransactionPanel {...transactionPanelProps} />
        </Card>
      </div>

       {/* Mobile Floating Cart Button & Sheet */}
       <div className="lg:hidden fixed bottom-4 right-4 z-50">
           <Sheet>
                <SheetTrigger asChild>
                    <Button size="icon" className="relative h-16 w-16 rounded-full shadow-lg">
                        <Icons.shoppingCart className="h-8 w-8" />
                        {totalItems > 0 && (
                            <Badge className="absolute -top-1 -right-1 h-6 w-6 justify-center rounded-full text-base">
                                {totalItems}
                            </Badge>
                        )}
                    </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="flex flex-col h-[90vh]">
                     <TransactionPanel {...transactionPanelProps} />
                </SheetContent>
            </Sheet>
       </div>
    </>
  );
}
