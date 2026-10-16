import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OrderStatus } from "@/components/admin/ui"
import { CustomerControls } from "@/components/admin/customers/CustomerControls"
import { can, getStaff } from "@/lib/admin"
import { prisma } from "@/lib/prisma"
import { CUSTOMER_ROLE } from "@/lib/roles"
import { formatDate, formatDateTime, formatSum } from "@/lib/utils"

export const metadata = { title: "Клиент" }

export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const staff = (await getStaff())!
  const [customer, groups] = await Promise.all([
    prisma.user.findFirst({
      where: { id, role: { name: CUSTOMER_ROLE } },
      include: {
        customerGroup: true,
        orders: { orderBy: { createdAt: "desc" }, include: { _count: { select: { items: true } } } },
      },
    }),
    prisma.customerGroup.findMany({ orderBy: { name: "asc" } }),
  ])
  if (!customer) notFound()

  const paid = customer.orders.filter((o) => o.status !== "CANCELLED")
  const spent = paid.reduce((sum, o) => sum + Number(o.total), 0)
  const name = [customer.firstName, customer.lastName].filter(Boolean).join(" ") || "Без имени"
  const showOrderLinks = can(staff, "orders")

  return (
    <div className="space-y-6">
      <Link href="/admin/customers" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" /> Все клиенты
      </Link>
      <div>
        <h1 className="text-2xl font-bold">{name}</h1>
        <p className="text-sm text-gray-500">Клиент с {formatDate(customer.createdAt)}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Заказов", value: String(paid.length) },
          { label: "Сумма покупок", value: formatSum(spent) },
          { label: "Средний чек", value: formatSum(paid.length ? Math.round(spent / paid.length) : 0) },
          { label: "Отменено", value: String(customer.orders.length - paid.length) },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className="text-xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Заказы</CardTitle></CardHeader>
          <CardContent>
            {customer.orders.length === 0 ? (
              <p className="text-sm text-gray-500">Заказов нет</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody>
                    {customer.orders.map((o) => (
                      <tr key={o.id} className="border-b last:border-0">
                        <td className="py-3 pr-3">
                          {showOrderLinks ? (
                            <Link href={`/admin/orders/${o.id}`} className="font-medium text-primary hover:underline">{o.orderNumber}</Link>
                          ) : (
                            <span className="font-medium">{o.orderNumber}</span>
                          )}
                          <p className="text-gray-500">{o._count.items} поз.</p>
                        </td>
                        <td className="py-3 pr-3 font-medium whitespace-nowrap">{formatSum(Number(o.total))}</td>
                        <td className="py-3 pr-3"><OrderStatus status={o.status} /></td>
                        <td className="py-3 text-right text-gray-500 whitespace-nowrap">{formatDateTime(o.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Контакты</CardTitle></CardHeader>
            <CardContent>
              <dl className="space-y-2 text-sm">
                {[
                  ["Телефон", customer.phone],
                  ["Email", customer.email],
                  ["Telegram", customer.telegram],
                  ["Компания", customer.company],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4">
                    <dt className="text-gray-500">{label}</dt>
                    <dd className="text-right break-all">{value || "—"}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
          <CustomerControls
            id={customer.id}
            customerGroupId={customer.customerGroupId ?? ""}
            isActive={customer.isActive}
            groups={groups.map((g) => ({ id: g.id, name: g.displayName, discount: Number(g.discount) }))}
          />
        </div>
      </div>
    </div>
  )
}
