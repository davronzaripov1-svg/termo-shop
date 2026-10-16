"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Copy, Edit, ExternalLink, Eye, EyeOff, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { deleteProduct, duplicateProduct, setProductActive } from "@/app/admin/products/actions"

export function ProductRowActions({ id, slug, name, isActive }: { id: string; slug: string; name: string; isActive: boolean }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const run = (action: () => Promise<{ ok: boolean; error?: string }>, success: string, after?: () => void) =>
    startTransition(async () => {
      const result = await action()
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success(success)
      after?.()
      router.refresh()
    })

  if (confirmDelete) {
    return (
      <div className="flex items-center justify-end gap-2 text-sm">
        <span className="text-gray-600">Удалить?</span>
        <Button
          size="sm"
          variant="destructive"
          disabled={isPending}
          onClick={() => run(() => deleteProduct(id), `«${name}» удалён`, () => setConfirmDelete(false))}
        >
          Да
        </Button>
        <Button size="sm" variant="outline" onClick={() => setConfirmDelete(false)}>Нет</Button>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Button asChild variant="ghost" size="icon" title="Редактировать">
        <Link href={`/admin/products/${id}`}><Edit className="h-4 w-4" /></Link>
      </Button>
      <Button asChild variant="ghost" size="icon" title="Открыть на сайте">
        <Link href={`/product/${slug}`} target="_blank"><ExternalLink className="h-4 w-4" /></Link>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        title={isActive ? "Скрыть с сайта" : "Показать на сайте"}
        disabled={isPending}
        onClick={() => run(() => setProductActive(id, !isActive), isActive ? "Товар скрыт" : "Товар на сайте")}
      >
        {isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        title="Создать копию"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const result = await duplicateProduct(id)
            if (!result.ok) return void toast.error(result.error)
            toast.success("Копия создана (скрыта с сайта)")
            router.push(`/admin/products/${result.data!.id}`)
          })
        }
      >
        <Copy className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" title="Удалить" className="text-red-500" onClick={() => setConfirmDelete(true)}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
