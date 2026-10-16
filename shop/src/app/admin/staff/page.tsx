import { StaffManager } from "@/components/admin/staff/StaffManager"
import { PERMISSIONS, getStaff, parsePermissions } from "@/lib/admin"
import { prisma } from "@/lib/prisma"
import { STAFF_ROLES } from "@/lib/roles"

export const metadata = { title: "Сотрудники" }

export default async function StaffPage() {
  const me = (await getStaff())!
  const [roles, users] = await Promise.all([
    prisma.role.findMany({ where: { name: { in: [...STAFF_ROLES] } } }),
    prisma.user.findMany({
      where: { role: { name: { in: [...STAFF_ROLES] } } },
      orderBy: [{ isActive: "desc" }, { createdAt: "asc" }],
      select: {
        id: true, firstName: true, lastName: true, email: true, phone: true, isActive: true, roleId: true, createdAt: true,
        _count: { select: { assignedOrders: true } },
      },
    }),
  ])
  const roleOrder = (name: string) => STAFF_ROLES.indexOf(name as (typeof STAFF_ROLES)[number])
  roles.sort((a, b) => roleOrder(a.name) - roleOrder(b.name))

  return (
    <StaffManager
      meId={me.id}
      meIsSuper={me.permissions.includes("*")}
      permissionLabels={PERMISSIONS}
      roles={roles.map((r) => ({
        id: r.id,
        name: r.name,
        displayName: r.displayName,
        description: r.description ?? "",
        permissions: parsePermissions(r.permissions),
      }))}
      users={users.map((u) => ({
        id: u.id,
        firstName: u.firstName ?? "",
        lastName: u.lastName ?? "",
        email: u.email,
        phone: u.phone ?? "",
        isActive: u.isActive,
        roleId: u.roleId,
        orders: u._count.assignedOrders,
      }))}
    />
  )
}
