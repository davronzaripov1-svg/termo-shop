import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const promocode = await prisma.promocode.findUnique({
    where: { id },
    include: {
      _count: { select: { orders: true } },
    },
  })

  if (!promocode) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(promocode)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()

  try {
    const promocode = await prisma.promocode.update({
      where: { id },
      data: {
        code: body.code?.toUpperCase(),
        description: body.description || null,
        discountType: body.discountType,
        discountValue: Number(body.discountValue),
        minOrderAmount: body.minOrderAmount ? Number(body.minOrderAmount) : null,
        maxDiscount: body.maxDiscount ? Number(body.maxDiscount) : null,
        usageLimit: body.usageLimit ? Number(body.usageLimit) : null,
        startsAt: body.startsAt ? new Date(body.startsAt) : null,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        isActive: body.isActive,
      },
    })

    return NextResponse.json(promocode)
  } catch (error) {
    console.error("Update promocode failed:", error)
    return NextResponse.json({ error: "Не удалось обновить промокод" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  try {
    await prisma.promocode.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete promocode failed:", error)
    return NextResponse.json({ error: "Не удалось удалить промокод" }, { status: 500 })
  }
}
