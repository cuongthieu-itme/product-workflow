'use client'

import { useState, useEffect } from 'react'
import { useMaterialContext, type Material } from './material-context-firebase'
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
import { Badge } from '@/components/ui/badge'
import {
  Edit,
  Trash2,
  Power,
  Plus,
  ImageIcon,
  Save,
  X,
  Pencil,
  Check,
  ChevronsUpDown
} from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { MultiImageUpload } from './multi-image-upload'
import Image from 'next/image'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import { cn } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

// Danh sách các đơn vị phổ biến
const commonUnits = [
  'kg',
  'g',
  'tấn',
  'm',
  'cm',
  'mm',
  'm²',
  'm³',
  'cái',
  'chiếc',
  'bộ',
  'lít',
  'ml',
  'thùng',
  'hộp'
]

// Danh sách các xuất xứ phổ biến
const commonOrigins = [
  'Việt Nam',
  'Trung Quốc',
  'Nhật Bản',
  'Hàn Quốc',
  'Thái Lan',
  'Malaysia',
  'Singapore',
  'Indonesia',
  'Đài Loan',
  'Mỹ',
  'Đức',
  'Pháp',
  'Ý',
  'Anh',
  'Nga',
  'Ấn Độ',
  'Australia'
]

export function MaterialsTable() {
  const {
    materials,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    toggleMaterialStatus,
    loading
  } = useMaterialContext()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
  const [currentMaterial, setCurrentMaterial] = useState<Material | null>(null)
  const [formData, setFormData] = useState<Partial<Material>>({
    name: '',
    code: '',
    quantity: 0,
    unit: '',
    description: '',
    origin: '',
    images: [],
    type: 'material' // Mặc định là nguyên liệu
  })
  const [activeTab, setActiveTab] = useState<'material' | 'accessory'>(
    'material'
  )

  // State for inline editing
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<string | number>('')

  // State for unit combobox
  const [unitOpen, setUnitOpen] = useState(false)
  const [customUnitInput, setCustomUnitInput] = useState('')
  const [availableUnits, setAvailableUnits] = useState<string[]>(commonUnits)
  const [isAddingNewUnit, setIsAddingNewUnit] = useState(false)

  // State for origin combobox
  const [originOpen, setOriginOpen] = useState(false)
  const [customOriginInput, setCustomOriginInput] = useState('')
  const [availableOrigins, setAvailableOrigins] =
    useState<string[]>(commonOrigins)
  const [isAddingNewOrigin, setIsAddingNewOrigin] = useState(false)

  // Lấy danh sách các đơn vị và xuất xứ đã có từ materials
  useEffect(() => {
    if (materials.length > 0) {
      // Xử lý đơn vị
      const existingUnits = materials
        .map((material) => material.unit)
        .filter(Boolean) as string[]
      const uniqueUnits = Array.from(
        new Set([...commonUnits, ...existingUnits])
      ).sort()
      setAvailableUnits(uniqueUnits)

      // Xử lý xuất xứ
      const existingOrigins = materials
        .map((material) => material.origin)
        .filter(Boolean) as string[]
      const uniqueOrigins = Array.from(
        new Set([...commonOrigins, ...existingOrigins])
      ).sort()
      setAvailableOrigins(uniqueOrigins)
    }
  }, [materials])

  // Lọc materials theo loại (nguyên liệu hoặc phụ kiện)
  const filteredMaterials = materials.filter(
    (material) => material.type === activeTab
  )

  // Xử lý thêm nguyên vật liệu mới
  const handleAddMaterial = async () => {
    if (
      !formData.name ||
      (formData.type === 'material' &&
        (formData.quantity === undefined || !formData.unit || !formData.origin))
    ) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ thông tin bắt buộc',
        variant: 'destructive'
      })
      return
    }

    try {
      await addMaterial({
        name: formData.name,
        code: formData.code || '',
        quantity: formData.quantity || 0,
        unit: formData.unit || 'cái',
        description: formData.description || '',
        origin: formData.origin || 'Việt Nam',
        images: formData.images || [],
        type: formData.type || 'material'
      })

      toast({
        title: 'Thành công',
        description: `Đã thêm ${formData.type === 'material' ? 'nguyên liệu' : 'phụ kiện'} mới`
      })

      // Nếu đơn vị mới chưa có trong danh sách, thêm vào
      if (formData.unit && !availableUnits.includes(formData.unit)) {
        setAvailableUnits((prev) => [...prev, formData.unit!].sort())
      }

      // Nếu xuất xứ mới chưa có trong danh sách, thêm vào
      if (formData.origin && !availableOrigins.includes(formData.origin)) {
        setAvailableOrigins((prev) => [...prev, formData.origin!].sort())
      }

      setIsAddDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error adding material:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể thêm nguyên vật liệu. Vui lòng thử lại sau.',
        variant: 'destructive'
      })
    }
  }

  // Xử lý khi chọn đơn vị từ dropdown
  const handleSelectUnit = (unit: string) => {
    if (unit === 'add-new') {
      setIsAddingNewUnit(true)
      setCustomUnitInput('')
    } else {
      setFormData({ ...formData, unit })
      setUnitOpen(false)
    }
  }

  // Xử lý khi thêm đơn vị mới
  const handleAddNewUnit = () => {
    if (customUnitInput.trim()) {
      const newUnit = customUnitInput.trim()
      setFormData({ ...formData, unit: newUnit })

      // Thêm đơn vị mới vào danh sách nếu chưa có
      if (!availableUnits.includes(newUnit)) {
        setAvailableUnits((prev) => [...prev, newUnit].sort())
      }

      setIsAddingNewUnit(false)
      setUnitOpen(false)
    }
  }

  // Xử lý khi chọn xuất xứ từ dropdown
  const handleSelectOrigin = (origin: string) => {
    if (origin === 'add-new') {
      setIsAddingNewOrigin(true)
      setCustomOriginInput('')
    } else {
      setFormData({ ...formData, origin })
      setOriginOpen(false)
    }
  }

  // Xử lý khi thêm xuất xứ mới
  const handleAddNewOrigin = () => {
    if (customOriginInput.trim()) {
      const newOrigin = customOriginInput.trim()
      setFormData({ ...formData, origin: newOrigin })

      // Thêm xuất xứ mới vào danh sách nếu chưa có
      if (!availableOrigins.includes(newOrigin)) {
        setAvailableOrigins((prev) => [...prev, newOrigin].sort())
      }

      setIsAddingNewOrigin(false)
      setOriginOpen(false)
    }
  }

  // Function to start editing a field
  const startEditing = (field: string, value: string | number) => {
    setEditingField(field)
    setEditValue(value)
  }

  // Function to cancel editing
  const cancelEditing = () => {
    setEditingField(null)
  }

  // Function to save changes for a specific field
  const saveFieldChange = async (field: string) => {
    if (!currentMaterial) return

    try {
      if (field === editingField) {
        const updatedData = {
          ...currentMaterial,
          [field]: editValue
        }

        await updateMaterial(currentMaterial.id, { [field]: editValue })

        // Update the current material in state
        setCurrentMaterial({
          ...currentMaterial,
          [field]: editValue
        })

        toast({
          title: 'Thành công',
          description: `Đã cập nhật ${getFieldLabel(field)}`
        })

        setEditingField(null)
      }
    } catch (error) {
      console.error('Error updating material:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật thông tin nguyên vật liệu',
        variant: 'destructive'
      })
    }
  }

  // Helper function to get field label
  const getFieldLabel = (field: string): string => {
    const labels: Record<string, string> = {
      name: 'Tên nguyên vật liệu',
      code: 'Mã',
      quantity: 'Số lượng',
      unit: 'Đơn vị',
      description: 'Mô tả',
      origin: 'Xuất xứ'
    }
    return labels[field] || field
  }

  // Render editable field
  const renderEditableField = (
    label: string,
    field: string,
    value: string | number
  ) => {
    const isEditing = editingField === field

    return (
      <div className="grid grid-cols-3 items-center gap-4 py-3 border-b border-gray-100">
        <Label className="font-medium">{label}</Label>
        <div className="col-span-2 flex items-center gap-2">
          {isEditing ? (
            <>
              {field === 'description' ? (
                <Textarea
                  value={editValue as string}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="flex-1"
                  autoFocus
                />
              ) : field === 'quantity' ? (
                <Input
                  type="number"
                  value={editValue as number}
                  onChange={(e) => setEditValue(Number(e.target.value))}
                  className="flex-1"
                  autoFocus
                />
              ) : field === 'unit' ? (
                <select
                  value={editValue as string}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="flex-1 p-2 border rounded-md"
                  autoFocus
                >
                  {availableUnits.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                  <option value="other">Khác...</option>
                </select>
              ) : field === 'origin' ? (
                <select
                  value={editValue as string}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="flex-1 p-2 border rounded-md"
                  autoFocus
                >
                  {availableOrigins.map((origin) => (
                    <option key={origin} value={origin}>
                      {origin}
                    </option>
                  ))}
                  <option value="other">Khác...</option>
                </select>
              ) : (
                <Input
                  value={editValue as string}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="flex-1"
                  autoFocus
                />
              )}
              <Button
                size="icon"
                variant="ghost"
                onClick={() => saveFieldChange(field)}
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={cancelEditing}>
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <span className="flex-1">{value}</span>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => startEditing(field, value)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    )
  }

  // Xử lý xóa nguyên vật liệu
  const handleDeleteMaterial = async () => {
    if (!currentMaterial) return

    try {
      await deleteMaterial(currentMaterial.id)

      toast({
        title: 'Thành công',
        description: 'Đã xóa nguyên vật liệu'
      })

      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error('Error deleting material:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa nguyên vật liệu. Vui lòng thử lại sau.',
        variant: 'destructive'
      })
    }
  }

  // Xử lý bật/tắt trạng thái nguyên vật liệu
  const handleToggleStatus = async (material: Material) => {
    try {
      await toggleMaterialStatus(material.id)

      toast({
        title: 'Thành công',
        description: `Đã ${material.isActive ? 'tắt' : 'bật'} trạng thái nguyên vật liệu. Trạng thái hiện tại: ${
          material.isActive ? 'Hết hàng' : 'Còn hàng'
        }`
      })
    } catch (error) {
      console.error('Error toggling material status:', error)
      toast({
        title: 'Lỗi',
        description:
          'Không thể thay đổi trạng thái nguyên vật liệu. Vui lòng thử lại sau.',
        variant: 'destructive'
      })
    }
  }

  // Mở dialog chi tiết
  const openDetailDialog = (material: Material) => {
    setCurrentMaterial(material)
    setIsDetailDialogOpen(true)
  }

  // Mở dialog xem hình ảnh
  const openImageDialog = (material: Material) => {
    setCurrentMaterial(material)
    setIsImageDialogOpen(true)
  }

  // Mở dialog xóa
  const openDeleteDialog = (material: Material) => {
    setCurrentMaterial(material)
    setIsDeleteDialogOpen(true)
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      quantity: 0,
      unit: '',
      description: '',
      origin: '',
      images: [],
      type: activeTab // Sử dụng tab hiện tại làm loại mặc định
    })
    setCurrentMaterial(null)
    setEditingField(null)
    setIsAddingNewUnit(false)
    setIsAddingNewOrigin(false)
  }

  // Khi chuyển tab, cập nhật loại mặc định cho form
  useEffect(() => {
    setFormData((prev) => ({ ...prev, type: activeTab }))
  }, [activeTab])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        Đang tải dữ liệu...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Danh sách nguyên vật liệu</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Thêm{' '}
          {activeTab === 'material' ? 'nguyên liệu' : 'phụ kiện'}
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(value as 'material' | 'accessory')
        }
        className="w-full"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="material">Nguyên liệu</TabsTrigger>
          <TabsTrigger value="accessory">Phụ kiện</TabsTrigger>
        </TabsList>

        <TabsContent value="material" className="border rounded-md">
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader className="sticky top-0 bg-white z-10">
                <TableRow>
                  <TableHead className="w-[100px]">Hình ảnh</TableHead>
                  <TableHead className="w-[120px]">Mã</TableHead>
                  <TableHead className="w-[200px]">Tên nguyên liệu</TableHead>
                  <TableHead className="w-[120px] text-center">
                    Số lượng
                  </TableHead>
                  <TableHead className="w-[100px] text-center">
                    Đơn vị
                  </TableHead>
                  <TableHead className="w-[150px]">Xuất xứ</TableHead>
                  <TableHead className="w-[120px]">Trạng thái</TableHead>
                  <TableHead className="w-[150px]">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaterials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Không có dữ liệu nguyên liệu
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMaterials.map((material) => (
                    <TableRow key={material.id}>
                      <TableCell className="w-[100px]">
                        {material.images && material.images.length > 0 ? (
                          <div
                            className="relative w-12 h-12 cursor-pointer"
                            onClick={() => openImageDialog(material)}
                          >
                            <Image
                              src={material.images[0] || '/placeholder.svg'}
                              alt={material.name}
                              fill
                              className="object-cover rounded-md"
                            />
                            {material.images.length > 1 && (
                              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                                {material.images.length}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="w-[120px]">
                        {material.code}
                      </TableCell>
                      <TableCell className="w-[200px]">
                        {material.name}
                      </TableCell>
                      <TableCell className="w-[120px] text-center">
                        {material.quantity}
                      </TableCell>
                      <TableCell className="w-[100px] text-center">
                        {material.unit}
                      </TableCell>
                      <TableCell className="w-[150px]">
                        {material.origin}
                      </TableCell>
                      <TableCell className="w-[120px]">
                        <Badge
                          variant={
                            material.isActive ? 'default' : 'destructive'
                          }
                        >
                          {material.isActive ? 'Còn hàng' : 'Hết hàng'}
                        </Badge>
                      </TableCell>
                      <TableCell className="w-[150px]">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openDetailDialog(material)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openDeleteDialog(material)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={
                              material.isActive ? 'destructive' : 'default'
                            }
                            size="icon"
                            onClick={() => handleToggleStatus(material)}
                          >
                            <Power className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="accessory" className="border rounded-md">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {filteredMaterials.length === 0 ? (
              <div className="col-span-full text-center py-8">
                Không có dữ liệu phụ kiện
              </div>
            ) : (
              filteredMaterials.map((accessory) => (
                <div
                  key={accessory.id}
                  className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div
                    className="relative h-40 w-full cursor-pointer"
                    onClick={() => openImageDialog(accessory)}
                  >
                    {accessory.images && accessory.images.length > 0 ? (
                      <Image
                        src={accessory.images[0] || '/placeholder.svg'}
                        alt={accessory.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <Badge
                      className="absolute top-2 right-2"
                      variant={accessory.isActive ? 'default' : 'destructive'}
                    >
                      {accessory.isActive ? 'Còn hàng' : 'Hết hàng'}
                    </Badge>
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-lg truncate">
                      {accessory.name}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {accessory.code}
                    </p>
                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-sm">SL: {accessory.quantity}</span>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDetailDialog(accessory)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(accessory)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleStatus(accessory)}
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog thêm nguyên vật liệu */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              Thêm {formData.type === 'material' ? 'nguyên liệu' : 'phụ kiện'}{' '}
              mới
            </DialogTitle>
            <DialogDescription>
              Nhập thông tin{' '}
              {formData.type === 'material' ? 'nguyên liệu' : 'phụ kiện'} mới
              vào form dưới đây.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="pr-4 h-[calc(90vh-180px)]">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Loại</Label>
                <RadioGroup
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      type: value as 'material' | 'accessory'
                    })
                  }
                  className="col-span-3 flex space-x-4"
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
              </div>

              <div className="col-span-4">
                <Label htmlFor="images" className="block mb-2">
                  Hình ảnh (tối đa 5 ảnh)
                </Label>
                <MultiImageUpload
                  initialImages={formData.images}
                  onImagesChange={(images) =>
                    setFormData({ ...formData, images })
                  }
                  maxImages={5}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Tên <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="code" className="text-right">
                  Mã
                </Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>

              {/* Các trường chỉ hiển thị cho nguyên liệu */}
              {formData.type === 'material' && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="quantity" className="text-right">
                      Số lượng <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          quantity: Number(e.target.value)
                        })
                      }
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="unit" className="text-right">
                      Đơn vị <span className="text-red-500">*</span>
                    </Label>
                    {isAddingNewUnit ? (
                      <div className="col-span-3 flex gap-2">
                        <Input
                          value={customUnitInput}
                          onChange={(e) => setCustomUnitInput(e.target.value)}
                          placeholder="Nhập đơn vị mới"
                          className="flex-1"
                          autoFocus
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setIsAddingNewUnit(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          onClick={handleAddNewUnit}
                          disabled={!customUnitInput.trim()}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="col-span-3">
                        <Popover open={unitOpen} onOpenChange={setUnitOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={unitOpen}
                              className="w-full justify-between"
                            >
                              {formData.unit ? formData.unit : 'Chọn đơn vị...'}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[300px] p-0">
                            <Command>
                              <CommandInput placeholder="Tìm đơn vị..." />
                              <CommandEmpty>
                                Không tìm thấy đơn vị.
                              </CommandEmpty>
                              <ScrollArea className="h-[200px]">
                                <CommandList>
                                  <CommandGroup>
                                    {availableUnits.map((unit) => (
                                      <CommandItem
                                        key={unit}
                                        value={unit}
                                        onSelect={() => handleSelectUnit(unit)}
                                      >
                                        <Check
                                          className={cn(
                                            'mr-2 h-4 w-4',
                                            formData.unit === unit
                                              ? 'opacity-100'
                                              : 'opacity-0'
                                          )}
                                        />
                                        {unit}
                                      </CommandItem>
                                    ))}
                                    <CommandItem
                                      value="add-new"
                                      onSelect={() =>
                                        handleSelectUnit('add-new')
                                      }
                                    >
                                      <Plus className="mr-2 h-4 w-4" />
                                      Thêm đơn vị mới...
                                    </CommandItem>
                                  </CommandGroup>
                                </CommandList>
                              </ScrollArea>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="origin" className="text-right">
                      Xuất xứ <span className="text-red-500">*</span>
                    </Label>
                    {isAddingNewOrigin ? (
                      <div className="col-span-3 flex gap-2">
                        <Input
                          value={customOriginInput}
                          onChange={(e) => setCustomOriginInput(e.target.value)}
                          placeholder="Nhập xuất xứ mới"
                          className="flex-1"
                          autoFocus
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setIsAddingNewOrigin(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          onClick={handleAddNewOrigin}
                          disabled={!customOriginInput.trim()}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="col-span-3">
                        <Popover open={originOpen} onOpenChange={setOriginOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={originOpen}
                              className="w-full justify-between"
                            >
                              {formData.origin
                                ? formData.origin
                                : 'Chọn xuất xứ...'}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[300px] p-0">
                            <Command>
                              <CommandInput placeholder="Tìm xuất xứ..." />
                              <CommandEmpty>
                                Không tìm thấy xuất xứ.
                              </CommandEmpty>
                              <ScrollArea className="h-[200px]">
                                <CommandList>
                                  <CommandGroup>
                                    {availableOrigins.map((origin) => (
                                      <CommandItem
                                        key={origin}
                                        value={origin}
                                        onSelect={() =>
                                          handleSelectOrigin(origin)
                                        }
                                      >
                                        <Check
                                          className={cn(
                                            'mr-2 h-4 w-4',
                                            formData.origin === origin
                                              ? 'opacity-100'
                                              : 'opacity-0'
                                          )}
                                        />
                                        {origin}
                                      </CommandItem>
                                    ))}
                                    <CommandItem
                                      value="add-new"
                                      onSelect={() =>
                                        handleSelectOrigin('add-new')
                                      }
                                    >
                                      <Plus className="mr-2 h-4 w-4" />
                                      Thêm xuất xứ mới...
                                    </CommandItem>
                                  </CommandGroup>
                                </CommandList>
                              </ScrollArea>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Trường mô tả cho cả hai loại */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Mô tả
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>

              {/* Các trường ẩn cho phụ kiện nhưng vẫn cần giá trị mặc định */}
              {formData.type === 'accessory' && (
                <div className="hidden">
                  <Input
                    type="number"
                    value={formData.quantity || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantity: Number(e.target.value)
                      })
                    }
                  />
                  <Input
                    value={formData.unit || 'cái'}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
                  />
                  <Input
                    value={formData.origin || 'Việt Nam'}
                    onChange={(e) =>
                      setFormData({ ...formData, origin: e.target.value })
                    }
                  />
                </div>
              )}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleAddMaterial}>
              Thêm {formData.type === 'material' ? 'nguyên liệu' : 'phụ kiện'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog chi tiết nguyên vật liệu */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              Chi tiết{' '}
              {currentMaterial?.type === 'material'
                ? 'nguyên liệu'
                : 'phụ kiện'}
            </DialogTitle>
            <DialogDescription>
              Xem và chỉnh sửa thông tin{' '}
              {currentMaterial?.type === 'material'
                ? 'nguyên liệu'
                : 'phụ kiện'}
              .
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="pr-4 h-[calc(90vh-180px)]">
            {currentMaterial && (
              <div className="space-y-4">
                {/* Hình ảnh */}
                <div className="grid grid-cols-3 items-center gap-4 py-3 border-b border-gray-100">
                  <Label className="font-medium">Hình ảnh</Label>
                  <div className="col-span-2">
                    <MultiImageUpload
                      initialImages={currentMaterial.images}
                      onImagesChange={async (images) => {
                        try {
                          await updateMaterial(currentMaterial.id, { images })
                          setCurrentMaterial({ ...currentMaterial, images })
                          toast({
                            title: 'Thành công',
                            description: 'Đã cập nhật hình ảnh'
                          })
                        } catch (error) {
                          console.error('Error updating images:', error)
                          toast({
                            title: 'Lỗi',
                            description: 'Không thể cập nhật hình ảnh',
                            variant: 'destructive'
                          })
                        }
                      }}
                      maxImages={5}
                    />
                  </div>
                </div>

                {/* Các trường có thể chỉnh sửa */}
                {renderEditableField('Tên', 'name', currentMaterial.name)}
                {renderEditableField('Mã', 'code', currentMaterial.code)}

                {/* Chỉ hiển thị các trường này cho nguyên liệu */}
                {currentMaterial.type === 'material' && (
                  <>
                    {renderEditableField(
                      'Số lượng',
                      'quantity',
                      currentMaterial.quantity
                    )}
                    {renderEditableField(
                      'Đơn vị',
                      'unit',
                      currentMaterial.unit
                    )}
                    {renderEditableField(
                      'Xuất xứ',
                      'origin',
                      currentMaterial.origin
                    )}
                  </>
                )}

                {renderEditableField(
                  'Mô tả',
                  'description',
                  currentMaterial.description || ''
                )}

                {/* Trạng thái */}
                <div className="grid grid-cols-3 items-center gap-4 py-3 border-b border-gray-100">
                  <Label className="font-medium">Trạng thái</Label>
                  <div className="col-span-2 flex items-center gap-2">
                    <Badge
                      variant={
                        currentMaterial.isActive ? 'default' : 'destructive'
                      }
                    >
                      {currentMaterial.isActive ? 'Còn hàng' : 'Hết hàng'}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          await toggleMaterialStatus(currentMaterial.id)
                          setCurrentMaterial({
                            ...currentMaterial,
                            isActive: !currentMaterial.isActive
                          })
                          toast({
                            title: 'Thành công',
                            description: `Đã ${currentMaterial.isActive ? 'tắt' : 'bật'} trạng thái`
                          })
                        } catch (error) {
                          console.error('Error toggling status:', error)
                          toast({
                            title: 'Lỗi',
                            description: 'Không thể thay đổi trạng thái',
                            variant: 'destructive'
                          })
                        }
                      }}
                    >
                      {currentMaterial.isActive ? 'Tắt' : 'Bật'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDetailDialogOpen(false)}
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog xem hình ảnh */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Hình ảnh{' '}
              {currentMaterial?.type === 'material'
                ? 'nguyên liệu'
                : 'phụ kiện'}
              : {currentMaterial?.name}
            </DialogTitle>
          </DialogHeader>
          {currentMaterial &&
          currentMaterial.images &&
          currentMaterial.images.length > 0 ? (
            <Carousel className="w-full max-w-3xl mx-auto">
              <CarouselContent>
                {currentMaterial.images.map((image, index) => (
                  <CarouselItem key={index}>
                    <div className="relative h-96 w-full">
                      <Image
                        src={image || '/placeholder.svg'}
                        alt={`${currentMaterial.name} - ${index + 1}`}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          ) : (
            <div className="text-center py-8">Không có hình ảnh</div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsImageDialogOpen(false)}
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog xác nhận xóa */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa{' '}
              {currentMaterial?.type === 'material'
                ? 'nguyên liệu'
                : 'phụ kiện'}{' '}
              "{currentMaterial?.name}" không? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteMaterial}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
