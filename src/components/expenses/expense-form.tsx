
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
import { addExpense, updateExpense } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { SerializableExpense, ExpenseFormData, ExpenseSchema } from '@/lib/types';
import { Icons } from '../icons';
import { useUser } from '@/context/user-context';
import { useTranslation } from '@/context/language-context';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '../ui/calendar';

type ExpenseFormProps = {
  expense?: SerializableExpense;
  setOpen: (open: boolean) => void;
};

export function ExpenseForm({ expense, setOpen }: ExpenseFormProps) {
  const { toast } = useToast();
  const { user } = useUser();
  const { t } = useTranslation();

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(ExpenseSchema),
    defaultValues: expense ? {
      ...expense,
      date: format(new Date(expense.date), 'yyyy-MM-dd'),
    } : {
      date: format(new Date(), 'yyyy-MM-dd'),
      category: '',
      description: '',
      amount: 0,
    },
  });

  const onSubmit = (data: ExpenseFormData) => {
    if (!user) {
        toast({ title: t('general.not_authenticated'), description: t('general.must_be_logged_in'), variant: 'destructive' });
        return;
    }
    
    const promise = expense
      ? updateExpense(expense.id, data, user)
      : addExpense(data, user);

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
                description: t('expenses.expense_saved'),
                className: 'bg-green-600 text-white',
            });
            if (!expense) {
                form.reset();
            }
            setOpen(false);
        }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
       <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{t('expenses.date')}</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(new Date(field.value), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : null)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('expenses.category')}</FormLabel>
              <FormControl>
                <Input placeholder={t('expenses.category_placeholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('expenses.description_label')}</FormLabel>
              <FormControl>
                <Input placeholder={t('expenses.description_placeholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
            <FormItem>
                <FormLabel>{t('expenses.amount')}</FormLabel>
                <FormControl>
                <Input type="number" placeholder="0.00" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
       
        <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
          {form.formState.isSubmitting && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          {t('expenses.save_button')}
        </Button>
      </form>
    </Form>
  );
}
