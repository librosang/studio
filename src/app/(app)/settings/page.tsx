
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/context/language-context';
import { Language } from '@/lib/types';


export default function SettingsPage() {
    const { language, setLanguage } = useLanguage();

  return (
    <div className="container mx-auto py-10">
       <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Manage your application settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-lg">
                <Label htmlFor="language-select" className="text-lg">Language</Label>
                <Select
                    value={language}
                    onValueChange={(value) => setLanguage(value as Language)}
                >
                    <SelectTrigger id="language-select" className="w-[180px]">
                        <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ar">العربية (Arabic)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </CardContent>
       </Card>
    </div>
  );
}
