import { z } from "zod";
import { sourceSchema } from "../schema";
import { MaterialEnum } from "@/features/materials/constants";

// Enum schemas
const SourceRequestSchema = z.enum(["CUSTOMER", "OTHER"]);
const PriorityTypeSchema = z.enum(["NORMAL", "MEDIUM", "HIGH", "VERY_HIGH"]);
const MaterialTypeSchema = z.enum(["INGREDIENT", "ACCESSORY"]);
const RequestMaterialStatusSchema = z.enum([
  "AVAILABLE_IN_STOCK",
  "SENDING_REQUEST",
  "CANCELLED",
]);

// CreateMaterialRequestInputDto schema
const CreateMaterialRequestInputSchema = z.object({
  quantity: z.number().min(0).optional(),
  expectedDate: z.string().datetime().optional(),
  supplier: z.string().optional(),
  sourceCountry: z.string().optional(),
  price: z.number().min(0).optional(),
  reason: z.string().optional(),
});

// CreateNewMaterialDto schema
const CreateNewMaterialSchema = z.object({
  image: z
    .array(z.string())
    .min(1, { message: "Phải chọn ít nhất 1 ảnh" })
    .max(5, { message: "Không được quá 5 ảnh" }),
  code: z
    .string()
    .trim()
    .min(1, { message: "Mã vật tư không được trống" })
    .max(32, { message: "Mã vật tư tối đa 32 ký tự" }),
  name: z
    .string()
    .trim()
    .min(1, { message: "Tên vật tư không được trống" })
    .max(100, { message: "Tên vật tư tối đa 100 ký tự" }),
  quantity: z
    .number()
    .int({ message: "Số lượng phải là số nguyên" })
    .positive({ message: "Số lượng phải > 0" }),
  unit: z
    .string()
    .trim()
    .min(1, { message: "Đơn vị không được trống" })
    .max(16, { message: "Đơn vị tối đa 16 ký tự" }),
  originId: z
    .number()
    .min(1, { message: "Xuất xứ không được trống" })
    .max(64, { message: "Xuất xứ tối đa 64 ký tự" }),
  description: z.string().trim().optional().or(z.literal("")),
  isActive: z.boolean().default(true).optional(),
  type: z.enum([MaterialEnum.ACCESSORY, MaterialEnum.MATERIAL]),
  price: z
    .number()
    .int({ message: "Giá phải là số nguyên" })
    .positive({ message: "Giá phải > 0" })
    .optional(),
});

// CreateRequestDto schema
const CreateRequestSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống"),
  description: z.string().optional(),
  productLink: z.array(z.string()).optional(),
  media: z.array(z.string()).optional(),
  source: sourceSchema,
  priority: PriorityTypeSchema,
  createdById: z.number().int().positive().optional(),
  customerId: z.number().int().positive().optional(),
  sourceOtherId: z.number().int().positive().optional(),
  statusProductId: z.number().int().positive().optional(),
  code: z.string().optional(),
});

// Main schema for createRequestAndMaterial method
export const CreateRequestAndMaterialSchema = z.object({
  requestData: CreateRequestSchema,
  materialsData: z
    .array(CreateNewMaterialSchema)
    .min(1, "Danh sách nguyên vật liệu không được để trống")
    .refine(
      (materials) => {
        // Check for duplicate material names
        const names = materials.map((m) => m.name.toLowerCase());
        return names.length === new Set(names).size;
      },
      {
        message: "Tên nguyên vật liệu không được trùng lặp",
      }
    ),
});

// Type inference
export type CreateRequestAndMaterialInput = z.infer<
  typeof CreateRequestAndMaterialSchema
>;
export type CreateRequestInput = z.infer<typeof CreateRequestSchema>;
export type CreateNewMaterialInput = z.infer<typeof CreateNewMaterialSchema>;
export type CreateMaterialRequestInputInput = z.infer<
  typeof CreateMaterialRequestInputSchema
>;

// Individual schemas for reuse
export {
  CreateRequestSchema,
  CreateNewMaterialSchema,
  CreateMaterialRequestInputSchema,
  SourceRequestSchema,
  PriorityTypeSchema,
  MaterialTypeSchema,
  RequestMaterialStatusSchema,
};
