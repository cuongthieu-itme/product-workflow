'use client'

import { useMemo } from 'react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip
} from 'recharts'
import { useRequest } from '@/components/requests/request-context-firebase'

const COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Orange
  '#8b5cf6', // Purple
  '#ef4444', // Red
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#f97316' // Orange-600
]

export function DepartmentActivity() {
  const { requests, loading } = useRequest()

  const chartData = useMemo(() => {
    if (loading || !requests.length) {
      return []
    }

    // Đếm requests theo phòng ban của người tạo
    const departmentCounts: Record<string, number> = {}

    requests.forEach((request) => {
      const department =
        request.creator?.department || request.department || 'Không xác định'
      departmentCounts[department] = (departmentCounts[department] || 0) + 1
    })

    // Chuyển đổi thành format cho biểu đồ
    const data = Object.entries(departmentCounts)
      .map(([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length]
      }))
      .sort((a, b) => b.value - a.value) // Sắp xếp theo số lượng giảm dần

    return data
  }, [requests, loading])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-muted-foreground">Đang tải dữ liệu...</p>
      </div>
    )
  }

  if (!chartData.length) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-muted-foreground">Không có dữ liệu để hiển thị</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) =>
            `${name} ${(percent * 100).toFixed(0)}%`
          }
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `${value} yêu cầu`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
