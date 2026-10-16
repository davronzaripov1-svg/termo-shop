"use server"

import { randomBytes } from "crypto"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { adminAction, logActivity, type ActionResult } from "@/lib/admin"
import { CUSTOMER_ROLE } from "@/lib/roles"
import { hashPassword } from "@/lib/auth"

export async function updateCustomer(
  id: string,
  data: { customerGroupId: string; isActive: boolean }
): Promise<ActionResult> {
  return adminAction("customers", async (staff) => {
    const customer = await prisma.user.findFirst({
      where: { id, role: { name: CUSTOMER_ROLE } },
      select: { customerGroupId: true, isActive: true },
    })
    if (!customer) return { ok: false, error: "Клиент не найден" }
    if (data.customerGroupId && !(await prisma.customerGroup.findUnique({ where: { id: data.customerGroupId } }))) {
      return { ok: false, error: "Группа не найдена" }
    }

    await prisma.user.update({
      where: { id },
      data: { customerGroupId: data.customerGroupId || null, isActive: data.isActive },
    })
    await logActivity(staff.id, "customer.update", "User", id, { oldData: customer, newData: data })
    revalidatePath("/admin/customers")
    revalidatePath(`/admin/customers/${id}`)
    return { ok: true }
  })
}

/** Новый временный пароль клиенту (по звонку «забыл пароль»). Показывается менеджеру один раз. */
export async function resetCustomerPassword(id: string): Promise<ActionResult<{ password: string }>> {
  return adminAction("customers", async (staff) => {
    const customer = await prisma.user.findFirst({ where: { id, role: { name: CUSTOMER_ROLE } }, select: { id: true } })
    if (!customer) return { ok: false, error: "Клиент не найден" }

    // без похожих символов (0/O, 1/l), чтобы легко продиктовать
    const alphabet = "abcdefghjkmnpqrstuvwxyz23456789"
    const bytes = randomBytes(10)
    const password = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("")

    await prisma.user.update({ where: { id }, data: { password: await hashPassword(password) } })
    await logActivity(staff.id, "customer.password_reset", "User", id)
    return { ok: true, data: { password } }
  })
}
