'use client'

import {
  Line,
  LineChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

// Dữ liệu mẫu cho biểu đồ hiệu suất marketing
const data = [
  {
    name: 'Tháng 1',
    'Chi phí': 20000000,
    'Doanh thu': 45000000,
    ROI: 2.25
  },
  {
    name: 'Tháng 2',
    'Chi phí': 25000000,
    'Doanh thu': 52000000,
    ROI: 2.08
  },
  {
    name: 'Tháng 3',
    'Chi phí': 30000000,
    'Doanh thu': 68000000,
    ROI: 2.27
  },
  {
    name: 'Tháng 4',
    'Chi phí': 35000000,
    'Doanh thu': 85000000,
    ROI: 2.43
  },
  {
    name: 'Tháng 5',
    'Chi phí': 40000000,
    'Doanh thu': 95000000,
    ROI: 2.38
  },
  {
    name: 'Tháng 6',
    'Chi phí': 30000000,
    'Doanh thu': 75000000,
    ROI: 2.5
  }
]

export function MarketingPerformanceChart() {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis yAxisId="left" orientation="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip
          formatter={(value, name) => {
            if (name === 'ROI') return [value, name]
            return [
              new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
                maximumFractionDigits: 0
              }).format(value as number),
              name
            ]
          }}
        />
        <Legend />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="Chi phí"
          stroke="#8884d8"
          activeDot={{ r: 8 }}
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="Doanh thu"
          stroke="#82ca9d"
        />
        <Line yAxisId="right" type="monotone" dataKey="ROI" stroke="#ff7300" />
      </LineChart>
    </ResponsiveContainer>
  )
}
