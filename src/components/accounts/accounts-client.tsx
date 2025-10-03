
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

type AccountsClientProps = {
  initialAccounts: UserProfile[];
};

export function AccountsClient({ initialAccounts }: AccountsClientProps) {
  const [accounts, setAccounts] = useState(initialAccounts);

  // In a real app, you'd have functions to edit/delete users.
  // For now, we just display them.

  return (
    <Card>
        <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {accounts.map((account) => (
                    <TableRow key={account.id}>
                        <TableCell className="font-medium">{account.name}</TableCell>
                        <TableCell>{account.email}</TableCell>
                        <TableCell>
                            <Badge variant={account.role === 'manager' ? 'default' : 'secondary'}>
                            {account.role}
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
