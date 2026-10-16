"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

export type SalesPoint = { label: string; revenue: number; orders: number }

// Один ряд — один цвет; контраст к белому фону проверен валидатором палитры
const BAR = "#65a30d"

const compact = (n: number) =>
  n >= 1e9 ? `${+(n / 1e9).toFixed(1)} млрд` : n >= 1e6 ? `${+(n / 1e6).toFixed(1)} млн` : n >= 1e3 ? `${Math.round(n / 1e3)} тыс` : String(n)

export function SalesChart({ data }: { data: SalesPoint[] }) {
  return (
    <div className="h-72 w-full" role="img" aria-label="Выручка по периодам">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap={2}>
          <CartesianGrid vertical={false} stroke="#eef0f2" />
          <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: "#d1d5db" }} tick={{ fontSize: 12, fill: "#6b7280" }} interval="preserveStartEnd" minTickGap={12} />
          <YAxis tickFormatter={compact} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} width={56} />
          <Tooltip
            cursor={{ fill: "rgba(0,0,0,0.04)" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const p = payload[0].payload as SalesPoint
              return (
                <div className="rounded-lg border bg-white px-3 py-2 text-sm shadow-md">
                  <p className="font-medium">{p.label}</p>
                  <p>Выручка: <b>{p.revenue.toLocaleString("ru-RU")} сум</b></p>
                  <p className="text-gray-500">Заказов: {p.orders}</p>
                </div>
              )
            }}
          />
          <Bar dataKey="revenue" fill={BAR} radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
