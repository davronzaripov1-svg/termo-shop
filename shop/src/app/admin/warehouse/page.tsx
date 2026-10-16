import Link from "next/link"
import { Download, History, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EmptyRow, Pagination } from "@/components/admin/ui"
import { StockButtons } from "@/components/admin/warehouse/StockButtons"
import { prisma } from "@/lib/prisma"
import { formatDateTime, formatSum } from "@/lib/utils"

export const metadata = { title: "Склад" }

const PAGE_SIZE = 40

const movementLabels: Record<string, { label: string; className: string; sign: string }> = {
  INCOMING: { label: "Приход", className: "text-green-600", sign: "+" },
  OUTGOING: { label: "Расход", className: "text-red-600", sign: "−" },
  ADJUSTMENT: { label: "Инвентаризация", className: "text-blue-600", sign: "" },
  RESERVE: { label: "Резерв", className: "text-amber-600", sign: "" },
  RELEASE: { label: "Снят резерв", className: "text-gray-600", sign: "" },
  RETURN: { label: "Возврат", className: "text-green-600", sign: "+" },
}

type StockRow = {
  id: string; name: string; sku: string; unit: string; stock: number; reserved: number
  lowStockThreshold: number; costPrice: string | null; isActive: boolean; variants: number
}

export default async function WarehousePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const sp = await searchParams
  const q = sp.q?.trim() ?? ""
  const filter = ["low", "out", "normal"].includes(sp.filter ?? "") ? sp.filter! : ""
  const page = Math.max(1, Number(sp.page) || 1)
  const like = `%${q}%`

  // Фильтр «мало/нет» сравнивает колонки между собой — поэтому SQL
  const filterSql = {
    "": "TRUE",
    low: `"stock" - "reserved" <= "lowStockThreshold" AND "stock" - "reserved" > 0`,
    out: `"stock" - "reserved" <= 0`,
    normal: `"stock" - "reserved" > "lowStockThreshold"`,
  }[filter]

  const [rows, totalRows, summary, movements, historyProduct] = await Promise.all([
    prisma.$queryRawUnsafe<StockRow[]>(
      `SELECT p."id", p."name", p."sku", p."unit", p."stock", p."reserved", p."lowStockThreshold",
              p."costPrice"::text AS "costPrice", p."isActive",
              (SELECT COUNT(*)::int FROM "ProductVariant" v WHERE v."productId" = p."id") AS "variants"
       FROM "Product" p
       WHERE (p."name" ILIKE $1 OR p."sku" ILIKE $1) AND p."status" <> 'DISCONTINUED' AND ${filterSql}
       ORDER BY p."stock" - p."reserved" ASC, p."name" ASC
       LIMIT ${PAGE_SIZE} OFFSET ${(page - 1) * PAGE_SIZE}`,
      like
    ),
    prisma.$queryRawUnsafe<{ count: number }[]>(
      `SELECT COUNT(*)::int AS count FROM "Product"
       WHERE ("name" ILIKE $1 OR "sku" ILIKE $1) AND "status" <> 'DISCONTINUED' AND ${filterSql}`,
      like
    ),
    prisma.$queryRaw<{ skus: number; units: number; value: string; low: number; out: number }[]>`
      SELECT COUNT(*)::int AS skus,
             COALESCE(SUM("stock"), 0)::int AS units,
             COALESCE(SUM("stock" * COALESCE("costPrice", 0)), 0)::text AS value,
             COUNT(*) FILTER (WHERE "stock" - "reserved" <= "lowStockThreshold" AND "stock" - "reserved" > 0)::int AS low,
             COUNT(*) FILTER (WHERE "stock" - "reserved" <= 0)::int AS out
      FROM "Product" WHERE "status" <> 'DISCONTINUED'`,
    prisma.stockMovement.findMany({
      where: sp.product ? { productId: sp.product } : undefined,
      orderBy: { createdAt: "desc" },
      take: sp.product ? 100 : 15,
      include: { product: { select: { name: true, sku: true, unit: true } } },
    }),
    sp.product ? prisma.product.findUnique({ where: { id: sp.product }, select: { name: true } }) : null,
  ])

  const variantRows = await prisma.productVariant.findMany({
    where: { productId: { in: rows.filter((r) => r.variants > 0).map((r) => r.id) } },
    orderBy: { createdAt: "asc" },
    select: { id: true, productId: true, name: true, stock: true, isActive: true },
  })
  const s = summary[0]
  const total = totalRows[0]?.count ?? 0
  const params = { q: q || undefined, filter: filter || undefined, product: sp.product }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Склад</h1>
          <p className="text-gray-500">Остатки, приход, списание и инвентаризация</p>
        </div>
        <Button asChild variant="outline">
          {/* скачивание файла — обычная ссылка, не клиентская навигация */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/api/admin/warehouse/export">
            <Download className="h-4 w-4 mr-2" />
            Экспорт в Excel
          </a>
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Позиций", value: String(s.skus), href: "/admin/warehouse" },
          { label: "Единиц на складе", value: String(s.units), href: "/admin/warehouse" },
          { label: "Стоимость (закупка)", value: formatSum(Number(s.value)), href: "/admin/warehouse" },
          { label: "Заканчиваются", value: String(s.low), href: "/admin/warehouse?filter=low", color: "text-orange-500" },
          { label: "Нет в наличии", value: String(s.out), href: "/admin/warehouse?filter=out", color: "text-red-500" },
        ].map((c) => (
          <Link key={c.label} href={c.href}>
            <Card className="hover:shadow-md transition-shadow h-full">
              <CardContent className="p-4">
                <p className="text-sm text-gray-500">{c.label}</p>
                <p className={`text-xl font-bold ${c.color ?? ""}`}>{c.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <Card className="lg:col-span-2">
          <CardHeader>
            <form className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input name="q" placeholder="Название или артикул..." className="pl-10" defaultValue={q} />
              </div>
              <select name="filter" className="border rounded-lg px-3 py-2 bg-white" defaultValue={filter}>
                <option value="">Все</option>
                <option value="normal">В наличии</option>
                <option value="low">Заканчивается</option>
                <option value="out">Нет в наличии</option>
              </select>
              <Button type="submit">Найти</Button>
            </form>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-y bg-gray-50">
                    <th className="px-4 py-3">Товар</th>
                    <th className="px-4 py-3 text-center">Остаток</th>
                    <th className="px-4 py-3 text-center">Резерв</th>
                    <th className="px-4 py-3 text-center">Доступно</th>
                    <th className="px-4 py-3">Статус</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && <EmptyRow colSpan={6}>Ничего не найдено</EmptyRow>}
                  {rows.map((p) => {
                    const free = p.stock - p.reserved
                    const state = free <= 0 ? "out" : free <= p.lowStockThreshold ? "low" : "normal"
                    return [
                      <tr key={p.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <Link href={`/admin/products/${p.id}`} className="font-medium hover:text-primary">{p.name}</Link>
                          <p className="text-xs text-gray-500">{p.sku}{!p.isActive && " · скрыт"}</p>
                        </td>
                        <td className="px-4 py-3 text-center">{p.stock}</td>
                        <td className="px-4 py-3 text-center text-gray-500">{p.reserved || "—"}</td>
                        <td className="px-4 py-3 text-center font-semibold">{free} {p.unit}</td>
                        <td className="px-4 py-3">
                          <Badge className={`border-0 text-white ${state === "out" ? "bg-red-500" : state === "low" ? "bg-orange-500" : "bg-green-500"}`}>
                            {state === "out" ? "Нет" : state === "low" ? "Мало" : "В наличии"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end items-center">
                            <StockButtons productId={p.id} name={p.name} stock={p.stock} reserved={p.reserved} unit={p.unit} />
                            <Button asChild variant="ghost" size="icon" title="История">
                              <Link href={`/admin/warehouse?product=${p.id}`}><History className="h-4 w-4" /></Link>
                            </Button>
                          </div>
                        </td>
                      </tr>,
                      ...variantRows.filter((v) => v.productId === p.id).map((v) => (
                        <tr key={v.id} className="border-b bg-gray-50/50">
                          <td className="px-4 py-2 pl-10 text-gray-600">↳ {v.name}{!v.isActive && " (выкл.)"}</td>
                          <td className="px-4 py-2 text-center">{v.stock}</td>
                          <td className="px-4 py-2 text-center text-gray-400">—</td>
                          <td className="px-4 py-2 text-center">{v.stock} {p.unit}</td>
                          <td className="px-4 py-2" />
                          <td className="px-4 py-2">
                            <div className="flex justify-end pr-10">
                              <StockButtons productId={p.id} variantId={v.id} name={`${p.name} — ${v.name}`} stock={v.stock} reserved={0} unit={p.unit} />
                            </div>
                          </td>
                        </tr>
                      )),
                    ]
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2 text-base">
              <span className="flex items-center gap-2">
                <History className="h-5 w-5" />
                {historyProduct ? `История: ${historyProduct.name}` : "Последние движения"}
              </span>
              {historyProduct && (
                <Link href="/admin/warehouse" title="Все движения" className="text-gray-400 hover:text-gray-900"><X className="h-4 w-4" /></Link>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {movements.length === 0 ? (
              <p className="text-sm text-gray-500">Движений пока нет</p>
            ) : (
              <ul className="space-y-3">
                {movements.map((m) => {
                  const meta = movementLabels[m.type]
                  const qty = m.type === "ADJUSTMENT" ? (m.quantity > 0 ? `+${m.quantity}` : `${m.quantity}`) : `${meta.sign}${m.quantity}`
                  return (
                    <li key={m.id} className="p-3 bg-gray-50 rounded-lg text-sm">
                      <div className="flex justify-between gap-2">
                        <span className="font-medium line-clamp-1">{m.product.name}</span>
                        <span className={`font-semibold whitespace-nowrap ${meta.className}`}>{qty} {m.product.unit}</span>
                      </div>
                      <p className="text-xs text-gray-500">{meta.label}{m.reason ? ` · ${m.reason}` : ""}</p>
                      <p className="text-xs text-gray-400">{formatDateTime(m.createdAt)}</p>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Pagination
        path="/admin/warehouse"
        params={params}
        page={page}
        pageCount={Math.max(1, Math.ceil(total / PAGE_SIZE))}
        total={total}
        shown={rows.length}
        noun="позиций"
      />
    </div>
  )
}
