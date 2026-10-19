import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u0400-\u04ff]+/gi, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100) + "-" + Date.now().toString(36)
}

function generateSku(): string {
  return "SKU-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase()
}

export async function GET(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q")?.trim() || ""
  const categoryId = searchParams.get("categoryId") || ""

  const products = await prisma.product.findMany({
    where: {
      ...(categoryId ? { categoryId } : {}),
      ...(q ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { sku: { contains: q, mode: "insensitive" } },
        ],
      } : {}),
    },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(products)
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const name = String(body.name || "").trim()
    const price = Number(body.price) || 0
    const categoryId = String(body.categoryId || "")

    if (!name || price <= 0 || !categoryId) {
      return NextResponse.json({ error: "Заполните название, цену и категорию" }, { status: 400 })
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug: generateSlug(name),
        sku: body.sku || generateSku(),
        description: body.description || "",
        price,
        oldPrice: body.oldPrice || null,
        stock: body.stock || 0,
        categoryId,
        isActive: body.isActive ?? true,
        isFeatured: body.isFeatured ?? false,
        isNew: body.isNew ?? false,
        images: body.imageUrl ? {
          create: {
            url: body.imageUrl,
            isMain: true,
            sortOrder: 0,
          }
        } : undefined,
      },
      include: {
        category: true,
        images: true,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Create product failed:", error)
    return NextResponse.json({ error: "Не удалось создать товар" }, { status: 500 })
  }
}
