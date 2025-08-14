import { z } from "zod";
import { sourceSchema } from "../schema";

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
  name: z.string().min(1, "Tên nguyên vật liệu không được để trống"),
  quantity: z.number().min(1, "Số lượng phải lớn hơn 0"),
  unit: z.string().min(1, "Đơn vị không được để trống"),
  description: z.string().optional(),
  image: z.array(z.string()).optional(),
  type: MaterialTypeSchema,
  originId: z.number().int().positive("Origin ID phải là số nguyên dương"),
  status: RequestMaterialStatusSchema,
  price: z.number().min(0).optional(),
  requestInput: CreateMaterialRequestInputSchema.optional(),
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
