
'use client';

import { SerializableLogEntry, LogType, UserProfile } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Icons, Icon } from '../icons';
import { format, formatDistanceToNow } from 'date-fns';
import { useState, useEffect } from 'react';
import { Badge } from '../ui/badge';
import { useUser } from '@/context/user-context';
import { ArrowRightLeft } from 'lucide-react';

const logIconMap: Record<LogType, Icon> = {
  CREATE: Icons.create,
  UPDATE: Icons.update,
  DELETE: Icons.delete,
  TRANSACTION: Icons.transaction,
  TRANSFER: ArrowRightLeft,
};

const logColorMap: Record<LogType, string> = {
  CREATE: 'bg-blue-500',
  UPDATE: 'bg-yellow-500',
  DELETE: 'bg-red-500',
  TRANSACTION: 'bg-green-500',
  TRANSFER: 'bg-purple-500',
}

function LogItem({ log }: { log: SerializableLogEntry }) {
  const [formattedDate, setFormattedDate] = useState('');
  const [relativeDate, setRelativeDate] = useState('');

  useEffect(() => {
    if (log.timestamp) {
      const date = new Date(log.timestamp);
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
           <div className="flex items-center gap-2">
            <p className="font-semibold">{log.type}</p>
            <Badge variant="outline" className="text-xs">{log.details}</Badge>
            <Badge variant="secondary" className="text-xs">{log.userName}</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1 sm:mt-0" title={formattedDate}>
              {relativeDate}
          </p>
        </div>
        <div className="text-sm text-muted-foreground mt-2 space-y-2">
            {log.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center border-b border-dashed pb-1">
                    <span>{item.productName}</span>
                    <span className={`font-medium ${item.quantityChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.quantityChange > 0 ? '+' : ''}{item.quantityChange}
                    </span>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}


export function LogList({ logs }: { logs: SerializableLogEntry[] }) {
  const { user } = useUser();

  const filteredLogs = user?.role === 'manager'
    ? logs
    : logs.filter(log => log.userId === user?.id);

  return (
    <Card>
      <CardContent className="p-0">
        <ScrollArea className="h-[75vh]">
          <div className="p-4 space-y-6 md:p-6">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <LogItem key={log.id} log={log} />
              ))
            ) : (
              <div className="py-16 text-center text-muted-foreground">
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
