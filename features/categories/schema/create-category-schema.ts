import { z } from "zod";

export const createCategoryInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Tên danh mục không được để trống" }),
  description: z.string().optional(),
});

export type CreateCategoryInputType = z.infer<typeof createCategoryInputSchema>;
