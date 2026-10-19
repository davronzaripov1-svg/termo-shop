"use client"

import { useEffect, useState } from "react"
import { Plus, Search, Edit, Trash2, X, Save, Percent, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type Promocode = {
  id: string
  code: string
  description?: string
  discountType: "PERCENT" | "FIXED"
  discountValue: number
  minOrderAmount?: number
  maxDiscount?: number
  usageLimit?: number
  usageCount: number
  startsAt?: string
  expiresAt?: string
  isActive: boolean
  _count?: { orders: number }
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("ru-RU").format(price) + " сум"
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("ru-RU")
}

export default function PromocodesPage() {
  const [promocodes, setPromocodes] = useState<Promocode[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editingPromo, setEditingPromo] = useState<Promocode | null>(null)
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "PERCENT" as "PERCENT" | "FIXED",
    discountValue: "",
    minOrderAmount: "",
    maxDiscount: "",
    usageLimit: "",
    startsAt: "",
    expiresAt: "",
    isActive: true,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadPromocodes()
  }, [])

  async function loadPromocodes() {
    try {
      const res = await fetch("/api/admin/promocodes")
      if (res.ok) {
        setPromocodes(await res.json())
      }
    } finally {
      setLoading(false)
    }
  }

  function openCreateModal() {
    setEditingPromo(null)
    setFormData({
      code: "",
      description: "",
      discountType: "PERCENT",
      discountValue: "",
      minOrderAmount: "",
      maxDiscount: "",
      usageLimit: "",
      startsAt: "",
      expiresAt: "",
      isActive: true,
    })
    setShowModal(true)
  }

  function openEditModal(promo: Promocode) {
    setEditingPromo(promo)
    setFormData({
      code: promo.code,
      description: promo.description || "",
      discountType: promo.discountType,
      discountValue: String(promo.discountValue),
      minOrderAmount: promo.minOrderAmount ? String(promo.minOrderAmount) : "",
      maxDiscount: promo.maxDiscount ? String(promo.maxDiscount) : "",
      usageLimit: promo.usageLimit ? String(promo.usageLimit) : "",
      startsAt: promo.startsAt ? promo.startsAt.split("T")[0] : "",
      expiresAt: promo.expiresAt ? promo.expiresAt.split("T")[0] : "",
      isActive: promo.isActive,
    })
    setShowModal(true)
  }

  async function handleSave() {
    if (!formData.code || !formData.discountValue) {
      alert("Заполните код и размер скидки")
      return
    }

    setSaving(true)
    try {
      const body = {
        code: formData.code,
        description: formData.description || null,
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : null,
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
        startsAt: formData.startsAt || null,
        expiresAt: formData.expiresAt || null,
        isActive: formData.isActive,
      }

      const url = editingPromo
        ? `/api/admin/promocodes/${editingPromo.id}`
        : "/api/admin/promocodes"

      const res = await fetch(url, {
        method: editingPromo ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        setShowModal(false)
        loadPromocodes()
      } else {
        const data = await res.json()
        alert(data.error || "Ошибка сохранения")
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Удалить промокод?")) return

    const res = await fetch(`/api/admin/promocodes/${id}`, { method: "DELETE" })
    if (res.ok) {
      loadPromocodes()
    } else {
      alert("Ошибка удаления")
    }
  }

  async function toggleActive(promo: Promocode) {
    await fetch(`/api/admin/promocodes/${promo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...promo, isActive: !promo.isActive }),
    })
    loadPromocodes()
  }

  const filteredPromocodes = promocodes.filter((p) =>
    p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  function isExpired(promo: Promocode) {
    if (!promo.expiresAt) return false
    return new Date(promo.expiresAt) < new Date()
  }

  function isNotStarted(promo: Promocode) {
    if (!promo.startsAt) return false
    return new Date(promo.startsAt) > new Date()
  }

  if (loading) return <div className="text-gray-500">Загрузка...</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Промокоды</h1>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4 mr-2" />
          Создать промокод
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Поиск по коду или описанию..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Promocodes Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b bg-gray-50">
                  <th className="p-4">Код</th>
                  <th className="p-4">Скидка</th>
                  <th className="p-4">Использований</th>
                  <th className="p-4">Период</th>
                  <th className="p-4">Статус</th>
                  <th className="p-4">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredPromocodes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      {promocodes.length === 0 ? "Нет промокодов. Создайте первый." : "Промокоды не найдены"}
                    </td>
                  </tr>
                ) : filteredPromocodes.map((promo) => (
                  <tr key={promo.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-blue-500" />
                        <span className="font-mono font-bold">{promo.code}</span>
                      </div>
                      {promo.description && (
                        <p className="text-sm text-gray-500 mt-1">{promo.description}</p>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        {promo.discountType === "PERCENT" ? (
                          <>
                            <Percent className="h-4 w-4" />
                            <span className="font-medium">{promo.discountValue}%</span>
                          </>
                        ) : (
                          <span className="font-medium">{formatPrice(Number(promo.discountValue))}</span>
                        )}
                      </div>
                      {promo.minOrderAmount && (
                        <p className="text-xs text-gray-500">от {formatPrice(Number(promo.minOrderAmount))}</p>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="font-medium">{promo.usageCount}</span>
                      {promo.usageLimit && (
                        <span className="text-gray-500"> / {promo.usageLimit}</span>
                      )}
                    </td>
                    <td className="p-4 text-sm">
                      {promo.startsAt && <div>с {formatDate(promo.startsAt)}</div>}
                      {promo.expiresAt && <div>до {formatDate(promo.expiresAt)}</div>}
                      {!promo.startsAt && !promo.expiresAt && <span className="text-gray-400">Бессрочный</span>}
                    </td>
                    <td className="p-4">
                      {isExpired(promo) ? (
                        <Badge className="bg-red-500">Истёк</Badge>
                      ) : isNotStarted(promo) ? (
                        <Badge className="bg-yellow-500">Ожидает</Badge>
                      ) : promo.isActive ? (
                        <Badge className="bg-green-500 cursor-pointer" onClick={() => toggleActive(promo)}>Активен</Badge>
                      ) : (
                        <Badge className="bg-gray-500 cursor-pointer" onClick={() => toggleActive(promo)}>Выключен</Badge>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" title="Редактировать" onClick={() => openEditModal(promo)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Удалить" onClick={() => handleDelete(promo.id)}>
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

      <p className="text-sm text-gray-500">Всего: {filteredPromocodes.length} промокодов</p>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-bold">{editingPromo ? "Редактировать промокод" : "Новый промокод"}</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Код промокода *</label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="SALE2024"
                  className="font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Описание</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Новогодняя акция"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Тип скидки</label>
                  <select
                    className="w-full border rounded-lg px-3 py-2"
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as "PERCENT" | "FIXED" })}
                  >
                    <option value="PERCENT">Процент (%)</option>
                    <option value="FIXED">Фиксированная сумма</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Размер скидки * {formData.discountType === "PERCENT" ? "(%)" : "(сум)"}
                  </label>
                  <Input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    placeholder={formData.discountType === "PERCENT" ? "10" : "50000"}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Мин. сумма заказа</label>
                  <Input
                    type="number"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    placeholder="100000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Макс. скидка (сум)</label>
                  <Input
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    placeholder="Без ограничений"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Лимит использований</label>
                <Input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  placeholder="Без ограничений"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Дата начала</label>
                  <Input
                    type="date"
                    value={formData.startsAt}
                    onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Дата окончания</label>
                  <Input
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <label htmlFor="isActive" className="text-sm">Активен</label>
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
