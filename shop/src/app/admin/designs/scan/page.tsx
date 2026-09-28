"use client"

import { FormEvent, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ScanLine, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DesignScannerPage() {
  const router = useRouter()
  const [code, setCode] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  function submit(e: FormEvent) {
    e.preventDefault()
    const value = code.trim().toUpperCase()
    if (!value) return
    router.push("/admin/designs/" + encodeURIComponent(value))
  }

  return (
    <div className="mx-auto max-w-2xl py-12">
      <Card>
        <CardHeader className="text-center">
          <ScanLine className="mx-auto h-16 w-16 text-primary" />
          <CardTitle className="text-2xl">Сканер дизайнов</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="flex gap-3">
            <Input
              ref={inputRef}
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="UV-URB-001"
              className="h-14 text-center font-mono text-xl uppercase"
            />
            <Button type="submit" className="h-14 px-6">
              <Search className="mr-2 h-5 w-5" />Найти
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
