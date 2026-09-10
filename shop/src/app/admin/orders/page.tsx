"use client"

import { useState } from "react"
import { Search, Eye, Printer, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const orders = [
  {
    id: "ORDER-2026-000024",
    customer: "Иван Петров",
    phone: "+998 90 123 45 67",
    email: "ivan@example.com",
    items: 3,
    total: 4500000,
    paymentStatus: "PENDING",
    status: "NEW",
    date: "10 сен 2026, 14:30",
    manager: null,
  },
  {
    id: "ORDER-2026-000023",
    customer: "Мария Сидорова",
    phone: "+998 91 234 56 78",
    email: "maria@example.com",
    items: 5,
    total: 1200000,
    paymentStatus: "PAID",
    status: "PROCESSING",
    date: "10 сен 2026, 12:15",
    manager: "Алексей",
  },
  {
    id: "ORDER-2026-000022",
    customer: "Алексей Козлов",
    phone: "+998 93 345 67 89",
    email: null,
    items: 2,
    total: 890000,
    paymentStatus: "PAID",
    status: "PICKING",
    date: "10 сен 2026, 10:00",
    manager: "Мария",
  },
  {
    id: "ORDER-2026-000021",
    customer: "Елена Новикова",
    phone: "+998 94 456 78 90",
    email: "elena@example.com",
    items: 8,
    total: 2100000,
    paymentStatus: "PAID",
    status: "READY",
    date: "09 сен 2026, 18:45",
    manager: "Алексей",
  },
  {
    id: "ORDER-2026-000020",
    customer: "Дмитрий Волков",
    phone: "+998 95 567 89 01",
    email: null,
    items: 1,
    total: 650000,
    paymentStatus: "PAID",
    status: "COMPLETED",
    date: "09 сен 2026, 15:20",
    manager: "Мария",
  },
  {
    id: "ORDER-2026-000019",
    customer: "Ольга Смирнова",
    phone: "+998 97 678 90 12",
    email: "olga@example.com",
    items: 4,
    total: 980000,
    paymentStatus: "REFUNDED",
    status: "CANCELLED",
    date: "08 сен 2026, 11:30",
    manager: "Алексей",
  },
]

function formatPrice(price: number) {
  return new Intl.NumberFormat("ru-RU").format(price) + " сум"
}

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

const paymentStatusColors: Record<string, string> = {
  PENDING: "bg-yellow-500",
  PAID: "bg-green-500",
  PARTIAL: "bg-blue-500",
  REFUNDED: "bg-gray-500",
  FAILED: "bg-red-500",
}

const paymentStatusLabels: Record<string, string> = {
  PENDING: "Ожидает",
  PAID: "Оплачен",
  PARTIAL: "Частично",
  REFUNDED: "Возврат",
  FAILED: "Ошибка",
}

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.phone.includes(searchQuery)
    const matchesStatus = !statusFilter || o.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Заказы</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Экспорт
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Новые", count: 8, color: "text-blue-600" },
          { label: "В обработке", count: 5, color: "text-yellow-600" },
          { label: "Комплектуются", count: 3, color: "text-orange-600" },
          { label: "Готовы", count: 2, color: "text-teal-600" },
          { label: "Завершены", count: 156, color: "text-green-600" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Поиск по номеру, клиенту или телефону..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="border rounded-lg px-3 py-2"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Все статусы</option>
              <option value="NEW">Новые</option>
              <option value="PROCESSING">В обработке</option>
              <option value="PICKING">Комплектуются</option>
              <option value="READY">Готовы</option>
              <option value="COMPLETED">Завершены</option>
              <option value="CANCELLED">Отменены</option>
            </select>
            <Input type="date" className="w-auto" />
            <Input type="date" className="w-auto" />
          </div>
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
                  <th className="p-4">Товаров</th>
                  <th className="p-4">Сумма</th>
                  <th className="p-4">Оплата</th>
                  <th className="p-4">Статус</th>
                  <th className="p-4">Менеджер</th>
                  <th className="p-4">Дата</th>
                  <th className="p-4">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-4">
                      <span className="font-medium text-primary">{order.id}</span>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{order.customer}</p>
                        <p className="text-sm text-gray-500">{order.phone}</p>
                      </div>
                    </td>
                    <td className="p-4">{order.items}</td>
                    <td className="p-4 font-medium">{formatPrice(order.total)}</td>
                    <td className="p-4">
                      <Badge className={paymentStatusColors[order.paymentStatus]}>
                        {paymentStatusLabels[order.paymentStatus]}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge className={statusColors[order.status]}>
                        {statusLabels[order.status]}
                      </Badge>
                    </td>
                    <td className="p-4 text-gray-500">{order.manager || "—"}</td>
                    <td className="p-4 text-sm text-gray-500">{order.date}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" title="Просмотр">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Печать">
                          <Printer className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          Показано {filteredOrders.length} из {orders.length} заказов
        </p>
        <div className="flex gap-2">
          <Button variant="outline" disabled>
            Назад
          </Button>
          <Button variant="outline">Вперед</Button>
        </div>
      </div>
    </div>
  )
}
