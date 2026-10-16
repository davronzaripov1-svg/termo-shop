"use client"

import { useEffect, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { deletePage, previewContent, savePage, type PageInput } from "@/app/admin/pages/actions"
import { slugify } from "@/lib/utils"

type Values = { id?: string; slug: string; title: string; content: string; isActive: boolean; metaTitle: string; metaDescription: string }

const fieldClass = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm"

const specialHints: Record<string, string> = {
  delivery: "Под текстом сайт сам показывает способы доставки и оплаты с ценами из Настроек.",
  contacts: "Над текстом сайт сам показывает телефоны, email, адрес и режим работы из Настроек.",
}

export function PageEditor({ initial, special }: { initial: Values; special?: string }) {
  const router = useRouter()
  const [v, setV] = useState(initial)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [preview, setPreview] = useState("")
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Предпросмотр — серверная функция, та же, что рисует страницу на сайте
  useEffect(() => {
    const t = setTimeout(() => previewContent(v.content).then(setPreview), 300)
    return () => clearTimeout(t)
  }, [v.content])

  const set = <K extends keyof Values>(key: K, value: Values[K]) => setV((prev) => ({ ...prev, [key]: value }))

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const result = await savePage(v as PageInput)
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {})
        toast.error(result.error)
        return
      }
      setErrors({})
      toast.success("Страница сохранена")
      if (!v.id) router.push(`/admin/pages/${result.data!.id}`)
      else router.refresh()
    })
  }

  const remove = () =>
    startTransition(async () => {
      const result = await deletePage(v.id!)
      if (!result.ok) return void toast.error(result.error)
      toast.success("Страница удалена")
      router.push("/admin/pages")
    })

  return (
    <form onSubmit={save} className="space-y-6" noValidate>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/admin/pages" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-1">
            <ArrowLeft className="h-4 w-4" /> Все страницы
          </Link>
          <h1 className="text-2xl font-bold">{v.id ? initial.title : "Новая страница"}</h1>
        </div>
        <div className="flex gap-2">
          {v.id && (confirmDelete ? (
            <>
              <Button type="button" variant="destructive" onClick={remove} disabled={isPending}>Да, удалить</Button>
              <Button type="button" variant="outline" onClick={() => setConfirmDelete(false)}>Отмена</Button>
            </>
          ) : (
            <Button type="button" variant="outline" className="text-red-600" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="h-4 w-4 mr-2" />Удалить
            </Button>
          ))}
          <Button type="submit" disabled={isPending}>{isPending ? "Сохранение..." : "Сохранить"}</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Заголовок" error={errors.title}>
                <Input value={v.title} onChange={(e) => {
                  set("title", e.target.value)
                  if (!v.id && !special) set("slug", slugify(e.target.value))
                }} />
              </Field>
              <Field label="Адрес страницы" error={errors.slug} hint={`/${v.slug || "..."}`}>
                <Input value={v.slug} onChange={(e) => set("slug", e.target.value)} />
              </Field>
            </div>
            {special && specialHints[special] && (
              <p className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-800">{specialHints[special]}</p>
            )}
            <Field label="Текст" error={errors.content}>
              <textarea className={`${fieldClass} font-mono`} rows={20} value={v.content} onChange={(e) => set("content", e.target.value)} />
            </Field>
            <details className="text-sm text-gray-600">
              <summary className="cursor-pointer">Как оформлять текст</summary>
              <ul className="mt-2 space-y-1 font-mono text-xs">
                <li># Заголовок, ## Подзаголовок</li>
                <li>Пустая строка — новый абзац</li>
                <li>- пункт списка, 1. нумерованный пункт</li>
                <li>**жирный**, *курсив*</li>
                <li>[текст ссылки](https://t.me/termostik)</li>
              </ul>
            </details>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={v.isActive} onChange={(e) => set("isActive", e.target.checked)} />
              Показывать на сайте
            </label>
            <details className="text-sm">
              <summary className="cursor-pointer text-gray-500">SEO</summary>
              <div className="space-y-3 mt-3">
                <Field label="Заголовок для поисковиков"><Input value={v.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} /></Field>
                <Field label="Описание для поисковиков">
                  <textarea className={fieldClass} rows={2} value={v.metaDescription} onChange={(e) => set("metaDescription", e.target.value)} />
                </Field>
              </div>
            </details>
          </CardContent>
        </Card>

        <Card className="h-fit lg:sticky lg:top-20">
          <CardHeader><CardTitle className="text-base text-gray-500">Предпросмотр</CardTitle></CardHeader>
          <CardContent>
            <h1 className="text-2xl font-bold mb-4">{v.title || "Заголовок"}</h1>
            <div className="prose-content" dangerouslySetInnerHTML={{ __html: preview }} />
          </CardContent>
        </Card>
      </div>
    </form>
  )
}

function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-sm text-red-600">{error}</span> : hint ? <span className="mt-1 block text-xs text-gray-500">{hint}</span> : null}
    </label>
  )
}
