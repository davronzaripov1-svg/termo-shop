import * as XLSX from "xlsx"
import { AdminActionError, requirePermission } from "@/lib/admin"
import { prisma } from "@/lib/prisma"

// Остатки склада в Excel
export async function GET() {
  try {
    await requirePermission("warehouse")
  } catch (error) {
    if (error instanceof AdminActionError) return new Response("Forbidden", { status: 403 })
    throw error
  }

  const products = await prisma.product.findMany({
    where: { status: { not: "DISCONTINUED" } },
    orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
    include: { category: { select: { name: true } }, variants: { orderBy: { createdAt: "asc" } } },
  })

  const rows = products.flatMap((p) => [
    {
      "Артикул": p.sku,
      "Товар": p.name,
      "Категория": p.category.name,
      "Остаток": p.stock,
      "Резерв": p.reserved,
      "Доступно": p.stock - p.reserved,
      "Ед.": p.unit,
      "Закупочная цена": p.costPrice ? Number(p.costPrice) : "",
      "Цена": Number(p.price),
      "На сайте": p.isActive ? "да" : "нет",
    },
    ...p.variants.map((v) => ({
      "Артикул": v.sku ?? "",
      "Товар": `${p.name} — ${v.name}`,
      "Категория": p.category.name,
      "Остаток": v.stock,
      "Резерв": 0,
      "Доступно": v.stock,
      "Ед.": p.unit,
      "Закупочная цена": "",
      "Цена": Number(v.price ?? p.price),
      "На сайте": v.isActive && p.isActive ? "да" : "нет",
    })),
  ])

  const book = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(book, XLSX.utils.json_to_sheet(rows), "Остатки")
  const file = XLSX.write(book, { type: "buffer", bookType: "xlsx" }) as Buffer
  return new Response(new Uint8Array(file), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="stock-${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  })
}
