import { z } from "zod";

export const createProductInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Tên sản phẩm không được để trống" }),
  description: z.string().min(1, { message: "Mô tả không được để trống" }),
  categoryId: z
    .number({
      message: "Phải chọn danh mục sản phẩm",
    })
    .min(1, { message: "Phải chọn danh mục sản phẩm" }),
  sku: z.string().min(1, { message: "Mã sản phẩm không được để trống" }),
  manufacturingProcess: z.string().optional(),
  requestId: z.number().optional().nullable(),
});

export type CreateProductInputType = z.infer<typeof createProductInputSchema>;
