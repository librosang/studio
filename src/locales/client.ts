'use client';

import { createI18nClient } from 'next-international/client';

const I18nClient = createI18nClient({
  en: () => import('./en'),
  ar: () => import('./ar'),
});

export const I18nProvider = I18nClient.I18nProvider;
export const useI18n = I18nClient.useI18n;
export const useScopedI18n = I18nClient.useScopedI18n;
export const useChangeLocale = I18nClient.useChangeLocale;
export const useCurrentLocale = I18nClient.useCurrentLocale;
