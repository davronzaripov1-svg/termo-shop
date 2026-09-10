"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Copy, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const products = [
  { id: "1", name: "Смартфон Premium X", sku: "SM-001", price: 4500000, stock: 15, category: "Электроника", status: "ACTIVE" },
  { id: "2", name: "Наушники Wireless Pro", sku: "HP-002", price: 890000, stock: 2, category: "Электроника", status: "ACTIVE" },
  { id: "3", name: "Умные часы Smart Watch", sku: "SW-003", price: 1200000, stock: 0, category: "Электроника", status: "OUT_OF_STOCK" },
  { id: "4", name: "Портативная колонка Bass", sku: "SP-004", price: 450000, stock: 25, category: "Электроника", status: "ACTIVE" },
  { id: "5", name: "Футболка Classic", sku: "CL-005", price: 150000, stock: 100, category: "Одежда", status: "ACTIVE" },
  { id: "6", name: "Джинсы Premium", sku: "JN-006", price: 450000, stock: 45, category: "Одежда", status: "ACTIVE" },
  { id: "7", name: "Кроссовки Sport", sku: "SH-007", price: 890000, stock: 30, category: "Спорт", status: "ACTIVE" },
  { id: "8", name: "Гантели 10кг", sku: "GN-008", price: 320000, stock: 12, category: "Спорт", status: "DISCONTINUED" },
]

function formatPrice(price: number) {
  return new Intl.NumberFormat("ru-RU").format(price) + " сум"
}

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-500",
  OUT_OF_STOCK: "bg-yellow-500",
  ON_ORDER: "bg-blue-500",
  DISCONTINUED: "bg-gray-500",
}

const statusLabels: Record<string, string> = {
  ACTIVE: "Активен",
  OUT_OF_STOCK: "Нет в наличии",
  ON_ORDER: "Под заказ",
  DISCONTINUED: "Снят",
}

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || p.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Товары</h1>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Добавить товар
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Поиск по названию или артикулу..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="border rounded-lg px-3 py-2"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Все категории</option>
              <option value="Электроника">Электроника</option>
              <option value="Одежда">Одежда</option>
              <option value="Спорт">Спорт</option>
            </select>
            <select className="border rounded-lg px-3 py-2">
              <option value="">Все статусы</option>
              <option value="ACTIVE">Активные</option>
              <option value="OUT_OF_STOCK">Нет в наличии</option>
              <option value="DISCONTINUED">Сняты</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b bg-gray-50">
                  <th className="p-4">Товар</th>
                  <th className="p-4">Артикул</th>
                  <th className="p-4">Категория</th>
                  <th className="p-4">Цена</th>
                  <th className="p-4">Остаток</th>
                  <th className="p-4">Статус</th>
                  <th className="p-4">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          📦
                        </div>
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-500">{product.sku}</td>
                    <td className="p-4">{product.category}</td>
                    <td className="p-4 font-medium">{formatPrice(product.price)}</td>
                    <td className="p-4">
                      <span
                        className={
                          product.stock <= 5
                            ? "text-red-500 font-medium"
                            : product.stock <= 10
                            ? "text-yellow-500 font-medium"
                            : ""
                        }
                      >
                        {product.stock} шт
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge className={statusColors[product.status]}>
                        {statusLabels[product.status]}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" title="Редактировать">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Копировать">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Удалить">
                          <Trash2 className="h-4 w-4 text-red-500" />
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
          Показано {filteredProducts.length} из {products.length} товаров
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
