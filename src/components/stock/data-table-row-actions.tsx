
'use client';

import { useState } from 'react';
import { Row } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Icons } from '../icons';
import { SerializableProduct } from '@/lib/types';
import { ProductForm } from './product-form';
import { deleteProduct } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/context/user-context';
import { TransferForm } from './transfer-form';
import { ArrowRightLeft } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { useTranslation } from '@/context/language-context';

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const product = row.original as SerializableProduct;
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const { t } = useTranslation();

  const handleDelete = async () => {
    if (!user) {
        toast({ title: t('general.not_authenticated'), description: t('general.must_be_logged_in'), variant: 'destructive' });
        return;
    }
    const result = await deleteProduct(product.id, user);
    if (result.error) {
      toast({
        title: t('general.error'),
        description: result.error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: t('general.success'),
        description: t('data_table.product_deleted'),
      });
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">{t('data_table.open_menu')}</span>
                <Icons.more className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsTransferDialogOpen(true)}>
                <ArrowRightLeft className="mr-2 h-4 w-4" />
                {t('data_table.transfer_to_shop')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                <Icons.edit className="mr-2 h-4 w-4" />
                {t('data_table.edit')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Icons.trash className="mr-2 h-4 w-4" />
                    {t('data_table.delete')}
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('data_table.are_you_sure')}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('data_table.delete_product_confirm')}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('data_table.cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">{t('data_table.continue')}</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>

          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{t('product_form.edit_title')}</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[80vh] p-0">
              <div className="p-6">
                <ProductForm product={product} setOpen={setIsEditDialogOpen} />
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('transfer_form.title')}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh] p-0">
            <div className="p-6">
              <TransferForm product={product} setOpen={setIsTransferDialogOpen} />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
