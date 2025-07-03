'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

// Dữ liệu mẫu cho biểu đồ hiệu suất sản phẩm
const data = [
  {
    name: 'Tháng 1',
    'Sản phẩm mới': 4,
    'Đang phát triển': 7,
    'Đã ra mắt': 2,
    'Thời gian phát triển': 45
  },
  {
    name: 'Tháng 2',
    'Sản phẩm mới': 3,
    'Đang phát triển': 8,
    'Đã ra mắt': 3,
    'Thời gian phát triển': 42
  },
  {
    name: 'Tháng 3',
    'Sản phẩm mới': 5,
    'Đang phát triển': 9,
    'Đã ra mắt': 4,
    'Thời gian phát triển': 40
  },
  {
    name: 'Tháng 4',
    'Sản phẩm mới': 6,
    'Đang phát triển': 10,
    'Đã ra mắt': 5,
    'Thời gian phát triển': 38
  },
  {
    name: 'Tháng 5',
    'Sản phẩm mới': 4,
    'Đang phát triển': 8,
    'Đã ra mắt': 6,
    'Thời gian phát triển': 35
  },
  {
    name: 'Tháng 6',
    'Sản phẩm mới': 3,
    'Đang phát triển': 7,
    'Đã ra mắt': 4,
    'Thời gian phát triển': 32
  }
]

export function ProductPerformanceChart() {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
        <Tooltip />
        <Legend />
        <Bar yAxisId="left" dataKey="Sản phẩm mới" fill="#8884d8" />
        <Bar yAxisId="left" dataKey="Đang phát triển" fill="#82ca9d" />
        <Bar yAxisId="left" dataKey="Đã ra mắt" fill="#ffc658" />
        <Bar yAxisId="right" dataKey="Thời gian phát triển" fill="#ff8042" />
      </BarChart>
    </ResponsiveContainer>
  )
}
