import Link from "next/link"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { LoginForm } from "@/components/auth/LoginForm"
import { auth } from "@/lib/auth"
import { isStaffRole } from "@/lib/roles"

export const metadata = { title: "Вход" }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const session = await auth()
  if (session?.user) {
    redirect(isStaffRole(session.user.role) ? "/admin" : "/account")
  }

  const { callbackUrl } = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Вход</CardTitle>
          <CardDescription>Войдите в свой аккаунт</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm callbackUrl={callbackUrl} />

          <div className="mt-6 text-center text-sm">
            Нет аккаунта?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Зарегистрироваться
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
