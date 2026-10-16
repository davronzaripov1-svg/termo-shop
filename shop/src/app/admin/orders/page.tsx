import Link from "next/link"
import { Search, Eye, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyRow, OrderStatus, Pagination, PaymentStatus } from "@/components/admin/ui"
import { requirePagePermission } from "@/lib/admin"
import { prisma } from "@/lib/prisma"
import { ORDER_STATUS_LABELS } from "@/lib/checkout"
import { ORDER_STATUSES, orderWhere, parseOrderFilters } from "@/lib/orders"
import { formatDateTime, formatSum } from "@/lib/utils"

export const metadata = { title: "Заказы" }

const PAGE_SIZE = 25

const statCards = [
  { label: "Новые", statuses: ["NEW"], color: "text-blue-600", filter: "NEW" },
  { label: "В обработке", statuses: ["CONFIRMED", "PROCESSING"], color: "text-yellow-600", filter: "PROCESSING" },
  { label: "Комплектуются", statuses: ["PICKING"], color: "text-orange-600", filter: "PICKING" },
  { label: "Готовы / в доставке", statuses: ["READY", "SHIPPING"], color: "text-teal-600", filter: "READY" },
  { label: "Завершены", statuses: ["DELIVERED", "COMPLETED"], color: "text-green-600", filter: "COMPLETED" },
] as const

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await requirePagePermission("orders")
  const filters = parseOrderFilters(await searchParams)
  const where = orderWhere(filters)

  const [orders, total, byStatus] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (filters.page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        manager: { select: { firstName: true, lastName: true, email: true } },
        _count: { select: { items: true } },
      },
    }),
    prisma.order.count({ where }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
  ])
  const countOf = (statuses: readonly string[]) =>
    byStatus.filter((s) => statuses.includes(s.status)).reduce((n, s) => n + s._count._all, 0)

  const params = { q: filters.q, status: filters.status, from: filters.from, to: filters.to }
  const exportQs = new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][]).toString()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Заказы</h1>
        <Button asChild variant="outline">
          <a href={`/api/admin/orders/export${exportQs ? `?${exportQs}` : ""}`}>
            <FileText className="h-4 w-4 mr-2" />
            Экспорт в Excel
          </a>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <Link key={stat.label} href={`/admin/orders?status=${stat.filter}`}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <p className={`text-2xl font-bold ${stat.color}`}>{countOf(stat.statuses)}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <form className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                name="q"
                placeholder="Поиск по номеру, клиенту или телефону..."
                className="pl-10"
                defaultValue={filters.q}
              />
            </div>
            <select name="status" className="border rounded-lg px-3 py-2 bg-white" defaultValue={filters.status ?? ""}>
              <option value="">Все статусы</option>
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
              ))}
            </select>
            <Input type="date" name="from" className="w-auto" defaultValue={filters.from} aria-label="С даты" />
            <Input type="date" name="to" className="w-auto" defaultValue={filters.to} aria-label="По дату" />
            <div className="flex gap-2">
              <Button type="submit">Найти</Button>
              {(filters.q || filters.status || filters.from || filters.to) && (
                <Button asChild variant="ghost"><Link href="/admin/orders">Сбросить</Link></Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b bg-gray-50">
                  <th className="p-4">Заказ</th>
                  <th className="p-4">Клиент</th>
                  <th className="p-4">Позиций</th>
                  <th className="p-4">Сумма</th>
                  <th className="p-4">Оплата</th>
                  <th className="p-4">Статус</th>
                  <th className="p-4">Менеджер</th>
                  <th className="p-4">Дата</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 && <EmptyRow colSpan={9}>Заказов не найдено</EmptyRow>}
                {orders.map((order) => (
                  <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-4">
                      <Link href={`/admin/orders/${order.id}`} className="font-medium text-primary hover:underline whitespace-nowrap">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="p-4">
                      <p className="font-medium">{order.customerName}</p>
                      <p className="text-sm text-gray-500">{order.customerPhone}</p>
                    </td>
                    <td className="p-4">{order._count.items}</td>
                    <td className="p-4 font-medium whitespace-nowrap">{formatSum(Number(order.total))}</td>
                    <td className="p-4"><PaymentStatus status={order.paymentStatus} /></td>
                    <td className="p-4"><OrderStatus status={order.status} /></td>
                    <td className="p-4 text-gray-500">
                      {order.manager ? [order.manager.firstName, order.manager.lastName].filter(Boolean).join(" ") || order.manager.email : "—"}
                    </td>
                    <td className="p-4 text-sm text-gray-500 whitespace-nowrap">{formatDateTime(order.createdAt)}</td>
                    <td className="p-4">
                      <Button asChild variant="ghost" size="icon" title="Открыть">
                        <Link href={`/admin/orders/${order.id}`}><Eye className="h-4 w-4" /></Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Pagination
        path="/admin/orders"
        params={params}
        page={filters.page}
        pageCount={Math.max(1, Math.ceil(total / PAGE_SIZE))}
        total={total}
        shown={orders.length}
        noun="заказов"
      />
    </div>
  )
}
