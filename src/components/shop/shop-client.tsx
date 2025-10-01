'use client';

import { useState, useMemo } from 'react';
import { Product } from '@/lib/types';
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

type ShopClientProps = {
  initialProducts: Product[];
  categories: string[];
  brands: string[];
};

export function ShopClient({
  initialProducts,
  categories,
  brands,
}: ShopClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [cart, setCart] = useState<Map<string, number>>(new Map());
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const categoryMatch =
        categoryFilter === 'all' || product.category === categoryFilter;
      const brandMatch = brandFilter === 'all' || product.brand === brandFilter;
      return categoryMatch && brandMatch;
    });
  }, [products, categoryFilter, brandFilter]);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
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
      toast({ title: 'Success!', description: 'Transaction completed successfully.', className: 'bg-accent text-accent-foreground' });
      setCart(new Map());
      // Re-fetch products to update quantities, though revalidatePath should handle this
      // For instant client-side update:
      const updatedProducts = products.map(p => {
        if(cart.has(p.id)){
          return {...p, quantity: p.quantity - (cart.get(p.id) || 0)}
        }
        return p;
      })
      setProducts(updatedProducts);
    }
    setIsProcessing(false);
  };
  
  const cartItems = Array.from(cart.keys()).map(id => initialProducts.find(p => p.id === id)).filter(Boolean) as Product[];
  const totalItems = Array.from(cart.values()).reduce((sum, qty) => sum + Math.abs(qty), 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="flex gap-4 mb-6">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={brandFilter} onValueChange={setBrandFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by brand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brands</SelectItem>
              {brands.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                cartQuantity={cart.get(product.id) || 0}
                onQuantityChange={handleQuantityChange}
              />
            ))}
          </div>
        </ScrollArea>
      </div>

      <Card className="lg:col-span-1 h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.shop className="h-6 w-6" />
            Current Transaction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[40vh]">
            {cartItems.length > 0 ? (
              <ul className="space-y-4">
                {cartItems.map(item => (
                  <li key={item.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.brand}</p>
                    </div>
                     <Badge variant={ (cart.get(item.id) || 0) > 0 ? "default" : "destructive"}>
                      Qty: {cart.get(item.id)}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-10">Your cart is empty.</p>
            )}
          </ScrollArea>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
            <div className='w-full text-lg font-bold flex justify-between'>
                <span>Total Items:</span>
                <span>{totalItems}</span>
            </div>
          <Button onClick={handleValidate} disabled={isProcessing || cart.size === 0} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            {isProcessing ? <Icons.spinner className="animate-spin mr-2" /> : <Icons.checkCircle className="mr-2" />}
            Validate Transaction
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
