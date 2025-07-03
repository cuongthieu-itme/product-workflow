'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye, Edit, BarChart } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

// Dữ liệu mẫu cho chiến dịch marketing
const campaigns = [
  {
    id: '1',
    name: 'Ra mắt Ghế Ergonomic Pro',
    status: 'active',
    startDate: new Date(2023, 4, 1),
    endDate: new Date(2023, 5, 15),
    budget: 50000000,
    spent: 25000000,
    channels: ['social', 'email', 'website'],
    progress: 50
  },
  {
    id: '2',
    name: 'Khuyến mãi Bàn Làm Việc Thông Minh',
    status: 'planned',
    startDate: new Date(2023, 5, 1),
    endDate: new Date(2023, 6, 15),
    budget: 30000000,
    spent: 0,
    channels: ['social', 'website'],
    progress: 0
  },
  {
    id: '3',
    name: 'Quảng cáo Đèn Bàn LED Thông Minh',
    status: 'completed',
    startDate: new Date(2023, 2, 1),
    endDate: new Date(2023, 3, 15),
    budget: 20000000,
    spent: 20000000,
    channels: ['social', 'email', 'offline'],
    progress: 100
  },
  {
    id: '4',
    name: 'Giới thiệu Kệ Sách Đa Năng',
    status: 'active',
    startDate: new Date(2023, 3, 15),
    endDate: new Date(2023, 5, 1),
    budget: 15000000,
    spent: 10000000,
    channels: ['social', 'website'],
    progress: 67
  }
]

// Cấu hình hiển thị cho các trạng thái
const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: 'Đang Hoạt Động', color: 'bg-green-500' },
  planned: { label: 'Lên Kế Hoạch', color: 'bg-blue-500' },
  completed: { label: 'Đã Hoàn Thành', color: 'bg-gray-500' },
  paused: { label: 'Tạm Dừng', color: 'bg-yellow-500' }
}

// Cấu hình hiển thị cho các kênh
const channelConfig: Record<string, string> = {
  social: 'Mạng xã hội',
  email: 'Email',
  website: 'Website',
  offline: 'Ngoại tuyến'
}

export function MarketingCampaignsTable() {
  // Hàm định dạng ngày tháng
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date)
  }

  // Hàm định dạng tiền tệ
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Tên Chiến Dịch</TableHead>
            <TableHead>Trạng Thái</TableHead>
            <TableHead>Thời Gian</TableHead>
            <TableHead>Ngân Sách</TableHead>
            <TableHead>Tiến Độ</TableHead>
            <TableHead className="text-right">Thao Tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => {
            const status = statusConfig[campaign.status]
            return (
              <TableRow key={campaign.id}>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{campaign.name}</span>
                    <span className="text-xs text-muted-foreground">
                      Kênh:{' '}
                      {campaign.channels
                        .map((c) => channelConfig[c])
                        .join(', ')}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`${status.color} text-white`}>
                    {status.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">
                      Bắt đầu: {formatDate(campaign.startDate)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Kết thúc: {formatDate(campaign.endDate)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{formatCurrency(campaign.budget)}</span>
                    <span className="text-xs text-muted-foreground">
                      Đã chi: {formatCurrency(campaign.spent)} (
                      {Math.round((campaign.spent / campaign.budget) * 100)}%)
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Progress value={campaign.progress} className="h-2" />
                    <span className="text-xs text-muted-foreground">
                      {campaign.progress}% hoàn thành
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      Xem
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-4 w-4" />
                      Sửa
                    </Button>
                    <Button variant="outline" size="sm">
                      <BarChart className="mr-2 h-4 w-4" />
                      Phân Tích
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
