"use client"

import { useState } from "react"
import { Search, Eye, Mail, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const customers = [
  {
    id: "1",
    name: "Иван Петров",
    email: "ivan@example.com",
    phone: "+998 90 123 45 67",
    telegram: "@ivan_petrov",
    company: null,
    group: "RETAIL",
    ordersCount: 12,
    totalSpent: 15600000,
    lastOrder: "10 сен 2026",
    createdAt: "15 янв 2025",
  },
  {
    id: "2",
    name: "Мария Сидорова",
    email: "maria@example.com",
    phone: "+998 91 234 56 78",
    telegram: "@maria_s",
    company: "ООО Альфа",
    group: "WHOLESALE",
    ordersCount: 45,
    totalSpent: 89000000,
    lastOrder: "09 сен 2026",
    createdAt: "03 мар 2025",
  },
  {
    id: "3",
    name: "Алексей Козлов",
    email: null,
    phone: "+998 93 345 67 89",
    telegram: null,
    company: null,
    group: "VIP",
    ordersCount: 28,
    totalSpent: 45000000,
    lastOrder: "08 сен 2026",
    createdAt: "20 фев 2025",
  },
  {
    id: "4",
    name: "Елена Новикова",
    email: "elena@example.com",
    phone: "+998 94 456 78 90",
    telegram: "@elena_n",
    company: "ИП Новикова",
    group: "DEALER",
    ordersCount: 156,
    totalSpent: 234000000,
    lastOrder: "10 сен 2026",
    createdAt: "01 янв 2025",
  },
  {
    id: "5",
    name: "Дмитрий Волков",
    email: "dmitry@example.com",
    phone: "+998 95 567 89 01",
    telegram: null,
    company: null,
    group: "RETAIL",
    ordersCount: 3,
    totalSpent: 2100000,
    lastOrder: "05 сен 2026",
    createdAt: "01 сен 2026",
  },
]

function formatPrice(price: number) {
  return new Intl.NumberFormat("ru-RU").format(price) + " сум"
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
  const [searchQuery, setSearchQuery] = useState("")
  const [groupFilter, setGroupFilter] = useState("")

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesGroup = !groupFilter || c.group === groupFilter
    return matchesSearch && matchesGroup
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Клиенты</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Всего клиентов", count: 1234 },
          { label: "Новых за месяц", count: 56 },
          { label: "Активных", count: 892 },
          { label: "Средний чек", count: "890 000 сум" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">{stat.count}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b bg-gray-50">
                  <th className="p-4">Клиент</th>
                  <th className="p-4">Контакты</th>
                  <th className="p-4">Группа</th>
                  <th className="p-4">Заказов</th>
                  <th className="p-4">Сумма покупок</th>
                  <th className="p-4">Последний заказ</th>
                  <th className="p-4">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          {customer.company && (
                            <p className="text-sm text-gray-500">{customer.company}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3 text-gray-400" />
                          {customer.phone}
                        </div>
                        {customer.email && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Mail className="h-3 w-3 text-gray-400" />
                            {customer.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={groupColors[customer.group]}>
                        {groupLabels[customer.group]}
                      </Badge>
                    </td>
                    <td className="p-4 font-medium">{customer.ordersCount}</td>
                    <td className="p-4 font-medium">{formatPrice(customer.totalSpent)}</td>
                    <td className="p-4 text-gray-500">{customer.lastOrder}</td>
                    <td className="p-4">
                      <Button variant="ghost" size="icon" title="Просмотр">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
