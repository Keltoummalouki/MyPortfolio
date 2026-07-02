'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { PublicDesignSettings } from '@/features/cms/queries'
import { buildDesignCss } from '@/features/cms/design-css'
import {
  mergeVisitorDesign,
  normalizeVisitorDesignPreference,
  visitorDesignCookieString,
  type VisitorDesignPreference,
} from '@/features/preferences/options'

interface PreferenceContextValue {
  adminDesign?: PublicDesignSettings
  design: PublicDesignSettings
  preference: VisitorDesignPreference
  hasSeenPreference: boolean
  hasVisitorOverrides: boolean
  applyPreference: (patch: VisitorDesignPreference) => void
  skipPreference: () => void
}

const PreferenceContext = createContext<PreferenceContextValue | null>(null)

function hasOverrides(preference: VisitorDesignPreference) {
  return Boolean(
    preference.themePreset ||
      preference.fontBody ||
      preference.fontHeading ||
      preference.cursorStyle ||
      preference.headerPosition,
  )
}

function writePreferenceCookie(preference: VisitorDesignPreference) {
  document.cookie = visitorDesignCookieString(preference)
}

export function PreferenceProvider({
  adminDesign,
  initialPreference,
  children,
}: {
  adminDesign?: PublicDesignSettings
  initialPreference: VisitorDesignPreference
  children: ReactNode
}) {
  const [preference, setPreference] = useState(() => normalizeVisitorDesignPreference(initialPreference))
  const design = useMemo(() => mergeVisitorDesign(adminDesign, preference), [adminDesign, preference])

  const applyPreference = useCallback((patch: VisitorDesignPreference) => {
    setPreference((current) => {
      const next = normalizeVisitorDesignPreference({ ...current, ...patch, seen: true })
      writePreferenceCookie(next)
      return next
    })
  }, [])

  const skipPreference = useCallback(() => {
    const next = normalizeVisitorDesignPreference({ seen: true })
    writePreferenceCookie(next)
    setPreference(next)
  }, [])

  const value = useMemo<PreferenceContextValue>(
    () => ({
      adminDesign,
      design,
      preference,
      hasSeenPreference: preference.seen === true,
      hasVisitorOverrides: hasOverrides(preference),
      applyPreference,
      skipPreference,
    }),
    [adminDesign, applyPreference, design, preference, skipPreference],
  )

  return (
    <PreferenceContext.Provider value={value}>
      <style data-visitor-design dangerouslySetInnerHTML={{ __html: buildDesignCss(design) }} />
      {children}
    </PreferenceContext.Provider>
  )
}

export function useOptionalPreference() {
  return useContext(PreferenceContext)
}

export function usePreference() {
  const context = useOptionalPreference()
  if (!context) {
    throw new Error('usePreference must be used within PreferenceProvider')
  }
  return context
}
