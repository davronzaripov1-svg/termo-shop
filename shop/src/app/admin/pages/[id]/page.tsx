import { notFound } from "next/navigation"
import { PageEditor } from "@/components/admin/pages/PageEditor"
import { prisma } from "@/lib/prisma"
import { DEFAULT_PAGES } from "@/lib/pages"

export const metadata = { title: "Страница" }

// /admin/pages/new[?template=about] — новая страница (из шаблона), иначе — редактирование по id
export default async function EditPagePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ template?: string }>
}) {
  const [{ id }, { template }] = await Promise.all([params, searchParams])

  if (id === "new") {
    const t = template ? DEFAULT_PAGES[template] : undefined
    return (
      <PageEditor
        initial={{ slug: t ? template! : "", title: t?.title ?? "", content: t?.content ?? "", isActive: true, metaTitle: "", metaDescription: "" }}
        special={template}
      />
    )
  }

  const page = await prisma.page.findUnique({ where: { id } })
  if (!page) notFound()
  return (
    <PageEditor
      initial={{
        id: page.id,
        slug: page.slug,
        title: page.title,
        content: page.content,
        isActive: page.isActive,
        metaTitle: page.metaTitle ?? "",
        metaDescription: page.metaDescription ?? "",
      }}
      special={page.slug}
    />
  )
}
