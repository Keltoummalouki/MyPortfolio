import type { PublicDesignSettings } from '@/features/cms/queries'
import { cursorCss, fontStack } from '@/features/cms/design-options'

const HEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

function color(value: string | undefined) {
  return value && HEX.test(value) ? value : ''
}

export default function DesignSettingsStyle({ settings }: { settings?: PublicDesignSettings }) {
  if (!settings) return null

  const primary = color(settings.primaryColor)
  const accent = color(settings.accentColor)
  const bodyFont = fontStack(settings.fontBody, 'space-grotesk')
  const headingFont = fontStack(settings.fontHeading, 'archivo')
  const cursor = cursorCss(settings.cursorStyle)

  const css = `
    :root, .dark {
      ${primary ? `--primary: ${primary}; --ring: ${primary}; --sidebar-primary: ${primary}; --chart-1: ${primary};` : ''}
      ${accent && primary ? `--gradient-primary: linear-gradient(135deg, ${primary} 0%, ${accent} 100%);` : ''}
      ${accent ? `--chart-2: ${accent};` : ''}
    }
    body { font-family: ${bodyFont}; ${cursor} }
    h1, h2, h3, h4, h5, h6 { font-family: ${headingFont}; }
    a, button, [role="button"], input[type="submit"], input[type="button"], .cursor-pointer { ${cursor} }
  `

  return <style dangerouslySetInnerHTML={{ __html: css }} />
}
