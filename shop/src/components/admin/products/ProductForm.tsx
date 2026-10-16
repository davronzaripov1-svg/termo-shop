"use client"

import { useRef, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowDown, ArrowLeft, ArrowUp, ImagePlus, Link2, Plus, Star, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ProductImage } from "@/components/shop/ProductImage"
import { saveProduct, type ProductInput } from "@/app/admin/products/actions"
import { PRODUCT_STATUS_LABELS } from "@/lib/labels"
import { cn, slugify } from "@/lib/utils"

type Variant = { id?: string; name: string; sku: string; price: string; stock: string; isActive: boolean }

export type ProductFormValues = {
  id?: string
  name: string
  slug: string
  sku: string
  categoryId: string
  description: string
  price: string
  oldPrice: string
  costPrice: string
  unit: string
  minQuantity: string
  stock: string
  reserved: number
  lowStockThreshold: string
  status: string
  isActive: boolean
  isFeatured: boolean
  isNew: boolean
  weight: string
  dimensions: string
  metaTitle: string
  metaDescription: string
  images: { url: string; alt: string }[]
  attributes: { name: string; value: string }[]
  variants: Variant[]
}

const fieldClass = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm"

export function ProductForm({
  initial,
  categories,
}: {
  initial: ProductFormValues
  categories: { id: string; name: string; depth: number }[]
}) {
  const router = useRouter()
  const [v, setV] = useState(initial)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isPending, startTransition] = useTransition()
  const [uploading, setUploading] = useState(0)
  const [slugTouched, setSlugTouched] = useState(!!initial.id)
  const fileInput = useRef<HTMLInputElement>(null)

  const set = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) => {
    setV((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }
  const text = (key: keyof ProductFormValues) => ({
    value: v[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      set(key, e.target.value as never),
  })

  const uploadFiles = async (files: FileList | null) => {
    if (!files?.length) return
    for (const file of Array.from(files)) {
      setUploading((n) => n + 1)
      try {
        const body = new FormData()
        body.append("file", file)
        const res = await fetch("/api/admin/upload", { method: "POST", body })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || "Ошибка загрузки")
        setV((prev) => ({ ...prev, images: [...prev.images, { url: json.url, alt: "" }] }))
      } catch (e) {
        toast.error(`${file.name}: ${(e as Error).message}`)
      } finally {
        setUploading((n) => n - 1)
      }
    }
  }

  const addImageUrl = () => {
    const url = window.prompt("Ссылка на фото (https://...)")?.trim()
    if (url) set("images", [...v.images, { url, alt: "" }])
  }

  const moveImage = (i: number, dir: -1 | 1) => {
    const images = [...v.images]
    ;[images[i], images[i + dir]] = [images[i + dir], images[i]]
    set("images", images)
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const num = (s: string) => (s.trim() === "" ? "" : s.replace(/\s/g, "").replace(",", "."))
    const input: ProductInput = {
      id: v.id,
      name: v.name,
      slug: v.slug,
      sku: v.sku,
      categoryId: v.categoryId,
      description: v.description,
      price: num(v.price),
      oldPrice: num(v.oldPrice),
      costPrice: num(v.costPrice),
      unit: v.unit,
      minQuantity: num(v.minQuantity),
      stock: num(v.stock),
      lowStockThreshold: num(v.lowStockThreshold),
      status: v.status as ProductInput["status"],
      isActive: v.isActive,
      isFeatured: v.isFeatured,
      isNew: v.isNew,
      weight: num(v.weight),
      dimensions: v.dimensions,
      metaTitle: v.metaTitle,
      metaDescription: v.metaDescription,
      images: v.images,
      attributes: v.attributes.filter((a) => a.name.trim() || a.value.trim()),
      variants: v.variants.map((x) => ({ ...x, price: num(x.price), stock: num(x.stock) })),
    }
    startTransition(async () => {
      const result = await saveProduct(input)
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {})
        toast.error(result.error)
        return
      }
      toast.success(v.id ? "Товар сохранён" : "Товар создан")
      if (v.id) router.refresh()
      else router.push(`/admin/products/${result.data!.id}`)
    })
  }

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/admin/products" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-1">
            <ArrowLeft className="h-4 w-4" /> Все товары
          </Link>
          <h1 className="text-2xl font-bold">{v.id ? initial.name : "Новый товар"}</h1>
        </div>
        <div className="flex gap-2">
          {v.id && (
            <Button asChild variant="outline">
              <Link href={`/product/${initial.slug}`} target="_blank">На сайте</Link>
            </Button>
          )}
          <Button type="submit" disabled={isPending || uploading > 0}>
            {isPending ? "Сохранение..." : "Сохранить"}
          </Button>
        </div>
      </div>

      {Object.keys(errors).length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          Исправьте ошибки в отмеченных полях
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Основное</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Field label="Название" error={errors.name} required>
                <Input
                  value={v.name}
                  onChange={(e) => {
                    set("name", e.target.value)
                    if (!slugTouched) set("slug", slugify(e.target.value))
                  }}
                />
              </Field>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Артикул" error={errors.sku} required>
                  <Input {...text("sku")} />
                </Field>
                <Field label="Адрес страницы (slug)" error={errors.slug} hint={`/product/${v.slug || "..."}`}>
                  <Input
                    value={v.slug}
                    onChange={(e) => {
                      setSlugTouched(true)
                      set("slug", e.target.value)
                    }}
                  />
                </Field>
              </div>
              <Field label="Категория" error={errors.categoryId} required>
                <select className={fieldClass} {...text("categoryId")}>
                  <option value="">Выберите категорию</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{"— ".repeat(c.depth)}{c.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Описание" error={errors.description}>
                <textarea className={fieldClass} rows={6} {...text("description")} />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Фото</CardTitle>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={addImageUrl}>
                  <Link2 className="h-4 w-4 mr-1" /> По ссылке
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => fileInput.current?.click()} disabled={uploading > 0}>
                  <ImagePlus className="h-4 w-4 mr-1" /> {uploading > 0 ? "Загрузка..." : "Загрузить"}
                </Button>
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  hidden
                  onChange={(e) => {
                    uploadFiles(e.target.files)
                    e.target.value = ""
                  }}
                />
              </div>
            </CardHeader>
            <CardContent>
              {v.images.length === 0 ? (
                <p className="text-sm text-gray-500">Фото нет. Первое фото будет главным. JPG, PNG, WEBP до 5 МБ.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {v.images.map((img, i) => (
                    <div key={img.url + i} className={cn("relative rounded-lg border overflow-hidden group", i === 0 && "ring-2 ring-primary")}>
                      <ProductImage src={img.url} alt="" className="aspect-square w-full" />
                      {i === 0 && (
                        <span className="absolute top-1 left-1 rounded bg-primary px-1.5 text-xs text-white flex items-center gap-1">
                          <Star className="h-3 w-3" /> Главное
                        </span>
                      )}
                      <div className="absolute bottom-0 inset-x-0 flex justify-center gap-1 bg-white/90 p-1">
                        <IconBtn title="Левее" disabled={i === 0} onClick={() => moveImage(i, -1)}><ArrowUp className="h-3 w-3 -rotate-90" /></IconBtn>
                        <IconBtn title="Правее" disabled={i === v.images.length - 1} onClick={() => moveImage(i, 1)}><ArrowDown className="h-3 w-3 -rotate-90" /></IconBtn>
                        <IconBtn title="Удалить" onClick={() => set("images", v.images.filter((_, j) => j !== i))}><Trash2 className="h-3 w-3 text-red-500" /></IconBtn>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Характеристики</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={() => set("attributes", [...v.attributes, { name: "", value: "" }])}>
                <Plus className="h-4 w-4 mr-1" /> Добавить
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {v.attributes.length === 0 && <p className="text-sm text-gray-500">Например: Ширина — 50 см, Цвет — белый</p>}
              {v.attributes.map((a, i) => (
                <div key={i} className="flex gap-2">
                  <Input placeholder="Название" value={a.name} onChange={(e) => set("attributes", v.attributes.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                  <Input placeholder="Значение" value={a.value} onChange={(e) => set("attributes", v.attributes.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} />
                  <Button type="button" variant="ghost" size="icon" onClick={() => set("attributes", v.attributes.filter((_, j) => j !== i))} title="Удалить">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Варианты</CardTitle>
                <p className="text-sm text-gray-500 mt-1">Цвет, размер и т.п. У каждого варианта свой остаток; пустая цена — как у товара.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => set("variants", [...v.variants, { name: "", sku: "", price: "", stock: "0", isActive: true }])}
              >
                <Plus className="h-4 w-4 mr-1" /> Добавить
              </Button>
            </CardHeader>
            {v.variants.length > 0 && (
              <CardContent className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500">
                      <th className="pb-2 pr-2">Название</th>
                      <th className="pb-2 pr-2">Артикул</th>
                      <th className="pb-2 pr-2">Цена</th>
                      <th className="pb-2 pr-2">Остаток</th>
                      <th className="pb-2 pr-2">Вкл.</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {v.variants.map((x, i) => {
                      const update = (patch: Partial<Variant>) => set("variants", v.variants.map((y, j) => (j === i ? { ...y, ...patch } : y)))
                      return (
                        <tr key={x.id ?? `new-${i}`}>
                          <td className="pr-2 py-1"><Input value={x.name} onChange={(e) => update({ name: e.target.value })} className="min-w-28" /></td>
                          <td className="pr-2 py-1"><Input value={x.sku} onChange={(e) => update({ sku: e.target.value })} className="min-w-24" /></td>
                          <td className="pr-2 py-1"><Input value={x.price} inputMode="numeric" placeholder={v.price} onChange={(e) => update({ price: e.target.value })} className="min-w-24" /></td>
                          <td className="pr-2 py-1"><Input value={x.stock} inputMode="numeric" onChange={(e) => update({ stock: e.target.value })} className="w-20" /></td>
                          <td className="pr-2 py-1"><input type="checkbox" checked={x.isActive} onChange={(e) => update({ isActive: e.target.checked })} /></td>
                          <td className="py-1">
                            <Button type="button" variant="ghost" size="icon" onClick={() => set("variants", v.variants.filter((_, j) => j !== i))} title="Удалить">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                {errors.variants && <p className="text-sm text-red-600 mt-2">{errors.variants}</p>}
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader><CardTitle>SEO</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Field label="Заголовок страницы" hint="Если пусто — название товара">
                <Input {...text("metaTitle")} />
              </Field>
              <Field label="Описание для поисковиков" hint="Если пусто — описание товара">
                <textarea className={fieldClass} rows={2} {...text("metaDescription")} />
              </Field>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Показ на сайте</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Check label="Показывать на сайте" checked={v.isActive} onChange={(c) => set("isActive", c)} />
              <Check label="Хит (на главной)" checked={v.isFeatured} onChange={(c) => set("isFeatured", c)} />
              <Check label="Новинка" checked={v.isNew} onChange={(c) => set("isNew", c)} />
              <Field label="Статус" error={errors.status}>
                <select className={fieldClass} {...text("status")}>
                  {Object.entries(PRODUCT_STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Цена, сум</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Field label="Цена" error={errors.price} required>
                <Input inputMode="numeric" {...text("price")} />
              </Field>
              <Field label="Старая цена" error={errors.oldPrice} hint="Для показа скидки">
                <Input inputMode="numeric" {...text("oldPrice")} />
              </Field>
              <Field label="Закупочная цена" error={errors.costPrice} hint="Видна только в админке">
                <Input inputMode="numeric" {...text("costPrice")} />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Склад</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Остаток" error={errors.stock} hint={v.reserved > 0 ? `в резерве ${v.reserved}` : undefined}>
                  <Input inputMode="numeric" {...text("stock")} />
                </Field>
                <Field label="Ед. изм." error={errors.unit}>
                  <Input {...text("unit")} />
                </Field>
                <Field label="Мин. заказ" error={errors.minQuantity}>
                  <Input inputMode="numeric" {...text("minQuantity")} />
                </Field>
                <Field label="Мало, если ≤" error={errors.lowStockThreshold}>
                  <Input inputMode="numeric" {...text("lowStockThreshold")} />
                </Field>
                <Field label="Вес, кг" error={errors.weight}>
                  <Input inputMode="decimal" {...text("weight")} />
                </Field>
                <Field label="Размеры" error={errors.dimensions}>
                  <Input placeholder="60×100 см" {...text("dimensions")} />
                </Field>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}

function Field({
  label,
  error,
  hint,
  required,
  children,
}: {
  label: string
  error?: string
  hint?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
      {error ? (
        <span className="mt-1 block text-sm text-red-600">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-gray-500">{hint}</span>
      ) : null}
    </label>
  )
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4" />
      {label}
    </label>
  )
}

function IconBtn({ title, disabled, onClick, children }: { title: string; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" title={title} disabled={disabled} onClick={onClick} className="rounded p-1 hover:bg-gray-200 disabled:opacity-30">
      {children}
    </button>
  )
}
