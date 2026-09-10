"use client"

import { useState } from "react"
import {
  TrendingUp,
  TrendingDown,
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

const salesData = [
  { month: "Янв", sales: 4500000, orders: 45 },
  { month: "Фев", sales: 5200000, orders: 52 },
  { month: "Мар", sales: 4800000, orders: 48 },
  { month: "Апр", sales: 6100000, orders: 61 },
  { month: "Май", sales: 5500000, orders: 55 },
  { month: "Июн", sales: 7200000, orders: 72 },
  { month: "Июл", sales: 6800000, orders: 68 },
  { month: "Авг", sales: 7500000, orders: 75 },
  { month: "Сен", sales: 8200000, orders: 82 },
  { month: "Окт", sales: 7800000, orders: 78 },
  { month: "Ноя", sales: 9100000, orders: 91 },
  { month: "Дек", sales: 10500000, orders: 105 },
]

const topProducts = [
  { name: "Термотрансфер Premium A4", sales: 1250, revenue: 18750000 },
  { name: "Виниловая пленка глянцевая", sales: 890, revenue: 7565000 },
  { name: "DTF пленка рулон 60см", sales: 520, revenue: 18200000 },
  { name: "UV DTF стикеры набор", sales: 480, revenue: 6000000 },
  { name: "Порошок DTF белый 1кг", sales: 350, revenue: 5250000 },
]

const topCustomers = [
  { name: "ИП Алиев А.А.", orders: 45, total: 12500000 },
  { name: "ООО \"Принт Мастер\"", orders: 38, total: 9800000 },
  { name: "Рекламное агентство \"Брэнд\"", orders: 32, total: 8500000 },
  { name: "ИП Каримов Б.Б.", orders: 28, total: 7200000 },
  { name: "Типография \"Полиграф\"", orders: 25, total: 6800000 },
]

const categoryStats = [
  { name: "Термотрансферы", percentage: 35, color: "bg-primary" },
  { name: "Виниловые наклейки", percentage: 25, color: "bg-blue-500" },
  { name: "DTF печать", percentage: 20, color: "bg-purple-500" },
  { name: "UV DTF", percentage: 12, color: "bg-orange-500" },
  { name: "Другое", percentage: 8, color: "bg-gray-400" },
]

function formatPrice(price: number) {
  return new Intl.NumberFormat("ru-RU").format(price) + " сум"
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("month")

  const totalRevenue = salesData.reduce((acc, d) => acc + d.sales, 0)
  const totalOrders = salesData.reduce((acc, d) => acc + d.orders, 0)
  const avgOrderValue = Math.round(totalRevenue / totalOrders)
  const maxSales = Math.max(...salesData.map((d) => d.sales))

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
            <Calendar className="h-4 w-4 mr-2" />
            Выбрать даты
          </Button>
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
                <p className="text-2xl font-bold mt-1">{formatPrice(totalRevenue)}</p>
                <div className="flex items-center gap-1 mt-2 text-green-600">
                  <ArrowUpRight className="h-4 w-4" />
                  <span className="text-sm">+12.5%</span>
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
                <p className="text-2xl font-bold mt-1">{totalOrders}</p>
                <div className="flex items-center gap-1 mt-2 text-green-600">
                  <ArrowUpRight className="h-4 w-4" />
                  <span className="text-sm">+8.3%</span>
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
                <p className="text-2xl font-bold mt-1">{formatPrice(avgOrderValue)}</p>
                <div className="flex items-center gap-1 mt-2 text-green-600">
                  <ArrowUpRight className="h-4 w-4" />
                  <span className="text-sm">+3.8%</span>
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
                <p className="text-2xl font-bold mt-1">156</p>
                <div className="flex items-center gap-1 mt-2 text-red-600">
                  <ArrowDownRight className="h-4 w-4" />
                  <span className="text-sm">-2.1%</span>
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
            <div className="h-[300px] flex items-end gap-2">
              {salesData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-primary rounded-t transition-all hover:bg-primary/80"
                    style={{ height: `${(data.sales / maxSales) * 250}px` }}
                    title={formatPrice(data.sales)}
                  />
                  <span className="text-xs text-gray-500">{data.month}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>По категориям</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryStats.map((cat, index) => (
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
            <div className="space-y-4">
              {topProducts.map((product, index) => (
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
            <div className="space-y-4">
              {topCustomers.map((customer, index) => (
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
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-primary">95%</p>
            <p className="text-sm text-gray-500 mt-1">Выполнение заказов</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-blue-600">2.3 дня</p>
            <p className="text-sm text-gray-500 mt-1">Среднее время доставки</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-green-600">4.8</p>
            <p className="text-sm text-gray-500 mt-1">Средний рейтинг</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-purple-600">68%</p>
            <p className="text-sm text-gray-500 mt-1">Повторные покупки</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
