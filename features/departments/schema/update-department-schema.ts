import { z } from "zod";
import { createDepartmentInputSchema } from "./create-department-schema";

export const updateDepartmentInputSchema = z
  .object({
    id: z.number(),
  })
  .merge(createDepartmentInputSchema);

export type UpdateDepartmentInputType = z.input<
  typeof updateDepartmentInputSchema
>;
