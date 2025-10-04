
'use client';

import { useState } from 'react';
import { UserProfile } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '../ui/card';
import { DataTableRowActions } from './data-table-row-actions';
import { useTranslation } from '@/context/language-context';

type AccountsClientProps = {
  initialAccounts: UserProfile[];
};

export function AccountsClient({ initialAccounts }: AccountsClientProps) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const { t } = useTranslation();

  // In a real app, you'd have functions to edit/delete users.
  // For now, we just display them.

  return (
    <Card>
        <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>{t('general.name')}</TableHead>
                    <TableHead>{t('general.email')}</TableHead>
                    <TableHead>{t('general.role')}</TableHead>
                    <TableHead className="text-right">{t('general.actions')}</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {accounts.map((account) => (
                    <TableRow key={account.id}>
                        <TableCell className="font-medium">{account.name}</TableCell>
                        <TableCell>{account.email}</TableCell>
                        <TableCell>
                            <Badge variant={account.role === 'manager' ? 'default' : 'secondary'}>
                            {t(account.role === 'manager' ? 'accounts.manager_role' : 'accounts.cashier_role')}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                             <DataTableRowActions row={{ original: account }} />
                        </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
  );
}
