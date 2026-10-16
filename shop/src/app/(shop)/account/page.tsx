import Link from "next/link"
import { redirect } from "next/navigation"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isStaffRole } from "@/lib/roles"
import { logout } from "@/app/actions/auth"
import { OrderStatusBadge } from "@/components/shop/OrderStatusBadge"
import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm"
import { formatDateTime, formatSum } from "@/lib/utils"

export const metadata = { title: "Личный кабинет" }

export default async function AccountPage() {
  const session = await auth()
  if (!session?.user) {
    redirect("/login?callbackUrl=/account")
  }

  const [user, orders] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { firstName: true, lastName: true, email: true, phone: true },
    }),
    prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: { orderNumber: true, status: true, total: true, createdAt: true, _count: { select: { items: true } } },
    }),
  ])
  if (!user) {
    redirect("/login")
  }

  const rows = [
    { label: "Имя", value: [user.firstName, user.lastName].filter(Boolean).join(" ") || "—" },
    { label: "Email", value: user.email },
    { label: "Телефон", value: user.phone || "—" },
  ]

  return (
    <div className="container mx-auto px-4 py-10 max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Личный кабинет</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <dl className="space-y-3">
            {rows.map((row) => (
              <div key={row.label} className="flex justify-between gap-4 border-b pb-3 last:border-0">
                <dt className="text-gray-500">{row.label}</dt>
                <dd className="font-medium text-right break-all">{row.value}</dd>
              </div>
            ))}
          </dl>

          <div className="flex flex-wrap gap-3">
            {isStaffRole(session.user.role) && (
              <Link href="/admin">
                <Button>Панель управления</Button>
              </Link>
            )}
            <form action={logout}>
              <Button type="submit" variant="outline">
                <LogOut className="h-4 w-4 mr-2" />
                Выйти
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-xl">Мои заказы</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-gray-500">
              Заказов пока нет.{" "}
              <Link href="/catalog" className="text-primary hover:underline">Перейти в каталог</Link>
            </p>
          ) : (
            <ul className="divide-y">
              {orders.map((order) => (
                <li key={order.orderNumber}>
                  <Link
                    href={`/account/orders/${order.orderNumber}`}
                    className="flex flex-wrap items-center justify-between gap-3 py-3 hover:text-primary"
                  >
                    <div>
                      <p className="font-medium">№ {order.orderNumber}</p>
                      <p className="text-sm text-gray-500">
                        {formatDateTime(order.createdAt)} · {order._count.items} поз.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{formatSum(Number(order.total))}</span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-xl">Смена пароля</CardTitle>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  )
}
