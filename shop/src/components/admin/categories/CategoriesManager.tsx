"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Edit, ExternalLink, FolderTree, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { deleteCategory, saveCategory } from "@/app/admin/categories/actions"
import { cn, slugify } from "@/lib/utils"

type Category = {
  id: string
  name: string
  slug: string
  parentId: string
  description: string
  image: string
  sortOrder: string
  isActive: boolean
  metaTitle: string
  metaDescription: string
  depth: number
  productCount: number
}

type FormValues = Omit<Category, "id" | "depth" | "productCount"> & { id?: string }

const empty: FormValues = {
  name: "", slug: "", parentId: "", description: "", image: "", sortOrder: "0", isActive: true, metaTitle: "", metaDescription: "",
}
const fieldClass = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm"

export function CategoriesManager({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const [form, setForm] = useState<FormValues | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const open = (values: FormValues) => {
    setForm(values)
    setErrors({})
  }
  const set = (key: keyof FormValues, value: string | boolean) => form && setForm({ ...form, [key]: value })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form) return
    startTransition(async () => {
      const result = await saveCategory(form)
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {})
        toast.error(result.error)
        return
      }
      toast.success(form.id ? "Категория сохранена" : "Категория создана")
      setForm(null)
      router.refresh()
    })
  }

  const remove = (id: string) =>
    startTransition(async () => {
      const result = await deleteCategory(id)
      setConfirmDelete(null)
      if (!result.ok) return void toast.error(result.error)
      toast.success("Категория удалена")
      router.refresh()
    })

  // Родителем не может быть сама категория и её потомки
  const descendants = (id: string): string[] => {
    const kids = categories.filter((c) => c.parentId === id).map((c) => c.id)
    return [id, ...kids.flatMap(descendants)]
  }
  const parentOptions = form?.id ? categories.filter((c) => !descendants(form.id!).includes(c.id)) : categories

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Категории</h1>
          <p className="text-sm text-gray-500">Всего: {categories.length}</p>
        </div>
        <Button onClick={() => open(empty)}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить категорию
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <Card className="lg:col-span-2">
          <CardContent className="p-0">
            {categories.length === 0 ? (
              <p className="p-10 text-center text-gray-500">Категорий пока нет</p>
            ) : (
              <ul className="divide-y">
                {categories.map((c) => (
                  <li key={c.id} className={cn("flex items-center gap-3 px-4 py-3 hover:bg-gray-50", !c.isActive && "opacity-60")}>
                    <div className="flex-1 min-w-0" style={{ paddingLeft: c.depth * 24 }}>
                      <div className="flex items-center gap-2">
                        <FolderTree className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="font-medium truncate">{c.name}</span>
                        {!c.isActive && <span className="text-xs rounded bg-gray-200 px-1.5">скрыта</span>}
                      </div>
                      <p className="text-xs text-gray-400 ml-6">/catalog/{c.slug} · порядок {c.sortOrder}</p>
                    </div>
                    <Link href={`/admin/products?category=${c.id}`} className="text-sm text-gray-500 hover:text-primary whitespace-nowrap">
                      {c.productCount} тов.
                    </Link>
                    {confirmDelete === c.id ? (
                      <div className="flex items-center gap-2 text-sm">
                        <span>Удалить?</span>
                        <Button size="sm" variant="destructive" disabled={isPending} onClick={() => remove(c.id)}>Да</Button>
                        <Button size="sm" variant="outline" onClick={() => setConfirmDelete(null)}>Нет</Button>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Button asChild variant="ghost" size="icon" title="Открыть на сайте">
                          <Link href={`/catalog/${c.slug}`} target="_blank"><ExternalLink className="h-4 w-4" /></Link>
                        </Button>
                        <Button variant="ghost" size="icon" title="Подкатегория" onClick={() => open({ ...empty, parentId: c.id })}>
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Редактировать" onClick={() => open({ ...c })}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Удалить" className="text-red-500" onClick={() => setConfirmDelete(c.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {form && (
          <Card className="lg:sticky lg:top-20">
            <CardHeader><CardTitle>{form.id ? "Редактирование" : "Новая категория"}</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={submit} className="space-y-4" noValidate>
                <Field label="Название *" error={errors.name}>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.id ? form.slug : slugify(e.target.value) })}
                    autoFocus
                  />
                </Field>
                <Field label="Адрес (slug)" error={errors.slug}>
                  <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} />
                </Field>
                <Field label="Родительская категория" error={errors.parentId}>
                  <select className={fieldClass} value={form.parentId} onChange={(e) => set("parentId", e.target.value)}>
                    <option value="">— верхний уровень —</option>
                    {parentOptions.map((c) => (
                      <option key={c.id} value={c.id}>{"— ".repeat(c.depth)}{c.name}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Описание" error={errors.description}>
                  <textarea className={fieldClass} rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} />
                </Field>
                <Field label="Картинка (ссылка)" error={errors.image}>
                  <Input value={form.image} placeholder="https://..." onChange={(e) => set("image", e.target.value)} />
                </Field>
                <Field label="Порядок (меньше — выше)" error={errors.sortOrder}>
                  <Input inputMode="numeric" value={form.sortOrder} onChange={(e) => set("sortOrder", e.target.value)} />
                </Field>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} />
                  Показывать на сайте
                </label>
                <details className="text-sm">
                  <summary className="cursor-pointer text-gray-500">SEO</summary>
                  <div className="space-y-3 mt-3">
                    <Field label="Заголовок страницы"><Input value={form.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} /></Field>
                    <Field label="Описание для поисковиков">
                      <textarea className={fieldClass} rows={2} value={form.metaDescription} onChange={(e) => set("metaDescription", e.target.value)} />
                    </Field>
                  </div>
                </details>
                <div className="flex gap-2">
                  <Button type="submit" disabled={isPending}>{isPending ? "Сохранение..." : "Сохранить"}</Button>
                  <Button type="button" variant="outline" onClick={() => setForm(null)}>Отмена</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      {children}
      {error && <span className="mt-1 block text-sm text-red-600">{error}</span>}
    </label>
  )
}
