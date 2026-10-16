import Link from "next/link"
import { Prisma } from "@prisma/client"
import { Eye, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EmptyRow, Pagination } from "@/components/admin/ui"
import { prisma } from "@/lib/prisma"
import { formatDate, formatSum } from "@/lib/utils"
import { CUSTOMER_ROLE } from "@/lib/roles"
import { dayStart } from "@/lib/stats"

export const metadata = { title: "Клиенты" }

const PAGE_SIZE = 30

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const sp = await searchParams
  const q = sp.q?.trim()
  const page = Math.max(1, Number(sp.page) || 1)

  const and: Prisma.UserWhereInput[] = [{ role: { name: CUSTOMER_ROLE } }]
  if (q) {
    const digits = q.replace(/\D/g, "")
    and.push({
      OR: [
        { firstName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { company: { contains: q, mode: "insensitive" } },
        ...(digits.length >= 3 ? [{ phone: { contains: digits } }] : []),
      ],
    })
  }
  if (sp.group) and.push({ customerGroupId: sp.group === "none" ? null : sp.group })
  if (sp.blocked === "1") and.push({ isActive: false })
  const where: Prisma.UserWhereInput = { AND: and }

  const [customers, total, groups, monthNew] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true, firstName: true, lastName: true, email: true, phone: true, telegram: true, company: true,
        isActive: true, createdAt: true, customerGroup: { select: { displayName: true } },
      },
    }),
    prisma.user.count({ where }),
    prisma.customerGroup.findMany({ orderBy: { name: "asc" }, select: { id: true, displayName: true } }),
    prisma.user.count({ where: { role: { name: CUSTOMER_ROLE }, createdAt: { gte: dayStart(-30) } } }),
  ])

  // Покупки считаем по неотменённым заказам
  const stats = await prisma.order.groupBy({
    by: ["userId"],
    where: { userId: { in: customers.map((c) => c.id) }, status: { not: "CANCELLED" } },
    _count: { _all: true },
    _sum: { total: true },
    _max: { createdAt: true },
  })
  const statOf = (id: string) => stats.find((s) => s.userId === id)

  const params = { q, group: sp.group, blocked: sp.blocked }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Клиенты</h1>
        <p className="text-sm text-gray-500">Найдено: {total} · новых за 30 дней: {monthNew}</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <form className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input name="q" placeholder="Имя, email, телефон или компания..." className="pl-10" defaultValue={q} />
            </div>
            <select name="group" className="border rounded-lg px-3 py-2 bg-white" defaultValue={sp.group ?? ""}>
              <option value="">Все группы</option>
              <option value="none">Без группы</option>
              {groups.map((g) => <option key={g.id} value={g.id}>{g.displayName}</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="blocked" value="1" defaultChecked={sp.blocked === "1"} />
              Только заблокированные
            </label>
            <div className="flex gap-2">
              <Button type="submit">Найти</Button>
              {Object.values(params).some(Boolean) && <Button asChild variant="ghost"><Link href="/admin/customers">Сбросить</Link></Button>}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b bg-gray-50">
                  <th className="p-4">Клиент</th>
                  <th className="p-4">Контакты</th>
                  <th className="p-4">Группа</th>
                  <th className="p-4">Заказов</th>
                  <th className="p-4">Сумма покупок</th>
                  <th className="p-4">Последний заказ</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 && <EmptyRow colSpan={7}>Клиентов не найдено</EmptyRow>}
                {customers.map((c) => {
                  const s = statOf(c.id)
                  const name = [c.firstName, c.lastName].filter(Boolean).join(" ") || "Без имени"
                  return (
                    <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="p-4">
                        <Link href={`/admin/customers/${c.id}`} className="font-medium hover:text-primary">{name}</Link>
                        {c.company && <p className="text-sm text-gray-500">{c.company}</p>}
                        <p className="text-xs text-gray-400">с {formatDate(c.createdAt)}</p>
                        {!c.isActive && <Badge className="bg-red-500 text-white border-0 mt-1">Заблокирован</Badge>}
                      </td>
                      <td className="p-4 text-sm">
                        <p>{c.phone ?? "—"}</p>
                        <p className="text-gray-500">{c.email}</p>
                        {c.telegram && <p className="text-gray-500">{c.telegram}</p>}
                      </td>
                      <td className="p-4 text-sm">{c.customerGroup?.displayName ?? "—"}</td>
                      <td className="p-4">{s?._count._all ?? 0}</td>
                      <td className="p-4 font-medium whitespace-nowrap">{formatSum(Number(s?._sum.total ?? 0))}</td>
                      <td className="p-4 text-sm text-gray-500 whitespace-nowrap">{s?._max.createdAt ? formatDate(s._max.createdAt) : "—"}</td>
                      <td className="p-4">
                        <Button asChild variant="ghost" size="icon" title="Открыть">
                          <Link href={`/admin/customers/${c.id}`}><Eye className="h-4 w-4" /></Link>
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Pagination
        path="/admin/customers"
        params={params}
        page={page}
        pageCount={Math.max(1, Math.ceil(total / PAGE_SIZE))}
        total={total}
        shown={customers.length}
        noun="клиентов"
      />
    </div>
  )
}
