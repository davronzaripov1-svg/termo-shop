import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"
import { ensureDesignFolder, uploadDesignFile } from "@/lib/google-drive"

function cleanType(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]+/g, "").slice(0, 20)
}

function serializeDesign(design: any) {
  return {
    ...design,
    files: (design.files || []).map((file: any) => ({
      ...file,
      sizeBytes: Number(file.sizeBytes),
    })),
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { code } = await params

  try {
    const design = await prisma.design.findUnique({ where: { code: code.toUpperCase() } })
    if (!design) return NextResponse.json({ error: "Design not found" }, { status: 404 })

    const form = await request.formData()
    const file = form.get("file")
    const fileType = cleanType(String(form.get("fileType") || ""))

    if (!(file instanceof File) || !fileType) {
      return NextResponse.json({ error: "Файл и тип файла обязательны" }, { status: 400 })
    }

    const previous = await prisma.designFile.findMany({
      where: { designId: design.id, fileType, isCurrent: true },
      select: { version: true },
    })
    const nextVersion = Math.max(0, ...previous.map((x) => x.version)) + 1
    const ext = file.name.includes(".") ? "." + file.name.split(".").pop()!.toLowerCase() : ""
    const targetName = `${design.code}-${fileType}-V${nextVersion}${ext}`
    const folderId = design.driveFolderId || await ensureDesignFolder(design.designType, design.code)
    const uploaded = await uploadDesignFile(file, folderId, targetName)

    await prisma.$transaction([
      prisma.designFile.updateMany({
        where: { designId: design.id, fileType, isCurrent: true },
        data: { isCurrent: false },
      }),
      prisma.designFile.create({
        data: {
          designId: design.id,
          fileType,
          driveFileId: uploaded.id,
          filename: uploaded.name || targetName,
          mimeType: uploaded.mimeType || file.type || "application/octet-stream",
          sizeBytes: BigInt(file.size),
          version: nextVersion,
          isCurrent: true,
        },
      }),
      prisma.design.update({
        where: { id: design.id },
        data: { driveFolderId: folderId, version: Math.max(design.version, nextVersion) },
      }),
    ])

    const updated = await prisma.design.findUnique({
      where: { id: design.id },
      include: { files: { orderBy: [{ isCurrent: "desc" }, { version: "desc" }] } },
    })

    return NextResponse.json(serializeDesign(updated))
  } catch (error) {
    console.error("Upload design file failed:", error)
    return NextResponse.json({ error: "Не удалось загрузить файл" }, { status: 500 })
  }
}
