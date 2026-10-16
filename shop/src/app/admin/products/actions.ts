"use server"

import { ProductStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { AdminFormError, adminAction, logActivity, zodFieldErrors, type ActionResult } from "@/lib/admin"
import { slugify } from "@/lib/utils"

const money = z.coerce.number().min(0, "Не может быть меньше 0").max(1e12)
const optionalMoney = z.preprocess((v) => (v === "" || v === null ? undefined : v), money.optional())
const int = (min = 0) => z.coerce.number().int("Целое число").min(min, `Не меньше ${min}`)

const productSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().trim().min(2, "Укажите название").max(200),
    slug: z.string().trim().max(200).optional(),
    sku: z.string().trim().min(1, "Укажите артикул").max(64),
    categoryId: z.string().min(1, "Выберите категорию"),
    description: z.string().trim().max(10_000).optional(),
    price: z.preprocess(
      (v) => (v === "" || v === null || v === undefined ? undefined : v),
      z.coerce.number({ error: "Укажите цену" }).positive("Цена должна быть больше 0").max(1e12)
    ),
    oldPrice: optionalMoney,
    costPrice: optionalMoney,
    unit: z.string().trim().min(1).max(20),
    minQuantity: int(1),
    stock: int(0),
    lowStockThreshold: int(0),
    status: z.enum(ProductStatus),
    isActive: z.boolean(),
    isFeatured: z.boolean(),
    isNew: z.boolean(),
    weight: optionalMoney,
    dimensions: z.string().trim().max(100).optional(),
    metaTitle: z.string().trim().max(200).optional(),
    metaDescription: z.string().trim().max(500).optional(),
    images: z.array(z.object({ url: z.string().trim().min(1), alt: z.string().trim().max(200).optional() })).max(20),
    attributes: z.array(z.object({ name: z.string().trim().min(1, "Название"), value: z.string().trim().min(1, "Значение") })).max(50),
    variants: z
      .array(
        z.object({
          id: z.string().optional(),
          name: z.string().trim().min(1, "Название варианта"),
          sku: z.string().trim().max(64).optional(),
          price: optionalMoney,
          stock: int(0),
          isActive: z.boolean(),
        })
      )
      .max(100),
  })
  .refine((d) => d.oldPrice === undefined || d.oldPrice > d.price, {
    path: ["oldPrice"],
    message: "Старая цена должна быть больше текущей",
  })

export type ProductInput = z.input<typeof productSchema>

function refresh(id?: string) {
  revalidatePath("/admin/products")
  if (id) revalidatePath(`/admin/products/${id}`)
  revalidatePath("/", "layout") // каталог, главная, страницы товаров
}

/** Уникальный slug: если занят — добавляем -2, -3... */
async function uniqueSlug(base: string, exceptId?: string) {
  const root = slugify(base) || "product"
  for (let i = 1; ; i++) {
    const slug = i === 1 ? root : `${root}-${i}`
    const taken = await prisma.product.findFirst({ where: { slug, id: exceptId ? { not: exceptId } : undefined }, select: { id: true } })
    if (!taken) return slug
  }
}

export async function saveProduct(input: ProductInput): Promise<ActionResult<{ id: string }>> {
  return adminAction("products", async (staff) => {
    const parsed = productSchema.safeParse(input)
    if (!parsed.success) {
      return { ok: false, error: "Проверьте поля формы", fieldErrors: zodFieldErrors(parsed.error.issues) }
    }
    const { id, images, attributes, variants, slug: slugInput, ...d } = parsed.data

    const skuTaken = await prisma.product.findFirst({
      where: { sku: { equals: d.sku, mode: "insensitive" }, id: id ? { not: id } : undefined },
      select: { id: true },
    })
    if (skuTaken) return { ok: false, error: "Проверьте поля формы", fieldErrors: { sku: "Такой артикул уже есть" } }

    const slug = await uniqueSlug(slugInput || d.name, id)
    const data = {
      ...d,
      slug,
      description: d.description || null,
      oldPrice: d.oldPrice ?? null,
      costPrice: d.costPrice ?? null,
      weight: d.weight ?? null,
      dimensions: d.dimensions || null,
      metaTitle: d.metaTitle || null,
      metaDescription: d.metaDescription || null,
    }
    const imageRows = images.map((img, i) => ({ url: img.url, alt: img.alt || null, sortOrder: i, isMain: i === 0 }))
    const attributeRows = attributes.map((a, i) => ({ ...a, sortOrder: i }))

    const saved = await prisma.$transaction(async (tx) => {
      if (!id) {
        const created = await tx.product.create({
          data: {
            ...data,
            images: { create: imageRows },
            attributes: { create: attributeRows },
            variants: { create: variants.map((v) => ({ name: v.name, stock: v.stock, isActive: v.isActive, sku: v.sku || null, price: v.price ?? null })) },
          },
        })
        if (d.stock > 0) {
          await tx.stockMovement.create({
            data: { productId: created.id, type: "INCOMING", quantity: d.stock, reason: "Начальный остаток", userId: staff.id },
          })
        }
        return created
      }

      const before = await tx.product.findUniqueOrThrow({ where: { id }, select: { stock: true, reserved: true } })
      if (d.stock < before.reserved) {
        throw new AdminFormError({ stock: `В резерве ${before.reserved} — остаток не может быть меньше` })
      }
      await tx.product.update({ where: { id }, data })
      if (d.stock !== before.stock) {
        await tx.stockMovement.create({
          data: { productId: id, type: "ADJUSTMENT", quantity: d.stock - before.stock, reason: "Изменено в карточке товара", userId: staff.id },
        })
      }

      // Фото и характеристики — перезаписываем целиком
      await tx.productImage.deleteMany({ where: { productId: id } })
      await tx.productImage.createMany({ data: imageRows.map((r) => ({ ...r, productId: id })) })
      await tx.productAttribute.deleteMany({ where: { productId: id } })
      await tx.productAttribute.createMany({ data: attributeRows.map((r) => ({ ...r, productId: id })) })

      // Варианты: обновляем существующие (id сохраняется — на него ссылаются заказы), лишние удаляем
      const keepIds = variants.flatMap((v) => (v.id ? [v.id] : []))
      await tx.productVariant.deleteMany({ where: { productId: id, id: { notIn: keepIds } } })
      for (const { id: variantId, ...v } of variants) {
        const row = { ...v, sku: v.sku || null, price: v.price ?? null }
        if (variantId) {
          await tx.productVariant.update({ where: { id: variantId, productId: id }, data: row })
        } else {
          await tx.productVariant.create({ data: { ...row, productId: id } })
        }
      }
      return { id }
    })

    await logActivity(staff.id, id ? "product.update" : "product.create", "Product", saved.id, { newData: { name: d.name, sku: d.sku, price: d.price } })
    refresh(saved.id)
    return { ok: true, data: { id: saved.id } }
  })
}

export async function setProductActive(id: string, isActive: boolean): Promise<ActionResult> {
  return adminAction("products", async (staff) => {
    await prisma.product.update({ where: { id }, data: { isActive } })
    await logActivity(staff.id, isActive ? "product.show" : "product.hide", "Product", id)
    refresh(id)
    return { ok: true }
  })
}

export async function duplicateProduct(id: string): Promise<ActionResult<{ id: string }>> {
  return adminAction("products", async (staff) => {
    const p = await prisma.product.findUniqueOrThrow({
      where: { id },
      include: { images: true, attributes: true, variants: true },
    })
    let sku = `${p.sku}-COPY`
    for (let i = 2; await prisma.product.findUnique({ where: { sku }, select: { id: true } }); i++) {
      sku = `${p.sku}-COPY${i}`
    }
    const copy = await prisma.product.create({
      data: {
        name: `${p.name} (копия)`,
        slug: await uniqueSlug(`${p.slug}-copy`),
        sku,
        description: p.description,
        price: p.price,
        oldPrice: p.oldPrice,
        costPrice: p.costPrice,
        unit: p.unit,
        minQuantity: p.minQuantity,
        lowStockThreshold: p.lowStockThreshold,
        status: p.status,
        isActive: false, // копию сначала проверить, потом показать
        isNew: p.isNew,
        weight: p.weight,
        dimensions: p.dimensions,
        categoryId: p.categoryId,
        images: { create: p.images.map(({ url, alt, sortOrder, isMain }) => ({ url, alt, sortOrder, isMain })) },
        attributes: { create: p.attributes.map(({ name, value, sortOrder }) => ({ name, value, sortOrder })) },
        variants: { create: p.variants.map(({ name, sku: vsku, price, isActive, attributes }) => ({ name, sku: vsku, price, isActive, attributes: attributes ?? {}, stock: 0 })) },
      },
    })
    await logActivity(staff.id, "product.duplicate", "Product", copy.id, { newData: { from: id } })
    refresh()
    return { ok: true, data: { id: copy.id } }
  })
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  return adminAction("products", async (staff) => {
    const orders = await prisma.orderItem.count({ where: { productId: id } })
    if (orders > 0) {
      return { ok: false, error: `Товар есть в ${orders} заказ(ах) — удалить нельзя. Скройте его или снимите с продажи.` }
    }
    const p = await prisma.product.delete({ where: { id } })
    await logActivity(staff.id, "product.delete", "Product", id, { oldData: { name: p.name, sku: p.sku } })
    refresh()
    return { ok: true }
  })
}
