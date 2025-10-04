
'use client';

import { useState } from 'react';
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
import { UserProfile } from '@/lib/types';
import { AddAccountForm } from './add-account-form';
import { deleteAccount } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/context/user-context';
import { useTranslation } from '@/context/language-context';

interface DataTableRowActionsProps {
  row: {
    original: UserProfile;
  };
}

export function DataTableRowActions({
  row,
}: DataTableRowActionsProps) {
  const account = row.original;
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const { t } = useTranslation();

  const handleDelete = async () => {
    if (!user) {
        toast({ title: t('general.not_authenticated'), description: t('general.must_be_logged_in'), variant: 'destructive' });
        return;
    }
    const result = await deleteAccount(account.id, user);
    if (result.error) {
      toast({
        title: t('general.error'),
        description: t(result.error as any),
        variant: 'destructive',
      });
    } else {
      toast({
        title: t('general.success'),
        description: t('accounts.account_deleted'),
      });
      setIsDeleteDialogOpen(false);
      // Here you would typically refetch the data or remove the item from the local state
    }
  };
  
  // Can't edit or delete the currently logged in user from the list
  const canPerformActions = user?.id !== account.id;

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
                <DropdownMenuItem 
                  onSelect={(e) => e.preventDefault()}
                  disabled={!canPerformActions}
                >
                  <Icons.trash className="mr-2 h-4 w-4" />
                  {t('data_table.delete')}
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('data_table.are_you_sure')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('accounts.delete_account_confirm', {name: account.name})}
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
            <DialogTitle>{t('accounts.edit_account')}</DialogTitle>
          </DialogHeader>
          <AddAccountForm
            account={account}
            setOpen={setIsEditDialogOpen}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
