import Link from "next/link"
import { ShoppingCart, Users, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight, Wallet, ShieldAlert } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OrderStatus } from "@/components/admin/ui"
import { PERMISSIONS, can, getStaff, type Permission } from "@/lib/admin"
import { prisma } from "@/lib/prisma"
import { change, lowStockProducts, monthStart, pctLabel, periodTotals } from "@/lib/stats"
import { formatDateTime, formatSum } from "@/lib/utils"

export const metadata = { title: "Dashboard" }

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>
}) {
  const staff = (await getStaff())!
  const { denied } = await searchParams
  const seeOrders = can(staff, "orders")
  const seeStock = can(staff, "warehouse") || can(staff, "products")

  const [current, previous, recentOrders, lowStock, counters] = await Promise.all([
    seeOrders ? periodTotals(monthStart(0), monthStart(1)) : null,
    seeOrders ? periodTotals(monthStart(-1), monthStart(0)) : null,
    seeOrders
      ? prisma.order.findMany({
          orderBy: { createdAt: "desc" },
          take: 6,
          select: { id: true, orderNumber: true, customerName: true, total: true, status: true, createdAt: true },
        })
      : [],
    seeStock ? lowStockProducts(6) : [],
    seeOrders
      ? Promise.all([
          prisma.order.count({ where: { status: "NEW" } }),
          prisma.order.count({ where: { status: { in: ["CONFIRMED", "PROCESSING", "PICKING", "READY"] } } }),
          prisma.order.count({ where: { status: { not: "CANCELLED" }, paymentStatus: "PENDING" } }),
          prisma.order.count({ where: { status: "SHIPPING" } }),
        ])
      : null,
  ])

  const stats = current && previous
    ? [
        { name: "Выручка за месяц", value: formatSum(current.revenue), change: change(current.revenue, previous.revenue), icon: TrendingUp },
        { name: "Заказов за месяц", value: String(current.orders), change: change(current.orders, previous.orders), icon: ShoppingCart },
        { name: "Средний чек", value: formatSum(current.avgCheck), change: change(current.avgCheck, previous.avgCheck), icon: Wallet },
        { name: "Новых клиентов", value: String(current.customers), change: change(current.customers, previous.customers), icon: Users },
      ]
    : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Здравствуйте, {staff.name}</h1>
        <p className="text-sm text-gray-500">{staff.roleDisplayName}</p>
      </div>

      {denied && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <ShieldAlert className="h-4 w-4" />
          Нет доступа к разделу «{PERMISSIONS[denied as Permission] ?? denied}». Обратитесь к администратору.
        </div>
      )}

      {stats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.name}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.name}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    <div className="flex items-center mt-2 text-sm">
                      {stat.change === null || stat.change >= 0 ? (
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                      )}
                      <span className={stat.change === null || stat.change >= 0 ? "text-green-500" : "text-red-500"}>
                        {pctLabel(stat.change)}
                      </span>
                      <span className="text-gray-400 ml-1">к прошлому месяцу</span>
                    </div>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {counters && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Новые заказы", value: counters[0], href: "/admin/orders?status=NEW", color: "text-blue-600" },
            { label: "В работе", value: counters[1], href: "/admin/orders", color: "text-yellow-600" },
            { label: "Ждут оплаты", value: counters[2], href: "/admin/orders", color: "text-orange-600" },
            { label: "В доставке", value: counters[3], href: "/admin/orders?status=SHIPPING", color: "text-purple-600" },
          ].map((c) => (
            <Link key={c.label} href={c.href}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
                  <p className="text-sm text-gray-500">{c.label}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {seeOrders && (
          <Card className={seeStock ? "lg:col-span-2" : "lg:col-span-3"}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Последние заказы</CardTitle>
              <Link href="/admin/orders" className="text-sm text-primary hover:underline">Все заказы</Link>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <p className="text-gray-500 text-sm">Заказов пока нет</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <tbody>
                      {recentOrders.map((o) => (
                        <tr key={o.id} className="border-b last:border-0">
                          <td className="py-3 pr-3">
                            <Link href={`/admin/orders/${o.id}`} className="font-medium text-primary hover:underline">{o.orderNumber}</Link>
                            <p className="text-gray-500">{o.customerName}</p>
                          </td>
                          <td className="py-3 pr-3 font-medium whitespace-nowrap">{formatSum(Number(o.total))}</td>
                          <td className="py-3 pr-3"><OrderStatus status={o.status} /></td>
                          <td className="py-3 text-gray-500 whitespace-nowrap text-right">{formatDateTime(o.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {seeStock && (
          <Card className={seeOrders ? "" : "lg:col-span-3"}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Заканчиваются
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lowStock.length === 0 ? (
                <p className="text-sm text-gray-500">Все товары в достатке</p>
              ) : (
                <ul className="space-y-3">
                  {lowStock.map((p) => {
                    const free = p.stock - p.reserved
                    return (
                      <li key={p.id} className="flex items-center justify-between gap-3 text-sm">
                        <div className="min-w-0">
                          <Link href={`/admin/products/${p.id}`} className="font-medium hover:text-primary line-clamp-1">{p.name}</Link>
                          <p className="text-gray-500">{p.sku}</p>
                        </div>
                        <span className={`whitespace-nowrap font-semibold ${free <= 0 ? "text-red-500" : "text-orange-500"}`}>
                          {free} {p.unit}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              )}
              {can(staff, "warehouse") && (
                <Link href="/admin/warehouse?filter=low" className="block mt-4 text-sm text-primary hover:underline">Открыть склад</Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
