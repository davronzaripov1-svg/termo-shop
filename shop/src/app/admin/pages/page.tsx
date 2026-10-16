import Link from "next/link"
import { Edit, ExternalLink, FileText, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { prisma } from "@/lib/prisma"
import { DEFAULT_PAGES } from "@/lib/pages"
import { formatDate } from "@/lib/utils"

export const metadata = { title: "Страницы" }

export default async function PagesPage() {
  const pages = await prisma.page.findMany({ orderBy: { title: "asc" } })
  // Шаблонные страницы, которые ещё не сохраняли — тоже показываем, их можно отредактировать
  const defaults = Object.entries(DEFAULT_PAGES).filter(([slug]) => !pages.some((p) => p.slug === slug))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Страницы</h1>
          <p className="text-sm text-gray-500">О компании, доставка, контакты, условия и другие тексты сайта</p>
        </div>
        <Button asChild>
          <Link href="/admin/pages/new"><Plus className="h-4 w-4 mr-2" />Новая страница</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <ul className="divide-y">
            {pages.map((p) => (
              <Row key={p.id} title={p.title} slug={p.slug} editHref={`/admin/pages/${p.id}`}>
                {!p.isActive && <Badge className="bg-gray-500 text-white border-0">Скрыта</Badge>}
                <span className="text-xs text-gray-400">изменена {formatDate(p.updatedAt)}</span>
              </Row>
            ))}
            {defaults.map(([slug, d]) => (
              <Row key={slug} title={d.title} slug={slug} editHref={`/admin/pages/new?template=${slug}`}>
                <Badge className="bg-amber-500 text-white border-0">Шаблон</Badge>
                <span className="text-xs text-gray-400">проверьте и сохраните текст</span>
              </Row>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

function Row({ title, slug, editHref, children }: { title: string; slug: string; editHref: string; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
      <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <Link href={editHref} className="font-medium hover:text-primary">{title}</Link>
        <p className="text-xs text-gray-400">/{slug}</p>
      </div>
      <div className="hidden sm:flex items-center gap-2">{children}</div>
      <Button asChild variant="ghost" size="icon" title="Открыть на сайте">
        <Link href={`/${slug}`} target="_blank"><ExternalLink className="h-4 w-4" /></Link>
      </Button>
      <Button asChild variant="ghost" size="icon" title="Редактировать">
        <Link href={editHref}><Edit className="h-4 w-4" /></Link>
      </Button>
    </li>
  )
}
