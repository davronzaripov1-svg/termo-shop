import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const promocodes = await prisma.promocode.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { orders: true } },
    },
  })

  return NextResponse.json(promocodes)
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const code = String(body.code || "").trim().toUpperCase()

    if (!code || code.length < 3) {
      return NextResponse.json({ error: "Код должен быть минимум 3 символа" }, { status: 400 })
    }

    // Check if code exists
    const existing = await prisma.promocode.findUnique({ where: { code } })
    if (existing) {
      return NextResponse.json({ error: "Такой промокод уже существует" }, { status: 400 })
    }

    const promocode = await prisma.promocode.create({
      data: {
        code,
        description: body.description || null,
        discountType: body.discountType || "PERCENT",
        discountValue: Number(body.discountValue) || 0,
        minOrderAmount: body.minOrderAmount ? Number(body.minOrderAmount) : null,
        maxDiscount: body.maxDiscount ? Number(body.maxDiscount) : null,
        usageLimit: body.usageLimit ? Number(body.usageLimit) : null,
        startsAt: body.startsAt ? new Date(body.startsAt) : null,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        isActive: body.isActive ?? true,
      },
    })

    return NextResponse.json(promocode, { status: 201 })
  } catch (error) {
    console.error("Create promocode failed:", error)
    return NextResponse.json({ error: "Не удалось создать промокод" }, { status: 500 })
  }
}
