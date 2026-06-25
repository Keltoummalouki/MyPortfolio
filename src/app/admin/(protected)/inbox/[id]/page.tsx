import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail } from 'lucide-react'
import { getMessage } from '@/features/inbox/queries'
import { updateMessageStatusAction } from '@/features/inbox/actions'
import { MESSAGE_STATUSES } from '@/features/inbox/schema'
import { Button } from '@/components/ui/button'

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function MessageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const message = await getMessage(id)
  if (!message) notFound()

  // Safe mailto: reply (subject/body are URL-encoded; message stays plain text).
  const mailtoSubject = encodeURIComponent(`Re: ${message.subject ?? 'Your message'}`)
  const mailto = `mailto:${message.email}?subject=${mailtoSubject}`

  return (
    <div className="max-w-3xl space-y-6">
      <Link
        href="/admin/inbox"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Back to inbox
      </Link>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">{message.name}</h1>
            <a href={`mailto:${message.email}`} className="text-sm text-primary hover:underline">
              {message.email}
            </a>
          </div>
          <time className="text-xs text-muted-foreground" dateTime={message.created_at}>
            {formatDateTime(message.created_at)}
          </time>
        </div>

        {message.subject && (
          <p className="mb-2 text-sm font-medium text-foreground">{message.subject}</p>
        )}
        {/* Rendered as plain text — never as HTML — so message content cannot inject markup. */}
        <p className="whitespace-pre-wrap break-words text-sm text-foreground">{message.message}</p>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <Button asChild>
          <a href={mailto}>
            <Mail size={16} />
            Reply by email
          </a>
        </Button>

        <form action={updateMessageStatusAction} className="flex items-end gap-2">
          <input type="hidden" name="id" value={message.id} />
          <div className="space-y-1.5">
            <label htmlFor="status" className="text-sm font-medium text-foreground">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={message.status}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm capitalize text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              {MESSAGE_STATUSES.map((s) => (
                <option key={s} value={s} className="capitalize">
                  {s}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" variant="outline">
            Update
          </Button>
        </form>
      </div>
    </div>
  )
}
