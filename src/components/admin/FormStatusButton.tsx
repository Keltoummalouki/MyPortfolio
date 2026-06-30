'use client'

import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'

export default function FormStatusButton({
  children,
  variant,
  size,
  className,
}: {
  children: React.ReactNode
  variant?: React.ComponentProps<typeof Button>['variant']
  size?: React.ComponentProps<typeof Button>['size']
  className?: string
}) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} variant={variant} size={size} className={className}>
      {pending ? 'Saving…' : children}
    </Button>
  )
}

