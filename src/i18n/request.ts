import { getRequestConfig } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { routing } from './routing'

// Per-request i18n config. `requestLocale` corresponds to the `[locale]` URL
// segment (resolved by the middleware); it falls back to the default locale for
// non-localized requests (e.g. `/admin`).
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
