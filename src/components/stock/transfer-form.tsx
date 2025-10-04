
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { transferStockToShop } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { SerializableProduct } from '@/lib/types';
import { Icons } from '../icons';
import { useUser } from '@/context/user-context';

const FormSchema = z.object({
  quantity: z.coerce.number().int().positive('Quantity must be a positive number.'),
});

type TransferFormProps = {
  product: SerializableProduct;
  setOpen: (open: boolean) => void;
};

export function TransferForm({ product, setOpen }: TransferFormProps) {
  const { toast } = useToast();
  const { user } = useUser();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      quantity: 1,
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (!user) {
        toast({ title: 'Not Authenticated', description: 'You must be logged in.', variant: 'destructive' });
        return;
    }
    
    if (data.quantity > product.stockQuantity) {
      form.setError('quantity', {
        type: 'manual',
        message: `Cannot transfer more than available stock (${product.stockQuantity}).`,
      });
      return;
    }

    const result = await transferStockToShop(product.id, data.quantity, user);

    if (result.error) {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success!',
        description: `${data.quantity} unit(s) of ${product.name} transferred to shop.`,
        className: 'bg-green-600 text-white',
      });
      form.reset();
      setOpen(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h3 className="font-semibold">{product.name}</h3>
          <p className="text-sm text-muted-foreground">
            Available in Stock: <span className="font-bold">{product.stockQuantity}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Available in Shop: <span className="font-bold">{product.shopQuantity}</span>
          </p>
        </div>
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity to Transfer</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0" {...field} autoFocus />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
          {form.formState.isSubmitting && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Transfer to Shop
        </Button>
      </form>
    </Form>
  );
}
