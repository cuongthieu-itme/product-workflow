import { z } from "zod";
import { createProductInputSchema } from "./create-product-schema";

export const updateProductInputSchema = z
  .object({
    id: z.number(),
  })
  .merge(createProductInputSchema);

export type UpdateProductInputType = z.input<typeof updateProductInputSchema>;
