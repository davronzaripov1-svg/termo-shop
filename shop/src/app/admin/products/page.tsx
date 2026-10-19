"use client"

import { useEffect, useState, useRef } from "react"
import { Plus, Search, Edit, Trash2, Upload, X, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type Category = {
  id: string
  name: string
}

type ProductImage = {
  id: string
  url: string
  isMain: boolean
}

type Product = {
  id: string
  name: string
  sku: string
  price: number
  oldPrice?: number
  stock: number
  status: string
  isActive: boolean
  category?: Category
  images: ProductImage[]
}

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
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    price: "",
    oldPrice: "",
    stock: "",
    categoryId: "",
    isActive: true,
  })
  const [imageUrl, setImageUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadProducts()
    loadCategories()
  }, [])

  async function loadProducts() {
    try {
      const res = await fetch("/api/admin/products")
      if (res.ok) {
        setProducts(await res.json())
      }
    } finally {
      setLoading(false)
    }
  }

  async function loadCategories() {
    const res = await fetch("/api/admin/categories")
    if (res.ok) {
      const data = await res.json()
      // Flatten categories
      const flat: Category[] = []
      for (const cat of data) {
        flat.push({ id: cat.id, name: cat.name })
        if (cat.children) {
          for (const child of cat.children) {
            flat.push({ id: child.id, name: `${cat.name} / ${child.name}` })
          }
        }
      }
      setCategories(flat)
    }
  }

  function openCreateModal() {
    setEditingProduct(null)
    setFormData({ name: "", sku: "", price: "", oldPrice: "", stock: "", categoryId: "", isActive: true })
    setImageUrl("")
    setShowModal(true)
  }

  function openEditModal(product: Product) {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      sku: product.sku,
      price: String(product.price),
      oldPrice: product.oldPrice ? String(product.oldPrice) : "",
      stock: String(product.stock),
      categoryId: product.category?.id || "",
      isActive: product.isActive,
    })
    setImageUrl(product.images?.[0]?.url || "")
    setShowModal(true)
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const form = new FormData()
      form.append("file", file)
      const res = await fetch("/api/admin/upload", { method: "POST", body: form })
      if (res.ok) {
        const data = await res.json()
        setImageUrl(data.url)
      } else {
        alert("Ошибка загрузки изображения")
      }
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  async function handleSave() {
    if (!formData.name || !formData.price || !formData.categoryId) {
      alert("Заполните название, цену и категорию")
      return
    }

    setSaving(true)
    try {
      const body = {
        name: formData.name,
        sku: formData.sku || undefined,
        price: Number(formData.price),
        oldPrice: formData.oldPrice ? Number(formData.oldPrice) : null,
        stock: Number(formData.stock) || 0,
        categoryId: formData.categoryId,
        isActive: formData.isActive,
        imageUrl: imageUrl || undefined,
      }

      const url = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : "/api/admin/products"

      const res = await fetch(url, {
        method: editingProduct ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        setShowModal(false)
        loadProducts()
      } else {
        const data = await res.json()
        alert(data.error || "Ошибка сохранения")
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Удалить товар?")) return

    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" })
    if (res.ok) {
      loadProducts()
    } else {
      alert("Ошибка удаления")
    }
  }

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || p.category?.id === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (loading) return <div className="text-gray-500">Загрузка...</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Товары</h1>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить товар
        </Button>
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
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
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
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      {products.length === 0 ? "Нет товаров. Добавьте первый товар." : "Товары не найдены"}
                    </td>
                  </tr>
                ) : filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {product.images?.[0]?.url ? (
                            <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-2xl">📦</span>
                          )}
                        </div>
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-500">{product.sku}</td>
                    <td className="p-4">{product.category?.name || "-"}</td>
                    <td className="p-4 font-medium">{formatPrice(product.price)}</td>
                    <td className="p-4">
                      <span className={product.stock <= 5 ? "text-red-500 font-medium" : product.stock <= 10 ? "text-yellow-500 font-medium" : ""}>
                        {product.stock} шт
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge className={product.isActive ? "bg-green-500" : "bg-gray-500"}>
                        {product.isActive ? "Активен" : "Скрыт"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" title="Редактировать" onClick={() => openEditModal(product)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Удалить" onClick={() => handleDelete(product.id)}>
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

      <p className="text-sm text-gray-500">Всего: {filteredProducts.length} товаров</p>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-bold">{editingProduct ? "Редактировать товар" : "Новый товар"}</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">Изображение</label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed">
                    {imageUrl ? (
                      <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl">📦</span>
                    )}
                  </div>
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {uploading ? "Загрузка..." : "Загрузить"}
                    </Button>
                    {imageUrl && (
                      <Button variant="ghost" size="sm" className="ml-2" onClick={() => setImageUrl("")}>
                        Удалить
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Название *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Название товара"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Артикул</label>
                  <Input
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="Авто"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Остаток</label>
                  <Input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Цена *</label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Старая цена</label>
                  <Input
                    type="number"
                    value={formData.oldPrice}
                    onChange={(e) => setFormData({ ...formData, oldPrice: e.target.value })}
                    placeholder="Для скидки"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Категория *</label>
                <select
                  className="w-full border rounded-lg px-3 py-2"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                >
                  <option value="">Выберите категорию</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <label htmlFor="isActive" className="text-sm">Активен (виден на сайте)</label>
              </div>
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowModal(false)}>Отмена</Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Сохранение..." : "Сохранить"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
