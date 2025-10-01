import { getLogs } from '@/lib/actions';
import { PageHeader } from '@/components/page-header';
import { LogList } from '@/components/log/log-list';

export const dynamic = 'force-dynamic';

export default async function LogPage() {
  const logs = await getLogs();

  return (
    <div className="container mx-auto py-10">
      <PageHeader
        title="Activity Log"
        description="A comprehensive history of all inventory changes and transactions."
      />
      <LogList logs={logs} />
    </div>
  );
}
