"use client"

import { useEffect, useState } from "react"
import { ArrowDown, ArrowUp, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { listProductOptions, type ProductOption } from "@/app/admin/homepage/actions"

/** Ручной выбор товаров для блока «Популярные товары»: поиск, порядок, удаление. */
export function ManualProductPicker({ value, onChange, max }: { value: string[]; onChange: (ids: string[]) => void; max: number }) {
  const [options, setOptions] = useState<ProductOption[] | null>(null)
  const [query, setQuery] = useState("")

  useEffect(() => {
    listProductOptions().then((r) => setOptions(r.ok ? r.data ?? [] : []))
  }, [])

  if (!options) return <p className="text-sm text-gray-500">Загрузка товаров...</p>

  // Старые/удалённые id в настройках просто не показываем
  const selected = value.map((id) => options.find((o) => o.id === id)).filter((o): o is ProductOption => !!o)
  const q = query.trim().toLowerCase()
  const matches = q
    ? options.filter((o) => !value.includes(o.id) && (o.name.toLowerCase().includes(q) || o.sku.toLowerCase().includes(q))).slice(0, 8)
    : []
  const ids = selected.map((o) => o.id)
  const move = (i: number, dir: -1 | 1) => {
    const next = [...ids]
    ;[next[i], next[i + dir]] = [next[i + dir], next[i]]
    onChange(next)
  }

  return (
    <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
      {selected.length === 0 ? (
        <p className="text-sm text-gray-500">Товары не выбраны — на главной будут хиты и популярные.</p>
      ) : (
        <ol className="space-y-2">
          {selected.map((o, i) => (
            <li key={o.id} className="flex items-center gap-2 rounded-md bg-white border px-3 py-2 text-sm">
              <span className="w-5 text-gray-400">{i + 1}.</span>
              <span className="flex-1">
                {o.name} <span className="text-gray-400">{o.sku}</span>
                {!o.isActive && <span className="text-orange-500"> · скрыт, не будет показан</span>}
              </span>
              <button type="button" title="Выше" disabled={i === 0} onClick={() => move(i, -1)} className="p-1 disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
              <button type="button" title="Ниже" disabled={i === selected.length - 1} onClick={() => move(i, 1)} className="p-1 disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
              <button type="button" title="Убрать" onClick={() => onChange(ids.filter((id) => id !== o.id))} className="p-1 text-red-500"><X className="h-4 w-4" /></button>
            </li>
          ))}
        </ol>
      )}
      {selected.length < max ? (
        <div className="relative">
          <Input placeholder="Найти товар по названию или артикулу..." value={query} onChange={(e) => setQuery(e.target.value)} />
          {matches.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow-lg max-h-64 overflow-y-auto">
              {matches.map((o) => (
                <li key={o.id}>
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                    onClick={() => {
                      onChange([...ids, o.id])
                      setQuery("")
                    }}
                  >
                    {o.name} <span className="text-gray-400">{o.sku}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <p className="text-xs text-gray-500">Выбрано максимальное количество ({max}). Увеличьте «Количество товаров», чтобы добавить ещё.</p>
      )}
    </div>
  )
}
