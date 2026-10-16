import Link from "next/link"
import { Prisma, ProductStatus } from "@prisma/client"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EmptyRow, Pagination } from "@/components/admin/ui"
import { ProductRowActions } from "@/components/admin/products/ProductRowActions"
import { ProductImage } from "@/components/shop/ProductImage"
import { prisma } from "@/lib/prisma"
import { PRODUCT_STATUS_LABELS } from "@/lib/labels"
import { formatSum } from "@/lib/utils"

export const metadata = { title: "Товары" }

const PAGE_SIZE = 30

const statusColors: Record<ProductStatus, string> = {
  ACTIVE: "bg-green-500",
  OUT_OF_STOCK: "bg-yellow-500",
  ON_ORDER: "bg-blue-500",
  DISCONTINUED: "bg-gray-500",
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const sp = await searchParams
  const q = sp.q?.trim()
  const page = Math.max(1, Number(sp.page) || 1)

  const and: Prisma.ProductWhereInput[] = []
  if (q) {
    and.push({ OR: [{ name: { contains: q, mode: "insensitive" } }, { sku: { contains: q, mode: "insensitive" } }] })
  }
  if (sp.category) and.push({ categoryId: sp.category })
  if (sp.status && sp.status in statusColors) and.push({ status: sp.status as ProductStatus })
  if (sp.visibility === "hidden") and.push({ isActive: false })
  if (sp.visibility === "visible") and.push({ isActive: true })
  if (sp.stock === "out") and.push({ stock: 0 })
  const where: Prisma.ProductWhereInput = { AND: and }

  const [products, total, categories, lowStock] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        category: { select: { name: true } },
        images: { orderBy: [{ isMain: "desc" }, { sortOrder: "asc" }], take: 1, select: { url: true } },
        _count: { select: { variants: true } },
      },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }], select: { id: true, name: true } }),
    // мало на складе: свободный остаток <= порога (сравнение двух колонок — только SQL)
    prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) AS count FROM "Product"
      WHERE "isActive" AND "stock" - "reserved" <= "lowStockThreshold"`,
  ])

  const params = { q, category: sp.category, status: sp.status, visibility: sp.visibility, stock: sp.stock }
  const hasFilters = Object.values(params).some(Boolean)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Товары</h1>
          <p className="text-sm text-gray-500">
            Всего: {total}
            {Number(lowStock[0]?.count ?? 0) > 0 && (
              <> · <Link href="/admin/warehouse?filter=low" className="text-orange-600 hover:underline">мало на складе: {Number(lowStock[0].count)}</Link></>
            )}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4 mr-2" />
            Добавить товар
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <form className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input name="q" placeholder="Поиск по названию или артикулу..." className="pl-10" defaultValue={q} />
            </div>
            <select name="category" className="border rounded-lg px-3 py-2 bg-white" defaultValue={sp.category ?? ""}>
              <option value="">Все категории</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select name="status" className="border rounded-lg px-3 py-2 bg-white" defaultValue={sp.status ?? ""}>
              <option value="">Все статусы</option>
              {Object.entries(PRODUCT_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <select name="visibility" className="border rounded-lg px-3 py-2 bg-white" defaultValue={sp.visibility ?? ""}>
              <option value="">Показ: все</option>
              <option value="visible">На сайте</option>
              <option value="hidden">Скрытые</option>
            </select>
            <div className="flex gap-2">
              <Button type="submit">Найти</Button>
              {hasFilters && <Button asChild variant="ghost"><Link href="/admin/products">Сбросить</Link></Button>}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b bg-gray-50">
                  <th className="p-4">Товар</th>
                  <th className="p-4">Артикул</th>
                  <th className="p-4">Категория</th>
                  <th className="p-4">Цена</th>
                  <th className="p-4">Остаток</th>
                  <th className="p-4">Статус</th>
                  <th className="p-4 text-right">Действия</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 && (
                  <EmptyRow colSpan={7}>
                    {hasFilters ? "Ничего не найдено" : <>Товаров пока нет. <Link href="/admin/products/new" className="text-primary hover:underline">Добавить первый</Link></>}
                  </EmptyRow>
                )}
                {products.map((p) => {
                  const free = p.stock - p.reserved
                  return (
                    <tr key={p.id} className={`border-b last:border-0 hover:bg-gray-50 ${p.isActive ? "" : "opacity-60"}`}>
                      <td className="p-4">
                        <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 group">
                          <ProductImage src={p.images[0]?.url} alt={p.name} className="w-12 h-12 rounded-lg flex-shrink-0" />
                          <div>
                            <p className="font-medium group-hover:text-primary">{p.name}</p>
                            <p className="text-xs text-gray-400">
                              {!p.isActive && "Скрыт · "}
                              {p._count.variants > 0 && `${p._count.variants} вар. · `}
                              {p.isFeatured && "Хит "}
                              {p.isNew && "Новинка"}
                            </p>
                          </div>
                        </Link>
                      </td>
                      <td className="p-4 text-gray-500">{p.sku}</td>
                      <td className="p-4">{p.category.name}</td>
                      <td className="p-4 font-medium whitespace-nowrap">
                        {formatSum(Number(p.price))}
                        {p.oldPrice && <span className="block text-xs text-gray-400 line-through">{formatSum(Number(p.oldPrice))}</span>}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className={free <= 0 ? "text-red-500 font-medium" : free <= p.lowStockThreshold ? "text-orange-500 font-medium" : ""}>
                          {p.stock} {p.unit}
                        </span>
                        {p.reserved > 0 && <span className="block text-xs text-gray-400">резерв {p.reserved}</span>}
                      </td>
                      <td className="p-4">
                        <Badge className={`${statusColors[p.status]} text-white border-0 whitespace-nowrap`}>
                          {PRODUCT_STATUS_LABELS[p.status]}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <ProductRowActions id={p.id} slug={p.slug} name={p.name} isActive={p.isActive} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Pagination
        path="/admin/products"
        params={params}
        page={page}
        pageCount={Math.max(1, Math.ceil(total / PAGE_SIZE))}
        total={total}
        shown={products.length}
        noun="товаров"
      />
    </div>
  )
}
