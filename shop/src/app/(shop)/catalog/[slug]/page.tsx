import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { CatalogView } from "@/components/shop/catalog/CatalogView"
import { getCatalogCategories, parseCatalogQuery } from "@/lib/catalog"
import { prisma } from "@/lib/prisma"

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = await prisma.category.findFirst({
    where: { slug, isActive: true },
    select: { name: true, description: true, metaTitle: true, metaDescription: true },
  })
  if (!category) return {}
  return {
    title: category.metaTitle || category.name,
    description: category.metaDescription || category.description || undefined,
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ slug }, search] = await Promise.all([params, searchParams])
  const categories = await getCatalogCategories()

  if (!categories.some((c) => c.slug === slug)) {
    notFound()
  }

  return (
    <CatalogView
      query={{ ...parseCatalogQuery(search), categorySlug: slug }}
      categories={categories}
      view={search.view === "list" ? "list" : "grid"}
    />
  )
}
