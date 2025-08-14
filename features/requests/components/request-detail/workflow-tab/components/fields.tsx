import { InputCustom, SelectCustom } from "@/components/form";
import { DatePickerCustom } from "@/components/form/date-picker";
import { TextAreaCustom } from "@/components/form/textarea";
import { FieldType } from "@/features/workflows/types";
import { BaseResultQuery } from "@/types/common";
import { useCategoriesQuery } from "@/features/categories/hooks";
import { useProductsStatusQuery } from "@/features/products-status/hooks";
import { useMaterialsQuery } from "@/features/materials/hooks";
import { useUsersQuery } from "@/features/users/hooks";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray } from "react-hook-form";

interface FieldsProps {
  shouldShowField: (field: FieldType) => boolean; // Function to determine if field should be shown
  fields: BaseResultQuery<FieldType[]>;
  control: any; // Assuming control is passed from a form library like react-hook-form
}

export const Fields = ({ fields, control, shouldShowField }: FieldsProps) => {
  const { data: users } = useUsersQuery({ limit: 10000 });
  const { data: categories } = useCategoriesQuery({ limit: 10000 });
  const { data: productStatus } = useProductsStatusQuery({ limit: 10000 });
  const { data: materials } = useMaterialsQuery({ page: 1, limit: 10000 });

  // Helper function to get options based on field enumValue
  const getOptionsForField = (field: FieldType) => {
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
      case "APPROVED_BY":
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

  // Component for handling string_array fields
  const StringArrayField = ({ field }: { field: FieldType }) => {
    const fieldName = field.value as string;
    const {
      fields: arrayFields,
      append,
      remove,
    } = useFieldArray({
      control,
      name: fieldName,
    });

    // Ensure at least one field exists (required first field)
    if (arrayFields.length === 0) {
      append("");
    }

    const addNewField = () => {
      append("");
    };

    const removeField = (index: number) => {
      if (index > 0) {
        // Không cho phép xóa field đầu tiên (bắt buộc)
        remove(index);
      }
    };

    return (
      <div key={field.value} className="flex flex-col h-full space-y-3">
        <label className="text-sm font-medium">{field.label}</label>

        {arrayFields.map((item, index) => (
          <div key={item.id} className="flex items-center gap-2">
            <div className="flex-1">
              <InputCustom
                name={`${fieldName}.${index}`}
                control={control}
                placeholder={
                  index === 0
                    ? `Nhập ${field.label.toLowerCase()} (bắt buộc)`
                    : `Nhập ${field.label.toLowerCase()} (tùy chọn)`
                }
                className="w-full"
                required={index === 0} // Chỉ field đầu tiên là required
              />
            </div>

            {/* Nút xóa - chỉ hiển thị cho các field không phải field đầu tiên */}
            {index > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeField(index)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}

            {/* Nút thêm - chỉ hiển thị ở field cuối cùng */}
            {index === arrayFields.length - 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addNewField}
                className="text-green-500 hover:text-green-700 hover:bg-green-50"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}

        {/* Nút thêm ở cuối nếu không có field nào */}
        {arrayFields.length === 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addNewField}
            className="text-green-500 hover:text-green-700 hover:bg-green-50 w-fit"
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm {field.label.toLowerCase()}
          </Button>
        )}
      </div>
    );
  };

  const renderDynamicField = (field: FieldType) => {
    if (!shouldShowField(field)) {
      return null;
    }

    const fieldName = field.value as any; // Type assertion để bypass strict typing

    // Check for string_array type - có thể check bằng field.type hoặc enumValue
    if (field.valueType === "string_array") {
      return <StringArrayField field={field} />;
    }

    switch (field.type.toLowerCase()) {
      case "input":
      case "text":
      case "string":
        return (
          <div key={field.value} className="flex flex-col h-full">
            <InputCustom
              name={fieldName}
              control={control}
              label={field.label}
              placeholder={`Nhập ${field.label.toLowerCase()}`}
              className="w-full"
            />
          </div>
        );

      case "textarea":
        return (
          <div key={field.value} className="flex flex-col h-full">
            <TextAreaCustom
              name={fieldName}
              control={control}
              label={field.label}
              placeholder={`Nhập ${field.label.toLowerCase()}`}
              className="w-full flex-1"
              rows={3}
            />
          </div>
        );

      case "number":
        return (
          <div key={field.value} className="flex flex-col h-full">
            <InputCustom
              name={fieldName}
              control={control}
              label={field.label}
              type="number"
              placeholder={`Nhập ${field.label.toLowerCase()}`}
              className="w-full"
            />
          </div>
        );

      case "date":
        return (
          <div key={field.value} className="flex flex-col h-full">
            <DatePickerCustom
              name={fieldName}
              control={control}
              label={field.label}
              className="w-full"
            />
          </div>
        );

      case "select":
      case "enum":
        // Get options from API data based on enumValue mapping
        const options = getOptionsForField(field);

        return (
          <div key={field.value} className="flex flex-col h-full">
            <SelectCustom
              name={fieldName}
              control={control}
              label={field.label}
              placeholder={`Chọn ${field.label.toLowerCase()}`}
              options={options}
              className="w-full"
            />
          </div>
        );

      case "file":
        // Handle file type - không set default value cho file input
        return (
          <div key={field.value} className="flex flex-col h-full">
            <InputCustom
              name={fieldName}
              control={control}
              label={field.label}
              type="file"
              placeholder={`Chọn ${field.label.toLowerCase()}`}
              className="w-full"
            />
          </div>
        );

      default:
        return (
          <div key={field.value} className="flex flex-col h-full">
            <InputCustom
              name={fieldName}
              control={control}
              label={field.label}
              placeholder={`Nhập ${field.label.toLowerCase()}`}
              className="w-full"
            />
          </div>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch overflow-visible">
      {fields.data
        .filter((field) => shouldShowField(field))
        .map((field) => {
          return renderDynamicField(field);
        })}
    </div>
  );
};
