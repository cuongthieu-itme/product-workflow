import { z } from "zod";

export const createProductInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Tên sản phẩm không được để trống" }),
  description: z.string().optional(),
  categoryId: z
    .number()
    .min(1, { message: "Phải chọn danh mục sản phẩm" })
    .optional()
    .nullable(),
});

export type CreateProductInputType = z.infer<typeof createProductInputSchema>;
