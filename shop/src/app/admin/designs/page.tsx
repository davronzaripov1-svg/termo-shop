"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { Plus, Search, ScanLine } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

type DesignFile = {
  id: string
  fileType: string
  filename: string
  version: number
  isCurrent: boolean
  sizeBytes: number
}

type Design = {
  id: string
  code: string
  title: string
  series: string
  seriesCode: string
  designType: string
  version: number
  isActive: boolean
  files: DesignFile[]
}

export default function DesignsPage() {
  const [items, setItems] = useState<Design[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  async function load() {
    setLoading(true)
    const res = await fetch("/api/admin/designs", { cache: "no-store" })
    if (res.ok) setItems(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((x) =>
      [x.code, x.title, x.series, x.designType].some((v) => v.toLowerCase().includes(q))
    )
  }, [items, search])

  async function createDesign() {
    const title = window.prompt("Название дизайна")
    if (!title) return
    const series = window.prompt("Название серии", "Urban Street") || "General"
    const seriesCode = window.prompt("Код серии, например URB", "URB") || "GEN"
    const designType = window.prompt("Тип: UV-DTF / UV / DTF / 3D", "UV-DTF") || "UV-DTF"

    setCreating(true)
    try {
      const res = await fetch("/api/admin/designs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, series, seriesCode, designType }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || "Ошибка создания")
        return
      }
      window.location.href = "/admin/designs/" + data.code
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">База дизайнов</h1>
          <p className="text-sm text-gray-500">Исходники хранятся в Google Drive, метаданные — в PostgreSQL</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/designs/scan">
            <Button variant="outline"><ScanLine className="mr-2 h-4 w-4" />Сканер</Button>
          </Link>
          <Button onClick={createDesign} disabled={creating}>
            <Plus className="mr-2 h-4 w-4" />Добавить дизайн
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              placeholder="Поиск по коду, названию или серии..."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-sm text-gray-500">
                  <th className="p-4">Код</th>
                  <th className="p-4">Название</th>
                  <th className="p-4">Серия</th>
                  <th className="p-4">Тип</th>
                  <th className="p-4">Версия</th>
                  <th className="p-4">Файлы</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td className="p-6 text-gray-500" colSpan={6}>Загрузка...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td className="p-6 text-gray-500" colSpan={6}>Дизайнов пока нет</td></tr>
                ) : filtered.map((item) => (
                  <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-4 font-mono font-semibold">
                      <Link href={"/admin/designs/" + item.code} className="hover:text-primary">
                        {item.code}
                      </Link>
                    </td>
                    <td className="p-4">{item.title}</td>
                    <td className="p-4">{item.series}</td>
                    <td className="p-4">{item.designType}</td>
                    <td className="p-4">V{item.version}</td>
                    <td className="p-4">{item.files.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
