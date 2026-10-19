import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"

export async function GET(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status") || ""
  const q = searchParams.get("q")?.trim() || ""

  const orders = await prisma.order.findMany({
    where: {
      ...(status ? { status: status as any } : {}),
      ...(q ? {
        OR: [
          { orderNumber: { contains: q, mode: "insensitive" } },
          { customerName: { contains: q, mode: "insensitive" } },
          { customerPhone: { contains: q } },
        ],
      } : {}),
    },
    include: {
      user: { select: { id: true, email: true, firstName: true, lastName: true } },
      items: { include: { product: { select: { name: true, images: { take: 1 } } } } },
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return NextResponse.json(orders)
}
