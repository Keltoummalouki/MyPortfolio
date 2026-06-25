import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'
import { cn } from '@/lib/utils'

// Safe Markdown renderer. rehype-sanitize strips any raw/unsafe HTML, so article
// bodies (and the admin preview) cannot inject scripts or markup. Element styles
// are mapped explicitly to avoid depending on a typography plugin.

const components: Components = {
  h1: ({ children }) => <h1 className="mt-8 mb-4 text-3xl font-bold text-foreground">{children}</h1>,
  h2: ({ children }) => <h2 className="mt-8 mb-3 text-2xl font-bold text-foreground">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-6 mb-2 text-xl font-semibold text-foreground">{children}</h3>,
  p: ({ children }) => <p className="my-4 leading-relaxed text-foreground/90">{children}</p>,
  a: ({ href, children }) => {
    const external = !!href && /^https?:\/\//.test(href)
    return (
      <a
        href={href}
        className="text-primary underline underline-offset-2 hover:no-underline"
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {children}
      </a>
    )
  },
  ul: ({ children }) => <ul className="my-4 list-disc space-y-1 ps-6 text-foreground/90">{children}</ul>,
  ol: ({ children }) => <ol className="my-4 list-decimal space-y-1 ps-6 text-foreground/90">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-4 border-s-4 border-primary/40 ps-4 text-muted-foreground italic">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-8 border-border" />,
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  pre: ({ children }) => (
    <pre className="my-4 overflow-x-auto rounded-lg border border-border bg-muted p-4 text-sm">
      {children}
    </pre>
  ),
  code: ({ className, children }) => {
    const isBlock = /language-/.test(className ?? '')
    if (isBlock) return <code className={cn('font-mono', className)}>{children}</code>
    return <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">{children}</code>
  },
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border border-border px-3 py-2 text-start font-semibold">{children}</th>,
  td: ({ children }) => <td className="border border-border px-3 py-2">{children}</td>,
}

export default function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn('text-foreground/90', className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  )
}
