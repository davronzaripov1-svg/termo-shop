import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"

export async function GET(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q")?.trim() || ""

  const customers = await prisma.user.findMany({
    where: {
      role: { name: { not: "admin" } },
      ...(q ? {
        OR: [
          { email: { contains: q, mode: "insensitive" } },
          { firstName: { contains: q, mode: "insensitive" } },
          { lastName: { contains: q, mode: "insensitive" } },
          { phone: { contains: q } },
        ],
      } : {}),
    },
    include: {
      role: true,
      customerGroup: true,
      _count: { select: { orders: true } },
      orders: {
        select: { total: true },
        where: { status: { not: "CANCELLED" } },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  // Calculate total spent
  const result = customers.map(c => ({
    ...c,
    totalSpent: c.orders.reduce((sum, o) => sum + Number(o.total), 0),
    orders: undefined,
  }))

  return NextResponse.json(result)
}
