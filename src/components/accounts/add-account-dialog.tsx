
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Icons } from '../icons';
import { AddAccountForm } from './add-account-form';
import { useTranslation } from '@/context/language-context';

export function AddAccountDialog() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Icons.add className="mr-2 h-4 w-4" />
          {t('accounts.add_account')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('accounts.create_new_account')}</DialogTitle>
          <DialogDescription>
            {t('accounts.create_cashier_desc')}
          </DialogDescription>
        </DialogHeader>
        <AddAccountForm setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
}
