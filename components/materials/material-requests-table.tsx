'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'

import { useState } from 'react'
import { useMaterialContext, type MaterialRequest } from './material-context'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  Filter,
  Search
} from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { format, parseISO, isAfter } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function MaterialRequestsTable() {
  const {
    materials,
    materialRequests,
    addMaterialRequest,
    updateMaterialRequest,
    deleteMaterialRequest,
    updateRequestStatus,
    updateMaterialQuantity
  } = useMaterialContext()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [currentRequest, setCurrentRequest] = useState<MaterialRequest | null>(
    null
  )
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedStatus, setSelectedStatus] =
    useState<MaterialRequest['status']>('pending')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<
    MaterialRequest['status'] | 'all'
  >('all')
  const [formData, setFormData] = useState<{
    materialId: string
    quantity: number
    expectedDate: Date | undefined
    supplier: string
    reason: string
    sourceCountry: string
    importPrice: number | undefined
    requestCode: string
  }>({
    materialId: '',
    quantity: 0,
    expectedDate: undefined,
    supplier: '',
    reason: '',
    sourceCountry: '',
    importPrice: undefined,
    requestCode: ''
  })

  // Lọc ra các nguyên vật liệu đang hoạt động
  const activeMaterials = materials.filter((m) => m.isActive)

  // Lọc các yêu cầu trùng lặp dựa trên ID
  const uniqueRequests = materialRequests.reduce((acc, current) => {
    const isDuplicate = acc.find(
      (item) =>
        item.materialId === current.materialId &&
        item.quantity === current.quantity &&
        item.expectedDate === current.expectedDate &&
        item.supplier === current.supplier &&
        item.requestCode === current.requestCode
    )

    if (!isDuplicate) {
      return [...acc, current]
    }
    return acc
  }, [] as MaterialRequest[])

  // Lọc yêu cầu theo trạng thái và từ khóa tìm kiếm
  const filteredRequests = uniqueRequests.filter((request) => {
    const matchesStatus =
      statusFilter === 'all' || request.status === statusFilter
    const matchesSearch =
      request.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.supplier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requestCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.sourceCountry?.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesStatus && matchesSearch
  })

  // Xử lý thêm đơn yêu cầu mới
  const handleAddRequest = () => {
    if (
      !formData.materialId ||
      formData.quantity <= 0 ||
      !formData.expectedDate
    ) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ thông tin bắt buộc',
        variant: 'destructive'
      })
      return
    }

    const material = materials.find((m) => m.id === formData.materialId)
    if (!material) {
      toast({
        title: 'Lỗi',
        description: 'Không tìm thấy nguyên vật liệu',
        variant: 'destructive'
      })
      return
    }

    addMaterialRequest({
      materialId: formData.materialId,
      quantity: formData.quantity,
      expectedDate: formData.expectedDate.toISOString(),
      supplier: formData.supplier,
      status: 'pending',
      reason: formData.reason,
      sourceCountry: formData.sourceCountry || material.origin,
      importPrice: formData.importPrice || material.importPrice,
      requestCode: formData.requestCode
    })

    toast({
      title: 'Thành công',
      description: 'Đã tạo đơn yêu cầu nhập nguyên vật liệu'
    })

    setIsAddDialogOpen(false)
    resetForm()
  }

  // Xử lý cập nhật đơn yêu cầu
  const handleUpdateRequest = () => {
    if (
      !currentRequest ||
      !formData.materialId ||
      formData.quantity <= 0 ||
      !formData.expectedDate
    ) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ thông tin bắt buộc',
        variant: 'destructive'
      })
      return
    }

    updateMaterialRequest(currentRequest.id, {
      materialId: formData.materialId,
      quantity: formData.quantity,
      expectedDate: formData.expectedDate.toISOString(),
      supplier: formData.supplier,
      reason: formData.reason,
      sourceCountry: formData.sourceCountry,
      importPrice: formData.importPrice,
      requestCode: formData.requestCode
    })

    toast({
      title: 'Thành công',
      description: 'Đã cập nhật thông tin đơn yêu cầu'
    })

    setIsEditDialogOpen(false)
    resetForm()
  }

  // Xử lý xóa đơn yêu cầu
  const handleDeleteRequest = () => {
    if (!currentRequest) return

    deleteMaterialRequest(currentRequest.id)

    toast({
      title: 'Thành công',
      description: 'Đã xóa đơn yêu cầu'
    })

    setIsDeleteDialogOpen(false)
  }

  // Xử lý cập nhật trạng thái đơn yêu cầu
  const handleUpdateStatus = () => {
    if (!currentRequest) return

    updateRequestStatus(currentRequest.id, selectedStatus, formData.reason)

    // Nếu trạng thái là "completed", cập nhật số lượng nguyên vật liệu
    if (selectedStatus === 'completed') {
      updateMaterialQuantity(
        currentRequest.materialId,
        currentRequest.quantity,
        true
      )

      toast({
        title: 'Thành công',
        description: `Đã cập nhật trạng thái đơn yêu cầu thành "${getStatusText(selectedStatus)}" và cập nhật số lượng nguyên vật liệu`
      })
    } else {
      toast({
        title: 'Thành công',
        description: `Đã cập nhật trạng thái đơn yêu cầu thành "${getStatusText(selectedStatus)}"`
      })
    }

    setIsStatusDialogOpen(false)
    resetForm()
  }

  // Mở dialog chỉnh sửa
  const openEditDialog = (request: MaterialRequest) => {
    setCurrentRequest(request)
    setFormData({
      materialId: request.materialId,
      quantity: request.quantity,
      expectedDate: parseISO(request.expectedDate),
      supplier: request.supplier || '',
      reason: request.reason || '',
      sourceCountry: request.sourceCountry || '',
      importPrice: request.importPrice,
      requestCode: request.requestCode || ''
    })
    setIsEditDialogOpen(true)
  }

  // Mở dialog xóa
  const openDeleteDialog = (request: MaterialRequest) => {
    setCurrentRequest(request)
    setIsDeleteDialogOpen(true)
  }

  // Mở dialog cập nhật trạng thái
  const openStatusDialog = (request: MaterialRequest) => {
    setCurrentRequest(request)
    setSelectedStatus(request.status)
    setFormData({
      ...formData,
      reason: request.reason || '',
      materialId: request.materialId,
      quantity: request.quantity,
      expectedDate: parseISO(request.expectedDate),
      supplier: request.supplier || '',
      sourceCountry: request.sourceCountry || '',
      importPrice: request.importPrice,
      requestCode: request.requestCode || ''
    })
    setIsStatusDialogOpen(true)
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      materialId: '',
      quantity: 0,
      expectedDate: undefined,
      supplier: '',
      reason: '',
      sourceCountry: '',
      importPrice: undefined,
      requestCode: ''
    })
    setSelectedDate(undefined)
    setSelectedStatus('pending')
    setCurrentRequest(null)
  }

  // Lấy text hiển thị cho trạng thái
  const getStatusText = (status: MaterialRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'Đang chờ'
      case 'approved':
        return 'Đã duyệt'
      case 'completed':
        return 'Đã nhập thành công'
      case 'delayed':
        return 'Đã trễ'
      default:
        return status
    }
  }

  // Lấy màu cho badge trạng thái
  const getStatusVariant = (status: MaterialRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'secondary'
      case 'approved':
        return 'default'
      case 'completed':
        return 'success'
      case 'delayed':
        return 'destructive'
      default:
        return 'default'
    }
  }

  // Kiểm tra xem đơn yêu cầu có trễ không
  const isRequestDelayed = (request: MaterialRequest) => {
    if (request.status === 'completed' || request.status === 'delayed')
      return false
    return isAfter(new Date(), parseISO(request.expectedDate))
  }

  // Nhóm yêu cầu theo trạng thái
  const pendingRequests = filteredRequests.filter(
    (req) => req.status === 'pending' || req.status === 'approved'
  )
  const completedRequests = filteredRequests.filter(
    (req) => req.status === 'completed'
  )
  const delayedRequests = filteredRequests.filter(
    (req) => req.status === 'delayed' || isRequestDelayed(req)
  )

  // Hiển thị bảng yêu cầu
  const renderRequestsTable = (requests: MaterialRequest[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nguyên vật liệu</TableHead>
          <TableHead>Số lượng</TableHead>
          <TableHead>Ngày dự kiến</TableHead>
          <TableHead>Nhà cung cấp</TableHead>
          <TableHead>Xuất xứ</TableHead>
          <TableHead>Giá nhập (VNĐ)</TableHead>
          <TableHead>Mã yêu cầu</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead>Thao tác</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={9}
              className="text-center py-4 text-muted-foreground"
            >
              Không có đơn yêu cầu nào
            </TableCell>
          </TableRow>
        ) : (
          requests.map((request) => (
            <TableRow
              key={request.id}
              className={
                isRequestDelayed(request) && request.status !== 'delayed'
                  ? 'bg-red-50'
                  : ''
              }
            >
              <TableCell>{request.materialName}</TableCell>
              <TableCell>{request.quantity}</TableCell>
              <TableCell>
                {format(parseISO(request.expectedDate), 'dd/MM/yyyy')}
              </TableCell>
              <TableCell>{request.supplier || 'Không có'}</TableCell>
              <TableCell>{request.sourceCountry || 'Không có'}</TableCell>
              <TableCell>
                {request.importPrice
                  ? `${request.importPrice.toLocaleString()}`
                  : 'Không có'}
              </TableCell>
              <TableCell>{request.requestCode || 'Không có'}</TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(request.status) as any}>
                  {getStatusText(request.status)}
                </Badge>
                {isRequestDelayed(request) && request.status !== 'delayed' && (
                  <Badge
                    variant="outline"
                    className="ml-2 bg-red-50 text-red-500 border-red-200"
                  >
                    Trễ hạn
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => openEditDialog(request)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => openDeleteDialog(request)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => openStatusDialog(request)}
                  >
                    {request.status === 'completed' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : request.status === 'delayed' ? (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Đơn yêu cầu nhập nguyên vật liệu</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Tạo đơn yêu cầu
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Tìm kiếm và lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên, nhà cung cấp, mã yêu cầu..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-[200px]">
              <Select
                value={statusFilter}
                onValueChange={(value: MaterialRequest['status'] | 'all') =>
                  setStatusFilter(value)
                }
              >
                <SelectTrigger>
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Lọc theo trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="pending">Đang chờ</SelectItem>
                  <SelectItem value="approved">Đã duyệt</SelectItem>
                  <SelectItem value="completed">Đã nhập thành công</SelectItem>
                  <SelectItem value="delayed">Đã trễ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            Đang xử lý ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Đã hoàn thành ({completedRequests.length})
          </TabsTrigger>
          <TabsTrigger value="delayed">
            Trễ hạn ({delayedRequests.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="rounded-md border mt-4">
          {renderRequestsTable(pendingRequests)}
        </TabsContent>
        <TabsContent value="completed" className="rounded-md border mt-4">
          {renderRequestsTable(completedRequests)}
        </TabsContent>
        <TabsContent value="delayed" className="rounded-md border mt-4">
          {renderRequestsTable(delayedRequests)}
        </TabsContent>
      </Tabs>

      {/* Dialog thêm đơn yêu cầu */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo đơn yêu cầu nhập nguyên vật liệu</DialogTitle>
            <DialogDescription>
              Nhập thông tin đơn yêu cầu mới vào form dưới đây.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="material" className="text-right">
                Nguyên vật liệu
              </Label>
              <Select
                value={formData.materialId}
                onValueChange={(value) => {
                  const material = materials.find((m) => m.id === value)
                  setFormData({
                    ...formData,
                    materialId: value,
                    sourceCountry: material?.origin || '',
                    importPrice: material?.importPrice
                  })
                }}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn nguyên vật liệu" />
                </SelectTrigger>
                <SelectContent>
                  {activeMaterials.map((material) => (
                    <SelectItem key={material.id} value={material.id}>
                      {material.name} ({material.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Số lượng
              </Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: Number(e.target.value) })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expectedDate" className="text-right">
                Ngày dự kiến
              </Label>
              <div className="col-span-3">
                <DatePicker
                  date={formData.expectedDate}
                  setDate={(date) =>
                    setFormData({ ...formData, expectedDate: date })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="supplier" className="text-right">
                Nhà cung cấp
              </Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) =>
                  setFormData({ ...formData, supplier: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sourceCountry" className="text-right">
                Quốc gia nguồn nhập
              </Label>
              <Input
                id="sourceCountry"
                value={formData.sourceCountry}
                onChange={(e) =>
                  setFormData({ ...formData, sourceCountry: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="importPrice" className="text-right">
                Giá nhập (VNĐ)
              </Label>
              <Input
                id="importPrice"
                type="number"
                value={formData.importPrice || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    importPrice: e.target.value
                      ? Number(e.target.value)
                      : undefined
                  })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="requestCode" className="text-right">
                Mã yêu cầu
              </Label>
              <Input
                id="requestCode"
                value={formData.requestCode}
                onChange={(e) =>
                  setFormData({ ...formData, requestCode: e.target.value })
                }
                className="col-span-3"
                placeholder="Nhập mã yêu cầu liên quan (nếu có)"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reason" className="text-right">
                Lý do
              </Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleAddRequest}>Tạo đơn</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog chỉnh sửa đơn yêu cầu */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa đơn yêu cầu</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin đơn yêu cầu nhập nguyên vật liệu.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-material" className="text-right">
                Nguyên vật liệu
              </Label>
              <Select
                value={formData.materialId}
                onValueChange={(value) => {
                  const material = materials.find((m) => m.id === value)
                  setFormData({
                    ...formData,
                    materialId: value,
                    sourceCountry: material?.origin || formData.sourceCountry,
                    importPrice: formData.importPrice || material?.importPrice
                  })
                }}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn nguyên vật liệu" />
                </SelectTrigger>
                <SelectContent>
                  {activeMaterials.map((material) => (
                    <SelectItem key={material.id} value={material.id}>
                      {material.name} ({material.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-quantity" className="text-right">
                Số lượng
              </Label>
              <Input
                id="edit-quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: Number(e.target.value) })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-expectedDate" className="text-right">
                Ngày dự kiến
              </Label>
              <div className="col-span-3">
                <DatePicker
                  date={formData.expectedDate}
                  setDate={(date) =>
                    setFormData({ ...formData, expectedDate: date })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-supplier" className="text-right">
                Nhà cung cấp
              </Label>
              <Input
                id="edit-supplier"
                value={formData.supplier}
                onChange={(e) =>
                  setFormData({ ...formData, supplier: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-sourceCountry" className="text-right">
                Quốc gia nguồn nhập
              </Label>
              <Input
                id="edit-sourceCountry"
                value={formData.sourceCountry}
                onChange={(e) =>
                  setFormData({ ...formData, sourceCountry: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-importPrice" className="text-right">
                Giá nhập (VNĐ)
              </Label>
              <Input
                id="edit-importPrice"
                type="number"
                value={formData.importPrice || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    importPrice: e.target.value
                      ? Number(e.target.value)
                      : undefined
                  })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-requestCode" className="text-right">
                Mã yêu cầu
              </Label>
              <Input
                id="edit-requestCode"
                value={formData.requestCode}
                onChange={(e) =>
                  setFormData({ ...formData, requestCode: e.target.value })
                }
                className="col-span-3"
                placeholder="Nhập mã yêu cầu liên quan (nếu có)"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-reason" className="text-right">
                Lý do
              </Label>
              <Textarea
                id="edit-reason"
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button onClick={handleUpdateRequest}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog xóa đơn yêu cầu */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa đơn yêu cầu nhập nguyên vật liệu này
              không? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteRequest}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog cập nhật trạng thái */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật trạng thái</DialogTitle>
            <DialogDescription>
              Cập nhật trạng thái đơn yêu cầu nhập nguyên vật liệu.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Trạng thái
              </Label>
              <Select
                value={selectedStatus}
                onValueChange={(value: MaterialRequest['status']) =>
                  setSelectedStatus(value)
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Đang chờ</SelectItem>
                  <SelectItem value="approved">Đã duyệt</SelectItem>
                  <SelectItem value="completed">Đã nhập thành công</SelectItem>
                  <SelectItem value="delayed">Đã trễ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {selectedStatus === 'delayed' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reason" className="text-right">
                  Lý do
                </Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
            )}
            {selectedStatus === 'completed' && (
              <div className="space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="col-span-4">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Khi chuyển trạng thái thành "Đã nhập thành công", số
                        lượng nguyên vật liệu sẽ được cập nhật tự động.
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStatusDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button onClick={handleUpdateStatus}>Cập nhật</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
