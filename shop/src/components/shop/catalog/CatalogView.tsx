import { Suspense } from "react"
import Link from "next/link"
import { Grid, List, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProductCard } from "@/components/shop/ProductCard"
import { SortSelect } from "@/components/shop/catalog/SortSelect"
import { cn } from "@/lib/utils"
import {
  getCatalogProducts,
  type CatalogCategory,
  type CatalogQuery,
} from "@/lib/catalog"

type Params = Record<string, string | undefined>

/** Собирает ссылку каталога, сохраняя текущие фильтры. Пустые значения выкидываем. */
function catalogHref(path: string, current: Params, overrides: Params = {}) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries({ ...current, ...overrides })) {
    if (value) params.set(key, value)
  }
  const qs = params.toString()
  return qs ? `${path}?${qs}` : path
}

const filterTitles = { new: "Новинки", sale: "Скидки" }

export async function CatalogView({
  query,
  categories,
  view,
}: {
  query: CatalogQuery
  categories: CatalogCategory[]
  view: "grid" | "list"
}) {
  const { products, total, pageCount } = await getCatalogProducts(query, categories)

  const category = categories.find((c) => c.slug === query.categorySlug)
  const path = category ? `/catalog/${category.slug}` : "/catalog"
  const current: Params = {
    q: query.q,
    min: query.minPrice?.toString(),
    max: query.maxPrice?.toString(),
    filter: query.filter,
    sort: query.sort === "default" ? undefined : query.sort,
    view: view === "list" ? "list" : undefined,
  }
  // Ссылки на категории: фильтры сохраняем, страницу сбрасываем
  const categoryHref = (slug?: string) => catalogHref(slug ? `/catalog/${slug}` : "/catalog", current)

  const topLevel = categories.filter((c) => !c.parentId)
  const childrenOf = (id: string) => categories.filter((c) => c.parentId === id)

  const title = query.q
    ? `Поиск: «${query.q}»`
    : category?.name ?? (query.filter ? filterTitles[query.filter] : "Каталог товаров")

  const activeFilters = [
    query.q && { label: `«${query.q}»`, href: catalogHref(path, current, { q: undefined }) },
    query.filter && { label: filterTitles[query.filter], href: catalogHref(path, current, { filter: undefined }) },
    (query.minPrice !== undefined || query.maxPrice !== undefined) && {
      label: `Цена ${query.minPrice ?? 0} – ${query.maxPrice ?? "∞"}`,
      href: catalogHref(path, current, { min: undefined, max: undefined }),
    },
  ].filter((f): f is { label: string; href: string } => !!f)

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-primary">Главная</Link>
        <span className="mx-2">/</span>
        {category ? (
          <>
            <Link href="/catalog" className="hover:text-primary">Каталог</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{category.name}</span>
          </>
        ) : (
          <span className="text-gray-900">Каталог</span>
        )}
      </nav>

      <h1 className="text-3xl font-bold mb-2">{title}</h1>
      {category?.description && <p className="text-gray-600 mb-6">{category.description}</p>}

      <div className="flex flex-col lg:flex-row gap-8 mt-6">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="lg:sticky lg:top-24">
            <h2 className="font-semibold mb-4">Категории</h2>
            <ul className="space-y-1">
              <li>
                <Link
                  href={categoryHref()}
                  className={cn(
                    "block px-3 py-2 rounded-lg transition-colors",
                    !category ? "bg-primary text-white" : "hover:bg-gray-100"
                  )}
                >
                  Все категории
                </Link>
              </li>
              {topLevel.map((cat) => (
                <li key={cat.id}>
                  <CategoryLink cat={cat} href={categoryHref(cat.slug)} active={cat.id === category?.id} />
                  {childrenOf(cat.id).length > 0 && (
                    <ul className="ml-4 mt-1 space-y-1">
                      {childrenOf(cat.id).map((child) => (
                        <li key={child.id}>
                          <CategoryLink cat={child} href={categoryHref(child.slug)} active={child.id === category?.id} />
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>

            <hr className="my-6" />

            <h2 className="font-semibold mb-4">Цена, сум</h2>
            <form action={path} className="space-y-3">
              {/* Остальные фильтры при отправке формы сохраняем */}
              {Object.entries(current)
                .filter(([key, value]) => value && key !== "min" && key !== "max")
                .map(([key, value]) => (
                  <input key={key} type="hidden" name={key} value={value} />
                ))}
              <div className="flex gap-2">
                <Input name="min" placeholder="От" type="number" min={0} defaultValue={query.minPrice} />
                <Input name="max" placeholder="До" type="number" min={0} defaultValue={query.maxPrice} />
              </div>
              <Button type="submit" className="w-full" variant="outline">
                Применить
              </Button>
            </form>

            <hr className="my-6" />

            <div className="flex flex-col gap-1">
              <Link
                href={catalogHref(path, current, { filter: query.filter === "new" ? undefined : "new" })}
                className={cn("px-3 py-2 rounded-lg", query.filter === "new" ? "bg-primary text-white" : "hover:bg-gray-100")}
              >
                Новинки
              </Link>
              <Link
                href={catalogHref(path, current, { filter: query.filter === "sale" ? undefined : "sale" })}
                className={cn("px-3 py-2 rounded-lg", query.filter === "sale" ? "bg-primary text-white" : "hover:bg-gray-100")}
              >
                Со скидкой
              </Link>
            </div>
          </div>
        </aside>

        {/* Products */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <p className="text-gray-600">
              Найдено: <span className="font-semibold">{total}</span> {pluralGoods(total)}
            </p>
            <div className="flex items-center gap-4">
              <Suspense>
                <SortSelect value={query.sort} />
              </Suspense>
              <div className="flex border rounded-lg">
                <Button asChild variant={view === "grid" ? "default" : "ghost"} size="icon">
                  <Link href={catalogHref(path, current, { view: undefined })} aria-label="Плиткой">
                    <Grid className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant={view === "list" ? "default" : "ghost"} size="icon">
                  <Link href={catalogHref(path, current, { view: "list" })} aria-label="Списком">
                    <List className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {activeFilters.map((f) => (
                <Link
                  key={f.label}
                  href={f.href}
                  className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200"
                >
                  {f.label}
                  <X className="h-3 w-3" />
                </Link>
              ))}
            </div>
          )}

          {products.length === 0 ? (
            <div className="text-center py-20 border rounded-xl bg-white">
              <p className="text-lg font-medium mb-2">Ничего не найдено</p>
              <p className="text-gray-500 mb-6">Попробуйте изменить фильтры или поисковый запрос</p>
              <Button asChild variant="outline">
                <Link href="/catalog">Сбросить фильтры</Link>
              </Button>
            </div>
          ) : (
            <div
              className={
                view === "grid"
                  ? "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"
                  : "flex flex-col gap-4"
              }
            >
              {products.map((product) => (
                <ProductCard key={product.id} product={product} layout={view} />
              ))}
            </div>
          )}

          {pageCount > 1 && (
            <nav className="flex justify-center gap-2 mt-10" aria-label="Страницы">
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
                <Link
                  key={page}
                  href={catalogHref(path, current, { page: page === 1 ? undefined : String(page) })}
                  className={cn(
                    "min-w-10 h-10 px-3 flex items-center justify-center rounded-lg border",
                    page === query.page ? "bg-primary text-white border-primary" : "bg-white hover:bg-gray-100"
                  )}
                >
                  {page}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>
    </div>
  )
}

function CategoryLink({ cat, href, active }: { cat: CatalogCategory; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center justify-between px-3 py-2 rounded-lg transition-colors",
        active ? "bg-primary text-white" : "hover:bg-gray-100"
      )}
    >
      <span>{cat.name}</span>
      <span className={cn("text-xs", active ? "text-white/80" : "text-gray-400")}>{cat.productCount}</span>
    </Link>
  )
}

function pluralGoods(n: number) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return "товар"
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "товара"
  return "товаров"
}
