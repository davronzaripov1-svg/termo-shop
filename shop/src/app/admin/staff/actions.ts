"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { hashPassword, normalizePhone } from "@/lib/auth"
import { PERMISSIONS, adminAction, logActivity, zodFieldErrors, type ActionResult, type StaffUser } from "@/lib/admin"
import { STAFF_ROLES } from "@/lib/roles"

const staffSchema = z.object({
  id: z.string().optional(),
  firstName: z.string().trim().min(1, "Укажите имя").max(100),
  lastName: z.string().trim().max(100).optional(),
  email: z.string().trim().toLowerCase().pipe(z.email("Неверный email")),
  phone: z.string().optional().transform((v) => (v ? normalizePhone(v) : "")),
  roleId: z.string().min(1, "Выберите роль"),
  isActive: z.boolean(),
  // при создании обязателен, при редактировании — только если меняем
  password: z.string().optional(),
})

export type StaffInput = z.input<typeof staffSchema>

function refresh() {
  revalidatePath("/admin/staff")
  revalidatePath("/admin", "layout")
}

/** Права SUPER_ADMIN («всё») может выдавать и отнимать только SUPER_ADMIN */
const isSuper = (staff: StaffUser) => staff.permissions.includes("*")

async function activeSuperAdmins(exceptUserId?: string) {
  return prisma.user.count({
    where: { isActive: true, role: { name: "SUPER_ADMIN" }, id: exceptUserId ? { not: exceptUserId } : undefined },
  })
}

export async function saveStaff(input: StaffInput): Promise<ActionResult> {
  return adminAction("staff", async (staff) => {
    const parsed = staffSchema.safeParse(input)
    if (!parsed.success) return { ok: false, error: "Проверьте поля", fieldErrors: zodFieldErrors(parsed.error.issues) }
    const { id, password, phone, ...d } = parsed.data

    if (!id && (!password || password.length < 8)) {
      return { ok: false, error: "Проверьте поля", fieldErrors: { password: "Минимум 8 символов" } }
    }
    if (id && password && password.length < 8) {
      return { ok: false, error: "Проверьте поля", fieldErrors: { password: "Минимум 8 символов" } }
    }
    if (phone && !/^\+\d{9,15}$/.test(phone)) {
      return { ok: false, error: "Проверьте поля", fieldErrors: { phone: "Неверный номер" } }
    }

    const role = await prisma.role.findUnique({ where: { id: d.roleId } })
    if (!role || !(STAFF_ROLES as readonly string[]).includes(role.name)) {
      return { ok: false, error: "Проверьте поля", fieldErrors: { roleId: "Выберите роль сотрудника" } }
    }

    const existing = id
      ? await prisma.user.findUnique({ where: { id }, include: { role: true } })
      : null
    if (id && (!existing || !(STAFF_ROLES as readonly string[]).includes(existing.role.name))) {
      return { ok: false, error: "Сотрудник не найден" }
    }
    if ((role.name === "SUPER_ADMIN" || existing?.role.name === "SUPER_ADMIN") && !isSuper(staff)) {
      return { ok: false, error: "Только супер-администратор может управлять супер-администраторами" }
    }
    if (id === staff.id && (!d.isActive || role.id !== existing!.roleId)) {
      return { ok: false, error: "Нельзя заблокировать себя или сменить себе роль" }
    }
    if (existing?.role.name === "SUPER_ADMIN" && (role.name !== "SUPER_ADMIN" || !d.isActive) && (await activeSuperAdmins(existing.id)) === 0) {
      return { ok: false, error: "Должен остаться хотя бы один активный супер-администратор" }
    }

    const taken = await prisma.user.findFirst({
      where: { OR: [{ email: d.email }, ...(phone ? [{ phone }] : [])], id: id ? { not: id } : undefined },
      select: { email: true },
    })
    if (taken) {
      return taken.email === d.email
        ? { ok: false, error: "Проверьте поля", fieldErrors: { email: "Email уже используется" } }
        : { ok: false, error: "Проверьте поля", fieldErrors: { phone: "Телефон уже используется" } }
    }

    const data = { ...d, lastName: d.lastName || null, phone: phone || null }
    if (id) {
      await prisma.user.update({
        where: { id },
        data: { ...data, ...(password ? { password: await hashPassword(password) } : {}) },
      })
    } else {
      await prisma.user.create({ data: { ...data, password: await hashPassword(password!), emailVerified: new Date() } })
    }
    await logActivity(staff.id, id ? "staff.update" : "staff.create", "User", id, { newData: { email: d.email, role: role.name, isActive: d.isActive } })
    refresh()
    return { ok: true }
  })
}

export async function saveRolePermissions(roleId: string, permissions: string[]): Promise<ActionResult> {
  return adminAction("staff", async (staff) => {
    const role = await prisma.role.findUnique({ where: { id: roleId } })
    if (!role || !(STAFF_ROLES as readonly string[]).includes(role.name)) return { ok: false, error: "Роль не найдена" }
    if (role.name === "SUPER_ADMIN") return { ok: false, error: "У супер-администратора всегда полный доступ" }
    // без права «Сотрудники» нельзя раздать себе/другим больше, чем есть у себя
    const valid = permissions.filter((p) => p in PERMISSIONS)
    if (!isSuper(staff) && valid.some((p) => !staff.permissions.includes(p))) {
      return { ok: false, error: "Нельзя выдать права, которых нет у вас" }
    }
    await prisma.role.update({ where: { id: roleId }, data: { permissions: valid } })
    await logActivity(staff.id, "role.permissions", "Role", roleId, { oldData: role.permissions, newData: valid })
    refresh()
    return { ok: true }
  })
}
