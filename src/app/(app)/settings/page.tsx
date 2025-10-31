
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCurrency, useLanguage, useTranslation } from '@/context/language-context';
import { Language, Currency } from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { ChevronRight } from 'lucide-react';


export default function SettingsPage() {
    const { language, setLanguage } = useLanguage();
    const { currency, setCurrency } = useCurrency();
    const { t } = useTranslation();

  return (
    <div className="container mx-auto py-10">
       <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{t('settings.title')}</CardTitle>
          <CardDescription>{t('settings.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
                <Label htmlFor="language-select" className="text-lg">{t('general.language')}</Label>
                <Select
                    value={language}
                    onValueChange={(value) => setLanguage(value as Language)}
                >
                    <SelectTrigger id="language-select" className="w-[180px]">
                        <SelectValue placeholder={t('general.select_language')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="en">{t('general.english')}</SelectItem>
                        <SelectItem value="ar">{t('general.arabic')}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
                <Label htmlFor="currency-select" className="text-lg">{t('settings.currency')}</Label>
                 <Select
                    value={currency}
                    onValueChange={(value) => setCurrency(value as Currency)}
                >
                    <SelectTrigger id="currency-select" className="w-[180px]">
                        <SelectValue placeholder={t('settings.select_currency')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="JPY">JPY (¥)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="CAD">CAD (C$)</SelectItem>
                        <SelectItem value="MAD">MAD (DH)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Link href="/settings/plugins" className="block">
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                      <Icons.plugin className="h-6 w-6 text-muted-foreground"/>
                      <div>
                          <p className="text-lg font-medium">Plugins</p>
                          <p className="text-sm text-muted-foreground">Enable or disable application features.</p>
                      </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Link>
        </CardContent>
       </Card>
    </div>
  );
}
