
'use client';

import { SerializableProduct } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { useCurrency } from '@/context/language-context';

type ProductGridItemProps = {
  product: SerializableProduct;
  onAddToCart: () => void;
};

export function ProductGridItem({ product, onAddToCart }: ProductGridItemProps) {
  const { formatCurrency } = useCurrency();

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
        <p className="text-sm font-semibold">{formatCurrency(product.price)}</p>
        <p className="text-xs text-muted-foreground">In Shop: {product.shopQuantity}</p>
      </CardContent>
    </Card>
  );
}
