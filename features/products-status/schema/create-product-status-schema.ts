import { z } from "zod";

export const createProductStatusInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Tên trạng thái không được để trống" }),
  color: z.string().trim().min(1, { message: "Màu không được để trống" }),
  description: z.string().min(8, { message: "Mô tả phải có ít nhất 8 ký tự" }),
  procedureId: z
    .number()
    .min(1, {
      message: "Vui lòng chọn quy trình",
    })
    .optional()
    .nullable(),
});

export type CreateProductStatusInputType = z.infer<
  typeof createProductStatusInputSchema
>;
