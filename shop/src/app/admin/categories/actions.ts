"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { adminAction, logActivity, zodFieldErrors, type ActionResult } from "@/lib/admin"
import { slugify } from "@/lib/utils"

const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "Укажите название").max(100),
  slug: z.string().trim().max(100).optional(),
  parentId: z.string().optional(),
  description: z.string().trim().max(2000).optional(),
  image: z.string().trim().max(500).optional(),
  sortOrder: z.coerce.number().int("Целое число").min(0).max(10000),
  isActive: z.boolean(),
  metaTitle: z.string().trim().max(200).optional(),
  metaDescription: z.string().trim().max(500).optional(),
})

export type CategoryInput = z.input<typeof categorySchema>

function refresh() {
  revalidatePath("/admin/categories")
  revalidatePath("/", "layout")
}

export async function saveCategory(input: CategoryInput): Promise<ActionResult> {
  return adminAction("categories", async (staff) => {
    const parsed = categorySchema.safeParse(input)
    if (!parsed.success) {
      return { ok: false, error: "Проверьте поля формы", fieldErrors: zodFieldErrors(parsed.error.issues) }
    }
    const { id, slug: slugInput, parentId, ...d } = parsed.data

    const slug = slugify(slugInput || d.name)
    if (!slug) return { ok: false, error: "Проверьте поля формы", fieldErrors: { slug: "Укажите адрес латиницей" } }
    const taken = await prisma.category.findFirst({ where: { slug, id: id ? { not: id } : undefined }, select: { id: true } })
    if (taken) return { ok: false, error: "Проверьте поля формы", fieldErrors: { slug: "Такой адрес уже занят" } }

    // Нельзя сделать категорию дочерней самой себе или своему потомку
    if (id && parentId) {
      let current: string | null = parentId
      while (current) {
        if (current === id) {
          return { ok: false, error: "Проверьте поля формы", fieldErrors: { parentId: "Нельзя вложить категорию в саму себя" } }
        }
        const parent: { parentId: string | null } | null = await prisma.category.findUnique({ where: { id: current }, select: { parentId: true } })
        current = parent?.parentId ?? null
      }
    }

    const data = {
      ...d,
      slug,
      parentId: parentId || null,
      description: d.description || null,
      image: d.image || null,
      metaTitle: d.metaTitle || null,
      metaDescription: d.metaDescription || null,
    }
    const saved = id
      ? await prisma.category.update({ where: { id }, data })
      : await prisma.category.create({ data })
    await logActivity(staff.id, id ? "category.update" : "category.create", "Category", saved.id, { newData: { name: d.name, slug } })
    refresh()
    return { ok: true }
  })
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  return adminAction("categories", async (staff) => {
    const [products, children] = await Promise.all([
      prisma.product.count({ where: { categoryId: id } }),
      prisma.category.count({ where: { parentId: id } }),
    ])
    if (products > 0) return { ok: false, error: `В категории ${products} товар(ов). Перенесите их в другую категорию или скройте категорию.` }
    if (children > 0) return { ok: false, error: "Сначала удалите или перенесите подкатегории" }

    const c = await prisma.category.delete({ where: { id } })
    await logActivity(staff.id, "category.delete", "Category", id, { oldData: { name: c.name, slug: c.slug } })
    refresh()
    return { ok: true }
  })
}
