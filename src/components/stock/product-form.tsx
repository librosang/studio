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
import { addProduct, updateProduct, getCategorySuggestion } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/lib/types';
import { Icons } from '../icons';
import { useState } from 'react';

const FormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  brand: z.string().min(2, 'Brand must be at least 2 characters.'),
  category: z.string().min(2, 'Category must be at least 2 characters.'),
  quantity: z.coerce.number().int(),
});

type ProductFormProps = {
  product?: Product;
  setOpen: (open: boolean) => void;
};

export function ProductForm({ product, setOpen }: ProductFormProps) {
  const { toast } = useToast();
  const [isSuggesting, setIsSuggesting] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: product ? {
      name: product.name,
      brand: product.brand,
      category: product.category,
      quantity: product.quantity,
    } : {
      name: '',
      brand: '',
      category: '',
      quantity: 0,
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    const result = product
      ? await updateProduct(product.id, data)
      : await addProduct(data);

    if (result.error) {
      toast({
        title: 'Error',
        description: typeof result.error === 'string' ? result.error : 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success!',
        description: `Product has been ${product ? 'updated' : 'added'}.`,
        className: 'bg-green-600 text-white',
      });
      if (!product) {
        form.reset();
      }
      setOpen(false);
    }
  };

  const handleSuggestCategory = async () => {
    const productName = form.getValues('name');
    if (!productName) {
        toast({ title: 'Error', description: 'Please enter a product name first.', variant: 'destructive' });
        return;
    }
    setIsSuggesting(true);
    const result = await getCategorySuggestion(productName);
    if (result.category) {
        form.setValue('category', result.category, { shouldValidate: true });
        toast({ title: 'Suggestion applied!', description: `Category set to "${result.category}".`, className: 'bg-blue-500 text-white' });
    } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
    setIsSuggesting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Organic Cotton T-Shirt" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input placeholder="e.g. Apparel" {...field} />
                </FormControl>
                <Button type="button" variant="outline" onClick={handleSuggestCategory} disabled={isSuggesting} className='px-3'>
                    {isSuggesting ? <Icons.spinner className="animate-spin h-4 w-4" /> : <Icons.magic className="h-4 w-4 text-primary" />}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="brand"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brand</FormLabel>
              <FormControl>
                <Input placeholder="e.g. EcoThreads" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
          {form.formState.isSubmitting && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          {product ? 'Save Changes' : 'Add Product'}
        </Button>
      </form>
    </Form>
  );
}