export const STAFF_ROLES = ["SUPER_ADMIN", "ADMIN", "MANAGER", "WAREHOUSE"] as const

export const CUSTOMER_ROLE = "CUSTOMER"

export function isStaffRole(role: string | undefined | null): boolean {
  return !!role && (STAFF_ROLES as readonly string[]).includes(role)
}
