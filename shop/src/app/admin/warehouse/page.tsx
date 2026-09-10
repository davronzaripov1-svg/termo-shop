"use client"

import { useState } from "react"
import {
  Search,
  Filter,
  Download,
  Upload,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  Plus,
  Minus,
  History,
  Box,
  Truck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const stockItems = [
  {
    id: "1",
    sku: "TT-001",
    name: "Термотрансфер Premium A4",
    category: "Термотрансферы",
    stock: 100,
    reserved: 15,
    available: 85,
    minStock: 20,
    maxStock: 200,
    location: "A1-01",
    lastMovement: "2024-01-15",
    status: "normal",
  },
  {
    id: "2",
    sku: "VN-002",
    name: "Виниловая пленка глянцевая",
    category: "Виниловые наклейки",
    stock: 8,
    reserved: 3,
    available: 5,
    minStock: 10,
    maxStock: 50,
    location: "B2-03",
    lastMovement: "2024-01-14",
    status: "low",
  },
  {
    id: "3",
    sku: "DTF-003",
    name: "DTF пленка рулон 60см",
    category: "DTF печать",
    stock: 30,
    reserved: 5,
    available: 25,
    minStock: 15,
    maxStock: 100,
    location: "C1-02",
    lastMovement: "2024-01-15",
    status: "normal",
  },
  {
    id: "4",
    sku: "UV-004",
    name: "UV DTF стикеры набор",
    category: "UV DTF",
    stock: 0,
    reserved: 0,
    available: 0,
    minStock: 10,
    maxStock: 50,
    location: "D3-01",
    lastMovement: "2024-01-10",
    status: "out",
  },
  {
    id: "5",
    sku: "MT-005",
    name: "Порошок DTF белый 1кг",
    category: "Расходные материалы",
    stock: 45,
    reserved: 10,
    available: 35,
    minStock: 20,
    maxStock: 100,
    location: "E2-04",
    lastMovement: "2024-01-15",
    status: "normal",
  },
  {
    id: "6",
    sku: "EQ-006",
    name: "Термопресс 40x50см",
    category: "Оборудование",
    stock: 3,
    reserved: 1,
    available: 2,
    minStock: 2,
    maxStock: 10,
    location: "F1-01",
    lastMovement: "2024-01-12",
    status: "low",
  },
]

const recentMovements = [
  { id: "1", type: "in", sku: "TT-001", name: "Термотрансфер Premium A4", qty: 50, date: "2024-01-15 14:30", user: "Admin" },
  { id: "2", type: "out", sku: "VN-002", name: "Виниловая пленка глянцевая", qty: 5, date: "2024-01-15 12:15", user: "Manager" },
  { id: "3", type: "reserve", sku: "DTF-003", name: "DTF пленка рулон 60см", qty: 5, date: "2024-01-15 11:00", user: "System" },
  { id: "4", type: "in", sku: "MT-005", name: "Порошок DTF белый 1кг", qty: 20, date: "2024-01-15 10:30", user: "Admin" },
]

export default function WarehousePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredItems = stockItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const lowStockCount = stockItems.filter((i) => i.status === "low").length
  const outOfStockCount = stockItems.filter((i) => i.status === "out").length
  const totalItems = stockItems.reduce((acc, i) => acc + i.stock, 0)
  const reservedItems = stockItems.reduce((acc, i) => acc + i.reserved, 0)

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

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "in":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "out":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      case "reserve":
        return <Box className="h-4 w-4 text-blue-500" />
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
            <Upload className="h-4 w-4 mr-2" />
            Импорт
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Экспорт
          </Button>
          <Button className="bg-primary text-black hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Приход товара
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
                <p className="text-2xl font-bold">{totalItems}</p>
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
                <p className="text-2xl font-bold">{reservedItems}</p>
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
                <p className="text-2xl font-bold">{lowStockCount}</p>
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
                <p className="text-2xl font-bold">{outOfStockCount}</p>
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
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-3 font-medium">Товар</th>
                      <th className="pb-3 font-medium text-center">Остаток</th>
                      <th className="pb-3 font-medium text-center">Резерв</th>
                      <th className="pb-3 font-medium text-center">Доступно</th>
                      <th className="pb-3 font-medium">Ячейка</th>
                      <th className="pb-3 font-medium">Статус</th>
                      <th className="pb-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="py-3">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-500">{item.sku}</p>
                          </div>
                        </td>
                        <td className="py-3 text-center font-medium">{item.stock}</td>
                        <td className="py-3 text-center text-blue-600">{item.reserved}</td>
                        <td className="py-3 text-center font-medium text-green-600">{item.available}</td>
                        <td className="py-3">
                          <Badge variant="outline">{item.location}</Badge>
                        </td>
                        <td className="py-3">{getStatusBadge(item.status)}</td>
                        <td className="py-3">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" title="Приход">
                              <Plus className="h-4 w-4 text-green-500" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Расход">
                              <Minus className="h-4 w-4 text-red-500" />
                            </Button>
                            <Button variant="ghost" size="icon" title="История">
                              <History className="h-4 w-4" />
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
        </div>

        {/* Recent Movements */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Последние движения
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentMovements.map((movement) => (
                  <div key={movement.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="mt-1">{getMovementIcon(movement.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{movement.name}</p>
                      <p className="text-xs text-gray-500">{movement.sku}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-sm font-medium ${
                          movement.type === "in" ? "text-green-600" :
                          movement.type === "out" ? "text-red-600" : "text-blue-600"
                        }`}>
                          {movement.type === "in" ? "+" : movement.type === "out" ? "-" : ""}
                          {movement.qty} шт
                        </span>
                        <span className="text-xs text-gray-400">{movement.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                Все движения
              </Button>
            </CardContent>
          </Card>

          {/* Low Stock Alert */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-600">
                <AlertTriangle className="h-5 w-5" />
                Требуется пополнение
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stockItems
                  .filter((i) => i.status === "low" || i.status === "out")
                  .map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500">Минимум: {item.minStock}</p>
                      </div>
                      <Badge variant={item.status === "out" ? "destructive" : "secondary"}>
                        {item.stock} шт
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
