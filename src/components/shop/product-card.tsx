'use client';

import { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '../icons';
import { Badge } from '../ui/badge';

type ProductCardProps = {
  product: Product;
  cartQuantity: number;
  onQuantityChange: (productId: string, newQuantity: number) => void;
};

export function ProductCard({ product, cartQuantity, onQuantityChange }: ProductCardProps) {

  const handleIncrement = () => {
    onQuantityChange(product.id, cartQuantity + 1);
  };

  const handleDecrement = () => {
    onQuantityChange(product.id, cartQuantity - 1);
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">{product.name}</CardTitle>
        <CardDescription>{product.brand}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-2">
         <Badge variant="secondary">{product.category}</Badge>
        <p className="text-sm text-muted-foreground">In Stock: {product.quantity}</p>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleDecrement}>
            <Icons.minus className="h-4 w-4" />
          </Button>
          <span className="font-bold w-10 text-center text-lg">{cartQuantity}</span>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleIncrement}>
            <Icons.plus className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
