export function getFieldDisplayName(field: string): string {
  const fieldDisplayNames: Record<string, string> = {
    title: "Tiêu đề",
    description: "Mô tả",
    dataSource: "Nguồn dữ liệu",
    referenceLink: "Link tham khảo",
    images: "Ảnh mẫu",
    assignee: "Người được giao việc",
    status: "Trạng thái",
    productStatus: "Trạng thái sản phẩm",
    workflowProcessId: "Quy trình làm việc",
    currentStepId: "Bước hiện tại",
    currentStepStatus: "Trạng thái bước hiện tại",
    completedSteps: "Các bước đã hoàn thành",
    stepFieldValues: "Giá trị các trường dữ liệu",
    priority: "Độ ưu tiên",
    department: "Phòng ban",
    materials: "Nguyên vật liệu",
  }

  return fieldDisplayNames[field] || field
}

export function formatFieldValue(field: string, value: any): string {
  if (value === undefined || value === null) {
    return "Không có"
  }

  if (field === "images") {
    return `${Array.isArray(value) ? value.length : 0} ảnh`
  }

  if (field === "dataSource") {
    if (typeof value === "object" && value !== null) {
      return value.name || "Không có tên"
    }
    return String(value)
  }

  if (field === "assignee") {
    if (typeof value === "object" && value !== null) {
      return value.name || "Không có tên"
    }
    return String(value)
  }

  if (field === "productStatus") {
    if (typeof value === "object" && value !== null) {
      return value.name || "Không có tên"
    }
    return String(value)
  }

  if (field === "completedSteps") {
    if (Array.isArray(value)) {
      return `${value.length} bước`
    }
    return String(value)
  }

  if (field === "materials") {
    if (Array.isArray(value)) {
      return `${value.length} nguyên vật liệu`
    }
    return String(value)
  }

  if (typeof value === "object") {
    try {
      return JSON.stringify(value)
    } catch (error) {
      return "[Đối tượng phức tạp]"
    }
  }

  return String(value)
}
