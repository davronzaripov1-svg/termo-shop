"use client"

import { useEffect, useState } from "react"
import {
  Search,
  Download,
  Package,
  AlertTriangle,
  Plus,
  Minus,
  Box,
  X,
  Save,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type StockItem = {
  id: string
  sku: string
  name: string
  category: string
  stock: number
  reserved: number
  available: number
  minStock: number
  maxStock: number
  image?: string
  status: "normal" | "low" | "out"
}

type Stats = {
  totalStock: number
  reserved: number
  lowStockCount: number
  outOfStockCount: number
}

export default function WarehousePage() {
  const [items, setItems] = useState<StockItem[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const [showModal, setShowModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null)
  const [operationType, setOperationType] = useState<"in" | "out">("in")
  const [quantity, setQuantity] = useState(1)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadData()
  }, [statusFilter])

  async function loadData() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (searchQuery) params.set("q", searchQuery)

      const res = await fetch(`/api/admin/warehouse?${params}`)
      if (res.ok) {
        const data = await res.json()
        setItems(data.items)
        setStats(data.stats)
      }
    } finally {
      setLoading(false)
    }
  }

  function openStockModal(item: StockItem, type: "in" | "out") {
    setSelectedItem(item)
    setOperationType(type)
    setQuantity(1)
    setShowModal(true)
  }

  async function handleStockOperation() {
    if (!selectedItem) return

    setSaving(true)
    try {
      const res = await fetch("/api/admin/warehouse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedItem.id,
          type: operationType,
          quantity,
        }),
      })

      if (res.ok) {
        setShowModal(false)
        loadData()
      } else {
        const data = await res.json()
        alert(data.error || "Ошибка операции")
      }
    } finally {
      setSaving(false)
    }
  }

  const filteredItems = items.filter((item) => {
    if (!searchQuery) return true
    return (
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "normal":
        return <Badge className="bg-green-100 text-green-700">В наличии</Badge>
      case "low":
        return <Badge className="bg-yellow-100 text-yellow-700">Мало</Badge>
      case "out":
        return <Badge className="bg-red-100 text-red-700">Нет в наличии</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Склад</h1>
          <p className="text-gray-500">Управление складским учетом</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Экспорт
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalStock || 0}</p>
                <p className="text-sm text-gray-500">Всего на складе</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Box className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.reserved || 0}</p>
                <p className="text-sm text-gray-500">Зарезервировано</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.lowStockCount || 0}</p>
                <p className="text-sm text-gray-500">Заканчивается</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <Package className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.outOfStockCount || 0}</p>
                <p className="text-sm text-gray-500">Нет в наличии</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle>Остатки на складе</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Поиск..."
                      className="pl-10 w-[200px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && loadData()}
                    />
                  </div>
                  <select
                    className="px-3 py-2 border rounded-lg text-sm"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">Все</option>
                    <option value="normal">В наличии</option>
                    <option value="low">Заканчивается</option>
                    <option value="out">Нет в наличии</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="p-8 text-center text-gray-500">Загрузка...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-3 font-medium">Товар</th>
                        <th className="pb-3 font-medium text-center">Остаток</th>
                        <th className="pb-3 font-medium text-center">Резерв</th>
                        <th className="pb-3 font-medium text-center">Доступно</th>
                        <th className="pb-3 font-medium">Статус</th>
                        <th className="pb-3 font-medium"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-gray-500">
                            Товаров нет
                          </td>
                        </tr>
                      ) : filteredItems.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                          <td className="py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                                {item.image ? (
                                  <img src={item.image} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <Package className="h-5 w-5 text-gray-400" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-gray-500">{item.sku}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 text-center font-medium">{item.stock}</td>
                          <td className="py-3 text-center text-blue-600">{item.reserved}</td>
                          <td className="py-3 text-center font-medium text-green-600">{item.available}</td>
                          <td className="py-3">{getStatusBadge(item.status)}</td>
                          <td className="py-3">
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Приход"
                                onClick={() => openStockModal(item, "in")}
                              >
                                <Plus className="h-4 w-4 text-green-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Расход"
                                onClick={() => openStockModal(item, "out")}
                                disabled={item.stock === 0}
                              >
                                <Minus className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alert */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-600">
                <AlertTriangle className="h-5 w-5" />
                Требуется пополнение
              </CardTitle>
            </CardHeader>
            <CardContent>
              {items.filter((i) => i.status === "low" || i.status === "out").length === 0 ? (
                <p className="text-center text-gray-500 py-4">Все товары в наличии</p>
              ) : (
                <div className="space-y-3">
                  {items
                    .filter((i) => i.status === "low" || i.status === "out")
                    .slice(0, 10)
                    .map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.name}</p>
                          <p className="text-xs text-gray-500">Мин: {item.minStock}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={item.status === "out" ? "destructive" : "secondary"}>
                            {item.stock} шт
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => openStockModal(item, "in")}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <p className="text-sm text-gray-500">Всего товаров: {filteredItems.length}</p>

      {/* Stock Operation Modal */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-bold">
                {operationType === "in" ? "Приход товара" : "Расход товара"}
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                  {selectedItem.image ? (
                    <img src={selectedItem.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Package className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{selectedItem.name}</p>
                  <p className="text-sm text-gray-500">{selectedItem.sku}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold">{selectedItem.stock}</p>
                  <p className="text-sm text-gray-500">Текущий остаток</p>
                </div>
                <div className={`p-3 rounded-lg ${operationType === "in" ? "bg-green-50" : "bg-red-50"}`}>
                  <p className={`text-2xl font-bold ${operationType === "in" ? "text-green-600" : "text-red-600"}`}>
                    {operationType === "in" ? selectedItem.stock + quantity : selectedItem.stock - quantity}
                  </p>
                  <p className="text-sm text-gray-500">После операции</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Количество</label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    min={1}
                    max={operationType === "out" ? selectedItem.stock : 9999}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="text-center text-xl font-bold w-24"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const max = operationType === "out" ? selectedItem.stock : 9999
                      setQuantity(Math.min(max, quantity + 1))
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {operationType === "out" && quantity > selectedItem.stock && (
                <p className="text-red-500 text-sm">Недостаточно товара на складе</p>
              )}
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Отмена
              </Button>
              <Button
                onClick={handleStockOperation}
                disabled={saving || (operationType === "out" && quantity > selectedItem.stock)}
                className={operationType === "in" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "..." : operationType === "in" ? "Оприходовать" : "Списать"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
