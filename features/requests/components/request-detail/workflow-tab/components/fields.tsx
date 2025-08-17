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
import { getImageUrl } from "@/features/settings/utils";
import { generateTypeFile } from "@/components/common/upload/helper";
import { UploadFile } from "@/components/common/upload";
import { number } from "zod/dist/types/v4/core/regexes";
import { memo } from "react";

interface FieldsProps {
  shouldShowField: (field: FieldType) => boolean; // Function to determine if field should be shown
  fields: BaseResultQuery<FieldType[]>;
  control: any; // Assuming control is passed from a form library like react-hook-form
  isCompleted?: boolean; // Whether the step is completed (show as read-only text)
  values?: any; // Form values to display when completed
  nearestSampleMedia?: string[]; // Media from nearest previous step
  nearestApprovedSampleImage?: string; // Image from nearest previous step
  previousStepValues?: any;
}

export const Fields = memo(
  ({
    fields,
    control,
    shouldShowField,
    isCompleted = false,
    values,
    nearestSampleMedia = [],
    nearestApprovedSampleImage = "",
    previousStepValues,
  }: FieldsProps) => {
    const { data: users } = useUsersQuery({ limit: 10000 });
    const { data: categories } = useCategoriesQuery({ limit: 10000 });
    const { data: productStatus } = useProductsStatusQuery({ limit: 10000 });
    const { data: materials } = useMaterialsQuery({ page: 1, limit: 10000 });

    // Helper function to format display value for completed fields
    const formatDisplayValue = (field: FieldType, value: any) => {
      if (!value) return "Chưa có dữ liệu";

      // Handle array values
      if (Array.isArray(value)) {
        return value.filter(Boolean).join(", ") || "Chưa có dữ liệu";
      }

      // Handle select/enum fields - show label instead of value
      if (
        field.type.toLowerCase() === "select" ||
        field.type.toLowerCase() === "enum"
      ) {
        const options = getOptionsForField(field);
        const selectedOption = options.find((opt) => opt.value === value);
        return selectedOption ? selectedOption.label : value;
      }

      // Handle date fields
      if (field.type.toLowerCase() === "date") {
        try {
          return new Date(value).toLocaleDateString("vi-VN");
        } catch {
          return value;
        }
      }

      return value.toString();
    };

    // Component for displaying completed string array fields
    const CompletedStringArrayField = ({ field }: { field: FieldType }) => {
      const fieldName = field.value as string;
      const fieldValue = values?.[fieldName] || [];

      return (
        <div key={field.value} className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-gray-700">
            {field.label}
          </label>
          <div className="p-3 bg-gray-50 rounded-md border">
            {Array.isArray(fieldValue) && fieldValue.length > 0 ? (
              <ul className="space-y-1">
                {fieldValue
                  .filter(Boolean)
                  .map((item: string, index: number) => (
                    <li key={index} className="text-sm text-gray-800">
                      • {item}
                    </li>
                  ))}
              </ul>
            ) : (
              <span className="text-sm text-gray-500">Chưa có dữ liệu</span>
            )}
          </div>
        </div>
      );
    };

    // Component for displaying completed number array fields
    const CompletedNumberArrayField = ({ field }: { field: FieldType }) => {
      const fieldName = field.value as string;
      const fieldValue = values?.[fieldName] || [];

      return (
        <div key={field.value} className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-gray-700">
            {field.label}
          </label>
          <div className="p-3 bg-gray-50 rounded-md border">
            {Array.isArray(fieldValue) && fieldValue.length > 0 ? (
              <ul className="space-y-1">
                {fieldValue
                  .filter(Boolean)
                  .map((item: number, index: number) => (
                    <li key={index} className="text-sm text-gray-800">
                      • {item.toLocaleString("vi-VN")}
                    </li>
                  ))}
              </ul>
            ) : (
              <span className="text-sm text-gray-500">Chưa có dữ liệu</span>
            )}
          </div>
        </div>
      );
    };

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
        case "DESIGNER":
        case "PRICE_CALCULATOR":
          return (
            users?.data?.map((user) => ({
              label: user.fullName,
              value: user.id,
            })) || []
          );

        case "SAMPLE_STATUS":
          return [
            { label: "Chờ xử lý", value: "pending" },
            { label: "Đang thực hiện", value: "in_progress" },
            { label: "Hoàn thành", value: "completed" },
            { label: "Thất bại", value: "failed" },
          ];

        // Status fields
        case "STATUS":
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

        // Sent to RD confirmation (yes/no)
        case "MATERIAL_SENT_TO_RD":
          return [
            { label: "Có", value: "yes" },
            { label: "Không", value: "no" },
          ];

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

    // Component for handling number_array fields
    const NumberArrayField = ({ field }: { field: FieldType }) => {
      const fieldName = field.value ?? "numberArrayField"; // Fallback name if field.value is undefined
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
                  type="number"
                  name={`${fieldName}.${index}`}
                  control={control}
                  placeholder={
                    index === 0
                      ? `Nhập ${field.label.toLowerCase()} (bắt buộc)`
                      : `Nhập ${field.label.toLowerCase()} (tùy chọn)`
                  }
                  className="w-full"
                  required={index === 0}
                />
              </div>

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

      // If step is completed, show as read-only text
      if (isCompleted) {
        const fieldValue = values?.[fieldName];

        // Handle string_array type for completed fields
        if (field.valueType === "string_array") {
          return <CompletedStringArrayField field={field} />;
        }

        if (field.valueType === "number_array") {
          return <></>;
        }

        // Regular completed field display
        return (
          <div key={field.value} className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {field.label}
            </label>
            <div className="p-3 bg-gray-50 rounded-md border">
              <span className="text-sm text-gray-800">
                {formatDisplayValue(field, fieldValue)}
              </span>
            </div>
          </div>
        );
      }

      if (field.enumValue === "FINAL_PRODUCT_VIDEO") {
        // Special case: SAMPLE_MEDIA_LINK → show 3 media upload boxes (image/video)
        const acceptMedia = {
          "video/mp4": [".mp4"],
        } as const;

        return (
          <div key={field.value} className="flex flex-col h-full space-y-2">
            <label className="text-sm font-medium">{field.label}</label>
            <div className="flex gap-3 overflow-x-auto">
              <UploadFile
                hideUploadWhenHavePreview={true}
                name={`${fieldName}_1`}
                control={control}
                label={`Video`}
                maxFiles={1}
                accept={acceptMedia}
                content="Kéo thả hoặc chọnvideo"
                className="min-w-[220px]"
                previewClasses="min-w-[190px] min-h-[200px] object-cover"
              />
            </div>
          </div>
        );
      }

      if (field.enumValue === "SAMPLE_MEDIA_LINK") {
        // Special case: SAMPLE_MEDIA_LINK → show 3 media upload boxes (image/video)
        const acceptMedia = {
          "image/jpeg": [".jpg", ".jpeg"],
          "image/png": [".png"],
          "image/webp": [".webp"],
          "video/mp4": [".mp4"],
          "video/webm": [".webm"],
          "video/quicktime": [".mov"],
        } as const;

        if (nearestSampleMedia.length > 0) {
          return (
            <div key={field.value} className="flex flex-col h-full space-y-2">
              <label className="text-sm font-medium">{field.label}</label>
              <div className="flex gap-3 overflow-x-auto">
                {nearestSampleMedia.map((media, index) => (
                  <div key={index} className="min-w-[220px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {getImageUrl(media) ? (
                      <img
                        src={getImageUrl(media)}
                        alt={`Media ${index + 1}`}
                        className="min-w-[190px] min-h-[200px] object-cover rounded-md border"
                      />
                    ) : (
                      <video
                        src={media}
                        controls
                        className="min-w-[190px] min-h-[200px] object-cover rounded-md border"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        }

        return (
          <div key={field.value} className="flex flex-col h-full space-y-2">
            <label className="text-sm font-medium">{field.label}</label>
            <div className="flex gap-3 overflow-x-auto">
              <UploadFile
                name={`${fieldName}_1`}
                control={control}
                label={`Ảnh/Video 1`}
                maxFiles={1}
                accept={acceptMedia}
                content="Kéo thả hoặc chọn ảnh/video"
                className="min-w-[220px]"
                previewClasses="min-w-[190px] min-h-[200px] object-cover"
              />
              <UploadFile
                name={`${fieldName}_2`}
                control={control}
                label={`Ảnh/Video 2`}
                maxFiles={1}
                accept={acceptMedia}
                content="Kéo thả hoặc chọn ảnh/video"
                className="min-w-[220px]"
                previewClasses="min-w-[190px] min-h-[200px] object-cover"
              />
              <UploadFile
                name={`${fieldName}_3`}
                control={control}
                label={`Ảnh/Video 3`}
                maxFiles={1}
                accept={acceptMedia}
                content="Kéo thả hoặc chọn ảnh/video"
                className="min-w-[220px]"
                previewClasses="min-w-[190px] min-h-[200px] object-cover"
              />
            </div>
          </div>
        );
      }

      // Special case: FINAL_APPROVED_SAMPLE_IMAGE → if nearest has image, show preview; else show upload (image only)
      if (field.enumValue === "FINAL_APPROVED_SAMPLE_IMAGE") {
        const acceptImages = {
          "image/jpeg": [".jpg", ".jpeg"],
          "image/png": [".png"],
          "image/webp": [".webp"],
        } as const;

        if (nearestApprovedSampleImage) {
          const url = getImageUrl(nearestApprovedSampleImage);
          return (
            <div key={field.value} className="flex flex-col h-full space-y-2">
              <label className="text-sm font-medium">{field.label}</label>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={field.label}
                className="w-full h-48 object-cover rounded-md border"
              />
            </div>
          );
        }

        return (
          <div key={field.value} className="flex items-start h-full">
            <UploadFile
              hideUploadWhenHavePreview={true}
              name={`${fieldName}Array`}
              control={control}
              label={field.label}
              maxFiles={1}
              accept={acceptImages}
              content="Kéo thả hoặc chọn hình ảnh"
              className="w-full"
              previewClasses="min-w-[200px]"
            />
          </div>
        );
      }

      // Check for string_array type - có thể check bằng field.type hoặc enumValue
      if (field.valueType === "string_array") {
        return <StringArrayField field={field} />;
      }

      // Check for number_array type
      if (field.valueType === "number_array") {
        return <NumberArrayField field={field} />;
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

        case "number_array":
          return <NumberArrayField key={field.value} field={field} />;

        case "select":
        case "enum":
          const options = getOptionsForField(field);

          // Handle DESIGNER field specially
          if (field.enumValue === "DESIGNER") {
            const previousDesigner = previousStepValues?.[fieldName];

            if (previousDesigner) {
              const designerOption = users?.data?.find(
                (u) => u.id == previousDesigner
              );
              return (
                <div key={field.value} className="flex flex-col space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {field.label}
                  </label>
                  <div className="p-3 bg-gray-50 rounded-md border">
                    <span className="text-sm text-gray-800">
                      {designerOption?.fullName || "Không tìm thấy thông tin"}
                    </span>
                  </div>
                </div>
              );
            }
          }

          if (
            field.enumValue === "PRICE_CALCULATOR" ||
            field.enumValue === "CATEGORY"
          ) {
            return (
              <div key={field.value} className="flex flex-col h-full">
                <SelectCustom
                  options={options}
                  name={fieldName}
                  control={control}
                  label={field.label}
                  placeholder={`Chọn ${field.label.toLowerCase()}`}
                  className="w-full"
                  valueType="number"
                />
              </div>
            );
          }

          // Handle VARIANT field specially
          if (field.enumValue === "VARIANT") {
            const previousVariant = previousStepValues?.[fieldName];

            if (previousVariant) {
              return (
                <div key={field.value} className="flex flex-col h-full">
                  <InputCustom
                    name={fieldName}
                    control={control}
                    label={field.label}
                    placeholder={`Nhập ${field.label.toLowerCase()}`}
                    className="w-full"
                    defaultValue={previousVariant}
                  />
                </div>
              );
            }
          }

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
        {fields?.data ? (
          fields.data
            .filter((field) => shouldShowField(field))
            .map((field) => {
              return renderDynamicField(field);
            })
        ) : (
          <div className="col-span-full text-center text-gray-500 py-4">
            Đang tải fields...
          </div>
        )}
      </div>
    );
  }
);
