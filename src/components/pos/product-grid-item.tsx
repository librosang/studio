
'use client';

import { SerializableProduct } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

type ProductGridItemProps = {
  product: SerializableProduct;
  onAddToCart: () => void;
};

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export function ProductGridItem({ product, onAddToCart }: ProductGridItemProps) {
  return (
    <Card 
        onClick={onAddToCart}
        className="flex flex-col cursor-pointer hover:border-primary transition-colors"
    >
      {product.imageUrl && (
        <div className="relative h-24 w-full">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover rounded-t-lg"
          />
        </div>
      )}
      <CardHeader className="p-2 flex-grow">
        <CardTitle className="text-sm font-medium leading-tight">{product.name}</CardTitle>
      </CardHeader>
      <CardContent className="p-2 pt-0 mt-auto">
        <p className="text-sm font-semibold">{currencyFormatter.format(product.price)}</p>
        <p className="text-xs text-muted-foreground">In Stock: {product.quantity}</p>
      </CardContent>
    </Card>
  );
}
