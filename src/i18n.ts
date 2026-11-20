import { en } from '@payloadcms/translations/languages/en'
import { da } from '@payloadcms/translations/languages/da'
import type { Config } from 'payload'

/**
 * English is the default/fallback; Danish is wired in so the admin UI can be
 * switched per-user. Add more languages by importing their pack and listing
 * it under `supportedLanguages`.
 */
export const i18n: Config['i18n'] = {
  fallbackLanguage: 'en',
  supportedLanguages: { en, da },
}
