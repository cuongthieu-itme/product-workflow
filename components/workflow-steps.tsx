"use client"

import { useState, useEffect } from "react"
import { useWorkflow, type Product, type ProductStatus } from "@/components/workflow-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, CheckCircle, FileUp, Info, Loader2, Megaphone, Palette, Rocket, ShoppingCart } from "lucide-react"
import { cn } from "@/lib/utils"

// Các bước trong quy trình
const workflowSteps = [
  {
    id: "request",
    title: "Khởi Tạo Yêu Cầu",
    description: "Nhập thông tin yêu cầu phát triển sản phẩm",
    icon: <Info className="h-5 w-5" />,
    status: "draft" as ProductStatus,
  },
  {
    id: "review",
    title: "Kiểm Tra Phát Triển",
    description: "Kiểm tra thông tin và yêu cầu bổ sung nếu cần",
    icon: <AlertCircle className="h-5 w-5" />,
    status: "review" as ProductStatus,
  },
  {
    id: "design",
    title: "Thiết Kế & Xác Nhận",
    description: "Tải lên thiết kế và phê duyệt sản phẩm",
    icon: <Palette className="h-5 w-5" />,
    status: "design" as ProductStatus,
  },
  {
    id: "production",
    title: "Cập Nhật SKU & Thông Tin",
    description: "Tạo mã SKU và cập nhật thông tin sản phẩm",
    icon: <ShoppingCart className="h-5 w-5" />,
    status: "production" as ProductStatus,
  },
  {
    id: "marketing",
    title: "Truyền Thông Marketing",
    description: "Tạo và theo dõi chiến dịch marketing",
    icon: <Megaphone className="h-5 w-5" />,
    status: "marketing" as ProductStatus,
  },
  {
    id: "launch",
    title: "Ra Mắt & Hoạt Động Sau Ra Mắt",
    description: "Theo dõi tình trạng sản phẩm sau khi ra mắt",
    icon: <Rocket className="h-5 w-5" />,
    status: "launch" as ProductStatus,
  },
]

interface WorkflowStepsProps {
  productId?: string
  onClose: () => void
  onComplete: () => void
}

export default function WorkflowSteps({ productId, onClose, onComplete }: WorkflowStepsProps) {
  const { products, addProduct, updateProduct, generateSKU, addNotification } = useWorkflow()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    description: "",
    status: "draft",
    currentStep: 0,
    departments: ["product"],
  })
  const [loading, setLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Nếu đang chỉnh sửa sản phẩm hiện có
  useEffect(() => {
    if (productId) {
      const product = products.find((p) => p.id === productId)
      if (product) {
        setFormData({ ...product })
        // Tìm index của bước hiện tại dựa trên trạng thái
        const stepIndex = workflowSteps.findIndex((step) => step.status === product.status)
        setCurrentStep(stepIndex >= 0 ? stepIndex : 0)
      }
    }
  }, [productId, products])

  const validateStep = () => {
    const errors: Record<string, string> = {}

    switch (currentStep) {
      case 0: // Khởi tạo yêu cầu
        if (!formData.name?.trim()) errors.name = "Vui lòng nhập tên sản phẩm"
        if (!formData.description?.trim()) errors.description = "Vui lòng nhập mô tả sản phẩm"
        break
      case 1: // Kiểm tra phát triển
        // Kiểm tra các trường bắt buộc đã được điền
        if (!formData.departments || formData.departments.length === 0) {
          errors.departments = "Vui lòng chọn ít nhất một phòng ban liên quan"
        }
        break
      // Thêm validation cho các bước khác nếu cần
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNext = () => {
    if (!validateStep()) return

    setLoading(true)

    // Giả lập thời gian xử lý
    setTimeout(() => {
      // Cập nhật trạng thái sản phẩm theo bước hiện tại
      const nextStep = currentStep + 1
      const updatedData = {
        ...formData,
        status: workflowSteps[nextStep]?.status || workflowSteps[currentStep].status,
        currentStep: nextStep,
      }

      setFormData(updatedData)

      // Nếu đang ở bước 3 (index 2) và chuyển sang bước 4, tạo SKU
      if (currentStep === 2 && !formData.sku) {
        const sku = generateSKU(formData.name || "")
        setFormData((prev) => ({ ...prev, sku }))
        updatedData.sku = sku
      }

      // Cập nhật hoặc thêm mới sản phẩm
      if (productId) {
        updateProduct(productId, updatedData)

        // Tạo thông báo cho các phòng ban liên quan
        addNotification(productId, {
          title: `Cập nhật trạng thái: ${workflowSteps[nextStep]?.title}`,
          message: `Sản phẩm "${formData.name}" đã chuyển sang bước ${workflowSteps[nextStep]?.title}`,
          departments: formData.departments || [],
        })
      } else if (nextStep === workflowSteps.length) {
        // Nếu là bước cuối cùng và là sản phẩm mới, thêm sản phẩm với trạng thái hoàn thành
        addProduct({
          ...updatedData,
          status: "completed",
        })
      }

      if (nextStep < workflowSteps.length) {
        setCurrentStep(nextStep)
      } else {
        // Hoàn thành quy trình
        onComplete()
      }

      setLoading(false)
    }, 800)
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Xóa lỗi validation khi người dùng sửa
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleDepartmentChange = (department: string, checked: boolean) => {
    setFormData((prev) => {
      const currentDepts = prev.departments || []
      return {
        ...prev,
        departments: checked ? [...currentDepts, department as any] : currentDepts.filter((d) => d !== department),
      }
    })
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Khởi tạo yêu cầu
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên Sản Phẩm</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={validationErrors.name ? "border-red-500" : ""}
              />
              {validationErrors.name && <p className="text-sm text-red-500">{validationErrors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô Tả Sản Phẩm</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className={validationErrors.description ? "border-red-500" : ""}
              />
              {validationErrors.description && <p className="text-sm text-red-500">{validationErrors.description}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Danh Mục Sản Phẩm</Label>
              <RadioGroup
                id="category"
                value={formData.category || "furniture"}
                onValueChange={(value) => handleInputChange("category", value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="furniture" id="furniture" />
                  <Label htmlFor="furniture">Nội Thất</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="electronics" id="electronics" />
                  <Label htmlFor="electronics">Điện Tử</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="accessories" id="accessories" />
                  <Label htmlFor="accessories">Phụ Kiện</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other">Khác</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        )

      case 1: // Kiểm tra phát triển
        return (
          <div className="space-y-4">
            <div className="rounded-md bg-amber-50 p-4 border border-amber-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-amber-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">Kiểm tra thông tin</h3>
                  <div className="mt-2 text-sm text-amber-700">
                    <p>
                      Vui lòng kiểm tra lại thông tin sản phẩm và chọn các phòng ban liên quan để tiếp tục quy trình.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Thông Tin Sản Phẩm</Label>
              <div className="rounded-md bg-muted p-4">
                <p>
                  <strong>Tên:</strong> {formData.name}
                </p>
                <p>
                  <strong>Mô tả:</strong> {formData.description}
                </p>
                <p>
                  <strong>Danh mục:</strong>{" "}
                  {formData.category === "furniture"
                    ? "Nội Thất"
                    : formData.category === "electronics"
                      ? "Điện Tử"
                      : formData.category === "accessories"
                        ? "Phụ Kiện"
                        : "Khác"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Phòng Ban Liên Quan</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="product"
                    checked={formData.departments?.includes("product")}
                    onCheckedChange={(checked) => handleDepartmentChange("product", !!checked)}
                  />
                  <Label htmlFor="product">Phòng Sản Phẩm</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="design"
                    checked={formData.departments?.includes("design")}
                    onCheckedChange={(checked) => handleDepartmentChange("design", !!checked)}
                  />
                  <Label htmlFor="design">Phòng Thiết Kế</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="marketing"
                    checked={formData.departments?.includes("marketing")}
                    onCheckedChange={(checked) => handleDepartmentChange("marketing", !!checked)}
                  />
                  <Label htmlFor="marketing">Phòng Marketing</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sales"
                    checked={formData.departments?.includes("sales")}
                    onCheckedChange={(checked) => handleDepartmentChange("sales", !!checked)}
                  />
                  <Label htmlFor="sales">Phòng Kinh Doanh</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="operations"
                    checked={formData.departments?.includes("operations")}
                    onCheckedChange={(checked) => handleDepartmentChange("operations", !!checked)}
                  />
                  <Label htmlFor="operations">Phòng Vận Hành</Label>
                </div>
              </div>
              {validationErrors.departments && <p className="text-sm text-red-500">{validationErrors.departments}</p>}
            </div>
          </div>
        )

      case 2: // Thiết kế và xác nhận
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tải Lên Thiết Kế</Label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
                  <div className="mb-4 rounded-full bg-primary/10 p-2">
                    <FileUp className="h-6 w-6 text-primary" />
                  </div>
                  <p className="mb-2 text-sm font-medium">Kéo thả hoặc nhấp để tải lên</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG hoặc PDF (tối đa 10MB)</p>
                  <Button variant="outline" size="sm" className="mt-4">
                    Chọn Tệp
                  </Button>
                </div>

                {formData.designFiles && formData.designFiles.length > 0 ? (
                  <div className="rounded-md border p-4">
                    <h4 className="mb-2 text-sm font-medium">Tệp đã tải lên</h4>
                    <ul className="space-y-2 text-sm">
                      {formData.designFiles.map((file, index) => (
                        <li key={index} className="flex items-center justify-between">
                          <span>{file}</span>
                          <Button variant="ghost" size="sm">
                            Xóa
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="flex items-center justify-center rounded-md border p-8 text-center">
                    <p className="text-sm text-muted-foreground">Chưa có tệp thiết kế nào được tải lên</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="designNotes">Ghi Chú Thiết Kế</Label>
              <Textarea
                id="designNotes"
                placeholder="Nhập các ghi chú về thiết kế sản phẩm..."
                value={formData.designNotes || ""}
                onChange={(e) => handleInputChange("designNotes", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Trạng Thái Phê Duyệt</Label>
              <RadioGroup
                value={formData.approvalStatus || "pending"}
                onValueChange={(value) => handleInputChange("approvalStatus", value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pending" id="pending" />
                  <Label htmlFor="pending">Đang Chờ Phê Duyệt</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="approved" id="approved" />
                  <Label htmlFor="approved">Đã Phê Duyệt</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rejected" id="rejected" />
                  <Label htmlFor="rejected">Từ Chối</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        )

      case 3: // Cập nhật SKU và thông tin
        return (
          <div className="space-y-4">
            <div className="rounded-md bg-green-50 p-4 border border-green-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Thiết kế đã được phê duyệt</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Thiết kế sản phẩm đã được phê duyệt. Vui lòng cập nhật thông tin sản phẩm và mã SKU.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">Mã SKU</Label>
              <div className="flex space-x-2">
                <Input
                  id="sku"
                  value={formData.sku || ""}
                  onChange={(e) => handleInputChange("sku", e.target.value)}
                  placeholder="Mã SKU sản phẩm"
                />
                <Button variant="outline" onClick={() => handleInputChange("sku", generateSKU(formData.name || ""))}>
                  Tạo Mã
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Giá Sản Phẩm (VNĐ)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price || ""}
                onChange={(e) => handleInputChange("price", e.target.value)}
                placeholder="Nhập giá sản phẩm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="inventory">Số Lượng Tồn Kho</Label>
              <Input
                id="inventory"
                type="number"
                value={formData.inventory || ""}
                onChange={(e) => handleInputChange("inventory", e.target.value)}
                placeholder="Nhập số lượng tồn kho"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specifications">Thông Số Kỹ Thuật</Label>
              <Textarea
                id="specifications"
                value={formData.specifications || ""}
                onChange={(e) => handleInputChange("specifications", e.target.value)}
                placeholder="Nhập thông số kỹ thuật của sản phẩm"
              />
            </div>
          </div>
        )

      case 4: // Truyền thông marketing
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tải Lên Hình Ảnh Marketing</Label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
                  <div className="mb-4 rounded-full bg-primary/10 p-2">
                    <FileUp className="h-6 w-6 text-primary" />
                  </div>
                  <p className="mb-2 text-sm font-medium">Kéo thả hoặc nhấp để tải lên</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG hoặc PDF (tối đa 10MB)</p>
                  <Button variant="outline" size="sm" className="mt-4">
                    Chọn Tệp
                  </Button>
                </div>

                {formData.marketingFiles && formData.marketingFiles.length > 0 ? (
                  <div className="rounded-md border p-4">
                    <h4 className="mb-2 text-sm font-medium">Tệp đã tải lên</h4>
                    <ul className="space-y-2 text-sm">
                      {formData.marketingFiles.map((file, index) => (
                        <li key={index} className="flex items-center justify-between">
                          <span>{file}</span>
                          <Button variant="ghost" size="sm">
                            Xóa
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="flex items-center justify-center rounded-md border p-8 text-center">
                    <p className="text-sm text-muted-foreground">Chưa có tệp marketing nào được tải lên</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="marketingDescription">Mô Tả Marketing</Label>
              <Textarea
                id="marketingDescription"
                value={formData.marketingDescription || ""}
                onChange={(e) => handleInputChange("marketingDescription", e.target.value)}
                placeholder="Nhập mô tả marketing cho sản phẩm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="launchDate">Ngày Ra Mắt</Label>
              <Input
                id="launchDate"
                type="date"
                value={formData.launchDate ? new Date(formData.launchDate).toISOString().split("T")[0] : ""}
                onChange={(e) => handleInputChange("launchDate", new Date(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label>Kênh Marketing</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="social"
                    checked={formData.marketingChannels?.includes("social")}
                    onCheckedChange={(checked) => {
                      const current = formData.marketingChannels || []
                      handleInputChange(
                        "marketingChannels",
                        checked ? [...current, "social"] : current.filter((c) => c !== "social"),
                      )
                    }}
                  />
                  <Label htmlFor="social">Mạng Xã Hội</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="email"
                    checked={formData.marketingChannels?.includes("email")}
                    onCheckedChange={(checked) => {
                      const current = formData.marketingChannels || []
                      handleInputChange(
                        "marketingChannels",
                        checked ? [...current, "email"] : current.filter((c) => c !== "email"),
                      )
                    }}
                  />
                  <Label htmlFor="email">Email Marketing</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="website"
                    checked={formData.marketingChannels?.includes("website")}
                    onCheckedChange={(checked) => {
                      const current = formData.marketingChannels || []
                      handleInputChange(
                        "marketingChannels",
                        checked ? [...current, "website"] : current.filter((c) => c !== "website"),
                      )
                    }}
                  />
                  <Label htmlFor="website">Website</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="offline"
                    checked={formData.marketingChannels?.includes("offline")}
                    onCheckedChange={(checked) => {
                      const current = formData.marketingChannels || []
                      handleInputChange(
                        "marketingChannels",
                        checked ? [...current, "offline"] : current.filter((c) => c !== "offline"),
                      )
                    }}
                  />
                  <Label htmlFor="offline">Quảng Cáo Ngoại Tuyến</Label>
                </div>
              </div>
            </div>
          </div>
        )

      case 5: // Ra mắt và hoạt động sau ra mắt
        return (
          <div className="space-y-4">
            <div className="rounded-md bg-green-50 p-4 border border-green-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Rocket className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Sẵn sàng ra mắt</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      Sản phẩm đã sẵn sàng để ra mắt. Vui lòng xác nhận thông tin ra mắt và các hoạt động sau ra mắt.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Thông Tin Sản Phẩm</Label>
              <div className="rounded-md bg-muted p-4 space-y-2">
                <p>
                  <strong>Tên:</strong> {formData.name}
                </p>
                <p>
                  <strong>Mô tả:</strong> {formData.description}
                </p>
                <p>
                  <strong>SKU:</strong> {formData.sku}
                </p>
                <p>
                  <strong>Giá:</strong> {formData.price ? `${formData.price.toLocaleString()} VNĐ` : "Chưa có"}
                </p>
                <p>
                  <strong>Tồn kho:</strong> {formData.inventory || "Chưa có"}
                </p>
                <p>
                  <strong>Ngày ra mắt:</strong>{" "}
                  {formData.launchDate ? new Date(formData.launchDate).toLocaleDateString("vi-VN") : "Chưa có"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="launchNotes">Ghi Chú Ra Mắt</Label>
              <Textarea
                id="launchNotes"
                value={formData.launchNotes || ""}
                onChange={(e) => handleInputChange("launchNotes", e.target.value)}
                placeholder="Nhập ghi chú về việc ra mắt sản phẩm"
              />
            </div>

            <div className="space-y-2">
              <Label>Hoạt Động Sau Ra Mắt</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="customerFeedback"
                    checked={formData.postLaunchActivities?.includes("customerFeedback")}
                    onCheckedChange={(checked) => {
                      const current = formData.postLaunchActivities || []
                      handleInputChange(
                        "postLaunchActivities",
                        checked ? [...current, "customerFeedback"] : current.filter((c) => c !== "customerFeedback"),
                      )
                    }}
                  />
                  <Label htmlFor="customerFeedback">Thu Thập Phản Hồi Khách Hàng</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="salesTracking"
                    checked={formData.postLaunchActivities?.includes("salesTracking")}
                    onCheckedChange={(checked) => {
                      const current = formData.postLaunchActivities || []
                      handleInputChange(
                        "postLaunchActivities",
                        checked ? [...current, "salesTracking"] : current.filter((c) => c !== "salesTracking"),
                      )
                    }}
                  />
                  <Label htmlFor="salesTracking">Theo Dõi Doanh Số</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="marketingEffectiveness"
                    checked={formData.postLaunchActivities?.includes("marketingEffectiveness")}
                    onCheckedChange={(checked) => {
                      const current = formData.postLaunchActivities || []
                      handleInputChange(
                        "postLaunchActivities",
                        checked
                          ? [...current, "marketingEffectiveness"]
                          : current.filter((c) => c !== "marketingEffectiveness"),
                      )
                    }}
                  />
                  <Label htmlFor="marketingEffectiveness">Đánh Giá Hiệu Quả Marketing</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="productImprovements"
                    checked={formData.postLaunchActivities?.includes("productImprovements")}
                    onCheckedChange={(checked) => {
                      const current = formData.postLaunchActivities || []
                      handleInputChange(
                        "postLaunchActivities",
                        checked
                          ? [...current, "productImprovements"]
                          : current.filter((c) => c !== "productImprovements"),
                      )
                    }}
                  />
                  <Label htmlFor="productImprovements">Lên Kế Hoạch Cải Tiến Sản Phẩm</Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="successMetrics">Tiêu Chí Đánh Giá Thành Công</Label>
              <Textarea
                id="successMetrics"
                value={formData.successMetrics || ""}
                onChange={(e) => handleInputChange("successMetrics", e.target.value)}
                placeholder="Nhập các tiêu chí đánh giá thành công của sản phẩm"
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>
            {productId ? `Cập Nhật Sản Phẩm: ${formData.name}` : "Tạo Quy Trình Phát Triển Sản Phẩm Mới"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Stepper */}
          <div className="relative">
            <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-muted"></div>
            <ol className="relative z-10 flex justify-between">
              {workflowSteps.map((step, index) => {
                const isActive = index === currentStep
                const isCompleted = index < currentStep

                return (
                  <li key={step.id} className="flex items-center justify-center">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full border-2 bg-background",
                        isActive ? "border-primary" : isCompleted ? "border-primary bg-primary" : "border-muted",
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-white" />
                      ) : (
                        <span
                          className={cn("text-sm font-medium", isActive ? "text-primary" : "text-muted-foreground")}
                        >
                          {index + 1}
                        </span>
                      )}
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>

          {/* Step labels */}
          <div className="grid grid-cols-6 gap-2 text-center text-xs">
            {workflowSteps.map((step, index) => (
              <div
                key={step.id}
                className={cn("truncate", index === currentStep ? "font-medium text-primary" : "text-muted-foreground")}
              >
                {step.title}
              </div>
            ))}
          </div>

          {/* Current step content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {workflowSteps[currentStep].icon}
                {workflowSteps[currentStep].title}
              </CardTitle>
              <CardDescription>{workflowSteps[currentStep].description}</CardDescription>
            </CardHeader>
            <CardContent>{renderStepContent()}</CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0}>
                Quay Lại
              </Button>
              <Button onClick={handleNext} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {currentStep < workflowSteps.length - 1 ? "Tiếp Theo" : "Hoàn Thành"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
