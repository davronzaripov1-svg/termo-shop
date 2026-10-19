"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Search, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type Order = {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  total: number
  status: string
  paymentStatus: string
  createdAt: string
  _count?: { items: number }
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("ru-RU").format(price) + " сум"
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
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

const paymentLabels: Record<string, string> = {
  PENDING: "Ожидает",
  PAID: "Оплачен",
  PARTIAL: "Частично",
  REFUNDED: "Возврат",
  FAILED: "Ошибка",
}

const paymentColors: Record<string, string> = {
  PENDING: "bg-yellow-500",
  PAID: "bg-green-500",
  PARTIAL: "bg-orange-500",
  REFUNDED: "bg-gray-500",
  FAILED: "bg-red-500",
}

export default function OrdersPage() {
  const searchParams = useSearchParams()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "")

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [newStatus, setNewStatus] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadOrders()
  }, [statusFilter])

  async function loadOrders() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set("status", statusFilter)
      if (searchQuery) params.set("q", searchQuery)
      const res = await fetch(`/api/admin/orders?${params}`)
      if (res.ok) {
        setOrders(await res.json())
      }
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus() {
    if (!selectedOrder || !newStatus) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setSelectedOrder(null)
        loadOrders()
      }
    } finally {
      setSaving(false)
    }
  }

  const filteredOrders = orders.filter((o) => {
    if (!searchQuery) return true
    return (
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerPhone.includes(searchQuery)
    )
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Заказы</h1>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Поиск по номеру, имени, телефону..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadOrders()}
              />
            </div>
            <select
              className="border rounded-lg px-3 py-2"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Все статусы</option>
              {Object.entries(statusLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Загрузка...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 border-b bg-gray-50">
                    <th className="p-4">Заказ</th>
                    <th className="p-4">Клиент</th>
                    <th className="p-4">Сумма</th>
                    <th className="p-4">Оплата</th>
                    <th className="p-4">Статус</th>
                    <th className="p-4">Дата</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-500">
                        Заказов нет
                      </td>
                    </tr>
                  ) : filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="p-4">
                        <p className="font-medium">{order.orderNumber}</p>
                        <p className="text-sm text-gray-500">{order._count?.items || 0} позиций</p>
                      </td>
                      <td className="p-4">
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-sm text-gray-500">{order.customerPhone}</p>
                      </td>
                      <td className="p-4 font-medium">{formatPrice(Number(order.total))}</td>
                      <td className="p-4">
                        <Badge className={paymentColors[order.paymentStatus]}>
                          {paymentLabels[order.paymentStatus] || order.paymentStatus}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge className={statusColors[order.status]}>
                          {statusLabels[order.status] || order.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                      <td className="p-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedOrder(order)
                            setNewStatus(order.status)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-sm text-gray-500">Всего: {filteredOrders.length} заказов</p>

      {/* Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-4 border-b">
              <h2 className="text-lg font-bold">{selectedOrder.orderNumber}</h2>
              <p className="text-sm text-gray-500">{selectedOrder.customerName} · {selectedOrder.customerPhone}</p>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Сумма заказа</p>
                <p className="text-xl font-bold">{formatPrice(Number(selectedOrder.total))}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Изменить статус</label>
                <select
                  className="w-full border rounded-lg px-3 py-2"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedOrder(null)}>Закрыть</Button>
              <Button onClick={updateStatus} disabled={saving || newStatus === selectedOrder.status}>
                {saving ? "Сохранение..." : "Сохранить"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
