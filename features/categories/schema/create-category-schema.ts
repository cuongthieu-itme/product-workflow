import { z } from "zod";

export const createCategoryInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Tên danh mục không được để trống" }),
  description: z.string().min(1, { message: "Mô tả không được để trống" }),
});

export type CreateCategoryInputType = z.infer<typeof createCategoryInputSchema>;
