import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

// Locale-aware navigation wrappers. `Link`/`useRouter` automatically prepend the
// active locale prefix, so callers use unprefixed pathnames (e.g. "/blog").
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing)
