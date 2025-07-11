import { z } from "zod";

const imageSchema = z
  .array(
    z
      .instanceof(File)
      .refine(
        (f) => ["image/jpeg", "image/png", "image/webp"].includes(f.type),
        {
          message: "Chỉ chấp nhận JPG, PNG, WEBP",
        }
      )
      .refine((f) => f.size <= 5 * 1024 * 1024, {
        message: "Mỗi ảnh tối đa 5 MB",
      })
  )
  .min(1, { message: "Phải chọn ít nhất 1 ảnh" })
  .max(5, { message: "Không được quá 5 ảnh" });

export const createMaterialInputSchema = z.object({
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
  count: z
    .number({ invalid_type_error: "Số lượng phải là số" })
    .int({ message: "Số lượng phải là số nguyên" })
    .positive({ message: "Số lượng phải > 0" }),
  unit: z
    .string()
    .trim()
    .min(1, { message: "Đơn vị không được trống" })
    .max(16, { message: "Đơn vị tối đa 16 ký tự" }),
  origin: z
    .string()
    .trim()
    .min(1, { message: "Xuất xứ không được trống" })
    .max(64, { message: "Xuất xứ tối đa 64 ký tự" }),
  description: z
    .string()
    .trim()
    .max(255, { message: "Mô tả tối đa 255 ký tự" })
    .optional()
    .or(z.literal("")),
});

export type CreateMaterialInputType = z.infer<typeof createMaterialInputSchema>;
export type UpdateMaterialInputType = CreateMaterialInputType & {
  id: string;
};
