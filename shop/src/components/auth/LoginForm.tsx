"use client"

import { useActionState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/auth/PasswordInput"
import { login } from "@/app/actions/auth"

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, formAction, isPending] = useActionState(login, undefined)

  return (
    <form action={formAction} className="space-y-4">
      {callbackUrl && <input type="hidden" name="callbackUrl" value={callbackUrl} />}
      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
      )}
      <div>
        <label htmlFor="login" className="block text-sm font-medium mb-1">Email или телефон</label>
        <Input
          id="login"
          name="login"
          type="text"
          autoComplete="username"
          defaultValue={state?.values?.login}
          placeholder="email@example.com или +998..."
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">Пароль</label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          placeholder="Введите пароль"
          required
        />
      </div>
      <div className="flex justify-end text-sm">
        <Link href="/forgot-password" className="text-primary hover:underline">
          Забыли пароль?
        </Link>
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Вход..." : "Войти"}
      </Button>
    </form>
  )
}
