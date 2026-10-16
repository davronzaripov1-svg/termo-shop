import { Prisma, ProductStatus } from "@prisma/client"
import { prisma } from "./prisma"

export const PAGE_SIZE = 24

/** Сколько можно заказать при статусе «Под заказ», когда склад пуст. */
const ON_ORDER_LIMIT = 999

/** Товар, который видят покупатели: активный, не снят с продажи, категория включена. */
export const visibleProductWhere = {
  isActive: true,
  status: { not: ProductStatus.DISCONTINUED },
  category: { isActive: true },
} satisfies Prisma.ProductWhereInput

const cardInclude = {
  category: { select: { name: true, slug: true } },
  images: {
    orderBy: [{ isMain: "desc" }, { sortOrder: "asc" }],
    take: 1,
    select: { url: true, alt: true },
  },
} satisfies Prisma.ProductInclude

type ProductWithCard = Prisma.ProductGetPayload<{ include: typeof cardInclude }>

/** Данные карточки товара — только простые типы, можно отдавать в клиентские компоненты. */
export type ProductCardData = {
  id: string
  slug: string
  name: string
  sku: string
  price: number
  oldPrice: number | null
  image: string | null
  categoryName: string
  isNew: boolean
  isFeatured: boolean
  unit: string
  minQuantity: number
  maxQuantity: number
  availability: Availability
}

export type Availability = "in_stock" | "on_order" | "out_of_stock"

export function getAvailability(p: { stock: number; reserved: number; status: ProductStatus }): {
  availability: Availability
  maxQuantity: number
} {
  const free = Math.max(0, p.stock - p.reserved)
  if (p.status === ProductStatus.OUT_OF_STOCK || p.status === ProductStatus.DISCONTINUED) {
    return { availability: "out_of_stock", maxQuantity: 0 }
  }
  if (free > 0) {
    return { availability: "in_stock", maxQuantity: free }
  }
  if (p.status === ProductStatus.ON_ORDER) {
    return { availability: "on_order", maxQuantity: ON_ORDER_LIMIT }
  }
  return { availability: "out_of_stock", maxQuantity: 0 }
}

export function toCardData(p: ProductWithCard): ProductCardData {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    sku: p.sku,
    price: Number(p.price),
    oldPrice: p.oldPrice && Number(p.oldPrice) > Number(p.price) ? Number(p.oldPrice) : null,
    image: p.images[0]?.url ?? null,
    categoryName: p.category.name,
    isNew: p.isNew,
    isFeatured: p.isFeatured,
    unit: p.unit,
    minQuantity: Math.max(1, p.minQuantity),
    ...getAvailability(p),
  }
}

export type CatalogSort = "default" | "price-asc" | "price-desc" | "name" | "popular"
export type CatalogFilter = "new" | "sale"

export type CatalogQuery = {
  categorySlug?: string
  q?: string
  minPrice?: number
  maxPrice?: number
  filter?: CatalogFilter
  sort: CatalogSort
  page: number
}

const sortOrder: Record<CatalogSort, Prisma.ProductOrderByWithRelationInput[]> = {
  default: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  "price-asc": [{ price: "asc" }],
  "price-desc": [{ price: "desc" }],
  name: [{ name: "asc" }],
  popular: [{ views: "desc" }],
}

/** Разбирает ?category=&q=&min=&max=&filter=&sort=&page= из адресной строки. */
export function parseCatalogQuery(params: Record<string, string | string[] | undefined>): CatalogQuery {
  const get = (key: string) => {
    const v = params[key]
    return (Array.isArray(v) ? v[0] : v)?.trim() || undefined
  }
  const num = (key: string) => {
    const n = Number(get(key))
    return Number.isFinite(n) && n >= 0 ? n : undefined
  }
  const sort = get("sort")
  const filter = get("filter")

  return {
    categorySlug: get("category"),
    q: get("q"),
    minPrice: num("min"),
    maxPrice: num("max"),
    filter: filter === "new" || filter === "sale" ? filter : undefined,
    sort: sort && sort in sortOrder ? (sort as CatalogSort) : "default",
    page: Math.max(1, Math.floor(num("page") ?? 1)),
  }
}

export async function getCatalogCategories() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      parentId: true,
      _count: { select: { products: { where: visibleProductWhere } } },
    },
  })
  return categories.map(({ _count, ...c }) => ({ ...c, productCount: _count.products }))
}

export type CatalogCategory = Awaited<ReturnType<typeof getCatalogCategories>>[number]

export async function getCatalogProducts(query: CatalogQuery, categories: CatalogCategory[]) {
  const where: Prisma.ProductWhereInput[] = [visibleProductWhere]

  if (query.categorySlug) {
    const category = categories.find((c) => c.slug === query.categorySlug)
    // Товары категории и всех её подкатегорий
    const ids = category ? collectCategoryIds(category.id, categories) : []
    where.push({ categoryId: { in: ids } })
  }
  if (query.q) {
    where.push({
      OR: [
        { name: { contains: query.q, mode: "insensitive" } },
        { sku: { contains: query.q, mode: "insensitive" } },
        { description: { contains: query.q, mode: "insensitive" } },
      ],
    })
  }
  if (query.minPrice !== undefined) where.push({ price: { gte: query.minPrice } })
  if (query.maxPrice !== undefined) where.push({ price: { lte: query.maxPrice } })
  if (query.filter === "new") where.push({ isNew: true })
  if (query.filter === "sale") where.push({ oldPrice: { not: null } })

  const [total, products] = await prisma.$transaction([
    prisma.product.count({ where: { AND: where } }),
    prisma.product.findMany({
      where: { AND: where },
      orderBy: sortOrder[query.sort],
      include: cardInclude,
      skip: (query.page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ])

  return {
    total,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    products: products.map(toCardData),
  }
}

function collectCategoryIds(rootId: string, categories: CatalogCategory[]): string[] {
  const ids = [rootId]
  for (let i = 0; i < ids.length; i++) {
    for (const c of categories) {
      if (c.parentId === ids[i]) ids.push(c.id)
    }
  }
  return ids
}

/** Хиты (isFeatured), а если их меньше нужного — добираем популярными. */
export async function getFeaturedProducts(count: number): Promise<ProductCardData[]> {
  const featured = await prisma.product.findMany({
    where: { ...visibleProductWhere, isFeatured: true },
    orderBy: [{ sortOrder: "asc" }, { views: "desc" }],
    include: cardInclude,
    take: count,
  })
  const rest = featured.length < count
    ? await prisma.product.findMany({
        where: { ...visibleProductWhere, id: { notIn: featured.map((p) => p.id) } },
        orderBy: [{ views: "desc" }, { createdAt: "desc" }],
        include: cardInclude,
        take: count - featured.length,
      })
    : []
  return [...featured, ...rest].map(toCardData)
}

export async function getProductBySlug(slugOrId: string) {
  const product = await prisma.product.findFirst({
    // Старые ссылки вида /product/<id> тоже открываются
    where: { ...visibleProductWhere, OR: [{ slug: slugOrId }, { id: slugOrId }] },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      images: { orderBy: [{ isMain: "desc" }, { sortOrder: "asc" }], select: { id: true, url: true, alt: true } },
      attributes: { orderBy: { sortOrder: "asc" }, select: { id: true, name: true, value: true } },
      variants: { where: { isActive: true }, orderBy: { createdAt: "asc" } },
    },
  })
  if (!product) return null

  return {
    ...toCardData({ ...product, images: product.images.slice(0, 1) }),
    description: product.description,
    categoryId: product.category.id,
    categorySlug: product.category.slug,
    weight: product.weight ? Number(product.weight) : null,
    dimensions: product.dimensions,
    images: product.images,
    attributes: product.attributes,
    variants: product.variants.map((v) => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      price: v.price ? Number(v.price) : null,
      // У варианта свой остаток; статус «под заказ»/«нет в наличии» берём у товара
      ...getAvailability({ stock: v.stock, reserved: 0, status: product.status }),
    })),
  }
}

export type ProductDetails = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>

export async function getRelatedProducts(productId: string, categoryId: string, count = 4) {
  const products = await prisma.product.findMany({
    where: { ...visibleProductWhere, categoryId, id: { not: productId } },
    orderBy: [{ views: "desc" }],
    include: cardInclude,
    take: count,
  })
  return products.map(toCardData)
}


/** Товары по списку id в заданном порядке (ручной выбор на главной); скрытые пропускаются */
export async function getProductsByIds(ids: string[]): Promise<ProductCardData[]> {
  if (ids.length === 0) return []
  const products = await prisma.product.findMany({
    where: { ...visibleProductWhere, id: { in: ids } },
    include: cardInclude,
  })
  return ids.flatMap((id) => {
    const p = products.find((x) => x.id === id)
    return p ? [toCardData(p)] : []
  })
}
