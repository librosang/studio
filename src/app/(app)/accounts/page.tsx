
import { PageHeader } from '@/components/page-header';
import { UserProfile } from '@/lib/types';
import { getAccounts } from '@/lib/actions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { AddAccountDialog } from '@/components/accounts/add-account-dialog';
import { AccountsClient } from '@/components/accounts/accounts-client';

export const dynamic = 'force-dynamic';

export default async function AccountsPage() {
    // This is a mock implementation since we don't have a real user session on the server
    const mockManagerUser: UserProfile = { id: '1', name: 'Admin Manager', email: 'manager@test.com', role: 'manager' };
    const accounts: UserProfile[] = await getAccounts(mockManagerUser);

  return (
    <div className="container mx-auto py-10">
      <PageHeader
        title="Account Management"
        description="View and manage user accounts and their roles."
      >
        <AddAccountDialog />
      </PageHeader>
      <AccountsClient initialAccounts={accounts} />
    </div>
  );
}
