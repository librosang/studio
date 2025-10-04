
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
import { SerializableProduct } from '@/lib/types';
import { Icons } from '../icons';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { BarcodeScanner } from '../pos/barcode-scanner';
import { ScanBarcode } from 'lucide-react';
import { useUser } from '@/context/user-context';

const FormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  brand: z.string().min(2, 'Brand must be at least 2 characters.'),
  category: z.string().min(2, 'Category must be at least 2 characters.'),
  stockQuantity: z.coerce.number().int(),
  shopQuantity: z.coerce.number().int(),
  price: z.coerce.number().positive('Price must be a positive number.'),
  imageUrl: z.string().url('Must be a valid URL.').optional().or(z.literal('')),
  barcode: z.string().optional().or(z.literal('')),
});

type ProductFormProps = {
  product?: SerializableProduct;
  setOpen: (open: boolean) => void;
};

export function ProductForm({ product, setOpen }: ProductFormProps) {
  const { toast } = useToast();
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const { user } = useUser();


  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: product ? {
      name: product.name,
      brand: product.brand,
      category: product.category,
      stockQuantity: product.stockQuantity,
      shopQuantity: product.shopQuantity,
      price: product.price,
      imageUrl: product.imageUrl,
      barcode: product.barcode,
    } : {
      name: '',
      brand: '',
      category: '',
      stockQuantity: 0,
      shopQuantity: 0,
      price: 0,
      imageUrl: '',
      barcode: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (!user) {
        toast({ title: 'Not Authenticated', description: 'You must be logged in.', variant: 'destructive' });
        return;
    }
    const result = product
      ? await updateProduct(product.id, data, user)
      : await addProduct(data, user);

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

  const onBarcodeScanned = (barcode: string) => {
    form.setValue('barcode', barcode, { shouldValidate: true });
    setIsScannerOpen(false);
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
        <div className="flex gap-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className='flex-1'>
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
                <FormItem className="flex-1">
                  <FormLabel>Brand</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. EcoThreads" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
         <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://picsum.photos/seed/1/200/300" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="barcode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Barcode (EAN, UPC)</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input placeholder="e.g. 9780201379624" {...field} />
                </FormControl>
                <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" className='px-3'>
                      <ScanBarcode className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Scan Barcode</DialogTitle>
                    </DialogHeader>
                    <BarcodeScanner
                      onScan={onBarcodeScanned}
                      onClose={() => setIsScannerOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="stockQuantity"
            render={({ field }) => (
              <FormItem className='flex-1'>
                <FormLabel>Stock Quantity</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="shopQuantity"
            render={({ field }) => (
              <FormItem className='flex-1'>
                <FormLabel>Shop Quantity</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-4">
            <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                <FormItem className='flex-1'>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                    <Input type="number" placeholder="0.00" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>
        <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
          {form.formState.isSubmitting && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          {product ? 'Save Changes' : 'Add Product'}
        </Button>
      </form>
    </Form>
  );
}
