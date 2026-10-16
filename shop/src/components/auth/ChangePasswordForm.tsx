"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { PasswordInput } from "@/components/auth/PasswordInput"
import { changePassword } from "@/app/actions/auth"

export function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(changePassword, undefined)
  const errors = state?.fieldErrors ?? {}

  return (
    <form action={formAction} className="space-y-3">
      {state?.success && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">Пароль изменён</p>
      )}
      {state?.error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>}
      {[
        { name: "currentPassword", label: "Текущий пароль", autoComplete: "current-password" },
        { name: "newPassword", label: "Новый пароль", autoComplete: "new-password" },
        { name: "confirmPassword", label: "Повторите новый пароль", autoComplete: "new-password" },
      ].map((f) => (
        <label key={f.name} className="block text-sm">
          <span className="font-medium">{f.label}</span>
          <PasswordInput name={f.name} autoComplete={f.autoComplete} required className="mt-1" />
          {errors[f.name] && <span className="mt-1 block text-red-600">{errors[f.name]}</span>}
        </label>
      ))}
      <Button type="submit" variant="outline" disabled={isPending}>
        {isPending ? "Сохранение..." : "Сменить пароль"}
      </Button>
    </form>
  )
}
