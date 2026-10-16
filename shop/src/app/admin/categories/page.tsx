import { CategoriesManager } from "@/components/admin/categories/CategoriesManager"
import { prisma } from "@/lib/prisma"

export const metadata = { title: "Категории" }

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  })

  // Дерево: родитель, затем дети
  const ordered: (typeof categories[number] & { depth: number })[] = []
  const walk = (parentId: string | null, depth: number) => {
    for (const c of categories.filter((x) => x.parentId === parentId)) {
      ordered.push({ ...c, depth })
      walk(c.id, depth + 1)
    }
  }
  walk(null, 0)

  return (
    <CategoriesManager
      categories={ordered.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        parentId: c.parentId ?? "",
        description: c.description ?? "",
        image: c.image ?? "",
        sortOrder: String(c.sortOrder),
        isActive: c.isActive,
        metaTitle: c.metaTitle ?? "",
        metaDescription: c.metaDescription ?? "",
        depth: c.depth,
        productCount: c._count.products,
      }))}
    />
  )
}
