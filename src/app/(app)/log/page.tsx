
'use client';
import { getLogs } from '@/lib/actions';
import { PageHeader } from '@/components/page-header';
import { LogList } from '@/components/log/log-list';
import { SerializableLogEntry } from '@/lib/types';
import { LogExport } from '@/components/log/log-export';
import { useTranslation } from '@/context/language-context';
import { useEffect, useState } from 'react';

export default function LogPage() {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<SerializableLogEntry[]>([]);
  
  useEffect(() => {
    getLogs().then(setLogs);
  }, []);

  return (
    <div className="container mx-auto py-10">
      <PageHeader
        title={t('log.title')}
        description={t('log.description')}
      >
        <LogExport logs={logs} />
      </PageHeader>
      <LogList logs={logs} />
    </div>
  );
}
