import { notFound } from "next/navigation"
import { ProductForm } from "@/components/admin/products/ProductForm"
import { getCategoryOptions } from "@/lib/admin"
import { prisma } from "@/lib/prisma"

export const metadata = { title: "Товар" }

const str = (v: { toString(): string } | null | undefined) => (v === null || v === undefined ? "" : v.toString())

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: [{ isMain: "desc" }, { sortOrder: "asc" }] },
        attributes: { orderBy: { sortOrder: "asc" } },
        variants: { orderBy: { createdAt: "asc" } },
      },
    }),
    getCategoryOptions(),
  ])
  if (!product) notFound()

  return (
    <ProductForm
      categories={categories}
      initial={{
        id: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        categoryId: product.categoryId,
        description: product.description ?? "",
        price: str(product.price),
        oldPrice: str(product.oldPrice),
        costPrice: str(product.costPrice),
        unit: product.unit,
        minQuantity: str(product.minQuantity),
        stock: str(product.stock),
        reserved: product.reserved,
        lowStockThreshold: str(product.lowStockThreshold),
        status: product.status,
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        isNew: product.isNew,
        weight: str(product.weight),
        dimensions: product.dimensions ?? "",
        metaTitle: product.metaTitle ?? "",
        metaDescription: product.metaDescription ?? "",
        images: product.images.map((i) => ({ url: i.url, alt: i.alt ?? "" })),
        attributes: product.attributes.map((a) => ({ name: a.name, value: a.value })),
        variants: product.variants.map((x) => ({
          id: x.id,
          name: x.name,
          sku: x.sku ?? "",
          price: str(x.price),
          stock: str(x.stock),
          isActive: x.isActive,
        })),
      }}
    />
  )
}
