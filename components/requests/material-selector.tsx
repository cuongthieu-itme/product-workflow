'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import {
  useMaterialContext,
  type Material
} from '../materials/material-context-firebase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'
import {
  Plus,
  Trash2,
  AlertCircle,
  Info,
  Calendar,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MaterialWithImport } from './request-context'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/components/ui/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface MaterialSelectorProps {
  selectedMaterials: MaterialWithImport[]
  onSelectMaterials: (materials: MaterialWithImport[]) => void
  requestCode: string
}

export function MaterialSelector({
  selectedMaterials,
  onSelectMaterials,
  requestCode
}: MaterialSelectorProps) {
  const { materials, addMaterial, loading, error } = useMaterialContext()
  const [showDialog, setShowDialog] = useState(false)
  const [showNewMaterialDialog, setShowNewMaterialDialog] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [selectedMaterialType, setSelectedMaterialType] = useState<
    'material' | 'accessory'
  >('material')
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(
    null
  )
  const [quantity, setQuantity] = useState<number>(1)
  const [showImportForm, setShowImportForm] = useState<string | null>(null)
  const [importQuantity, setImportQuantity] = useState<number>(0)
  const [importSupplier, setImportSupplier] = useState<string>('')
  const [importReason, setImportReason] = useState<string>('')
  const [importDate, setImportDate] = useState<Date>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  ) // Mặc định 7 ngày
  const [importPrice, setImportPrice] = useState<number | undefined>(undefined)
  const [sourceCountry, setSourceCountry] = useState<string>('')
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')

  // State cho form thêm nguyên vật liệu mới
  const [newMaterialName, setNewMaterialName] = useState('')
  const [newMaterialCode, setNewMaterialCode] = useState('')
  const [newMaterialUnit, setNewMaterialUnit] = useState('')
  const [newMaterialDescription, setNewMaterialDescription] = useState('')
  const [newMaterialOrigin, setNewMaterialOrigin] = useState('Việt Nam')
  const [newMaterialImportPrice, setNewMaterialImportPrice] = useState<
    number | undefined
  >(undefined)
  const [newMaterialMinQuantity, setNewMaterialMinQuantity] =
    useState<number>(10)
  const [createImportRequestForNew, setCreateImportRequestForNew] =
    useState(true)
  const [newMaterialImportQuantity, setNewMaterialImportQuantity] =
    useState<number>(0)
  const [newMaterialImportDate, setNewMaterialImportDate] = useState<Date>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  )
  const [newMaterialImportSupplier, setNewMaterialImportSupplier] = useState('')
  const [newMaterialImportReason, setNewMaterialImportReason] = useState('')
  const [isSubmittingNewMaterial, setIsSubmittingNewMaterial] = useState(false)

  // Tạo mã nguyên vật liệu tự động
  useEffect(() => {
    if (showNewMaterialDialog && !newMaterialCode) {
      const timestamp = Date.now().toString().slice(-6)
      const prefix = 'NVL'
      const randomCode = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0')
      setNewMaterialCode(`${prefix}${timestamp}${randomCode}`)
    }
  }, [showNewMaterialDialog, newMaterialCode])

  // Lọc danh sách nguyên vật liệu theo từ khóa tìm kiếm và loại
  const filteredMaterials = (materials || []).filter((material) => {
    // Lọc theo loại nguyên vật liệu
    const typeMatch =
      material.type === selectedMaterialType ||
      (!material.type && selectedMaterialType === 'material')

    if (!typeMatch) return false

    // Lọc theo từ khóa tìm kiếm
    if (!searchValue.trim()) return true

    const searchLower = searchValue.toLowerCase()
    const nameLower = material.name.toLowerCase()
    const codeLower = material.code.toLowerCase()
    const descLower = material.description
      ? material.description.toLowerCase()
      : ''

    return (
      nameLower.includes(searchLower) ||
      codeLower.includes(searchLower) ||
      descLower.includes(searchLower)
    )
  })

  // Xử lý thêm nguyên vật liệu vào danh sách đã chọn
  const handleAddMaterial = () => {
    if (selectedMaterial && quantity > 0) {
      // Kiểm tra xem nguyên vật liệu đã được chọn chưa
      const existingIndex = selectedMaterials.findIndex(
        (m) => m.id === selectedMaterial.id
      )

      if (existingIndex >= 0) {
        // Nếu đã có, cập nhật số lượng
        const updatedMaterials = [...selectedMaterials]
        updatedMaterials[existingIndex] = {
          ...updatedMaterials[existingIndex],
          quantity: quantity
        }
        onSelectMaterials(updatedMaterials)
      } else {
        // Nếu chưa có, thêm mới
        onSelectMaterials([
          ...selectedMaterials,
          {
            ...selectedMaterial,
            quantity: quantity
          }
        ])
      }

      // Reset form
      setSelectedMaterial(null)
      setQuantity(1)
      setShowDialog(false)
      setSearchValue('')

      toast({
        title: 'Thành công',
        description: `Đã thêm ${selectedMaterial.name} vào danh sách`
      })
    }
  }

  // Xử lý thêm nguyên vật liệu mới
  const handleAddNewMaterial = async () => {
    if (
      !newMaterialName.trim() ||
      !newMaterialCode.trim() ||
      !newMaterialUnit.trim()
    ) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ thông tin bắt buộc',
        variant: 'destructive'
      })
      return
    }

    setIsSubmittingNewMaterial(true)

    try {
      // Thêm nguyên vật liệu mới vào database
      const newMaterialData = {
        name: newMaterialName.trim(),
        code: newMaterialCode.trim(),
        quantity: 0, // Mặc định là 0 vì chưa có trong kho
        unit: newMaterialUnit.trim(),
        description: newMaterialDescription.trim(),
        origin: newMaterialOrigin.trim(),
        images: [],
        importPrice: newMaterialImportPrice,
        minQuantity: newMaterialMinQuantity,
        type: selectedMaterialType // Thêm type dựa trên lựa chọn hiện tại
      }

      const newMaterialId = await addMaterial(newMaterialData)

      // Thêm nguyên vật liệu mới vào danh sách đã chọn
      const newMaterial: MaterialWithImport = {
        id: newMaterialId,
        ...newMaterialData,
        isActive: true
      }

      // Nếu người dùng chọn tạo yêu cầu nhập
      if (createImportRequestForNew) {
        newMaterial.createImportRequest = true
        newMaterial.importQuantity = newMaterialImportQuantity || 10
        newMaterial.importDate = newMaterialImportDate.toISOString()
        newMaterial.importSupplier = newMaterialImportSupplier
        newMaterial.importReason =
          newMaterialImportReason || `Nguyên vật liệu mới: ${newMaterialName}`
        newMaterial.sourceCountry = newMaterialOrigin
        newMaterial.importPrice = newMaterialImportPrice
      }

      onSelectMaterials([...selectedMaterials, newMaterial])

      toast({
        title: 'Thành công',
        description: 'Đã thêm nguyên vật liệu mới'
      })

      // Reset form
      setNewMaterialName('')
      setNewMaterialCode('')
      setNewMaterialUnit('')
      setNewMaterialDescription('')
      setNewMaterialOrigin('Việt Nam')
      setNewMaterialImportPrice(undefined)
      setNewMaterialMinQuantity(10)
      setCreateImportRequestForNew(true)
      setNewMaterialImportQuantity(0)
      setNewMaterialImportSupplier('')
      setNewMaterialImportReason('')
      setShowNewMaterialDialog(false)
    } catch (error) {
      console.error('Lỗi khi thêm nguyên vật liệu mới:', error)
      toast({
        title: 'Lỗi',
        description: 'Đã xảy ra lỗi khi thêm nguyên vật liệu mới',
        variant: 'destructive'
      })
    } finally {
      setIsSubmittingNewMaterial(false)
    }
  }

  // Xử lý xóa nguyên vật liệu khỏi danh sách đã chọn
  const handleRemoveMaterial = (id: string) => {
    onSelectMaterials(selectedMaterials.filter((m) => m.id !== id))
  }

  // Xử lý tạo yêu cầu nhập nguyên vật liệu
  const handleCreateImportRequest = (materialId: string) => {
    if (importQuantity <= 0) {
      alert('Số lượng nhập phải lớn hơn 0')
      return
    }

    const updatedMaterials = selectedMaterials.map((m) => {
      if (m.id === materialId) {
        return {
          ...m,
          importQuantity: importQuantity,
          createImportRequest: true,
          importSupplier: importSupplier,
          importReason: importReason,
          importDate: importDate.toISOString(),
          importPrice: importPrice,
          sourceCountry: sourceCountry || m.origin
        }
      }
      return m
    })

    onSelectMaterials(updatedMaterials)
    setShowImportForm(null)
    setImportQuantity(0)
    setImportSupplier('')
    setImportReason('')
    setImportDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
    setImportPrice(undefined)
    setSourceCountry('')
  }

  // Xử lý hủy yêu cầu nhập nguyên vật liệu
  const handleCancelImportRequest = (materialId: string) => {
    const updatedMaterials = selectedMaterials.map((m) => {
      if (m.id === materialId) {
        const {
          importQuantity,
          createImportRequest,
          importSupplier,
          importReason,
          importDate,
          importPrice,
          sourceCountry,
          ...rest
        } = m
        return rest
      }
      return m
    })

    onSelectMaterials(updatedMaterials)
  }

  // Xử lý hiển thị form tạo yêu cầu nhập
  const handleShowImportForm = (material: MaterialWithImport) => {
    setShowImportForm(material.id)
    setImportQuantity(material.quantity)
    setImportSupplier(material.importSupplier || '')
    setImportReason(material.importReason || '')
    setImportDate(
      material.importDate
        ? new Date(material.importDate)
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    )
    setImportPrice(material.importPrice || undefined)
    setSourceCountry(material.sourceCountry || material.origin || '')
  }

  // Reset selected material when changing material type
  useEffect(() => {
    setSelectedMaterial(null)
    setSearchValue('')
  }, [selectedMaterialType])

  const handleMaterialSelect = (material: Material) => {
    setSelectedMaterial(material)
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    if (!isNaN(value)) {
      setQuantity(value)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {/* Dialog chọn nguyên vật liệu có sẵn */}
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" className="shrink-0">
                <Plus className="h-4 w-4 mr-1" /> Thêm nguyên vật liệu
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Thêm nguyên vật liệu</DialogTitle>
              </DialogHeader>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Lỗi khi tải dữ liệu: {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid gap-4 py-4">
                <RadioGroup
                  value={selectedMaterialType}
                  className="flex flex-col space-y-1.5"
                  onValueChange={(value) =>
                    setSelectedMaterialType(value as 'material' | 'accessory')
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="material" id="material" />
                    <Label htmlFor="material">Nguyên liệu</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="accessory" id="accessory" />
                    <Label htmlFor="accessory">Phụ kiện</Label>
                  </div>
                </RadioGroup>

                <div className="grid gap-2">
                  <Label htmlFor="search">Tìm nguyên vật liệu</Label>
                  <Input
                    type="search"
                    id="search"
                    placeholder="Tìm theo tên, mã..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                  />
                </div>

                <div className="max-h-80 overflow-auto border rounded-md">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Đang tải dữ liệu...</span>
                    </div>
                  ) : filteredMaterials && filteredMaterials.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {filteredMaterials.map((material) => (
                        <div
                          key={material.id}
                          className={cn(
                            'p-3 cursor-pointer hover:bg-gray-100 transition-colors',
                            selectedMaterial?.id === material.id
                              ? 'bg-blue-50 border-l-4 border-blue-500'
                              : ''
                          )}
                          onClick={() => handleMaterialSelect(material)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">{material.name}</div>
                              <div className="text-sm text-gray-500">
                                Mã: {material.code} | Đơn vị: {material.unit}
                              </div>
                              {material.description && (
                                <div className="text-xs text-gray-400 mt-1">
                                  {material.description}
                                </div>
                              )}
                              <div className="text-xs text-gray-400 mt-1">
                                Xuất xứ: {material.origin} | Loại:{' '}
                                {material.type === 'accessory'
                                  ? 'Phụ kiện'
                                  : 'Nguyên liệu'}
                              </div>
                            </div>
                            <div className="text-right">
                              <div
                                className={cn(
                                  'text-sm font-medium',
                                  material.quantity > 0
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                )}
                              >
                                {material.quantity > 0
                                  ? 'Còn hàng'
                                  : 'Hết hàng'}
                              </div>
                              <div className="text-xs text-gray-500">
                                SL: {material.quantity} {material.unit}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      {searchValue
                        ? `Không tìm thấy ${selectedMaterialType === 'material' ? 'nguyên liệu' : 'phụ kiện'} phù hợp`
                        : `Không có ${selectedMaterialType === 'material' ? 'nguyên liệu' : 'phụ kiện'} nào`}
                    </div>
                  )}
                </div>

                {selectedMaterial && (
                  <div className="p-3 bg-blue-50 rounded-md border">
                    <div className="text-sm font-medium text-blue-900">
                      Đã chọn: {selectedMaterial.name}
                    </div>
                    <div className="text-xs text-blue-700 mt-1">
                      Mã: {selectedMaterial.code} | Đơn vị:{' '}
                      {selectedMaterial.unit} | Tồn kho:{' '}
                      {selectedMaterial.quantity}
                    </div>
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="quantity">Số lượng cần dùng</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      id="quantity"
                      value={quantity}
                      min="1"
                      onChange={handleQuantityChange}
                      className="w-32"
                    />
                    {selectedMaterial && (
                      <span className="text-sm text-gray-500">
                        {selectedMaterial.unit}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDialog(false)}
                >
                  Hủy
                </Button>
                <Button
                  type="button"
                  onClick={handleAddMaterial}
                  disabled={!selectedMaterial || quantity <= 0}
                >
                  Thêm vào danh sách
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dialog tạo nguyên vật liệu mới */}
          <Dialog
            open={showNewMaterialDialog}
            onOpenChange={setShowNewMaterialDialog}
          >
            <DialogTrigger asChild>
              <Button type="button" variant="secondary" className="shrink-0">
                <Plus className="h-4 w-4 mr-1" /> Thêm nguyên vật liệu mới
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Thêm nguyên vật liệu mới</DialogTitle>
              </DialogHeader>

              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
                  <TabsTrigger value="import" disabled={!newMaterialName}>
                    Yêu cầu nhập
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="mt-4">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="newMaterialName">
                        Tên nguyên vật liệu{' '}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="newMaterialName"
                        value={newMaterialName}
                        onChange={(e) => setNewMaterialName(e.target.value)}
                        placeholder="Nhập tên nguyên vật liệu"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="newMaterialCode">
                          Mã <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="newMaterialCode"
                          value={newMaterialCode}
                          onChange={(e) => setNewMaterialCode(e.target.value)}
                          placeholder="Mã nguyên vật liệu"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="newMaterialUnit">
                          Đơn vị <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="newMaterialUnit"
                          value={newMaterialUnit}
                          onChange={(e) => setNewMaterialUnit(e.target.value)}
                          placeholder="kg, m, cái..."
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="newMaterialOrigin">Xuất xứ</Label>
                        <Input
                          id="newMaterialOrigin"
                          value={newMaterialOrigin}
                          onChange={(e) => setNewMaterialOrigin(e.target.value)}
                          placeholder="Xuất xứ"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="newMaterialImportPrice">
                          Giá nhập (VNĐ)
                        </Label>
                        <Input
                          id="newMaterialImportPrice"
                          type="number"
                          value={newMaterialImportPrice || ''}
                          onChange={(e) =>
                            setNewMaterialImportPrice(
                              e.target.value
                                ? Number(e.target.value)
                                : undefined
                            )
                          }
                          placeholder="Giá nhập"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="newMaterialDescription">Mô tả</Label>
                      <Textarea
                        id="newMaterialDescription"
                        value={newMaterialDescription}
                        onChange={(e) =>
                          setNewMaterialDescription(e.target.value)
                        }
                        placeholder="Mô tả chi tiết"
                        rows={2}
                      />
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                      <Switch
                        id="createImportRequest"
                        checked={createImportRequestForNew}
                        onCheckedChange={setCreateImportRequestForNew}
                      />
                      <Label htmlFor="createImportRequest">
                        Tạo yêu cầu nhập
                      </Label>
                    </div>

                    {createImportRequestForNew && (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => setActiveTab('import')}
                      >
                        Tiếp tục thiết lập yêu cầu nhập →
                      </Button>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="import" className="mt-4">
                  {createImportRequestForNew && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="newMaterialImportQuantity">
                            Số lượng nhập{' '}
                            <span className="text-red-500">*</span>
                          </Label>
                          <div className="flex items-center gap-1">
                            <Input
                              id="newMaterialImportQuantity"
                              type="number"
                              min="1"
                              value={newMaterialImportQuantity || ''}
                              onChange={(e) =>
                                setNewMaterialImportQuantity(
                                  Number(e.target.value)
                                )
                              }
                              placeholder="Số lượng"
                              required
                            />
                            <span className="text-sm text-muted-foreground w-8">
                              {newMaterialUnit}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="newMaterialImportDate">
                            Ngày dự kiến
                          </Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal text-sm"
                              >
                                <Calendar className="mr-2 h-3 w-3" />
                                {format(newMaterialImportDate, 'dd/MM/yyyy', {
                                  locale: vi
                                })}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <CalendarComponent
                                mode="single"
                                selected={newMaterialImportDate}
                                onSelect={(date) =>
                                  setNewMaterialImportDate(date || new Date())
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="newMaterialImportSupplier">
                          Nhà cung cấp
                        </Label>
                        <Input
                          id="newMaterialImportSupplier"
                          value={newMaterialImportSupplier}
                          onChange={(e) =>
                            setNewMaterialImportSupplier(e.target.value)
                          }
                          placeholder="Tên nhà cung cấp"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="newMaterialImportReason">
                          Lý do nhập
                        </Label>
                        <Textarea
                          id="newMaterialImportReason"
                          value={newMaterialImportReason}
                          onChange={(e) =>
                            setNewMaterialImportReason(e.target.value)
                          }
                          placeholder="Lý do nhập nguyên vật liệu"
                          rows={2}
                        />
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => setActiveTab('basic')}
                      >
                        ← Quay lại thông tin cơ bản
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <DialogFooter className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewMaterialDialog(false)}
                >
                  Hủy
                </Button>
                <Button
                  type="button"
                  onClick={handleAddNewMaterial}
                  disabled={
                    isSubmittingNewMaterial ||
                    !newMaterialName ||
                    !newMaterialCode ||
                    !newMaterialUnit
                  }
                >
                  {isSubmittingNewMaterial
                    ? 'Đang xử lý...'
                    : 'Thêm nguyên vật liệu'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {selectedMaterials.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã</TableHead>
                <TableHead>Tên nguyên vật liệu</TableHead>
                <TableHead className="text-center">Số lượng</TableHead>
                <TableHead className="text-center">Tình trạng</TableHead>
                <TableHead className="text-center">Yêu cầu nhập</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedMaterials.map((material) => (
                <TableRow key={material.id}>
                  <TableCell className="font-medium">{material.code}</TableCell>
                  <TableCell>{material.name}</TableCell>
                  <TableCell className="text-center">
                    {material.quantity} {material.unit}
                  </TableCell>
                  <TableCell className="text-center">
                    {material.quantity > 0 ? (
                      <span className="text-green-500">Còn hàng</span>
                    ) : (
                      <span className="text-red-500">Hết hàng</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {material.createImportRequest ? (
                      <div className="flex flex-col items-center">
                        <span className="text-green-500 text-sm">Đã tạo</span>
                        <span className="text-xs">
                          {material.importQuantity} {material.unit}
                        </span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="text-xs text-blue-500 cursor-help">
                                Chi tiết
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="w-64">
                              <div className="space-y-1 text-xs">
                                <p>
                                  <span className="font-medium">Số lượng:</span>{' '}
                                  {material.importQuantity} {material.unit}
                                </p>
                                <p>
                                  <span className="font-medium">
                                    Ngày dự kiến:
                                  </span>{' '}
                                  {format(
                                    new Date(material.importDate!),
                                    'dd/MM/yyyy'
                                  )}
                                </p>
                                <p>
                                  <span className="font-medium">
                                    Nhà cung cấp:
                                  </span>{' '}
                                  {material.importSupplier || 'Chưa xác định'}
                                </p>
                                <p>
                                  <span className="font-medium">Xuất xứ:</span>{' '}
                                  {material.sourceCountry ||
                                    material.origin ||
                                    'Chưa xác định'}
                                </p>
                                {material.importPrice && (
                                  <p>
                                    <span className="font-medium">
                                      Giá nhập:
                                    </span>{' '}
                                    {material.importPrice.toLocaleString()} VNĐ/
                                    {material.unit}
                                  </p>
                                )}
                                <p>
                                  <span className="font-medium">Lý do:</span>{' '}
                                  {material.importReason || 'Không có'}
                                </p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs text-red-500"
                          onClick={() => handleCancelImportRequest(material.id)}
                        >
                          Hủy
                        </Button>
                      </div>
                    ) : showImportForm === material.id ? (
                      <div className="flex flex-col gap-2 p-2 border rounded-md">
                        <div className="space-y-2">
                          <Label
                            htmlFor={`import-quantity-${material.id}`}
                            className="text-xs"
                          >
                            Số lượng
                          </Label>
                          <div className="flex items-center gap-1">
                            <Input
                              id={`import-quantity-${material.id}`}
                              type="number"
                              min="1"
                              value={importQuantity}
                              onChange={(e) =>
                                setImportQuantity(Number(e.target.value))
                              }
                              className="h-7"
                            />
                            <span className="text-xs">{material.unit}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor={`import-date-${material.id}`}
                            className="text-xs"
                          >
                            Ngày dự kiến
                          </Label>
                          <Popover
                            open={datePickerOpen}
                            onOpenChange={setDatePickerOpen}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal h-7 text-xs"
                              >
                                <Calendar className="mr-2 h-3 w-3" />
                                {importDate ? (
                                  format(importDate, 'dd/MM/yyyy', {
                                    locale: vi
                                  })
                                ) : (
                                  <span>Chọn ngày</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <CalendarComponent
                                mode="single"
                                selected={importDate}
                                onSelect={(date) => {
                                  setImportDate(date || new Date())
                                  setDatePickerOpen(false)
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor={`import-supplier-${material.id}`}
                            className="text-xs"
                          >
                            Nhà cung cấp
                          </Label>
                          <Input
                            id={`import-supplier-${material.id}`}
                            value={importSupplier}
                            onChange={(e) => setImportSupplier(e.target.value)}
                            placeholder="Nhập nhà cung cấp"
                            className="h-7 text-xs"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor={`source-country-${material.id}`}
                            className="text-xs"
                          >
                            Quốc gia nguồn nhập
                          </Label>
                          <Input
                            id={`source-country-${material.id}`}
                            value={sourceCountry}
                            onChange={(e) => setSourceCountry(e.target.value)}
                            placeholder="Nhập quốc gia nguồn nhập"
                            className="h-7 text-xs"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor={`import-price-${material.id}`}
                            className="text-xs"
                          >
                            Giá nhập (VNĐ/{material.unit})
                          </Label>
                          <Input
                            id={`import-price-${material.id}`}
                            type="number"
                            value={importPrice || ''}
                            onChange={(e) =>
                              setImportPrice(
                                e.target.value
                                  ? Number(e.target.value)
                                  : undefined
                              )
                            }
                            placeholder="Nhập giá nhập"
                            className="h-7 text-xs"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor={`import-reason-${material.id}`}
                            className="text-xs"
                          >
                            Lý do
                          </Label>
                          <Textarea
                            id={`import-reason-${material.id}`}
                            value={importReason}
                            onChange={(e) => setImportReason(e.target.value)}
                            placeholder="Nhập lý do"
                            className="h-16 min-h-0 text-xs"
                          />
                        </div>

                        <div className="flex gap-1 justify-end mt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() =>
                              handleCreateImportRequest(material.id)
                            }
                          >
                            Tạo
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => setShowImportForm(null)}
                          >
                            Hủy
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7"
                        onClick={() => handleShowImportForm(material)}
                      >
                        Tạo yêu cầu
                      </Button>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveMaterial(material.id)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-4 text-muted-foreground border rounded-md">
          Chưa có nguyên vật liệu nào được chọn
        </div>
      )}

      {selectedMaterials.some(
        (m) => m.quantity <= 0 && !m.createImportRequest
      ) && (
        <Alert variant="warning" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Có nguyên vật liệu đang hết hàng. Vui lòng tạo yêu cầu nhập nguyên
            vật liệu.
          </AlertDescription>
        </Alert>
      )}

      {selectedMaterials.some((m) => m.createImportRequest) && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-sm text-blue-500 cursor-help">
                <Info className="h-4 w-4" />
                <span>Đã tạo yêu cầu nhập nguyên vật liệu</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Yêu cầu nhập nguyên vật liệu sẽ được tạo khi bạn lưu yêu cầu
                này. Mã yêu cầu: {requestCode || '[Chưa có]'}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}
