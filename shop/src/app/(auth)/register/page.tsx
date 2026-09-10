"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    // TODO: Implement registration logic
    setTimeout(() => setIsLoading(false), 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Регистрация</CardTitle>
          <CardDescription>Создайте новый аккаунт</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Имя</label>
                <Input type="text" placeholder="Иван" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Фамилия</label>
                <Input type="text" placeholder="Петров" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Телефон</label>
              <Input type="tel" placeholder="+998 90 123 45 67" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input type="email" placeholder="email@example.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Пароль</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Минимум 8 символов"
                  required
                  minLength={8}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Подтвердите пароль</label>
              <Input
                type="password"
                placeholder="Повторите пароль"
                required
              />
            </div>
            <div className="flex items-start gap-2 text-sm">
              <input type="checkbox" className="rounded mt-1" required />
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
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Регистрация..." : "Зарегистрироваться"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            Уже есть аккаунт?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Войти
            </Link>
          </div>

          <div className="mt-4">
            <Link href="/" className="block text-center text-sm text-gray-500 hover:text-primary">
              Вернуться в магазин
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
