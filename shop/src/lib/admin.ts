import { cache } from "react"
import { Prisma } from "@prisma/client"
import { redirect } from "next/navigation"
import { auth } from "./auth"
import { prisma } from "./prisma"
import { isStaffRole } from "./roles"

/**
 * Права ролей хранятся в Role.permissions: ["*"] — всё, иначе список разделов.
 * В seed.ts роли получили ["products","orders","customers","categories"] и т.п.
 */
export const PERMISSIONS = {
  orders: "Заказы",
  products: "Товары",
  categories: "Категории",
  customers: "Клиенты",
  warehouse: "Склад",
  analytics: "Аналитика",
  content: "Главная и страницы",
  staff: "Сотрудники",
  settings: "Настройки",
} as const

export type Permission = keyof typeof PERMISSIONS

export type StaffUser = {
  id: string
  name: string
  role: string
  roleDisplayName: string
  permissions: string[]
}

/** permissions в базе может лежать как массив или как JSON-строка (так пишет seed.ts) */
export function parsePermissions(value: unknown): string[] {
  if (typeof value === "string") {
    try {
      return parsePermissions(JSON.parse(value))
    } catch {
      return []
    }
  }
  return Array.isArray(value) ? value.filter((p): p is string => typeof p === "string") : []
}

export function can(staff: Pick<StaffUser, "permissions">, permission: Permission): boolean {
  return staff.permissions.includes("*") || staff.permissions.includes(permission)
}

/** Текущий сотрудник (один запрос к базе на рендер) или null. */
export const getStaff = cache(async (): Promise<StaffUser | null> => {
  const session = await auth()
  if (!session?.user || !isStaffRole(session.user.role)) return null

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, firstName: true, lastName: true, email: true, isActive: true, role: true },
  })
  // Роль и активность проверяем по базе, а не по токену: могли поменять после входа
  if (!user || !user.isActive || !isStaffRole(user.role.name)) return null

  return {
    id: user.id,
    name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email,
    role: user.role.name,
    roleDisplayName: user.role.displayName,
    permissions: parsePermissions(user.role.permissions),
  }
})

/** Для страниц админки: без права — на дашборд. */
export async function requirePagePermission(permission: Permission): Promise<StaffUser> {
  const staff = await getStaff()
  if (!staff) redirect("/login?callbackUrl=/admin")
  if (!can(staff, permission)) redirect("/admin?denied=" + permission)
  return staff
}

export class AdminActionError extends Error {}

/** Ошибка конкретных полей формы, обнаруженная глубоко в логике (например, в транзакции). */
export class AdminFormError extends Error {
  constructor(public fieldErrors: Record<string, string>) {
    super("Проверьте поля формы")
  }
}

/** Для server actions и API: без права — исключение. */
export async function requirePermission(permission: Permission): Promise<StaffUser> {
  const staff = await getStaff()
  if (!staff || !can(staff, permission)) {
    throw new AdminActionError("Недостаточно прав")
  }
  return staff
}

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> }

/** Оборачивает server action: ошибки прав и непредвиденные ошибки -> { ok: false }. */
export async function adminAction<T>(
  permission: Permission,
  run: (staff: StaffUser) => Promise<ActionResult<T>>
): Promise<ActionResult<T>> {
  try {
    const staff = await requirePermission(permission)
    return await run(staff)
  } catch (error) {
    if (error instanceof AdminActionError) return { ok: false, error: error.message }
    if (error instanceof AdminFormError) return { ok: false, error: error.message, fieldErrors: error.fieldErrors }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, error: "Запись с такими данными уже существует" }
    }
    console.error("Admin action failed:", error)
    return { ok: false, error: "Не удалось сохранить. Попробуйте ещё раз." }
  }
}

/** Ошибки zod -> { поле: сообщение } */
export function zodFieldErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const fieldErrors: Record<string, string> = {}
  for (const issue of issues) {
    fieldErrors[String(issue.path[0])] ??= issue.message
  }
  return fieldErrors
}


export async function logActivity(
  userId: string,
  action: string,
  entity: string,
  entityId?: string,
  data?: { oldData?: unknown; newData?: unknown }
) {
  await prisma.activityLog.create({
    data: {
      userId,
      action,
      entity,
      entityId,
      oldData: data?.oldData === undefined ? undefined : (data.oldData as Prisma.InputJsonValue),
      newData: data?.newData === undefined ? undefined : (data.newData as Prisma.InputJsonValue),
    },
  })
}

/** Категории деревом: родитель, потом его дети с depth+1 — для выпадающих списков. */
export async function getCategoryOptions() {
  const all = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, parentId: true, isActive: true },
  })
  const result: { id: string; name: string; depth: number; isActive: boolean }[] = []
  const walk = (parentId: string | null, depth: number) => {
    for (const c of all.filter((x) => x.parentId === parentId)) {
      result.push({ id: c.id, name: c.name, depth, isActive: c.isActive })
      walk(c.id, depth + 1)
    }
  }
  walk(null, 0)
  return result
}
