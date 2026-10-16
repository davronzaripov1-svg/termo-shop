import path from "path"

// Загруженные файлы лежат вне public/: next start не раздаёт файлы, добавленные после сборки.
// Отдаёт их маршрут /api/uploads/[...path].
export const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads"))

export const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
}

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024

/** Безопасный путь внутри UPLOAD_DIR или null (защита от ../) */
export function resolveUploadPath(parts: string[]): string | null {
  const full = path.resolve(UPLOAD_DIR, ...parts)
  return full.startsWith(UPLOAD_DIR + path.sep) ? full : null
}
