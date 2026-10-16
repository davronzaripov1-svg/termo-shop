import type { Metadata } from "next"
import Link from "next/link"
import { notFound, permanentRedirect } from "next/navigation"
import { after } from "next/server"
import { Badge } from "@/components/ui/badge"
import { ProductCard } from "@/components/shop/ProductCard"
import { ProductGallery } from "@/components/shop/product/ProductGallery"
import { ProductPurchase } from "@/components/shop/product/ProductPurchase"
import { FavoriteButton } from "@/components/shop/FavoriteButton"
import { getProductBySlug, getRelatedProducts } from "@/lib/catalog"
import { prisma } from "@/lib/prisma"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await prisma.product.findFirst({
    where: { OR: [{ slug }, { id: slug }] },
    select: { name: true, description: true, metaTitle: true, metaDescription: true },
  })
  if (!product) return {}
  return {
    title: product.metaTitle || product.name,
    description: product.metaDescription || product.description || undefined,
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) {
    notFound()
  }
  if (product.slug !== slug) {
    // Открыли по старой ссылке с id — переводим на адрес со slug
    permanentRedirect(`/product/${product.slug}`)
  }

  after(() =>
    prisma.product.update({ where: { id: product.id }, data: { views: { increment: 1 } } })
  )

  const related = await getRelatedProducts(product.id, product.categoryId)

  const specs = [
    { name: "Артикул", value: product.sku },
    ...product.attributes,
    product.weight ? { name: "Вес", value: `${product.weight} кг` } : null,
    product.dimensions ? { name: "Размеры", value: product.dimensions } : null,
  ].filter((s): s is { name: string; value: string } => !!s)

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary">Главная</Link>
        <span className="mx-2">/</span>
        <Link href="/catalog" className="hover:text-primary">Каталог</Link>
        <span className="mx-2">/</span>
        <Link href={`/catalog/${product.categorySlug}`} className="hover:text-primary">
          {product.categoryName}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <ProductGallery images={product.images} name={product.name} />

        <div>
          <div className="flex gap-2 mb-3">
            {product.isNew && <Badge>Новинка</Badge>}
            {product.isFeatured && <Badge className="bg-black text-white border-0">Хит</Badge>}
          </div>
          <div className="flex items-start justify-between gap-4 mb-2">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <FavoriteButton productId={product.id} className="border flex-shrink-0" />
          </div>
          <p className="text-sm text-gray-400 mb-6">Артикул: {product.sku}</p>

          <ProductPurchase product={product} />

          {product.description && (
            <section className="mt-10">
              <h2 className="text-xl font-semibold mb-3">Описание</h2>
              <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
            </section>
          )}

          <section className="mt-8">
            <h2 className="text-xl font-semibold mb-3">Характеристики</h2>
            <dl className="divide-y border rounded-xl bg-white">
              {specs.map((s) => (
                <div key={s.name} className="flex justify-between gap-4 px-4 py-3 text-sm">
                  <dt className="text-gray-500">{s.name}</dt>
                  <dd className="font-medium text-right">{s.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Похожие товары</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
