import { z } from "zod";
import { MaterialEnum, MaterialStatus } from "../constants";

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

export type CreateMaterialInputType = z.infer<typeof createMaterialInputSchema>;
export type UpdateMaterialInputType = CreateMaterialInputType & {
  id: number;
};
