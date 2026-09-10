"use client"

import { useState } from "react"
import Link from "next/link"
import { Grid, List, SlidersHorizontal, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

const categories = [
  { name: "Все категории", slug: "" },
  { name: "Электроника", slug: "electronics" },
  { name: "Одежда", slug: "clothing" },
  { name: "Дом и сад", slug: "home" },
  { name: "Спорт", slug: "sport" },
  { name: "Красота", slug: "beauty" },
]

const products = [
  { id: "1", name: "Смартфон Premium X", price: 4500000, oldPrice: 5200000, sku: "SM-001", category: "Электроника", inStock: true },
  { id: "2", name: "Наушники Wireless Pro", price: 890000, sku: "HP-002", category: "Электроника", inStock: true, isNew: true },
  { id: "3", name: "Умные часы Smart Watch", price: 1200000, oldPrice: 1500000, sku: "SW-003", category: "Электроника", inStock: true },
  { id: "4", name: "Портативная колонка Bass", price: 450000, sku: "SP-004", category: "Электроника", inStock: false },
  { id: "5", name: "Футболка Classic", price: 150000, sku: "CL-005", category: "Одежда", inStock: true },
  { id: "6", name: "Джинсы Premium", price: 450000, oldPrice: 550000, sku: "JN-006", category: "Одежда", inStock: true },
  { id: "7", name: "Кроссовки Sport", price: 890000, sku: "SH-007", category: "Спорт", inStock: true, isNew: true },
  { id: "8", name: "Гантели 10кг", price: 320000, sku: "GN-008", category: "Спорт", inStock: true },
]

function formatPrice(price: number) {
  return new Intl.NumberFormat("ru-RU").format(price) + " сум"
}

export default function CatalogPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [sortBy, setSortBy] = useState("default")

  const filteredProducts = products.filter(
    (p) => !selectedCategory || p.category === selectedCategory
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Каталог товаров</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="sticky top-24">
            <h2 className="font-semibold mb-4">Категории</h2>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <button
                    onClick={() => setSelectedCategory(cat.slug === "" ? "" : cat.name)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      (selectedCategory === cat.name || (!selectedCategory && cat.slug === ""))
                        ? "bg-primary text-white"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>

            <hr className="my-6" />

            <h2 className="font-semibold mb-4">Цена</h2>
            <div className="flex gap-2">
              <Input placeholder="От" type="number" />
              <Input placeholder="До" type="number" />
            </div>
            <Button className="w-full mt-3" variant="outline">
              Применить
            </Button>
          </div>
        </aside>

        {/* Products */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <p className="text-gray-600">
              Найдено: <span className="font-semibold">{filteredProducts.length}</span> товаров
            </p>
            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm"
              >
                <option value="default">По умолчанию</option>
                <option value="price-asc">Сначала дешевые</option>
                <option value="price-desc">Сначала дорогие</option>
                <option value="name">По названию</option>
              </select>
              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                : "flex flex-col gap-4"
            }
          >
            {filteredProducts.map((product) => (
              <Link key={product.id} href={`/product/${product.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardContent className={`p-4 ${viewMode === "list" ? "flex gap-4" : ""}`}>
                    <div
                      className={`relative bg-gray-100 rounded-lg flex items-center justify-center ${
                        viewMode === "list" ? "w-32 h-32 flex-shrink-0" : "w-full aspect-square mb-3"
                      }`}
                    >
                      <span className="text-4xl">📦</span>
                      {product.isNew && (
                        <Badge className="absolute top-2 left-2">Новинка</Badge>
                      )}
                      {!product.inStock && (
                        <Badge variant="secondary" className="absolute top-2 right-2">
                          Нет в наличии
                        </Badge>
                      )}
                    </div>
                    <div className={viewMode === "list" ? "flex-1" : ""}>
                      <p className="text-xs text-gray-400 mb-1">{product.sku}</p>
                      <h3 className="font-medium mb-2 line-clamp-2">{product.name}</h3>
                      <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-lg">{formatPrice(product.price)}</span>
                        {product.oldPrice && (
                          <span className="text-sm text-gray-400 line-through">
                            {formatPrice(product.oldPrice)}
                          </span>
                        )}
                      </div>
                      <Button
                        className="w-full mt-3"
                        size="sm"
                        disabled={!product.inStock}
                      >
                        {product.inStock ? "В корзину" : "Нет в наличии"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
