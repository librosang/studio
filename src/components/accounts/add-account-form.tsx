
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Icons } from '../icons';
import { addAccount, updateAccount } from '@/lib/actions';
import { useUser } from '@/context/user-context';
import { UserProfile } from '@/lib/types';
import { useTranslation } from '@/context/language-context';

const FormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email.'),
  role: z.enum(['cashier', 'manager'], {
    required_error: 'You need to select a role.',
  }),
});

type AddAccountFormProps = {
  account?: UserProfile;
  setOpen: (open: boolean) => void;
};

export function AddAccountForm({ account, setOpen }: AddAccountFormProps) {
  const { toast } = useToast();
  const { user } = useUser();
  const { t } = useTranslation();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: account ? {
      name: account.name,
      email: account.email,
      role: account.role,
    } : {
      name: '',
      email: '',
      role: 'cashier',
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (!user) {
        toast({ title: t('general.not_authenticated'), description: t('general.must_be_logged_in'), variant: 'destructive' });
        return;
    }

    const result = account
      ? await updateAccount(account.id, data, user)
      : await addAccount(data, user);

    if (result.error) {
        const errorText = typeof result.error === 'string' ? result.error : "Validation failed. Check your inputs.";
        toast({
            title: t('general.error'),
            description: errorText,
            variant: 'destructive',
        });
    } else {
        toast({
            title: t('general.success'),
            description: t('accounts.account_saved_success', { name: data.name, action: account ? t('accounts.action_updated') : t('accounts.action_created') }),
            className: 'bg-green-600 text-white',
        });
        form.reset();
        setOpen(false);
        // Note: In a real app, you would need to trigger a re-fetch of the accounts list.
        // For this mock app, we'll rely on a page refresh for now.
        window.location.reload(); 
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('accounts.full_name')}</FormLabel>
              <FormControl>
                <Input placeholder={t('accounts.name_placeholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('general.email')}</FormLabel>
              <FormControl>
                <Input type="email" placeholder={t('accounts.email_placeholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('general.role')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('accounts.select_role')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="cashier">{t('accounts.cashier_role')}</SelectItem>
                  <SelectItem value="manager">{t('accounts.manager_role')}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
          {form.formState.isSubmitting && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          {account ? t('product_form.save_button') : t('accounts.create_account_button')}
        </Button>
      </form>
    </Form>
  );
}
