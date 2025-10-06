
'use client';
import { PageHeader } from '@/components/page-header';
import { LogList } from '@/components/log/log-list';
import { SerializableLogEntry } from '@/lib/types';
import { LogExport } from '@/components/log/log-export';
import { useTranslation } from '@/context/language-context';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Icons } from '@/components/icons';

export default function LogPage() {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<SerializableLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const logsRef = collection(db, 'logs');
    const q = query(logsRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logsData: SerializableLogEntry[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          timestamp: data.timestamp.toDate().toISOString(),
          type: data.type,
          details: data.details,
          userId: data.userId,
          userName: data.userName,
          items: data.items,
        };
      });
      setLogs(logsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="container mx-auto py-10">
      <PageHeader
        title={t('log.title')}
        description={t('log.description')}
      >
        <LogExport logs={logs} />
      </PageHeader>
      {loading ? (
         <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center"><Icons.spinner className="h-8 w-8 animate-spin" /></div>
      ) : (
        <LogList logs={logs} />
      )}
    </div>
  );
}

    
