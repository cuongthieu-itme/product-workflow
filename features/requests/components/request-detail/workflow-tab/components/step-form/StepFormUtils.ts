import { FieldType } from "@/features/workflows/types";

// Helper function to get options based on field enumValue
export const getOptionsForField = (
  field: FieldType,
  users?: { data: any[] },
  productStatus?: { data: any[] },
  materials?: { data: any[] },
  categories?: { data: any[] }
) => {
  // If field has enumValue, try to parse it first
  if (field.enumValue) {
    try {
      const parsedOptions = JSON.parse(field.enumValue);
      if (Array.isArray(parsedOptions)) {
        return parsedOptions;
      }
    } catch (e) {
      // If not JSON, try to split by comma
      const splitOptions = field.enumValue.split(",").map((opt) => ({
        label: opt.trim(),
        value: opt.trim(),
      }));
      if (splitOptions.length > 1) {
        return splitOptions;
      }
    }
  }

  // Map based on enumValue constants
  switch (field.enumValue) {
    // User-related fields
    case "APPROVED_BY":
    case "PURCHASER":
    case "CHECKED_BY":
    case "DESIGNER":
    case "SAMPLE_MAKER":
    case "PRODUCT_FEEDBACK_RESPONDER":
    case "SAMPLE_FEEDBACK_RESPONDER":
    case "MATERIAL_CONFIRMER":
    case "WAREHOUSE_CHECKER":
    case "RD_MATERIAL_CHECKER":
    case "ASSIGNED_TO":
    case "TEMPLATE_CHECKER":
    case "MOCKUP_CHECKER":
      return (
        users?.data?.map((user) => ({
          label: user.fullName,
          value: user.id,
        })) || []
      );

    // Status fields
    case "STATUS":
    case "SAMPLE_STATUS":
    case "PRODUCT_FEEDBACK_STATUS":
    case "PURCHASE_STATUS":
    case "TEMPLATE_CHECKING_STATUS":
    case "MOCKUP_CHECKING_STATUS":
      return (
        productStatus?.data?.map((status) => ({
          label: status.name,
          value: status.id,
        })) || []
      );

    // Material type field
    case "MATERIAL_TYPE":
      return (
        materials?.data?.map((material) => ({
          label: material.name,
          value: material.id,
        })) || []
      );

    // Category field
    case "CATEGORY":
      return (
        categories?.data?.map((category) => ({
          label: category.name,
          value: category.id,
        })) || []
      );

    // Default status options for common status fields
    default:
      if (field.value?.toLowerCase().includes("status")) {
        return [
          { label: "Chờ xử lý", value: "pending" },
          { label: "Đang xử lý", value: "processing" },
          { label: "Hoàn thành", value: "completed" },
          { label: "Đã hủy", value: "cancelled" },
        ];
      }
      return [];
  }
};

// Function để kiểm tra field có nên hiển thị không dựa vào checkFields
export const shouldShowField = (
  field: FieldType,
  fields?: { data: FieldType[] },
  checkFieldsList: string[] = []
): boolean => {
  // Nếu không có fields data, return false
  if (!fields?.data) return false;

  // Nếu không có checkFields list, hiển thị tất cả
  if (checkFieldsList.length === 0) return false;

  // Kiểm tra enumValue của field có trong checkFields list không
  const isIncluded = checkFieldsList.includes(field.enumValue);

  return isIncluded;
};

// Create default form values
export const createDefaultValues = (
  step: any,
  fields?: { data: FieldType[] },
  shouldShowFieldFn?: (field: FieldType) => boolean
) => {
  const defaultValues = {
    ...step,
    id: step.id,
    startDate: step.startDate ? new Date(step.startDate) : new Date(),
    endDate: step.endDate ? new Date(step.endDate) : new Date(),
    userId: step.userId || undefined,
    price: step.price ?? undefined,
    isStepWithCost: step.isStepWithCost,
    // Thêm current values từ fieldSubprocess nếu có
    ...(step.fieldSubprocess
      ? {
          status: step.fieldSubprocess.status || "",
          materialType: step.fieldSubprocess.materialType || "",
          media: step.fieldSubprocess.media || [],
          purchaseLink: step.fieldSubprocess.purchaseLink || [],
          additionalNote: step.fieldSubprocess.additionalNote || "",
          approvedBy: step.fieldSubprocess.approvedBy || "",
          approvedTime: step.fieldSubprocess.approvedTime
            ? new Date(step.fieldSubprocess.approvedTime)
            : null,
          purchaser: step.fieldSubprocess.purchaser || "",
          purchasingTime: step.fieldSubprocess.purchasingTime
            ? new Date(step.fieldSubprocess.purchasingTime)
            : null,
          trackingLink: step.fieldSubprocess.trackingLink || "",
          receivedQuantity: step.fieldSubprocess.receivedQuantity || 0,
          checkedBy: step.fieldSubprocess.checkedBy || "",
          checkedTime: step.fieldSubprocess.checkedTime
            ? new Date(step.fieldSubprocess.checkedTime)
            : null,
          sampleProductionPlan: step.fieldSubprocess.sampleProductionPlan || "",
          designer: step.fieldSubprocess.designer || "",
          startTime: step.fieldSubprocess.startTime
            ? new Date(step.fieldSubprocess.startTime)
            : null,
          completedTime: step.fieldSubprocess.completedTime
            ? new Date(step.fieldSubprocess.completedTime)
            : null,
          productionFileLink: step.fieldSubprocess.productionFileLink || "",
          sampleMaker: step.fieldSubprocess.sampleMaker || "",
          sampleStatus: step.fieldSubprocess.sampleStatus || "",
          sampleMediaLink: step.fieldSubprocess.sampleMediaLink || [],
          note: step.fieldSubprocess.note || "",
          finalApprovedSampleImage:
            step.fieldSubprocess.finalApprovedSampleImage || "",
          finalProductVideo: step.fieldSubprocess.finalProductVideo || "",
        }
      : {}),
  };

  // Thêm default values cho dynamic fields nếu có
  if (fields?.data && shouldShowFieldFn) {
    const dynamicDefaults = fields.data.reduce((acc, field) => {
      if (shouldShowFieldFn(field)) {
        // Chỉ set default nếu chưa có value từ fieldSubprocess
        if (!(field.value in (step.fieldSubprocess || {}))) {
          switch (field.type.toLowerCase()) {
            case "number":
              acc[field.value] = 0;
              break;
            case "date":
              acc[field.value] = new Date();
              break;
            case "file":
              // Không set default value cho file input
              break;
            case "string_array":
              // Khởi tạo array với một string rỗng (bắt buộc)
              acc[field.value] = [""];
              break;
            default:
              // Kiểm tra nếu field type chứa "array"
              if (field.type.toLowerCase().includes("array")) {
                acc[field.value] = [""];
              } else {
                acc[field.value] = "";
              }
              break;
          }
        }
      }
      return acc;
    }, {} as Record<string, any>);

    return { ...defaultValues, ...dynamicDefaults };
  }

  return defaultValues;
};
