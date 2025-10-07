
'use client';
import { PageHeader } from '@/components/page-header';
import { useTranslation } from '@/context/language-context';
import { useEffect, useState } from 'react';
import { SerializableExpense } from '@/lib/types';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Icons } from '@/components/icons';
import { ExpensesDataTable } from '@/components/expenses/expenses-data-table';
import { columns } from '@/components/expenses/columns';

export default function ExpensesPage() {
  const { t } = useTranslation();
  const [expenses, setExpenses] = useState<SerializableExpense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const expensesRef = collection(db, 'expenses');
    const q = query(expensesRef, orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const expensesData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date.toDate().toISOString(),
        } as SerializableExpense;
      });
      setExpenses(expensesData);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching expenses: ", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
     return <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center"><Icons.spinner className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="container mx-auto py-10">
      <PageHeader
        title={t('expenses.title')}
        description={t('expenses.description')}
      />
      <ExpensesDataTable columns={columns} data={expenses} />
    </div>
  );
}
