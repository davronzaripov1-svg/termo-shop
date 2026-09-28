"use client"

import Link from "next/link"
import { ChangeEvent, useEffect, useState } from "react"
import { ArrowLeft, Download, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type DesignFile = {
  id: string
  fileType: string
  filename: string
  mimeType?: string
  sizeBytes: number
  version: number
  isCurrent: boolean
}

type Design = {
  code: string
  title: string
  series: string
  designType: string
  version: number
  storageLocation?: string
  files: DesignFile[]
}

const FILE_TYPES = ["CDR", "PDF", "PNG", "AI", "PSD", "ZIP"]

function formatBytes(bytes: number) {
  if (!bytes) return "0 B"
  const units = ["B", "KB", "MB", "GB"]
  let value = bytes
  let i = 0
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024
    i++
  }
  return value.toFixed(i ? 1 : 0) + " " + units[i]
}

export default function DesignDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const [code, setCode] = useState("")
  const [item, setItem] = useState<Design | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    params.then(({ code }) => setCode(code))
  }, [params])

  useEffect(() => {
    if (!code) return
    fetch("/api/admin/designs/" + encodeURIComponent(code), { cache: "no-store" })
      .then((r) => r.json())
      .then(setItem)
  }, [code])

  async function upload(fileType: string, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file || !code) return

    setUploading(true)
    try {
      const form = new FormData()
      form.append("fileType", fileType)
      form.append("file", file)

      const res = await fetch("/api/admin/designs/" + encodeURIComponent(code) + "/files", {
        method: "POST",
        body: form,
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || "Ошибка загрузки")
        return
      }
      setItem(data)
    } finally {
      setUploading(false)
    }
  }

  if (!item) return <div className="text-gray-500">Загрузка...</div>

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/designs">
          <Button variant="ghost" className="mb-3">
            <ArrowLeft className="mr-2 h-4 w-4" />Назад
          </Button>
        </Link>
        <div className="font-mono text-sm text-gray-500">{item.code}</div>
        <h1 className="text-3xl font-bold">{item.title}</h1>
        <p className="text-gray-500">{item.series} · {item.designType} · V{item.version}</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Загрузить исходник</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {FILE_TYPES.map((type) => (
              <label key={type}>
                <input
                  type="file"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => upload(type, e)}
                />
                <span className="inline-flex cursor-pointer items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50">
                  <Upload className="mr-2 h-4 w-4" />{type}
                </span>
              </label>
            ))}
          </div>
          <p className="mt-3 text-sm text-gray-500">
            Повторная загрузка одного типа создаёт новую версию. Предыдущая версия сохраняется.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-sm text-gray-500">
                  <th className="p-4">Тип</th>
                  <th className="p-4">Файл</th>
                  <th className="p-4">Размер</th>
                  <th className="p-4">Версия</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {item.files.length === 0 ? (
                  <tr><td colSpan={5} className="p-6 text-gray-500">Файлов пока нет</td></tr>
                ) : item.files.map((file) => (
                  <tr key={file.id} className="border-b last:border-0">
                    <td className="p-4 font-semibold">{file.fileType}</td>
                    <td className="p-4">{file.filename}</td>
                    <td className="p-4">{formatBytes(file.sizeBytes)}</td>
                    <td className="p-4">V{file.version}{file.isCurrent ? " · current" : ""}</td>
                    <td className="p-4">
                      <a href={"/api/admin/designs/" + item.code + "/files/" + file.id + "/download"}>
                        <Button size="sm" variant="outline">
                          <Download className="mr-2 h-4 w-4" />Скачать
                        </Button>
                      </a>
                    </td>
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
