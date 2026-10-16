"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Edit, Plus, Shield, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { saveRolePermissions, saveStaff } from "@/app/admin/staff/actions"
import { cn } from "@/lib/utils"

type Role = { id: string; name: string; displayName: string; description: string; permissions: string[] }
type User = { id: string; firstName: string; lastName: string; email: string; phone: string; isActive: boolean; roleId: string; orders: number }
type Form = Omit<User, "id" | "orders"> & { id?: string; password: string }

const roleColors: Record<string, string> = {
  SUPER_ADMIN: "bg-red-500",
  ADMIN: "bg-purple-500",
  MANAGER: "bg-blue-500",
  WAREHOUSE: "bg-amber-500",
}

export function StaffManager({
  meId,
  meIsSuper,
  roles,
  users,
  permissionLabels,
}: {
  meId: string
  meIsSuper: boolean
  roles: Role[]
  users: User[]
  permissionLabels: Record<string, string>
}) {
  const router = useRouter()
  const [form, setForm] = useState<Form | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [rolePerms, setRolePerms] = useState(() => Object.fromEntries(roles.map((r) => [r.id, r.permissions])))
  const [isPending, startTransition] = useTransition()

  const roleOf = (id: string) => roles.find((r) => r.id === id)
  const assignable = roles.filter((r) => meIsSuper || r.name !== "SUPER_ADMIN")

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form) return
    startTransition(async () => {
      const result = await saveStaff(form)
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {})
        toast.error(result.error)
        return
      }
      toast.success(form.id ? "Сохранено" : "Сотрудник добавлен")
      setForm(null)
      router.refresh()
    })
  }

  const savePerms = (role: Role) =>
    startTransition(async () => {
      const result = await saveRolePermissions(role.id, rolePerms[role.id])
      if (!result.ok) return void toast.error(result.error)
      toast.success(`Права роли «${role.displayName}» сохранены`)
      router.refresh()
    })

  const field = (key: keyof Form) => ({
    value: form ? String(form[key] ?? "") : "",
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => form && setForm({ ...form, [key]: e.target.value }),
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Сотрудники</h1>
          <p className="text-sm text-gray-500">Активных: {users.filter((u) => u.isActive).length}</p>
        </div>
        <Button
          onClick={() => {
            setErrors({})
            setForm({ firstName: "", lastName: "", email: "", phone: "", isActive: true, roleId: assignable.find((r) => r.name === "MANAGER")?.id ?? "", password: "" })
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Добавить сотрудника
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <Card className="lg:col-span-2">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b bg-gray-50">
                    <th className="p-4">Сотрудник</th>
                    <th className="p-4">Роль</th>
                    <th className="p-4">Заказов ведёт</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const role = roleOf(u.roleId)
                    const canEdit = meIsSuper || role?.name !== "SUPER_ADMIN"
                    return (
                      <tr key={u.id} className={cn("border-b last:border-0", !u.isActive && "opacity-50")}>
                        <td className="p-4">
                          <p className="font-medium">
                            {[u.firstName, u.lastName].filter(Boolean).join(" ") || "—"}
                            {u.id === meId && <span className="text-gray-400 font-normal"> (вы)</span>}
                          </p>
                          <p className="text-gray-500">{u.email}{u.phone && ` · ${u.phone}`}</p>
                          {!u.isActive && <Badge className="bg-gray-500 text-white border-0 mt-1">Заблокирован</Badge>}
                        </td>
                        <td className="p-4">
                          <Badge className={`${roleColors[role?.name ?? ""] ?? "bg-gray-500"} text-white border-0`}>{role?.displayName}</Badge>
                        </td>
                        <td className="p-4">{u.orders}</td>
                        <td className="p-4 text-right">
                          {canEdit && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Редактировать"
                              onClick={() => {
                                setErrors({})
                                setForm({ ...u, password: "" })
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {form && (
          <Card className="lg:sticky lg:top-20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>{form.id ? "Редактирование" : "Новый сотрудник"}</CardTitle>
              <button onClick={() => setForm(null)} aria-label="Закрыть"><X className="h-5 w-5 text-gray-400" /></button>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="space-y-3" noValidate>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Имя *" error={errors.firstName}><Input {...field("firstName")} /></Field>
                  <Field label="Фамилия" error={errors.lastName}><Input {...field("lastName")} /></Field>
                </div>
                <Field label="Email (логин) *" error={errors.email}><Input type="email" {...field("email")} /></Field>
                <Field label="Телефон" error={errors.phone}><Input type="tel" {...field("phone")} /></Field>
                <Field label="Роль *" error={errors.roleId}>
                  <select className="w-full border rounded-lg px-3 py-2 text-sm bg-white" {...field("roleId")} disabled={form.id === meId}>
                    {assignable.map((r) => <option key={r.id} value={r.id}>{r.displayName}</option>)}
                  </select>
                </Field>
                <Field label={form.id ? "Новый пароль (пусто — не менять)" : "Пароль *"} error={errors.password}>
                  <Input type="text" autoComplete="new-password" placeholder="Минимум 8 символов" {...field("password")} />
                </Field>
                {form.id !== meId && (
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={!form.isActive} onChange={(e) => setForm({ ...form, isActive: !e.target.checked })} />
                    Заблокировать доступ
                  </label>
                )}
                <div className="flex gap-2 pt-2">
                  <Button type="submit" disabled={isPending}>{isPending ? "Сохранение..." : "Сохранить"}</Button>
                  <Button type="button" variant="outline" onClick={() => setForm(null)}>Отмена</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Права ролей</CardTitle>
          <p className="text-sm text-gray-500">Какие разделы админки видит каждая роль. Дашборд доступен всем.</p>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2 pr-4">Роль</th>
                {Object.values(permissionLabels).map((label) => (
                  <th key={label} className="py-2 px-2 text-center font-medium whitespace-nowrap">{label}</th>
                ))}
                <th />
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => {
                const isSuperRole = role.name === "SUPER_ADMIN"
                const perms = rolePerms[role.id]
                const changed = perms.slice().sort().join() !== role.permissions.slice().sort().join()
                return (
                  <tr key={role.id} className="border-b last:border-0">
                    <td className="py-3 pr-4">
                      <p className="font-medium">{role.displayName}</p>
                      <p className="text-xs text-gray-500">{role.description}</p>
                    </td>
                    {Object.keys(permissionLabels).map((p) => (
                      <td key={p} className="py-3 px-2 text-center">
                        <input
                          type="checkbox"
                          aria-label={`${role.displayName}: ${permissionLabels[p]}`}
                          checked={isSuperRole || perms.includes("*") || perms.includes(p)}
                          disabled={isSuperRole}
                          onChange={(e) =>
                            setRolePerms({
                              ...rolePerms,
                              [role.id]: e.target.checked ? [...perms, p] : perms.filter((x) => x !== p),
                            })
                          }
                        />
                      </td>
                    ))}
                    <td className="py-3 pl-2 text-right">
                      {!isSuperRole && (
                        <Button size="sm" variant="outline" disabled={!changed || isPending} onClick={() => savePerms(role)}>
                          Сохранить
                        </Button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      {children}
      {error && <span className="mt-1 block text-sm text-red-600">{error}</span>}
    </label>
  )
}
