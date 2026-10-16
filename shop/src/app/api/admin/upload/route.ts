import { mkdir, writeFile } from "fs/promises"
import path from "path"
import { randomUUID } from "crypto"
import { NextResponse } from "next/server"
import { AdminActionError, requirePermission } from "@/lib/admin"
import { IMAGE_TYPES, MAX_IMAGE_SIZE, UPLOAD_DIR } from "@/lib/uploads"

// Загрузка фото товаров/категорий. Возвращает { url }.
export async function POST(request: Request) {
  try {
    await requirePermission("products")
  } catch (error) {
    if (error instanceof AdminActionError) return NextResponse.json({ error: error.message }, { status: 403 })
    throw error
  }

  const form = await request.formData()
  const file = form.get("file")
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Файл не передан" }, { status: 400 })
  }
  const ext = IMAGE_TYPES[file.type]
  if (!ext) {
    return NextResponse.json({ error: "Только JPG, PNG, WEBP или GIF" }, { status: 400 })
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return NextResponse.json({ error: "Файл больше 5 МБ" }, { status: 400 })
  }

  const month = new Date().toISOString().slice(0, 7)
  const dir = path.join(UPLOAD_DIR, "products", month)
  await mkdir(dir, { recursive: true })
  const name = `${randomUUID()}.${ext}`
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()))

  return NextResponse.json({ url: `/api/uploads/products/${month}/${name}` })
}
