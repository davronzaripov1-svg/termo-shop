"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ClipboardCheck, Minus, Plus, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { applyStockOperation } from "@/app/admin/warehouse/actions"

type Op = "in" | "out" | "set"

const titles: Record<Op, string> = { in: "Приход", out: "Списание", set: "Инвентаризация" }

export function StockButtons({
  productId,
  variantId,
  name,
  stock,
  reserved,
  unit,
}: {
  productId: string
  variantId?: string
  name: string
  stock: number
  reserved: number
  unit: string
}) {
  const router = useRouter()
  const [op, setOp] = useState<Op | null>(null)
  const [quantity, setQuantity] = useState("")
  const [reason, setReason] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const open = (next: Op) => {
    setOp(next)
    setQuantity(next === "set" ? String(stock) : "")
    setReason("")
    setError(null)
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!op) return
    startTransition(async () => {
      const result = await applyStockOperation({ productId, variantId, op, quantity, reason })
      if (!result.ok) {
        setError(result.fieldErrors?.quantity ?? result.error)
        return
      }
      toast.success(`${titles[op]}: ${name}`)
      setOp(null)
      router.refresh()
    })
  }

  const preview = (() => {
    const n = Number(quantity)
    if (!op || !Number.isFinite(n) || quantity === "") return null
    return op === "in" ? stock + n : op === "out" ? stock - n : n
  })()

  return (
    <>
      <Button variant="ghost" size="icon" title="Приход" onClick={() => open("in")}><Plus className="h-4 w-4 text-green-600" /></Button>
      <Button variant="ghost" size="icon" title="Списание" onClick={() => open("out")}><Minus className="h-4 w-4 text-red-600" /></Button>
      <Button variant="ghost" size="icon" title="Инвентаризация" onClick={() => open("set")}><ClipboardCheck className="h-4 w-4 text-blue-600" /></Button>

      {op && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setOp(null)}>
          <form
            onSubmit={submit}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl space-y-4 text-left"
            role="dialog"
            aria-label={titles[op]}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">{titles[op]}</h3>
                <p className="text-sm text-gray-500">{name}</p>
              </div>
              <button type="button" onClick={() => setOp(null)} aria-label="Закрыть"><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <p className="text-sm">
              Сейчас: <b>{stock} {unit}</b>
              {reserved > 0 && <span className="text-gray-500"> (в резерве {reserved})</span>}
            </p>
            <label className="block text-sm">
              <span className="font-medium">{op === "set" ? "Фактический остаток" : "Количество"}</span>
              <Input
                autoFocus
                inputMode="numeric"
                value={quantity}
                onChange={(e) => {
                  setQuantity(e.target.value.replace(/[^\d]/g, ""))
                  setError(null)
                }}
                className="mt-1"
              />
            </label>
            {preview !== null && (
              <p className="text-sm text-gray-500">Станет: <b className={preview < reserved ? "text-red-600" : "text-gray-900"}>{preview} {unit}</b></p>
            )}
            <label className="block text-sm">
              <span className="font-medium">Причина / документ</span>
              <Input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={op === "in" ? "Накладная №..." : op === "out" ? "Брак, порча..." : "Пересчёт"}
                className="mt-1"
              />
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setOp(null)}>Отмена</Button>
              <Button type="submit" disabled={isPending || quantity === ""}>{isPending ? "..." : "Сохранить"}</Button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
