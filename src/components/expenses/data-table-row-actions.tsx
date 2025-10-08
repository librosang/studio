
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
  DialogDescription,
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
import { SerializableExpense } from '@/lib/types';
import { deleteExpense } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/context/user-context';
import { ScrollArea } from '../ui/scroll-area';
import { useTranslation } from '@/context/language-context';
import { ExpenseForm } from './expense-form';

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const expense = row.original as SerializableExpense;
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const { t } = useTranslation();

  const handleDelete = () => {
    if (!user) {
        toast({ title: t('general.not_authenticated'), description: t('general.must_be_logged_in'), variant: 'destructive' });
        return;
    }
    
    deleteExpense(expense.id, user).then(result => {
        if (result.error) {
            toast({
                title: t('general.error'),
                description: result.error,
                variant: 'destructive',
            });
        } else {
            toast({
                title: t('general.success'),
                description: t('expenses.expense_deleted'),
            });
            setIsDeleteDialogOpen(false);
        }
    });
  };

  return (
    <>
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">{t('data_table.open_menu')}</span>
                <Icons.more className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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
                      {t('expenses.delete_expense_confirm')}
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
              <DialogTitle>{t('expenses.edit_title')}</DialogTitle>
              <DialogDescription>
                {t('expenses.edit_desc')}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[80vh] p-0">
              <div className="p-6 pt-0">
                <ExpenseForm expense={expense} setOpen={setIsEditDialogOpen} />
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
    </>
  );
}
