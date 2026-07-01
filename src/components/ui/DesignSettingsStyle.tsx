import type { PublicDesignSettings } from '@/features/cms/queries'
import { buildDesignCss } from '@/features/cms/design-css'

export default function DesignSettingsStyle({ settings }: { settings?: PublicDesignSettings }) {
  const css = buildDesignCss(settings)
  if (!css) return null

  return <style dangerouslySetInnerHTML={{ __html: css }} />
}
