import { getLogs } from '@/lib/actions';
import { PageHeader } from '@/components/page-header';
import { LogList } from '@/components/log/log-list';
import { SerializableLogEntry } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { LogExport } from '@/components/log/log-export';

export const dynamic = 'force-dynamic';

export default async function LogPage() {
  const logs: SerializableLogEntry[] = await getLogs();

  return (
    <div className="container mx-auto py-10">
      <PageHeader
        title="Activity Log"
        description="A comprehensive history of all inventory changes and transactions."
      >
        <LogExport logs={logs} />
      </PageHeader>
      <LogList logs={logs} />
    </div>
  );
}
