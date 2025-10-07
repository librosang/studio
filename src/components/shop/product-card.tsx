
'use client';

import { Product, SerializableProduct } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '../icons';
import { Badge } from '../ui/badge';
import Image from 'next/image';
import { useCurrency } from '@/context/language-context';

type ProductCardProps = {
  product: SerializableProduct;
  cartQuantity: number;
  onQuantityChange: (productId: string, newQuantity: number) => void;
};

export function ProductCard({ product, cartQuantity, onQuantityChange }: ProductCardProps) {
  const { formatCurrency } = useCurrency();

  const handleIncrement = () => {
    onQuantityChange(product.id, cartQuantity + 1);
  };

  const handleDecrement = () => {
    onQuantityChange(product.id, cartQuantity - 1);
  };

  return (
    <Card className="flex flex-col">
       {product.imageUrl && (
        <div className="relative h-48 w-full">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover rounded-t-lg"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div className="grid gap-0.5">
            <CardTitle className="text-lg">{product.name}</CardTitle>
            <CardDescription>{product.brand}</CardDescription>
          </div>
          <p className="text-lg font-semibold">{formatCurrency(product.price)}</p>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-2">
         <Badge variant="secondary">{product.category}</Badge>
        <p className="text-sm text-muted-foreground">In Shop: {product.shopQuantity}</p>
      </CardContent>
      <CardFooter className="flex items-center justify-between mt-auto">
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
