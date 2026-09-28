import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"

function serializeDesign(design: any) {
  return {
    ...design,
    files: (design.files || []).map((file: any) => ({
      ...file,
      sizeBytes: Number(file.sizeBytes),
    })),
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { code } = await params

  const item = await prisma.design.findUnique({
    where: { code: code.toUpperCase() },
    include: { files: { orderBy: [{ isCurrent: "desc" }, { version: "desc" }] } },
  })

  if (!item) return NextResponse.json({ error: "Design not found" }, { status: 404 })
  return NextResponse.json(serializeDesign(item))
}
