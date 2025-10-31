
'use client';

import { useState, useEffect } from 'react';
import { allPlugins, type Plugin } from '@/lib/plugins';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Icons } from '../icons';

export function PluginsClient() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const storedPlugins = localStorage.getItem('plugins');
    if (storedPlugins) {
      const parsedPlugins: Plugin[] = JSON.parse(storedPlugins);
      // Ensure all plugins from code are present, even if not in storage
      const updatedPlugins = allPlugins.map(p => {
        const stored = parsedPlugins.find(sp => sp.id === p.id);
        return stored ? { ...p, active: stored.active } : p;
      });
      setPlugins(updatedPlugins);
    } else {
      setPlugins(allPlugins);
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('plugins', JSON.stringify(plugins));
       // Dispatch a custom event to notify other components (like the sidebar)
      window.dispatchEvent(new Event('plugins-updated'));
    }
  }, [plugins, isMounted]);

  const handleToggle = (id: string) => {
    setPlugins(prevPlugins =>
      prevPlugins.map(p =>
        p.id === id ? { ...p, active: !p.active } : p
      )
    );
  };
  
  if (!isMounted) {
    return <div className="flex h-64 w-full items-center justify-center"><Icons.spinner className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {plugins.map(plugin => {
        const Icon = plugin.icon;
        return (
          <Card key={plugin.id} className="flex flex-col justify-between">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Icon className="h-8 w-8 text-primary" />
                  <CardTitle>{plugin.name}</CardTitle>
                </div>
                <Switch
                  checked={plugin.active}
                  onCheckedChange={() => handleToggle(plugin.id)}
                  aria-label={`Toggle ${plugin.name}`}
                />
              </div>
              <CardDescription className="pt-2">{plugin.description}</CardDescription>
            </CardHeader>
          </Card>
        );
      })}
    </div>
  );
}
