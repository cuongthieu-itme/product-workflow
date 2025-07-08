import { z } from "zod";
import { createCategoryInputSchema } from "./create-category-schema";

export const updateCategoryInputSchema = z
  .object({
    id: z.number(),
  })
  .merge(createCategoryInputSchema);

export type UpdateCategoryInputType = z.input<typeof updateCategoryInputSchema>;
