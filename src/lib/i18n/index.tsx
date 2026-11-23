import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { Locale, LocaleMeta, Translations } from './types'
import { SUPPORTED_LOCALES } from './types'
import { en } from './locales/en'
import { es } from './locales/es'
import { pt } from './locales/pt'
import { fr } from './locales/fr'
import { ja } from './locales/ja'
import { zh } from './locales/zh'

const TRANSLATIONS: Record<Locale, Translations> = {
  en,
  es,
  pt,
  fr,
  ja,
  zh,
}

const STORAGE_KEY = 'eot_save_editor_locale'

/**
 * Detect browser language or fallback to 'en'.
 * Checks navigator.language and navigator.languages.
 */
export function detectBrowserLocale(): Locale {
  if (typeof window === 'undefined' || !window.navigator) {
    return 'en'
  }

  // Check saved preference first
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null
    if (saved && TRANSLATIONS[saved]) {
      return saved
    }
  } catch {
    // Ignore localStorage access errors
  }

  const browserLangs: string[] = []
  if (navigator.language) {
    browserLangs.push(navigator.language)
  }
  if (Array.isArray(navigator.languages)) {
    browserLangs.push(...navigator.languages)
  }

  for (const raw of browserLangs) {
    const lower = raw.toLowerCase().trim()
    if (lower.startsWith('es')) return 'es'
    if (lower.startsWith('pt')) return 'pt'
    if (lower.startsWith('fr')) return 'fr'
    if (lower.startsWith('ja')) return 'ja'
    if (lower.startsWith('zh')) return 'zh'
    if (lower.startsWith('en')) return 'en'
  }

  return 'en'
}

interface I18nContextValue {
  locale: Locale
  setLocale: (loc: Locale) => void
  t: Translations
  supportedLocales: LocaleMeta[]
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => detectBrowserLocale())

  const setLocale = (newLoc: Locale) => {
    setLocaleState(newLoc)
    try {
      localStorage.setItem(STORAGE_KEY, newLoc)
    } catch {
      // Ignore
    }
    document.documentElement.lang = newLoc
  }

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const t = useMemo(() => TRANSLATIONS[locale] || TRANSLATIONS.en, [locale])

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      supportedLocales: SUPPORTED_LOCALES,
    }),
    [locale, t],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return ctx
}

export * from './types'
