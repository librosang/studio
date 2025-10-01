'use client';

import { LogEntry, LogType } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Icons, Icon } from '../icons';
import { format, formatDistanceToNow } from 'date-fns';
import { useState, useEffect } from 'react';
import { Badge } from '../ui/badge';

const logIconMap: Record<LogType, Icon> = {
  CREATE: Icons.create,
  UPDATE: Icons.update,
  DELETE: Icons.delete,
  SALE: Icons.sale,
  RETURN: Icons.return,
};

const logColorMap: Record<LogType, string> = {
  CREATE: 'bg-blue-500',
  UPDATE: 'bg-yellow-500',
  DELETE: 'bg-red-500',
  SALE: 'bg-green-500',
  RETURN: 'bg-purple-500',
}

function LogItem({ log }: { log: LogEntry }) {
  const [formattedDate, setFormattedDate] = useState('');
  const [relativeDate, setRelativeDate] = useState('');

  useEffect(() => {
    if (log.timestamp) {
      const date = log.timestamp.toDate();
      setFormattedDate(format(date, 'PPP p'));
      setRelativeDate(formatDistanceToNow(date, { addSuffix: true }));
    }
  }, [log.timestamp]);


  const LogIcon = logIconMap[log.type] || Icons.log;
  const iconBgColor = logColorMap[log.type] || 'bg-gray-500';

  return (
    <div className="flex items-start gap-4">
      <div className={`mt-1 rounded-full p-2 text-primary-foreground ${iconBgColor}`}>
         <LogIcon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <p className="font-semibold">{log.productName}</p>
          <p className="text-xs text-muted-foreground mt-1 sm:mt-0" title={formattedDate}>
              {relativeDate}
          </p>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{log.details}</p>
        <Badge variant="outline" className="mt-2 text-xs">{log.type}</Badge>
      </div>
    </div>
  );
}


export function LogList({ logs }: { logs: LogEntry[] }) {
  return (
    <Card>
      <CardContent className="p-0">
        <ScrollArea className="h-[75vh]">
          <div className="p-4 md:p-6 space-y-6">
            {logs.length > 0 ? (
              logs.map((log) => (
                <LogItem key={log.id} log={log} />
              ))
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <Icons.log className="mx-auto h-12 w-12" />
                <p className="mt-4">No log entries yet.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
