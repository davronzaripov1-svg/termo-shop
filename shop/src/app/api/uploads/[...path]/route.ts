import { readFile } from "fs/promises"
import path from "path"
import { IMAGE_TYPES, resolveUploadPath } from "@/lib/uploads"

const typeByExt = Object.fromEntries(Object.entries(IMAGE_TYPES).map(([type, ext]) => [ext, type]))

// Отдаёт загруженные фото
export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const file = resolveUploadPath((await params).path)
  const type = file && typeByExt[path.extname(file).slice(1)]
  if (!file || !type) return new Response("Not found", { status: 404 })

  try {
    const data = await readFile(file)
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": type,
        // имена файлов уникальные — можно кешировать навсегда
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch {
    return new Response("Not found", { status: 404 })
  }
}
