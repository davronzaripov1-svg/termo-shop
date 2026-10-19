"use client"

import { useEffect, useState } from "react"
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Metrics = {
  totalRevenue: number
  revenueChange: number
  totalOrders: number
  ordersChange: number
  avgOrderValue: number
  avgOrderChange: number
  newCustomers: number
  customersChange: number
}

type SalesData = {
  month: string
  sales: number
  orders: number
}

type TopProduct = {
  name: string
  sales: number
  revenue: number
}

type TopCustomer = {
  name: string
  orders: number
  total: number
}

type CategoryStat = {
  name: string
  percentage: number
  color: string
}

type QuickStats = {
  completionRate: number
  avgDeliveryDays: number
  avgRating: number
  repeatPurchaseRate: number
}

type AnalyticsData = {
  metrics: Metrics
  salesData: SalesData[]
  topProducts: TopProduct[]
  topCustomers: TopCustomer[]
  categoryStats: CategoryStat[]
  quickStats: QuickStats
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("ru-RU").format(price) + " сум"
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("month")

  useEffect(() => {
    loadData()
  }, [period])

  async function loadData() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/analytics?period=${period}`)
      if (res.ok) {
        setData(await res.json())
      }
    } finally {
      setLoading(false)
    }
  }

  const maxSales = data?.salesData ? Math.max(...data.salesData.map((d) => d.sales), 1) : 1

  function ChangeIndicator({ value }: { value: number }) {
    if (value > 0) {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <ArrowUpRight className="h-4 w-4" />
          <span className="text-sm">+{value}%</span>
        </div>
      )
    } else if (value < 0) {
      return (
        <div className="flex items-center gap-1 text-red-600">
          <ArrowDownRight className="h-4 w-4" />
          <span className="text-sm">{value}%</span>
        </div>
      )
    }
    return <span className="text-sm text-gray-400">0%</span>
  }

  if (loading) {
    return <div className="text-gray-500">Загрузка...</div>
  }

  if (!data) {
    return <div className="text-gray-500">Ошибка загрузки данных</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Аналитика</h1>
          <p className="text-gray-500">Статистика продаж и отчеты</p>
        </div>
        <div className="flex gap-2">
          <select
            className="px-3 py-2 border rounded-lg text-sm"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="week">Неделя</option>
            <option value="month">Месяц</option>
            <option value="quarter">Квартал</option>
            <option value="year">Год</option>
          </select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Экспорт
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Общая выручка</p>
                <p className="text-2xl font-bold mt-1">{formatPrice(data.metrics.totalRevenue)}</p>
                <div className="mt-2">
                  <ChangeIndicator value={data.metrics.revenueChange} />
                </div>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Заказов</p>
                <p className="text-2xl font-bold mt-1">{data.metrics.totalOrders}</p>
                <div className="mt-2">
                  <ChangeIndicator value={data.metrics.ordersChange} />
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Средний чек</p>
                <p className="text-2xl font-bold mt-1">{formatPrice(data.metrics.avgOrderValue)}</p>
                <div className="mt-2">
                  <ChangeIndicator value={data.metrics.avgOrderChange} />
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Новых клиентов</p>
                <p className="text-2xl font-bold mt-1">{data.metrics.newCustomers}</p>
                <div className="mt-2">
                  <ChangeIndicator value={data.metrics.customersChange} />
                </div>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Динамика продаж</CardTitle>
          </CardHeader>
          <CardContent>
            {data.salesData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                Нет данных
              </div>
            ) : (
              <div className="h-[300px] flex items-end gap-2">
                {data.salesData.map((item, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-primary rounded-t transition-all hover:bg-primary/80"
                      style={{ height: `${(item.sales / maxSales) * 250}px`, minHeight: item.sales > 0 ? "4px" : "0" }}
                      title={`${formatPrice(item.sales)} (${item.orders} заказов)`}
                    />
                    <span className="text-xs text-gray-500">{item.month}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>По категориям</CardTitle>
          </CardHeader>
          <CardContent>
            {data.categoryStats.length === 0 ? (
              <div className="py-8 text-center text-gray-500">Нет данных</div>
            ) : (
              <div className="space-y-4">
                {data.categoryStats.map((cat, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{cat.name}</span>
                      <span className="font-medium">{cat.percentage}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${cat.color} rounded-full`}
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Топ товаров
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.topProducts.length === 0 ? (
              <div className="py-8 text-center text-gray-500">Нет данных</div>
            ) : (
              <div className="space-y-4">
                {data.topProducts.map((product, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.sales} продаж</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatPrice(product.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Топ клиентов
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.topCustomers.length === 0 ? (
              <div className="py-8 text-center text-gray-500">Нет данных</div>
            ) : (
              <div className="space-y-4">
                {data.topCustomers.map((customer, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-sm text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{customer.name}</p>
                      <p className="text-sm text-gray-500">{customer.orders} заказов</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatPrice(customer.total)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-primary">{data.quickStats.completionRate}%</p>
            <p className="text-sm text-gray-500 mt-1">Выполнение заказов</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-blue-600">{data.quickStats.avgDeliveryDays} дня</p>
            <p className="text-sm text-gray-500 mt-1">Среднее время доставки</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-green-600">{data.quickStats.avgRating}</p>
            <p className="text-sm text-gray-500 mt-1">Средний рейтинг</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-purple-600">{data.quickStats.repeatPurchaseRate}%</p>
            <p className="text-sm text-gray-500 mt-1">Повторные покупки</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
