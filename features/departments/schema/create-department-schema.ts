import { z } from "zod";

export const createDepartmentInputSchema = z.object({
  name: z.string().trim().min(6, { message: "Họ tên phải dài hơn 6 ký tự" }),
  description: z
    .string()
    .trim()
    .min(10, { message: "Mô tả phải dài hơn 10 ký tự" }),
  headId: z.number().optional().nullable(),
  memberIds: z.array(z.number()),
});

export type CreateDepartmentInputType = z.infer<
  typeof createDepartmentInputSchema
>;
