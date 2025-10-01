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
import { Separator } from '../ui/separator';

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
      toast({ title: 'Success!', description: 'Transaction completed successfully.', className: 'bg-green-600 text-white' });
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
  const salesCount = Array.from(cart.values()).filter(q => q > 0).reduce((sum, q) => sum + q, 0);
  const returnsCount = Array.from(cart.values()).filter(q => q < 0).reduce((sum, q) => sum + q, 0);


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[200px] bg-card">
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
            <SelectTrigger className="w-full sm:w-[200px] bg-card">
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
                <p className="mt-4">No products match the current filters.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <Card className="lg:col-span-1 h-fit sticky top-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Icons.shoppingCart className="h-7 w-7" />
            <span className="text-2xl">Current Transaction</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[35vh] md:h-[40vh] pr-3 -mr-3">
            {cartItems.length > 0 ? (
              <ul className="space-y-4">
                {cartItems.map(item => (
                  <li key={item.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.brand}</p>
                    </div>
                     <Badge variant={ (cart.get(item.id) || 0) > 0 ? "secondary" : "destructive"}>
                      Qty: {cart.get(item.id)}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-muted-foreground text-center py-10 h-full flex flex-col justify-center items-center">
                <Icons.shop className="h-12 w-12 mb-4" />
                <p>Your cart is empty.</p>
                <p className="text-sm">Add products from the list.</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
        <Separator/>
        <CardFooter className="flex flex-col gap-4 text-sm p-4">
            <div className='w-full flex justify-between items-center'>
                <span className="text-muted-foreground">Sales</span>
                <span className="font-semibold">{salesCount} items</span>
            </div>
            <div className='w-full flex justify-between items-center'>
                <span className="text-muted-foreground">Returns</span>
                <span className="font-semibold">{Math.abs(returnsCount)} items</span>
            </div>
             <Separator/>
             <div className='w-full text-lg font-bold flex justify-between items-center mt-2'>
                <span>Total Items:</span>
                <span>{totalItems}</span>
            </div>
          <Button onClick={handleValidate} disabled={isProcessing || cart.size === 0} size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-4">
            {isProcessing ? <Icons.spinner className="animate-spin mr-2" /> : <Icons.checkCircle className="mr-2" />}
            Validate Transaction
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
