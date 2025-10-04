
'use client';

import { UserProvider } from '@/context/user-context';
import { LanguageProvider } from '@/context/language-context';

export function Providers({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <LanguageProvider>
            <UserProvider>
                {children}
            </UserProvider>
        </LanguageProvider>
    );
}
