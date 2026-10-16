import Link from "next/link"
import { Phone, Send } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSiteSettings, telHref, telegramHref } from "@/lib/settings"

export const metadata = { title: "Восстановление пароля" }

// Писем и SMS магазин пока не отправляет — пароль сбрасывает менеджер (Админка → Клиенты)
export default async function ForgotPasswordPage() {
  const site = await getSiteSettings()
  const telegram = telegramHref(site.telegram)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Забыли пароль?</CardTitle>
          <CardDescription>
            Свяжитесь с нами — менеджер проверит ваш номер телефона и выдаст новый пароль.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {site.phone && (
            <a href={telHref(site.phone)} className="flex items-center gap-3 rounded-lg border p-3 hover:border-primary">
              <Phone className="h-5 w-5 text-primary" />
              <span className="font-medium">{site.phone}</span>
            </a>
          )}
          {telegram && (
            <a href={telegram} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-lg border p-3 hover:border-primary">
              <Send className="h-5 w-5 text-primary" />
              <span className="font-medium">{site.telegram}</span>
            </a>
          )}
          {site.workingHours && <p className="text-sm text-gray-500 text-center">{site.workingHours}</p>}
          <Link href="/login" className="block text-center text-sm text-primary hover:underline pt-2">
            Вернуться ко входу
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
