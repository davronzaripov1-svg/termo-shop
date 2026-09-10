import {
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const stats = [
  {
    name: "Продажи сегодня",
    value: "12 500 000 сум",
    change: "+12%",
    changeType: "positive",
    icon: TrendingUp,
  },
  {
    name: "Новые заказы",
    value: "24",
    change: "+5",
    changeType: "positive",
    icon: ShoppingCart,
  },
  {
    name: "Клиенты",
    value: "1 234",
    change: "+18",
    changeType: "positive",
    icon: Users,
  },
  {
    name: "Товары",
    value: "456",
    change: "-2",
    changeType: "negative",
    icon: Package,
  },
]

const recentOrders = [
  {
    id: "ORDER-2026-000024",
    customer: "Иван Петров",
    phone: "+998 90 123 45 67",
    total: "450 000 сум",
    status: "NEW",
    date: "10 сен 2026, 14:30",
  },
  {
    id: "ORDER-2026-000023",
    customer: "Мария Сидорова",
    phone: "+998 91 234 56 78",
    total: "1 200 000 сум",
    status: "PROCESSING",
    date: "10 сен 2026, 12:15",
  },
  {
    id: "ORDER-2026-000022",
    customer: "Алексей Козлов",
    phone: "+998 93 345 67 89",
    total: "890 000 сум",
    status: "PICKING",
    date: "10 сен 2026, 10:00",
  },
  {
    id: "ORDER-2026-000021",
    customer: "Елена Новикова",
    phone: "+998 94 456 78 90",
    total: "2 100 000 сум",
    status: "READY",
    date: "09 сен 2026, 18:45",
  },
  {
    id: "ORDER-2026-000020",
    customer: "Дмитрий Волков",
    phone: "+998 95 567 89 01",
    total: "650 000 сум",
    status: "COMPLETED",
    date: "09 сен 2026, 15:20",
  },
]

const lowStockProducts = [
  { name: "Смартфон Premium X", sku: "SM-001", stock: 3, threshold: 5 },
  { name: "Наушники Wireless Pro", sku: "HP-002", stock: 2, threshold: 10 },
  { name: "Умные часы Smart Watch", sku: "SW-003", stock: 4, threshold: 5 },
]

const statusColors: Record<string, string> = {
  NEW: "bg-blue-500",
  CONFIRMED: "bg-indigo-500",
  PROCESSING: "bg-yellow-500",
  PICKING: "bg-orange-500",
  READY: "bg-teal-500",
  SHIPPING: "bg-purple-500",
  DELIVERED: "bg-green-500",
  COMPLETED: "bg-green-700",
  CANCELLED: "bg-red-500",
}

const statusLabels: Record<string, string> = {
  NEW: "Новый",
  CONFIRMED: "Подтвержден",
  PROCESSING: "В обработке",
  PICKING: "Комплектуется",
  READY: "Готов",
  SHIPPING: "Доставка",
  DELIVERED: "Доставлен",
  COMPLETED: "Завершен",
  CANCELLED: "Отменен",
}

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.name}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    {stat.changeType === "positive" ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    )}
                    <span
                      className={
                        stat.changeType === "positive"
                          ? "text-green-500 text-sm"
                          : "text-red-500 text-sm"
                      }
                    >
                      {stat.change}
                    </span>
                    <span className="text-gray-400 text-sm ml-1">vs вчера</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Последние заказы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 border-b">
                    <th className="pb-3">Заказ</th>
                    <th className="pb-3">Клиент</th>
                    <th className="pb-3">Сумма</th>
                    <th className="pb-3">Статус</th>
                    <th className="pb-3">Дата</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b last:border-0">
                      <td className="py-3">
                        <span className="font-medium">{order.id}</span>
                      </td>
                      <td className="py-3">
                        <div>
                          <p className="font-medium">{order.customer}</p>
                          <p className="text-sm text-gray-500">{order.phone}</p>
                        </div>
                      </td>
                      <td className="py-3 font-medium">{order.total}</td>
                      <td className="py-3">
                        <Badge className={statusColors[order.status]}>
                          {statusLabels[order.status]}
                        </Badge>
                      </td>
                      <td className="py-3 text-sm text-gray-500">{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Низкий остаток
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockProducts.map((product) => (
                <div
                  key={product.sku}
                  className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-yellow-600">{product.stock} шт</p>
                    <p className="text-xs text-gray-500">мин: {product.threshold}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">8</p>
            <p className="text-sm text-gray-500">Новых заказов</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-yellow-600">5</p>
            <p className="text-sm text-gray-500">В обработке</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-600">11</p>
            <p className="text-sm text-gray-500">Завершено сегодня</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-purple-600">890 000</p>
            <p className="text-sm text-gray-500">Средний чек</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
