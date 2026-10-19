import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"

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
    const category = await prisma.category.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description || null,
        image: body.image || null,
        parentId: body.parentId || null,
        isActive: body.isActive,
        sortOrder: body.sortOrder || 0,
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error("Update category failed:", error)
    return NextResponse.json({ error: "Не удалось обновить категорию" }, { status: 500 })
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
    // Check if category has products
    const productsCount = await prisma.product.count({ where: { categoryId: id } })
    if (productsCount > 0) {
      return NextResponse.json({ error: `Категория содержит ${productsCount} товаров` }, { status: 400 })
    }

    await prisma.category.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete category failed:", error)
    return NextResponse.json({ error: "Не удалось удалить категорию" }, { status: 500 })
  }
}
