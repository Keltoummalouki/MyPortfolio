import 'server-only'

import { cookies } from 'next/headers'
import {
  VISITOR_DESIGN_COOKIE,
  parseVisitorDesignPreference,
  type VisitorDesignPreference,
} from './options'

export async function readVisitorDesignPreference(): Promise<VisitorDesignPreference> {
  const cookieStore = await cookies()
  return parseVisitorDesignPreference(cookieStore.get(VISITOR_DESIGN_COOKIE)?.value)
}
