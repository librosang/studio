
'use client';
import { PageHeader } from '@/components/page-header';
import { UserProfile } from '@/lib/types';
import { getAccounts } from '@/lib/actions';
import { AddAccountDialog } from '@/components/accounts/add-account-dialog';
import { AccountsClient } from '@/components/accounts/accounts-client';
import { useTranslation } from '@/context/language-context';
import { useEffect, useState } from 'react';
import { useUser } from '@/context/user-context';

export default function AccountsPage() {
    const { t } = useTranslation();
    const { user } = useUser();
    const [accounts, setAccounts] = useState<UserProfile[]>([]);

    useEffect(() => {
        const fetchAccounts = async () => {
            if(user) {
                const fetchedAccounts = await getAccounts(user);
                setAccounts(fetchedAccounts);
            }
        }
        fetchAccounts();
    }, [user]);

  return (
    <div className="container mx-auto py-10">
      <PageHeader
        title={t('accounts.title')}
        description={t('accounts.description')}
      >
        <AddAccountDialog />
      </PageHeader>
      <AccountsClient initialAccounts={accounts} />
    </div>
  );
}
