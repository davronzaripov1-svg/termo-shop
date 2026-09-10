"use client"

import { useState } from "react"
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  FolderTree,
  GripVertical,
  ChevronRight,
  Image as ImageIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const categories = [
  {
    id: "1",
    name: "Термотрансферы",
    slug: "termotransfers",
    description: "Термотрансферная печать на ткань",
    productsCount: 150,
    isActive: true,
    sortOrder: 1,
    children: [
      { id: "1-1", name: "Для светлых тканей", slug: "light-fabric", productsCount: 80, isActive: true },
      { id: "1-2", name: "Для темных тканей", slug: "dark-fabric", productsCount: 70, isActive: true },
    ],
  },
  {
    id: "2",
    name: "Виниловые наклейки",
    slug: "vinyl",
    description: "Виниловые пленки и наклейки",
    productsCount: 200,
    isActive: true,
    sortOrder: 2,
    children: [
      { id: "2-1", name: "Глянцевые", slug: "glossy", productsCount: 85, isActive: true },
      { id: "2-2", name: "Матовые", slug: "matte", productsCount: 75, isActive: true },
      { id: "2-3", name: "Светоотражающие", slug: "reflective", productsCount: 40, isActive: true },
    ],
  },
  {
    id: "3",
    name: "DTF печать",
    slug: "dtf",
    description: "Пленки и порошок для DTF печати",
    productsCount: 180,
    isActive: true,
    sortOrder: 3,
    children: [],
  },
  {
    id: "4",
    name: "UV DTF",
    slug: "uv-dtf",
    description: "UV DTF стикеры и материалы",
    productsCount: 120,
    isActive: true,
    sortOrder: 4,
    children: [],
  },
  {
    id: "5",
    name: "Расходные материалы",
    slug: "materials",
    description: "Чернила, порошки, пленки",
    productsCount: 85,
    isActive: true,
    sortOrder: 5,
    children: [],
  },
  {
    id: "6",
    name: "Оборудование",
    slug: "equipment",
    description: "Термопрессы и принтеры",
    productsCount: 45,
    isActive: false,
    sortOrder: 6,
    children: [],
  },
]

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["1", "2"])

  const toggleExpand = (id: string) => {
    setExpandedCategories((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.slug.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Категории</h1>
          <p className="text-gray-500">Управление категориями товаров</p>
        </div>
        <Button className="bg-primary text-black hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Добавить категорию
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <FolderTree className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{categories.length}</p>
                <p className="text-sm text-gray-500">Всего категорий</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <FolderTree className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{categories.filter((c) => c.isActive).length}</p>
                <p className="text-sm text-gray-500">Активных</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FolderTree className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {categories.reduce((acc, cat) => acc + cat.children.length, 0)}
                </p>
                <p className="text-sm text-gray-500">Подкатегорий</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FolderTree className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {categories.reduce((acc, cat) => acc + cat.productsCount, 0)}
                </p>
                <p className="text-sm text-gray-500">Товаров</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Поиск категорий..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories List */}
      <Card>
        <CardHeader>
          <CardTitle>Дерево категорий</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredCategories.map((category) => (
              <div key={category.id} className="border rounded-lg">
                {/* Parent Category */}
                <div className="flex items-center gap-3 p-4 hover:bg-gray-50">
                  <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />

                  {category.children.length > 0 ? (
                    <button
                      onClick={() => toggleExpand(category.id)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <ChevronRight
                        className={`h-4 w-4 transition-transform ${
                          expandedCategories.includes(category.id) ? "rotate-90" : ""
                        }`}
                      />
                    </button>
                  ) : (
                    <div className="w-6" />
                  )}

                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-gray-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{category.name}</h3>
                      <Badge variant={category.isActive ? "default" : "secondary"}>
                        {category.isActive ? "Активна" : "Скрыта"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{category.description}</p>
                  </div>

                  <div className="text-right">
                    <p className="font-medium">{category.productsCount}</p>
                    <p className="text-sm text-gray-500">товаров</p>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Children */}
                {expandedCategories.includes(category.id) && category.children.length > 0 && (
                  <div className="border-t bg-gray-50">
                    {category.children.map((child) => (
                      <div
                        key={child.id}
                        className="flex items-center gap-3 p-4 pl-16 hover:bg-gray-100 border-b last:border-b-0"
                      >
                        <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />

                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                          <ImageIcon className="h-5 w-5 text-gray-400" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{child.name}</h4>
                            <Badge variant={child.isActive ? "default" : "secondary"} className="text-xs">
                              {child.isActive ? "Активна" : "Скрыта"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">/{category.slug}/{child.slug}</p>
                        </div>

                        <div className="text-right">
                          <p className="font-medium">{child.productsCount}</p>
                          <p className="text-sm text-gray-500">товаров</p>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
