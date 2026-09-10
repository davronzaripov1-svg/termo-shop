"use client"

import { useState } from "react"
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Shield,
  UserCog,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Key,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const staff = [
  {
    id: "1",
    firstName: "Администратор",
    lastName: "Системы",
    email: "admin@termostik.uz",
    phone: "+998 90 123 45 67",
    role: "SUPER_ADMIN",
    roleName: "Супер Администратор",
    isActive: true,
    lastLogin: "2024-01-15 14:30",
    createdAt: "2023-06-01",
    avatar: "А",
  },
  {
    id: "2",
    firstName: "Азиз",
    lastName: "Каримов",
    email: "aziz@termostik.uz",
    phone: "+998 90 234 56 78",
    role: "ADMIN",
    roleName: "Администратор",
    isActive: true,
    lastLogin: "2024-01-15 12:15",
    createdAt: "2023-08-15",
    avatar: "А",
  },
  {
    id: "3",
    firstName: "Малика",
    lastName: "Алиева",
    email: "malika@termostik.uz",
    phone: "+998 90 345 67 89",
    role: "MANAGER",
    roleName: "Менеджер",
    isActive: true,
    lastLogin: "2024-01-15 10:00",
    createdAt: "2023-09-20",
    avatar: "М",
  },
  {
    id: "4",
    firstName: "Бахтиёр",
    lastName: "Рахимов",
    email: "bakhtiyor@termostik.uz",
    phone: "+998 90 456 78 90",
    role: "WAREHOUSE",
    roleName: "Склад",
    isActive: true,
    lastLogin: "2024-01-15 08:30",
    createdAt: "2023-10-10",
    avatar: "Б",
  },
  {
    id: "5",
    firstName: "Дилноза",
    lastName: "Усманова",
    email: "dilnoza@termostik.uz",
    phone: "+998 90 567 89 01",
    role: "MANAGER",
    roleName: "Менеджер",
    isActive: false,
    lastLogin: "2024-01-10 16:45",
    createdAt: "2023-11-05",
    avatar: "Д",
  },
]

const roles = [
  {
    name: "SUPER_ADMIN",
    displayName: "Супер Администратор",
    description: "Полный доступ ко всем функциям",
    permissions: ["*"],
    color: "bg-red-100 text-red-700",
  },
  {
    name: "ADMIN",
    displayName: "Администратор",
    description: "Управление товарами, заказами и клиентами",
    permissions: ["products", "orders", "customers", "categories"],
    color: "bg-purple-100 text-purple-700",
  },
  {
    name: "MANAGER",
    displayName: "Менеджер",
    description: "Работа с клиентами и заказами",
    permissions: ["orders", "customers"],
    color: "bg-blue-100 text-blue-700",
  },
  {
    name: "WAREHOUSE",
    displayName: "Склад",
    description: "Комплектация и складской учет",
    permissions: ["warehouse", "picking"],
    color: "bg-green-100 text-green-700",
  },
]

export default function StaffPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [activeTab, setActiveTab] = useState<"staff" | "roles">("staff")

  const filteredStaff = staff.filter((member) => {
    const matchesSearch =
      member.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === "all" || member.role === roleFilter
    return matchesSearch && matchesRole
  })

  const getRoleBadge = (role: string) => {
    const roleData = roles.find((r) => r.name === role)
    return (
      <Badge className={roleData?.color || "bg-gray-100 text-gray-700"}>
        {roleData?.displayName || role}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Сотрудники</h1>
          <p className="text-gray-500">Управление персоналом и ролями</p>
        </div>
        <Button className="bg-primary text-black hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Добавить сотрудника
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <UserCog className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{staff.length}</p>
                <p className="text-sm text-gray-500">Всего сотрудников</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{staff.filter((s) => s.isActive).length}</p>
                <p className="text-sm text-gray-500">Активных</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{roles.length}</p>
                <p className="text-sm text-gray-500">Ролей</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-gray-500">Онлайн сегодня</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "staff"
              ? "text-primary border-b-2 border-primary"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("staff")}
        >
          Сотрудники
        </button>
        <button
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "roles"
              ? "text-primary border-b-2 border-primary"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("roles")}
        >
          Роли и права
        </button>
      </div>

      {activeTab === "staff" ? (
        <>
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Поиск сотрудников..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <select
                  className="px-3 py-2 border rounded-lg"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="all">Все роли</option>
                  {roles.map((role) => (
                    <option key={role.name} value={role.name}>
                      {role.displayName}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Staff List */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {filteredStaff.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                      {member.avatar}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">
                          {member.firstName} {member.lastName}
                        </h3>
                        {getRoleBadge(member.role)}
                        {!member.isActive && (
                          <Badge variant="secondary">Неактивен</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {member.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {member.phone}
                        </span>
                      </div>
                    </div>

                    <div className="text-right text-sm">
                      <p className="text-gray-500">Последний вход</p>
                      <p className="font-medium">{member.lastLogin}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" title="Редактировать">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Сбросить пароль">
                        <Key className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Удалить">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        /* Roles Tab */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map((role) => (
            <Card key={role.name}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{role.displayName}</CardTitle>
                      <p className="text-sm text-gray-500">{role.description}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="text-sm font-medium mb-2">Права доступа:</p>
                  <div className="flex flex-wrap gap-2">
                    {role.permissions.map((perm) => (
                      <Badge key={perm} variant="outline">
                        {perm === "*" ? "Полный доступ" : perm}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-500">
                    Сотрудников с этой ролью:{" "}
                    <span className="font-medium text-gray-900">
                      {staff.filter((s) => s.role === role.name).length}
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="border-dashed border-2 flex items-center justify-center min-h-[200px]">
            <Button variant="ghost" className="flex flex-col gap-2 h-auto py-8">
              <Plus className="h-8 w-8 text-gray-400" />
              <span className="text-gray-500">Добавить роль</span>
            </Button>
          </Card>
        </div>
      )}
    </div>
  )
}
