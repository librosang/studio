
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
        toast({ title: 'Not Authenticated', description: 'You must be logged in.', variant: 'destructive' });
        return;
    }

    const result = account
      ? await updateAccount(account.id, data, user)
      : await addAccount(data, user);

    if (result.error) {
      toast({
        title: 'Error',
        description: 'Failed to save account.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success!',
        description: `Account for ${data.name} has been ${account ? 'updated' : 'created'}.`,
        className: 'bg-green-600 text-white',
      });
      form.reset();
      setOpen(false);
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
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
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
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="j.doe@example.com" {...field} />
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
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="cashier">Cashier</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
          {form.formState.isSubmitting && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          {account ? 'Save Changes' : 'Create Account'}
        </Button>
      </form>
    </Form>
  );
}
