
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser } from '@/context/user-context';
import { Icons } from '@/components/icons';
import { useTranslation } from '@/context/language-context';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const { login } = useUser();
  const { t } = useTranslation();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(email);
  };

  return (
    <div className="flex h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="mb-4 flex items-center justify-center gap-2">
                <Icons.logo className="h-10 w-10 text-primary" />
                <CardTitle className="text-4xl font-headline">{t('login.title')}</CardTitle>
            </div>
          <CardDescription>
            {t('login.description')}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('login.email_label')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('login.email_placeholder')}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              {t('login.signin_button')}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
