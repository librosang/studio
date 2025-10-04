
'use client';

import { I18nProvider } from '@/locales/client';
import { UserProvider } from '@/context/user-context';

export function Providers({
    children,
    locale
}: {
    children: React.ReactNode;
    locale: string;
}) {
    return (
        <I18nProvider locale={locale}>
            <UserProvider>
                {children}
            </UserProvider>
        </I18nProvider>
    );
}
