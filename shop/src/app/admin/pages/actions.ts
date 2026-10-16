"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { adminAction, logActivity, zodFieldErrors, type ActionResult } from "@/lib/admin"
import { renderContent } from "@/lib/content"
import { slugify } from "@/lib/utils"

// Адреса, занятые разделами сайта — страница с таким slug была бы недоступна
const RESERVED = new Set(["admin", "api", "catalog", "product", "cart", "checkout", "account", "login", "register", "favorites", "forgot-password", "new", "sale", "popular"])

const pageSchema = z.object({
  id: z.string().optional(),
  slug: z.string().trim().max(100),
  title: z.string().trim().min(2, "Укажите заголовок").max(200),
  content: z.string().max(100_000),
  isActive: z.boolean(),
  metaTitle: z.string().trim().max(200).optional(),
  metaDescription: z.string().trim().max(500).optional(),
})

export type PageInput = z.input<typeof pageSchema>

export async function savePage(input: PageInput): Promise<ActionResult<{ id: string }>> {
  return adminAction("content", async (staff) => {
    const parsed = pageSchema.safeParse(input)
    if (!parsed.success) return { ok: false, error: "Проверьте поля", fieldErrors: zodFieldErrors(parsed.error.issues) }
    const { id, ...d } = parsed.data

    const slug = slugify(d.slug || d.title)
    if (!slug) return { ok: false, error: "Проверьте поля", fieldErrors: { slug: "Укажите адрес латиницей" } }
    if (RESERVED.has(slug)) return { ok: false, error: "Проверьте поля", fieldErrors: { slug: "Этот адрес занят разделом сайта" } }
    const taken = await prisma.page.findFirst({ where: { slug, id: id ? { not: id } : undefined }, select: { id: true } })
    if (taken) return { ok: false, error: "Проверьте поля", fieldErrors: { slug: "Страница с таким адресом уже есть" } }

    const data = { ...d, slug, metaTitle: d.metaTitle || null, metaDescription: d.metaDescription || null }
    const before = id ? await prisma.page.findUnique({ where: { id }, select: { slug: true } }) : null
    const page = id ? await prisma.page.update({ where: { id }, data }) : await prisma.page.create({ data })

    await logActivity(staff.id, id ? "page.update" : "page.create", "Page", page.id, { newData: { slug, title: d.title } })
    revalidatePath("/admin/pages")
    revalidatePath(`/${slug}`)
    if (before && before.slug !== slug) revalidatePath(`/${before.slug}`)
    return { ok: true, data: { id: page.id } }
  })
}

export async function deletePage(id: string): Promise<ActionResult> {
  return adminAction("content", async (staff) => {
    const page = await prisma.page.delete({ where: { id } })
    await logActivity(staff.id, "page.delete", "Page", id, { oldData: { slug: page.slug, title: page.title } })
    revalidatePath("/admin/pages")
    revalidatePath(`/${page.slug}`)
    return { ok: true }
  })
}

/** Предпросмотр в редакторе — тот же код, что и на сайте */
export async function previewContent(content: string): Promise<string> {
  const result = await adminAction("content", async () => ({ ok: true, data: renderContent(content) }))
  return result.ok ? result.data ?? "" : ""
}
