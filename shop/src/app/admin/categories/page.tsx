"use client"

import { useEffect, useState, useRef } from "react"
import { Plus, Search, Edit, Trash2, X, Save, Upload, FolderTree } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type Category = {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  isActive: boolean
  sortOrder: number
  _count?: { products: number }
  children?: Category[]
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parentId: "",
    isActive: true,
  })
  const [imageUrl, setImageUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadCategories()
  }, [])

  async function loadCategories() {
    try {
      const res = await fetch("/api/admin/categories")
      if (res.ok) {
        setCategories(await res.json())
      }
    } finally {
      setLoading(false)
    }
  }

  function openCreateModal(parentId?: string) {
    setEditingCategory(null)
    setFormData({ name: "", description: "", parentId: parentId || "", isActive: true })
    setImageUrl("")
    setShowModal(true)
  }

  function openEditModal(cat: Category) {
    setEditingCategory(cat)
    setFormData({
      name: cat.name,
      description: cat.description || "",
      parentId: "",
      isActive: cat.isActive,
    })
    setImageUrl(cat.image || "")
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
      }
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  async function handleSave() {
    if (!formData.name) {
      alert("Введите название категории")
      return
    }

    setSaving(true)
    try {
      const body = {
        name: formData.name,
        description: formData.description || null,
        parentId: formData.parentId || null,
        image: imageUrl || null,
        isActive: formData.isActive,
      }

      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : "/api/admin/categories"

      const res = await fetch(url, {
        method: editingCategory ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        setShowModal(false)
        loadCategories()
      } else {
        const data = await res.json()
        alert(data.error || "Ошибка сохранения")
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Удалить категорию?")) return
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" })
    if (res.ok) {
      loadCategories()
    } else {
      const data = await res.json()
      alert(data.error || "Ошибка удаления")
    }
  }

  // Flatten categories for display
  const flatCategories: (Category & { level: number })[] = []
  function flatten(cats: Category[], level = 0) {
    for (const cat of cats) {
      if (searchQuery && !cat.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        if (cat.children) flatten(cat.children, level + 1)
        continue
      }
      flatCategories.push({ ...cat, level })
      if (cat.children) flatten(cat.children, level + 1)
    }
  }
  flatten(categories)

  if (loading) return <div className="text-gray-500">Загрузка...</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Категории</h1>
        <Button onClick={() => openCreateModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить категорию
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
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

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b bg-gray-50">
                  <th className="p-4">Название</th>
                  <th className="p-4">Товаров</th>
                  <th className="p-4">Статус</th>
                  <th className="p-4">Действия</th>
                </tr>
              </thead>
              <tbody>
                {flatCategories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">
                      {categories.length === 0 ? "Нет категорий. Создайте первую." : "Категории не найдены"}
                    </td>
                  </tr>
                ) : flatCategories.map((cat) => (
                  <tr key={cat.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3" style={{ paddingLeft: cat.level * 24 }}>
                        <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                          {cat.image ? (
                            <img src={cat.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <FolderTree className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{cat.name}</p>
                          {cat.description && <p className="text-sm text-gray-500 truncate max-w-xs">{cat.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">{cat._count?.products || 0}</td>
                    <td className="p-4">
                      <Badge className={cat.isActive ? "bg-green-500" : "bg-gray-500"}>
                        {cat.isActive ? "Активна" : "Скрыта"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditModal(cat)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                        {cat.level === 0 && (
                          <Button variant="ghost" size="sm" onClick={() => openCreateModal(cat.id)}>
                            <Plus className="h-4 w-4 mr-1" /> Подкатегория
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-bold">{editingCategory ? "Редактировать" : "Новая категория"}</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Изображение</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                    {imageUrl ? (
                      <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <FolderTree className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? "..." : "Загрузить"}
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Название *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Название категории"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Описание</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Краткое описание"
                />
              </div>

              {!editingCategory && (
                <div>
                  <label className="block text-sm font-medium mb-1">Родительская категория</label>
                  <select
                    className="w-full border rounded-lg px-3 py-2"
                    value={formData.parentId}
                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                  >
                    <option value="">Корневая категория</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <label htmlFor="isActive" className="text-sm">Активна</label>
              </div>
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowModal(false)}>Отмена</Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "..." : "Сохранить"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
