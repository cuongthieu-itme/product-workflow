import { z } from "zod";

export const createProductStatusInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Tên trạng thái không được để trống" }),
  color: z.string().trim().min(1, { message: "Màu không được để trống" }),
  description: z.string().min(8, { message: "Mô tả phải có ít nhất 8 ký tự" }),
  procedure: z
    .string()
    .trim()
    .min(4, { message: "Quy trình phải có ít nhất 4 ký tự" }),
});

export type CreateProductStatusInputType = z.infer<
  typeof createProductStatusInputSchema
>;
