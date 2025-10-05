
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import { addProduct, updateProduct, getCategorySuggestion, getProductDataFromBarcode } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { SerializableProduct, ProductFormData, ProductSchema } from '@/lib/types';
import { Icons } from '../icons';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { BarcodeScanner } from '../pos/barcode-scanner';
import { ScanBarcode, Search } from 'lucide-react';
import { useUser } from '@/context/user-context';
import { useTranslation } from '@/context/language-context';

type ProductFormProps = {
  product?: SerializableProduct;
  setOpen: (open: boolean) => void;
};

export function ProductForm({ product, setOpen }: ProductFormProps) {
  const { toast } = useToast();
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isFetchingBarcode, setIsFetchingBarcode] = useState(false);
  const { user } = useUser();
  const { t } = useTranslation();


  const form = useForm<ProductFormData>({
    resolver: zodResolver(ProductSchema),
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

  const onSubmit = (data: ProductFormData) => {
    if (!user) {
        toast({ title: t('general.not_authenticated'), description: t('general.must_be_logged_in'), variant: 'destructive' });
        return;
    }
    
    const promise = product
      ? updateProduct(product.id, data, user)
      : addProduct(data, user);

      promise.then(result => {
        if (result.error) {
            toast({
                title: t('general.error'),
                description: typeof result.error === 'string' ? result.error : 'An unexpected error occurred.',
                variant: 'destructive',
            });
        } else {
            toast({
                title: t('general.success'),
                description: product ? t('product_form.success_updated') : t('product_form.success_added'),
                className: 'bg-green-600 text-white',
            });
            if (!product) {
                form.reset();
            }
            setOpen(false);
        }
    });
  };

  const handleSuggestCategory = async () => {
    const productName = form.getValues('name');
    if (!productName) {
        toast({ title: t('general.error'), description: t('product_form.suggest_category_error'), variant: 'destructive' });
        return;
    }
    setIsSuggesting(true);
    const result = await getCategorySuggestion(productName);
    if (result.category) {
        form.setValue('category', result.category, { shouldValidate: true });
        toast({ title: t('product_form.suggestion_applied'), description: t('product_form.category_set_to', {category: result.category}), className: 'bg-blue-500 text-white' });
    } else {
        toast({ title: t('general.error'), description: result.error, variant: 'destructive' });
    }
    setIsSuggesting(false);
  }
  
  const handleBarcodeLookup = async (barcodeValue?: string) => {
    const barcode = barcodeValue || form.getValues('barcode');
    if (!barcode) {
        toast({ title: t('general.error'), description: t('product_form.enter_barcode_error'), variant: 'destructive' });
        return;
    }
    setIsFetchingBarcode(true);
    const result = await getProductDataFromBarcode(barcode);
    if ('error' in result) {
        toast({ title: t('general.error'), description: result.error, variant: 'destructive' });
    } else {
        if (result.name) form.setValue('name', result.name, { shouldValidate: true });
        if (result.imageUrl) form.setValue('imageUrl', result.imageUrl, { shouldValidate: true });
        toast({ title: t('product_form.product_found_title'), description: t('product_form.populated_data_desc', {name: result.name}), className: 'bg-blue-500 text-white' });
    }
    setIsFetchingBarcode(false);
};

  const onBarcodeScanned = (barcode: string) => {
    form.setValue('barcode', barcode, { shouldValidate: true });
    setIsScannerOpen(false);
    handleBarcodeLookup(barcode);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('product_form.product_name')}</FormLabel>
              <FormControl>
                <Input placeholder={t('product_form.name_placeholder')} {...field} />
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
                  <FormLabel>{t('product_form.category')}</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder={t('product_form.category_placeholder')} {...field} />
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
                  <FormLabel>{t('product_form.brand')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('product_form.brand_placeholder')} {...field} />
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
              <FormLabel>{t('product_form.image_url')}</FormLabel>
              <FormControl>
                <Input placeholder={t('product_form.image_url_placeholder')} {...field} />
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
              <FormLabel>{t('product_form.barcode')}</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input placeholder={t('product_form.barcode_placeholder')} {...field} />
                </FormControl>
                 <Button type="button" variant="outline" className="px-3" onClick={() => handleBarcodeLookup()} disabled={isFetchingBarcode}>
                    {isFetchingBarcode ? <Icons.spinner className="animate-spin h-4 w-4" /> : <Search className="h-4 w-4" />}
                </Button>
                <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" className='px-3'>
                      <ScanBarcode className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>{t('product_form.scan_barcode')}</DialogTitle>
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
                <FormLabel>{t('product_form.stock_quantity')}</FormLabel>
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
                <FormLabel>{t('product_form.shop_quantity')}</FormLabel>
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
                    <FormLabel>{t('product_form.price')}</FormLabel>
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
          {product ? t('product_form.save_button') : t('product_form.add_button')}
        </Button>
      </form>
    </Form>
  );
}
