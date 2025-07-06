import { z } from "zod";

export const createDepartmentInputSchema = z.object({
  name: z.string().trim().min(1, { message: "Tên phòng ban không được để trống" }),
  description: z.string().trim().optional(),
  headId: z.number().int().positive({ message: "Trưởng phòng phải là người dùng hợp lệ" }).nullable(),
});

export type CreateDepartmentInputType = z.input<typeof createDepartmentInputSchema>;
export type DepartmentOutputType = z.output<typeof createDepartmentInputSchema>;
