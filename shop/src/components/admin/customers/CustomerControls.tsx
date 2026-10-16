"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { resetCustomerPassword, updateCustomer } from "@/app/admin/customers/actions"

export function CustomerControls({
  id,
  customerGroupId,
  isActive,
  groups,
}: {
  id: string
  customerGroupId: string
  isActive: boolean
  groups: { id: string; name: string; discount: number }[]
}) {
  const router = useRouter()
  const [values, setValues] = useState({ customerGroupId, isActive })
  const [isPending, startTransition] = useTransition()
  const [newPassword, setNewPassword] = useState<string | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const changed = values.customerGroupId !== customerGroupId || values.isActive !== isActive

  const save = () =>
    startTransition(async () => {
      const result = await updateCustomer(id, values)
      if (!result.ok) return void toast.error(result.error)
      toast.success("Сохранено")
      router.refresh()
    })

  return (
    <Card>
      <CardHeader><CardTitle>Управление</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <label className="block text-sm">
          <span className="text-gray-500">Группа клиента</span>
          <select
            className="w-full border rounded-lg px-3 py-2 bg-white mt-1"
            value={values.customerGroupId}
            onChange={(e) => setValues({ ...values, customerGroupId: e.target.value })}
          >
            <option value="">Без группы</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>{g.name}{g.discount > 0 ? ` (−${g.discount}%)` : ""}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!values.isActive}
            onChange={(e) => setValues({ ...values, isActive: !e.target.checked })}
          />
          Заблокировать (не сможет войти и оформить заказ)
        </label>
        <Button className="w-full" onClick={save} disabled={isPending || !changed}>Сохранить</Button>
        <hr />
        {newPassword ? (
          <div className="rounded-lg bg-green-50 p-3 text-sm">
            <p>Новый пароль (сообщите клиенту, больше он не покажется):</p>
            <p className="font-mono text-lg font-semibold mt-1 select-all">{newPassword}</p>
          </div>
        ) : confirmReset ? (
          <div className="space-y-2 text-sm">
            <p>Старый пароль перестанет работать. Сбросить?</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="destructive"
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    const result = await resetCustomerPassword(id)
                    setConfirmReset(false)
                    if (!result.ok) return void toast.error(result.error)
                    setNewPassword(result.data!.password)
                  })
                }
              >
                Да, сбросить
              </Button>
              <Button size="sm" variant="outline" onClick={() => setConfirmReset(false)}>Отмена</Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" className="w-full" onClick={() => setConfirmReset(true)}>Сбросить пароль</Button>
        )}
      </CardContent>
    </Card>
  )
}
