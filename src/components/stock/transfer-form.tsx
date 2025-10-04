
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
import { useTranslation } from '@/context/language-context';

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
  const { t } = useTranslation();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      quantity: 1,
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (!user) {
        toast({ title: t('general.not_authenticated'), description: t('general.must_be_logged_in'), variant: 'destructive' });
        return;
    }
    
    if (data.quantity > product.stockQuantity) {
      form.setError('quantity', {
        type: 'manual',
        message: t('transfer_form.error_not_enough_stock', {count: product.stockQuantity}),
      });
      return;
    }

    const result = await transferStockToShop(product.id, data.quantity, user);

    if (result.error) {
      toast({
        title: t('general.error'),
        description: result.error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: t('general.success'),
        description: t('transfer_form.success', {quantity: data.quantity, name: product.name}),
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
            {t('transfer_form.available_stock')} <span className="font-bold">{product.stockQuantity}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            {t('transfer_form.available_shop')} <span className="font-bold">{product.shopQuantity}</span>
          </p>
        </div>
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('transfer_form.quantity_to_transfer')}</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0" {...field} autoFocus />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
          {form.formState.isSubmitting && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          {t('transfer_form.button')}
        </Button>
      </form>
    </Form>
  );
}
