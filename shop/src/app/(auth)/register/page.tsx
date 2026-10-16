import Link from "next/link"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { RegisterForm } from "@/components/auth/RegisterForm"
import { auth } from "@/lib/auth"

export const metadata = { title: "Регистрация" }

export default async function RegisterPage() {
  const session = await auth()
  if (session?.user) {
    redirect("/account")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Регистрация</CardTitle>
          <CardDescription>Создайте новый аккаунт</CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />

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
