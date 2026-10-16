import Link from "next/link"
import { Prisma } from "@prisma/client"
import { ArrowDownRight, ArrowUpRight, ShoppingCart, TrendingUp, Users, Wallet } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SalesChart, type SalesPoint } from "@/components/admin/analytics/SalesChart"
import { prisma } from "@/lib/prisma"
import { change, dayStart, monthStart, pctLabel, periodTotals } from "@/lib/stats"
import { cn, formatSum } from "@/lib/utils"

export const metadata = { title: "Аналитика" }

const PERIODS = {
  week: { label: "7 дней", days: 7 },
  month: { label: "30 дней", days: 30 },
  quarter: { label: "Квартал", months: 3 },
  year: { label: "Год", months: 12 },
} as const
type Period = keyof typeof PERIODS

const TZ = "Asia/Tashkent"
const monthNames = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"]

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const { period: raw } = await searchParams
  const period: Period = raw && raw in PERIODS ? (raw as Period) : "month"
  const conf = PERIODS[period]

  // Текущий период и такой же предыдущий для сравнения
  const byMonth = "months" in conf
  const to = byMonth ? monthStart(1) : dayStart(1)
  const from = byMonth ? monthStart(1 - conf.months) : dayStart(1 - conf.days)
  const prevFrom = byMonth ? monthStart(1 - 2 * conf.months) : dayStart(1 - 2 * conf.days)

  const sold: Prisma.OrderWhereInput = { status: { not: "CANCELLED" }, createdAt: { gte: from, lt: to } }

  const [current, previous, orders, topProducts, topCustomers, categories, cancelled] = await Promise.all([
    periodTotals(from, to),
    periodTotals(prevFrom, from),
    prisma.order.findMany({ where: sold, select: { total: true, createdAt: true } }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      where: { order: sold },
      _sum: { quantity: true, total: true },
      orderBy: { _sum: { total: "desc" } },
      take: 5,
    }),
    prisma.order.groupBy({
      by: ["userId"],
      where: sold,
      _sum: { total: true },
      _count: { _all: true },
      orderBy: { _sum: { total: "desc" } },
      take: 5,
    }),
    prisma.$queryRaw<{ name: string; revenue: string; quantity: number }[]>`
      SELECT c."name", SUM(oi."total")::text AS revenue, SUM(oi."quantity")::int AS quantity
      FROM "OrderItem" oi
      JOIN "Order" o ON o."id" = oi."orderId"
      JOIN "Product" p ON p."id" = oi."productId"
      JOIN "Category" c ON c."id" = p."categoryId"
      WHERE o."status" <> 'CANCELLED' AND o."createdAt" >= ${from} AND o."createdAt" < ${to}
      GROUP BY c."name" ORDER BY SUM(oi."total") DESC`,
    prisma.order.count({ where: { status: "CANCELLED", createdAt: { gte: from, lt: to } } }),
  ])

  const [products, customers] = await Promise.all([
    prisma.product.findMany({ where: { id: { in: topProducts.map((p) => p.productId) } }, select: { id: true, name: true, unit: true } }),
    prisma.user.findMany({
      where: { id: { in: topCustomers.map((c) => c.userId) } },
      select: { id: true, firstName: true, lastName: true, company: true, email: true },
    }),
  ])

  // Столбцы графика: по дням или по месяцам, по времени Ташкента
  const keyOf = (d: Date) => {
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d)
    return byMonth ? parts.slice(0, 7) : parts
  }
  const buckets = new Map<string, SalesPoint>()
  if (byMonth) {
    for (let i = 0; i < conf.months; i++) {
      const k = keyOf(monthStart(1 - conf.months + i))
      buckets.set(k, { label: `${monthNames[Number(k.slice(5, 7)) - 1]} ${k.slice(2, 4)}`, revenue: 0, orders: 0 })
    }
  } else {
    for (let i = 0; i < conf.days; i++) {
      const k = keyOf(dayStart(1 - conf.days + i))
      buckets.set(k, { label: `${k.slice(8, 10)}.${k.slice(5, 7)}`, revenue: 0, orders: 0 })
    }
  }
  for (const o of orders) {
    const b = buckets.get(keyOf(o.createdAt))
    if (b) {
      b.revenue += Number(o.total)
      b.orders += 1
    }
  }
  const series = [...buckets.values()]

  const kpis = [
    { name: "Выручка", value: formatSum(current.revenue), change: change(current.revenue, previous.revenue), icon: TrendingUp },
    { name: "Заказов", value: String(current.orders), change: change(current.orders, previous.orders), icon: ShoppingCart },
    { name: "Средний чек", value: formatSum(current.avgCheck), change: change(current.avgCheck, previous.avgCheck), icon: Wallet },
    { name: "Новых клиентов", value: String(current.customers), change: change(current.customers, previous.customers), icon: Users },
  ]
  const categoryTotal = categories.reduce((s, c) => s + Number(c.revenue), 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Аналитика</h1>
          <p className="text-sm text-gray-500">Без отменённых заказов{cancelled > 0 && ` · отменено за период: ${cancelled}`}</p>
        </div>
        <div className="flex rounded-lg border bg-white p-1">
          {(Object.keys(PERIODS) as Period[]).map((p) => (
            <Link
              key={p}
              href={`/admin/analytics?period=${p}`}
              className={cn("px-3 py-1.5 text-sm rounded-md", p === period ? "bg-primary text-white" : "hover:bg-gray-100")}
            >
              {PERIODS[p].label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card key={k.name}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{k.name}</p>
                  <p className="text-2xl font-bold mt-1">{k.value}</p>
                  <p className="flex items-center mt-2 text-sm">
                    {k.change === null || k.change >= 0
                      ? <ArrowUpRight className="h-4 w-4 text-green-600" />
                      : <ArrowDownRight className="h-4 w-4 text-red-600" />}
                    <span className={k.change === null || k.change >= 0 ? "text-green-600" : "text-red-600"}>{pctLabel(k.change)}</span>
                    <span className="text-gray-400 ml-1">к прошлому периоду</span>
                  </p>
                </div>
                <k.icon className="h-6 w-6 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Выручка {byMonth ? "по месяцам" : "по дням"}</CardTitle>
        </CardHeader>
        <CardContent>
          {current.orders === 0 ? (
            <p className="py-16 text-center text-gray-500">За этот период продаж нет</p>
          ) : (
            <SalesChart data={series} />
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        <TopList
          title="Топ товаров"
          empty="Нет продаж"
          rows={topProducts.map((t) => {
            const p = products.find((x) => x.id === t.productId)
            return {
              key: t.productId,
              name: p?.name ?? "Удалённый товар",
              href: p ? `/admin/products/${p.id}` : undefined,
              sub: `${t._sum.quantity ?? 0} ${p?.unit ?? "шт"}`,
              value: formatSum(Number(t._sum.total ?? 0)),
            }
          })}
        />
        <TopList
          title="Топ клиентов"
          empty="Нет заказов"
          rows={topCustomers.map((t) => {
            const c = customers.find((x) => x.id === t.userId)
            return {
              key: t.userId,
              name: c ? [c.firstName, c.lastName].filter(Boolean).join(" ") || c.email : "—",
              href: c ? `/admin/customers/${c.id}` : undefined,
              sub: [c?.company, `${t._count._all} заказ(ов)`].filter(Boolean).join(" · "),
              value: formatSum(Number(t._sum.total ?? 0)),
            }
          })}
        />
        <Card>
          <CardHeader><CardTitle>По категориям</CardTitle></CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <p className="text-sm text-gray-500">Нет продаж</p>
            ) : (
              <ul className="space-y-4">
                {categories.map((c) => {
                  const share = categoryTotal ? Math.round((Number(c.revenue) / categoryTotal) * 100) : 0
                  return (
                    <li key={c.name} className="text-sm">
                      <div className="flex justify-between gap-2 mb-1">
                        <span className="font-medium">{c.name}</span>
                        <span className="text-gray-600 whitespace-nowrap">{formatSum(Number(c.revenue))} · {share}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100">
                        <div className="h-2 rounded-full bg-[#65a30d]" style={{ width: `${Math.max(share, 2)}%` }} />
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function TopList({ title, empty, rows }: {
  title: string
  empty: string
  rows: { key: string; name: string; href?: string; sub: string; value: string }[]
}) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-gray-500">{empty}</p>
        ) : (
          <ol className="space-y-3">
            {rows.map((r, i) => (
              <li key={r.key} className="flex items-center gap-3 text-sm">
                <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  {r.href ? (
                    <Link href={r.href} className="font-medium hover:text-primary line-clamp-1">{r.name}</Link>
                  ) : (
                    <p className="font-medium line-clamp-1">{r.name}</p>
                  )}
                  <p className="text-gray-500">{r.sub}</p>
                </div>
                <span className="font-semibold whitespace-nowrap">{r.value}</span>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}
