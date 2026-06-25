'use client'

import { useActionState } from 'react'
import { signInAction, type SignInState } from '@/features/auth/actions'
import { Button } from '@/components/ui/button'

const initialState: SignInState = {}

const fieldClass =
  'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]'

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(signInAction, initialState)

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.error && (
        <p
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </p>
      )}

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={state.error ? true : undefined}
          className={fieldClass}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium text-foreground">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={state.error ? true : undefined}
          className={fieldClass}
        />
      </div>

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  )
}
