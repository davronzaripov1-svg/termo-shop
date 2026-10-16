"use client"

import { useActionState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/auth/PasswordInput"
import { register } from "@/app/actions/auth"

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1 text-sm text-red-600">{message}</p> : null
}

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(register, undefined)
  const errors = state?.fieldErrors ?? {}
  const values = state?.values ?? {}

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium mb-1">Имя</label>
          <Input id="firstName" name="firstName" defaultValue={values.firstName} type="text" autoComplete="given-name" placeholder="Иван" required />
          <FieldError message={errors.firstName} />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium mb-1">Фамилия</label>
          <Input id="lastName" name="lastName" defaultValue={values.lastName} type="text" autoComplete="family-name" placeholder="Петров" />
        </div>
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium mb-1">Телефон</label>
        <Input id="phone" name="phone" defaultValue={values.phone} type="tel" autoComplete="tel" placeholder="+998 90 123 45 67" required />
        <FieldError message={errors.phone} />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
        <Input id="email" name="email" defaultValue={values.email} type="email" autoComplete="email" placeholder="email@example.com" required />
        <FieldError message={errors.email} />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">Пароль</label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          placeholder="Минимум 8 символов"
          required
          minLength={8}
        />
        <FieldError message={errors.password} />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">Подтвердите пароль</label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Повторите пароль"
          required
        />
        <FieldError message={errors.confirmPassword} />
      </div>
      <div className="flex items-start gap-2 text-sm">
        <input type="checkbox" className="rounded mt-1" required defaultChecked={!!state?.values} />
        <span>
          Я соглашаюсь с{" "}
          <Link href="/terms" className="text-primary hover:underline">
            условиями использования
          </Link>{" "}
          и{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            политикой конфиденциальности
          </Link>
        </span>
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Регистрация..." : "Зарегистрироваться"}
      </Button>
    </form>
  )
}
