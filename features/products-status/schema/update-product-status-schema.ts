import { z } from "zod";
import { createProductStatusInputSchema } from "./create-product-status-schema";

export const updateProductStatusInputSchema = z
  .object({
    id: z.number(),
  })
  .merge(createProductStatusInputSchema);

export type UpdateProductStatusInputType = z.input<
  typeof updateProductStatusInputSchema
>;
