
'use client';

import { PageHeader } from '@/components/page-header';
import { PluginsClient } from '@/components/settings/plugins-client';
import { useTranslation } from '@/context/language-context';

export default function PluginsPage() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto py-10">
      <PageHeader
        title="Plugin Management"
        description="Enable or disable application features."
      />
      <PluginsClient />
    </div>
  );
}
