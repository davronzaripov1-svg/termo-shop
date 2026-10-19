"use client"

import { useEffect, useState } from "react"
import { Search, Eye, Mail, Phone, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type Customer = {
  id: string
  email?: string
  firstName?: string
  lastName?: string
  phone?: string
  telegram?: string
  company?: string
  role: { name: string }
  customerGroup?: { name: string; code: string }
  _count: { orders: number }
  totalSpent: number
  createdAt: string
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("ru-RU").format(price) + " сум"
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

const groupColors: Record<string, string> = {
  RETAIL: "bg-gray-500",
  WHOLESALE: "bg-blue-500",
  VIP: "bg-yellow-500",
  DEALER: "bg-purple-500",
}

const groupLabels: Record<string, string> = {
  RETAIL: "Розница",
  WHOLESALE: "Опт",
  VIP: "VIP",
  DEALER: "Дилер",
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [groupFilter, setGroupFilter] = useState("")

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  useEffect(() => {
    loadCustomers()
  }, [])

  async function loadCustomers() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.set("q", searchQuery)
      const res = await fetch(`/api/admin/customers?${params}`)
      if (res.ok) {
        setCustomers(await res.json())
      }
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter((c) => {
    const name = `${c.firstName || ""} ${c.lastName || ""}`.trim()
    const matchesSearch =
      !searchQuery ||
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone && c.phone.includes(searchQuery)) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesGroup = !groupFilter || c.customerGroup?.code === groupFilter
    return matchesSearch && matchesGroup
  })

  // Calculate stats
  const totalCustomers = customers.length
  const totalSpentSum = customers.reduce((sum, c) => sum + c.totalSpent, 0)
  const avgSpent = totalCustomers > 0 ? Math.round(totalSpentSum / totalCustomers) : 0
  const activeCustomers = customers.filter((c) => c._count.orders > 0).length

  function getCustomerName(c: Customer) {
    const name = `${c.firstName || ""} ${c.lastName || ""}`.trim()
    return name || c.email || "Без имени"
  }

  function getInitial(c: Customer) {
    if (c.firstName) return c.firstName.charAt(0).toUpperCase()
    if (c.lastName) return c.lastName.charAt(0).toUpperCase()
    if (c.email) return c.email.charAt(0).toUpperCase()
    return "?"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Клиенты</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{totalCustomers}</p>
            <p className="text-sm text-gray-500">Всего клиентов</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{activeCustomers}</p>
            <p className="text-sm text-gray-500">С заказами</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{formatPrice(totalSpentSum)}</p>
            <p className="text-sm text-gray-500">Общая сумма</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{formatPrice(avgSpent)}</p>
            <p className="text-sm text-gray-500">Средний чек</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Поиск по имени, телефону или email..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadCustomers()}
              />
            </div>
            <select
              className="border rounded-lg px-3 py-2"
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
            >
              <option value="">Все группы</option>
              <option value="RETAIL">Розница</option>
              <option value="WHOLESALE">Опт</option>
              <option value="VIP">VIP</option>
              <option value="DEALER">Дилеры</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Загрузка...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 border-b bg-gray-50">
                    <th className="p-4">Клиент</th>
                    <th className="p-4">Контакты</th>
                    <th className="p-4">Группа</th>
                    <th className="p-4">Заказов</th>
                    <th className="p-4">Сумма покупок</th>
                    <th className="p-4">Дата регистрации</th>
                    <th className="p-4">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-500">
                        Клиентов нет
                      </td>
                    </tr>
                  ) : filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                            {getInitial(customer)}
                          </div>
                          <div>
                            <p className="font-medium">{getCustomerName(customer)}</p>
                            {customer.company && (
                              <p className="text-sm text-gray-500">{customer.company}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          {customer.phone && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3 text-gray-400" />
                              {customer.phone}
                            </div>
                          )}
                          {customer.email && (
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Mail className="h-3 w-3 text-gray-400" />
                              {customer.email}
                            </div>
                          )}
                          {customer.telegram && (
                            <div className="text-sm text-blue-500">
                              {customer.telegram}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        {customer.customerGroup ? (
                          <Badge className={groupColors[customer.customerGroup.code] || "bg-gray-500"}>
                            {groupLabels[customer.customerGroup.code] || customer.customerGroup.name}
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-400">Обычный</Badge>
                        )}
                      </td>
                      <td className="p-4 font-medium">{customer._count.orders}</td>
                      <td className="p-4 font-medium">{formatPrice(customer.totalSpent)}</td>
                      <td className="p-4 text-gray-500">{formatDate(customer.createdAt)}</td>
                      <td className="p-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Просмотр"
                          onClick={() => setSelectedCustomer(customer)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-sm text-gray-500">Всего: {filteredCustomers.length} клиентов</p>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-4 border-b flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xl">
                {getInitial(selectedCustomer)}
              </div>
              <div>
                <h2 className="text-lg font-bold">{getCustomerName(selectedCustomer)}</h2>
                {selectedCustomer.company && (
                  <p className="text-sm text-gray-500">{selectedCustomer.company}</p>
                )}
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Заказов</p>
                  <p className="text-xl font-bold">{selectedCustomer._count.orders}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Сумма покупок</p>
                  <p className="text-xl font-bold">{formatPrice(selectedCustomer.totalSpent)}</p>
                </div>
              </div>

              <div className="space-y-2">
                {selectedCustomer.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{selectedCustomer.email}</span>
                  </div>
                )}
                {selectedCustomer.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{selectedCustomer.phone}</span>
                  </div>
                )}
                {selectedCustomer.telegram && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-blue-500">{selectedCustomer.telegram}</span>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-500">Зарегистрирован</p>
                <p>{formatDate(selectedCustomer.createdAt)}</p>
              </div>

              {selectedCustomer.customerGroup && (
                <div>
                  <p className="text-sm text-gray-500">Группа</p>
                  <Badge className={groupColors[selectedCustomer.customerGroup.code] || "bg-gray-500"}>
                    {groupLabels[selectedCustomer.customerGroup.code] || selectedCustomer.customerGroup.name}
                  </Badge>
                </div>
              )}
            </div>
            <div className="p-4 border-t flex justify-end">
              <Button variant="outline" onClick={() => setSelectedCustomer(null)}>
                Закрыть
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
