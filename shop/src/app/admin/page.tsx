"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type Stats = {
  totalOrders: number
  todayOrders: number
  monthOrders: number
  newOrders: number
  totalProducts: number
  activeProducts: number
  lowStockProducts: number
  totalCustomers: number
  todayCustomers: number
  totalRevenue: number
  monthRevenue: number
}

type RecentOrder = {
  id: string
  orderNumber: string
  customerName: string
  total: number
  status: string
  createdAt: string
}

type LowStockProduct = {
  id: string
  name: string
  sku: string
  stock: number
  images: { url: string }[]
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("ru-RU").format(price) + " сум"
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const statusLabels: Record<string, string> = {
  NEW: "Новый",
  CONFIRMED: "Подтверждён",
  PROCESSING: "В обработке",
  PICKING: "Сборка",
  READY: "Готов",
  SHIPPING: "Доставка",
  DELIVERED: "Доставлен",
  COMPLETED: "Завершён",
  CANCELLED: "Отменён",
}

const statusColors: Record<string, string> = {
  NEW: "bg-blue-500",
  CONFIRMED: "bg-indigo-500",
  PROCESSING: "bg-yellow-500",
  PICKING: "bg-orange-500",
  READY: "bg-cyan-500",
  SHIPPING: "bg-purple-500",
  DELIVERED: "bg-green-500",
  COMPLETED: "bg-green-600",
  CANCELLED: "bg-red-500",
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [lowStock, setLowStock] = useState<LowStockProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(r => r.json())
      .then(data => {
        setStats(data.stats)
        setRecentOrders(data.recentOrders || [])
        setLowStock(data.lowStock || [])
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-gray-500">Загрузка...</div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Заказы сегодня</p>
                <p className="text-3xl font-bold">{stats?.todayOrders || 0}</p>
                <p className="text-sm text-gray-500">Всего: {stats?.totalOrders || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Выручка за месяц</p>
                <p className="text-2xl font-bold">{formatPrice(stats?.monthRevenue || 0)}</p>
                <p className="text-sm text-gray-500">Всего: {formatPrice(stats?.totalRevenue || 0)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Активных товаров</p>
                <p className="text-3xl font-bold">{stats?.activeProducts || 0}</p>
                <p className="text-sm text-gray-500">Всего: {stats?.totalProducts || 0}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Клиенты</p>
                <p className="text-3xl font-bold">{stats?.totalCustomers || 0}</p>
                <p className="text-sm text-gray-500">Сегодня: +{stats?.todayCustomers || 0}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(stats?.newOrders || 0) > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Новых заказов: {stats?.newOrders}</span>
            </div>
            <Link href="/admin/orders?status=NEW">
              <Button size="sm">Посмотреть</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {(stats?.lowStockProducts || 0) > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span className="font-medium">Товаров с низким остатком: {stats?.lowStockProducts}</span>
            </div>
            <Link href="/admin/warehouse">
              <Button size="sm" variant="outline">Посмотреть</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Последние заказы</CardTitle>
            <Link href="/admin/orders">
              <Button variant="ghost" size="sm">
                Все заказы <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Заказов пока нет</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">{order.customerName}</p>
                      <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatPrice(Number(order.total))}</p>
                      <Badge className={statusColors[order.status]}>
                        {statusLabels[order.status] || order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Заканчиваются</CardTitle>
            <Link href="/admin/warehouse">
              <Button variant="ghost" size="sm">
                Склад <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {lowStock.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Все товары в наличии</p>
            ) : (
              <div className="space-y-3">
                {lowStock.map(product => (
                  <div key={product.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                      {product.images?.[0]?.url ? (
                        <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Package className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.sku}</p>
                    </div>
                    <Badge className={product.stock === 0 ? "bg-red-500" : "bg-yellow-500"}>
                      {product.stock} шт
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
