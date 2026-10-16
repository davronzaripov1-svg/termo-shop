import type { Metadata } from "next"
import { CatalogView } from "@/components/shop/catalog/CatalogView"
import { getCatalogCategories, parseCatalogQuery } from "@/lib/catalog"

export const metadata: Metadata = { title: "Каталог" }

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const query = parseCatalogQuery(params)
  const categories = await getCatalogCategories()

  return (
    <CatalogView
      query={query}
      categories={categories}
      view={params.view === "list" ? "list" : "grid"}
    />
  )
}
