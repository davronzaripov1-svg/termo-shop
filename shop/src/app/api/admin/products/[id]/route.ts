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
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
    },
  })

  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(product)
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
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        price: body.price,
        oldPrice: body.oldPrice || null,
        stock: body.stock,
        categoryId: body.categoryId,
        isActive: body.isActive,
        isFeatured: body.isFeatured,
        isNew: body.isNew,
      },
      include: {
        category: true,
        images: true,
      },
    })

    // Update main image if provided
    if (body.imageUrl) {
      await prisma.productImage.deleteMany({ where: { productId: id } })
      await prisma.productImage.create({
        data: {
          productId: id,
          url: body.imageUrl,
          isMain: true,
          sortOrder: 0,
        },
      })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Update product failed:", error)
    return NextResponse.json({ error: "Не удалось обновить товар" }, { status: 500 })
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
    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete product failed:", error)
    return NextResponse.json({ error: "Не удалось удалить товар" }, { status: 500 })
  }
}
